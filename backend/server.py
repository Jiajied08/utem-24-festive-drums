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
    except Exception as e:
        logger.error(f"Startup error: {e}")

@api_router.post("/auth/session")
async def create_session(session_id: str = Header(None, alias="X-Session-ID")):
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    
    try:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"Session exchange failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture", "")}}
        )
    else:
        user = User(
            user_id=user_id,
            email=data["email"],
            name=data["name"],
            picture=data.get("picture", ""),
            role="admin",
            created_at=datetime.now(timezone.utc).isoformat()
        )
        await db.users.insert_one(user.model_dump())
    
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at.isoformat(),
        created_at=datetime.now(timezone.utc).isoformat()
    )
    await db.user_sessions.insert_one(session.model_dump())
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
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