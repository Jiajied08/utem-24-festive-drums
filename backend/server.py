from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
import io
import bcrypt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "utem-drum-club"
storage_key = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        raise

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "admin"
    created_at: str

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: str
    created_at: str

class ClubInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    established_year: int = 2011
    performances_count: int = 0
    members_count: int = 0
    about_en: str = ""
    about_zh: str = ""
    mission_en: str = "To preserve and promote the art of 24 Festive Drums while developing discipline, leadership and teamwork among UTeM students."
    mission_zh: str = "保护和推广24节令鼓艺术，同时培养UTeM学生的纪律、领导力和团队精神。"

class HistoryEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"hist_{uuid.uuid4().hex[:12]}")
    year: int
    title_en: str
    title_zh: str
    description_en: str = ""
    description_zh: str = ""
    image_path: Optional[str] = None
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"img_{uuid.uuid4().hex[:12]}")
    storage_path: str
    original_filename: str
    title_en: str = ""
    title_zh: str = ""
    category: str
    event_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_deleted: bool = False

class PerformancePackage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"pkg_{uuid.uuid4().hex[:12]}")
    name_en: str
    name_zh: str
    description_en: str
    description_zh: str
    duration: str = "[Insert duration]"
    performers: str = "[Insert number]"
    price_from: str = "[Insert price]"
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Enquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"enq_{uuid.uuid4().hex[:12]}")
    org_name: str
    contact_person: str
    phone: str
    email: str
    event_name: str
    event_type: str
    event_date: str
    performance_time: str
    venue: str
    package_selected: str
    audience_size: str = ""
    indoor_outdoor: str = ""
    duration: str = ""
    requirements: str = ""
    budget: str = ""
    file_path: Optional[str] = None
    status: str = "New"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"ach_{uuid.uuid4().hex[:12]}")
    title_en: str
    title_zh: str
    year: int
    location: str = ""
    description_en: str = ""
    description_zh: str = ""
    image_path: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"mem_{uuid.uuid4().hex[:12]}")
    name_en: str
    name_zh: str
    position_en: str
    position_zh: str
    session: str
    bio_en: str = ""
    bio_zh: str = ""
    image_path: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    whatsapp_captain: str = "01131286264"
    whatsapp_vice: str = "0162530179"
    email: str = "[Email]"
    instagram: str = "utem24fd_official"
    facebook: str = "utem24festivedrums"
    tiktok: str = ""
    youtube: str = "UCfhI7K13yEpZgO7cIQ6kPoA"
    whatsapp_group_link: str = ""
    address_en: str = "Universiti Teknikal Malaysia Melaka, Jalan Hang Tuah Jaya, 76100 Durian Tunggal, Malacca"
    address_zh: str = "马来西亚技术大学，Jalan Hang Tuah Jaya，76100 Durian Tunggal，马六甲"
    logo_path: str = ""

class JoinUsSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"join_{uuid.uuid4().hex[:12]}")
    name: str
    email: str
    phone: str
    student_id: str
    faculty: str
    year: str
    experience: str = ""
    why_join: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InstagramPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"ig_{uuid.uuid4().hex[:12]}")
    post_url: str
    shortcode: str = ""
    caption: str = ""
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HeroImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"hero_{uuid.uuid4().hex[:12]}")
    storage_path: str
    caption_en: str = ""
    caption_zh: str = ""
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PerformanceVideo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"vid_{uuid.uuid4().hex[:12]}")
    video_url: str
    embed_url: str = ""
    title_en: str = ""
    title_zh: str = ""
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventPoster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"pos_{uuid.uuid4().hex[:12]}")
    storage_path: str
    title_en: str = ""
    title_zh: str = ""
    event_date: str = ""  # ISO date YYYY-MM-DD
    location: str = ""
    event_link: str = ""
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

def build_video_embed(url: str) -> Optional[str]:
    import re
    if not url:
        return None
    # YouTube long / short / shorts
    m = re.search(r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/|v/)|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    if m:
        return f"https://www.youtube.com/embed/{m.group(1)}"
    # Vimeo
    m = re.search(r'vimeo\.com/(?:video/)?(\d+)', url)
    if m:
        return f"https://player.vimeo.com/video/{m.group(1)}"
    return None

def extract_instagram_shortcode(url: str) -> Optional[str]:
    import re
    match = re.search(r'instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)', url)
    return match.group(1) if match else None

async def get_user_from_auth(authorization: str = Header(None), auth: str = Query(None)):
    auth_header = authorization or (f"Bearer {auth}" if auth else None)
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_token = auth_header.replace("Bearer ", "")
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    user_doc.pop("password_hash", None)

    return User(**user_doc)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
        
        existing = await db.site_settings.find_one({}, {"_id": 0})
        if not existing:
            await db.site_settings.insert_one(SiteSettings().model_dump())
            logger.info("Site settings initialized")
        
        club_info = await db.club_info.find_one({}, {"_id": 0})
        if not club_info:
            await db.club_info.insert_one(ClubInfo().model_dump())
            logger.info("Club info initialized")

        await seed_admin()
    except Exception as e:
        logger.error(f"Startup error: {e}")

def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def _verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        logger.warning("ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping seed")
        return
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    hashed = _hash_password(admin_password)
    if existing is None:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "Admin",
            "picture": "",
            "role": "admin",
            "password_hash": hashed,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
        logger.info(f"Admin seeded: {admin_email}")
    else:
        # Always sync the .env password so ops can rotate it
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hashed, "role": "admin"}})
        logger.info(f"Admin password synced: {admin_email}")

class LoginPayload(BaseModel):
    email: str
    password: str

@api_router.post("/auth/login")
async def login(payload: LoginPayload):
    email = payload.email.lower().strip()
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not _verify_password(payload.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session_token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session = UserSession(
        user_id=user_doc["user_id"],
        session_token=session_token,
        expires_at=expires_at.isoformat(),
        created_at=datetime.now(timezone.utc).isoformat()
    )
    await db.user_sessions.insert_one(session.model_dump())

    user_doc.pop("password_hash", None)
    return {"session_token": session_token, "user": user_doc}

@api_router.get("/auth/me")
async def get_current_user(authorization: str = Header(None)):
    user = await get_user_from_auth(authorization=authorization)
    return user

@api_router.post("/auth/logout")
async def logout(authorization: str = Header(None)):
    if not authorization:
        return {"message": "Logged out"}
    
    session_token = authorization.replace("Bearer ", "")
    await db.user_sessions.delete_many({"session_token": session_token})
    return {"message": "Logged out"}

@api_router.get("/club-info")
async def get_club_info():
    info = await db.club_info.find_one({}, {"_id": 0})
    if not info:
        return ClubInfo().model_dump()
    return info

@api_router.put("/club-info")
async def update_club_info(data: ClubInfo, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    await db.club_info.update_one({}, {"$set": data.model_dump()}, upsert=True)
    return {"message": "Updated"}

@api_router.get("/history")
async def get_history():
    events = await db.history_timeline.find({}, {"_id": 0}).sort("year", 1).to_list(1000)
    return events

@api_router.post("/history")
async def create_history(
    year: int = Form(...),
    title_en: str = Form(...),
    title_zh: str = Form(...),
    description_en: str = Form(""),
    description_zh: str = Form(""),
    order: int = Form(0),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    image_path = None
    if file and file.filename:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        path = f"{APP_NAME}/history/{uuid.uuid4()}.{ext}"
        data = await file.read()
        result = put_object(path, data, file.content_type or "image/jpeg")
        image_path = result["path"]
    event = HistoryEvent(
        year=year, title_en=title_en, title_zh=title_zh,
        description_en=description_en, description_zh=description_zh,
        order=order, image_path=image_path
    )
    await db.history_timeline.insert_one(event.model_dump())
    return event

@api_router.put("/history/{event_id}")
async def update_history(
    event_id: str,
    year: int = Form(...),
    title_en: str = Form(...),
    title_zh: str = Form(...),
    description_en: str = Form(""),
    description_zh: str = Form(""),
    order: int = Form(0),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    update_data = {
        "year": year, "title_en": title_en, "title_zh": title_zh,
        "description_en": description_en, "description_zh": description_zh,
        "order": order
    }
    if file and file.filename:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        path = f"{APP_NAME}/history/{uuid.uuid4()}.{ext}"
        data = await file.read()
        result = put_object(path, data, file.content_type or "image/jpeg")
        update_data["image_path"] = result["path"]
    result = await db.history_timeline.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Updated"}

@api_router.delete("/history/{event_id}")
async def delete_history(event_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.history_timeline.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    query = {"is_deleted": False}
    if category:
        query["category"] = category
    items = await db.gallery_items.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api_router.post("/gallery/upload")
async def upload_gallery_image(
    file: UploadFile = File(...),
    title_en: str = Form(""),
    title_zh: str = Form(""),
    category: str = Form(...),
    event_date: str = Form(""),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/jpeg")
    
    item = GalleryItem(
        storage_path=result["path"],
        original_filename=file.filename,
        title_en=title_en,
        title_zh=title_zh,
        category=category,
        event_date=event_date if event_date else None
    )
    await db.gallery_items.insert_one(item.model_dump())
    return item

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.gallery_items.update_one({"id": item_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/files/{path:path}")
async def get_file(path: str, authorization: str = Header(None), auth: str = Query(None)):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File retrieval error: {e}")
        raise HTTPException(status_code=404, detail="File not found")

@api_router.get("/packages")
async def get_packages():
    packages = await db.performance_packages.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return packages

@api_router.post("/packages")
async def create_package(package: PerformancePackage, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    await db.performance_packages.insert_one(package.model_dump())
    return package

@api_router.put("/packages/{package_id}")
async def update_package(package_id: str, package: PerformancePackage, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.performance_packages.update_one({"id": package_id}, {"$set": package.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return package

@api_router.delete("/packages/{package_id}")
async def delete_package(package_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.performance_packages.update_one({"id": package_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.post("/enquiries")
async def create_enquiry(enquiry: Enquiry):
    await db.enquiries.insert_one(enquiry.model_dump())
    return enquiry

@api_router.post("/enquiries/upload")
async def upload_enquiry_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    path = f"{APP_NAME}/enquiries/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/pdf")
    return {"path": result["path"], "filename": file.filename}

@api_router.get("/enquiries")
async def get_enquiries(authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return enquiries

@api_router.put("/enquiries/{enquiry_id}")
async def update_enquiry(enquiry_id: str, status: str = Form(...), authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Updated"}

@api_router.get("/achievements")
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).sort("year", -1).to_list(1000)
    return achievements

@api_router.post("/achievements")
async def create_achievement(
    title_en: str = Form(...),
    title_zh: str = Form(...),
    year: int = Form(...),
    location: str = Form(""),
    description_en: str = Form(""),
    description_zh: str = Form(""),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    
    image_path = None
    if file:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        path = f"{APP_NAME}/achievements/{uuid.uuid4()}.{ext}"
        data = await file.read()
        result = put_object(path, data, file.content_type or "image/jpeg")
        image_path = result["path"]
    
    achievement = Achievement(
        title_en=title_en,
        title_zh=title_zh,
        year=year,
        location=location,
        description_en=description_en,
        description_zh=description_zh,
        image_path=image_path
    )
    await db.achievements.insert_one(achievement.model_dump())
    return achievement

@api_router.delete("/achievements/{achievement_id}")
async def delete_achievement(achievement_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.achievements.delete_one({"id": achievement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/team")
async def get_team():
    members = await db.team_members.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return members

@api_router.post("/team")
async def create_team_member(
    name_en: str = Form(...),
    name_zh: str = Form(...),
    position_en: str = Form(...),
    position_zh: str = Form(...),
    session: str = Form(...),
    bio_en: str = Form(""),
    bio_zh: str = Form(""),
    order: int = Form(0),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    
    image_path = None
    if file:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        path = f"{APP_NAME}/team/{uuid.uuid4()}.{ext}"
        data = await file.read()
        result = put_object(path, data, file.content_type or "image/jpeg")
        image_path = result["path"]
    
    member = TeamMember(
        name_en=name_en,
        name_zh=name_zh,
        position_en=position_en,
        position_zh=position_zh,
        session=session,
        bio_en=bio_en,
        bio_zh=bio_zh,
        order=order,
        image_path=image_path
    )
    await db.team_members.insert_one(member.model_dump())
    return member

@api_router.delete("/team/{member_id}")
async def delete_team_member(member_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.team_members.update_one({"id": member_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        return SiteSettings().model_dump()
    return settings

@api_router.put("/settings")
async def update_settings(settings: SiteSettings, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    await db.site_settings.update_one({}, {"$set": settings.model_dump()}, upsert=True)
    return {"message": "Updated"}

@api_router.post("/settings/logo")
async def upload_logo(file: UploadFile = File(...), authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    path = f"{APP_NAME}/logo/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/png")
    await db.site_settings.update_one({}, {"$set": {"logo_path": result["path"]}}, upsert=True)
    return {"logo_path": result["path"]}

@api_router.post("/join-us")
async def submit_join_us(submission: JoinUsSubmission):
    await db.join_us_submissions.insert_one(submission.model_dump())
    return submission

@api_router.get("/join-us")
async def get_join_us_submissions(authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    submissions = await db.join_us_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return submissions

@api_router.get("/instagram-posts")
async def get_instagram_posts():
    posts = await db.instagram_posts.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return posts

@api_router.post("/instagram-posts")
async def create_instagram_post(post: InstagramPost, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    shortcode = extract_instagram_shortcode(post.post_url)
    if not shortcode:
        raise HTTPException(status_code=400, detail="Invalid Instagram URL. Use format: https://www.instagram.com/p/SHORTCODE/")
    post.shortcode = shortcode
    await db.instagram_posts.insert_one(post.model_dump())
    return post

@api_router.delete("/instagram-posts/{post_id}")
async def delete_instagram_post(post_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.instagram_posts.update_one({"id": post_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/hero-images")
async def get_hero_images():
    items = await db.hero_images.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return items

@api_router.post("/hero-images")
async def upload_hero_image(
    file: UploadFile = File(...),
    caption_en: str = Form(""),
    caption_zh: str = Form(""),
    order: int = Form(0),
    authorization: str = Header(None)
):
    await get_user_from_auth(authorization=authorization)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/hero-carousel/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/jpeg")
    item = HeroImage(
        storage_path=result["path"],
        caption_en=caption_en,
        caption_zh=caption_zh,
        order=order
    )
    await db.hero_images.insert_one(item.model_dump())
    return item

@api_router.delete("/hero-images/{image_id}")
async def delete_hero_image(image_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.hero_images.update_one({"id": image_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

class VideoCreatePayload(BaseModel):
    video_url: str
    title_en: str = ""
    title_zh: str = ""
    order: int = 0

@api_router.get("/videos")
async def get_videos():
    items = await db.performance_videos.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return items

@api_router.post("/videos")
async def create_video(payload: VideoCreatePayload, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    embed = build_video_embed(payload.video_url)
    if not embed:
        raise HTTPException(status_code=400, detail="Unsupported video URL. Please paste a YouTube or Vimeo link.")
    item = PerformanceVideo(
        video_url=payload.video_url,
        embed_url=embed,
        title_en=payload.title_en,
        title_zh=payload.title_zh,
        order=payload.order,
    )
    await db.performance_videos.insert_one(item.model_dump())
    return item

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.performance_videos.update_one({"id": video_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.get("/posters")
async def get_posters(upcoming: Optional[bool] = None):
    query = {"is_active": True}
    items = await db.event_posters.find(query, {"_id": 0}).to_list(1000)
    if upcoming:
        today = datetime.now(timezone.utc).date().isoformat()
        items = [p for p in items if (p.get("event_date") or "") >= today]
    items.sort(key=lambda p: (p.get("event_date") or "9999-12-31"))
    return items

@api_router.post("/posters")
async def create_poster(
    file: UploadFile = File(...),
    title_en: str = Form(""),
    title_zh: str = Form(""),
    event_date: str = Form(""),
    location: str = Form(""),
    event_link: str = Form(""),
    authorization: str = Header(None),
):
    await get_user_from_auth(authorization=authorization)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/posters/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/jpeg")
    item = EventPoster(
        storage_path=result["path"],
        title_en=title_en,
        title_zh=title_zh,
        event_date=event_date,
        location=location,
        event_link=event_link,
    )
    await db.event_posters.insert_one(item.model_dump())
    return item

@api_router.delete("/posters/{poster_id}")
async def delete_poster(poster_id: str, authorization: str = Header(None)):
    await get_user_from_auth(authorization=authorization)
    result = await db.event_posters.update_one({"id": poster_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()