import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Seed performance packages
    packages = [
        {
            "id": "pkg_opening",
            "name_en": "Opening Performance",
            "name_zh": "开场表演",
            "description_en": "Suitable for openings, launches and short ceremonies",
            "description_zh": "适合开幕式、启动仪式和短期庆典",
            "duration": "[Insert duration]",
            "performers": "[Insert number]",
            "price_from": "RM [Insert price]",
            "order": 0,
            "is_active": True
        },
        {
            "id": "pkg_standard",
            "name_en": "Standard Performance",
            "name_zh": "标准表演",
            "description_en": "Suitable for university, community and corporate events",
            "description_zh": "适合大学、社区和企业活动",
            "duration": "[Insert duration]",
            "performers": "[Insert number]",
            "price_from": "RM [Insert price]",
            "order": 1,
            "is_active": True
        },
        {
            "id": "pkg_premium",
            "name_en": "Premium Performance",
            "name_zh": "高级表演",
            "description_en": "Suitable for major celebrations, festivals and large-scale events",
            "description_zh": "适合重大庆祝活动、节日和大型活动",
            "duration": "[Insert duration]",
            "performers": "[Insert number]",
            "price_from": "RM [Insert price]",
            "order": 2,
            "is_active": True
        }
    ]
    
    # Check if packages already exist
    existing_packages = await db.performance_packages.count_documents({})
    if existing_packages == 0:
        await db.performance_packages.insert_many(packages)
        print("✓ Seeded performance packages")
    else:
        print("- Packages already exist")
    
    # Seed history timeline
    history_events = [
        {
            "id": "hist_2011",
            "year": 2011,
            "title_en": "Establishment of UTeM 24 Festive Drum Club",
            "title_zh": "UTeM 二十四节令鼓队成立",
            "description_en": "The club was officially founded by passionate students.",
            "description_zh": "该俱乐部由热情的学生正式成立。",
            "order": 0
        },
        {
            "id": "hist_2025",
            "year": 2025,
            "title_en": "Participation in 1st National University 24 Festive Drums Competition",
            "title_zh": "参加第一届全国大学24节令鼓比赛",
            "description_en": "",
            "description_zh": "",
            "order": 1
        },
        {
            "id": "hist_2026",
            "year": 2026,
            "title_en": "Involvement in 2nd National Inter-University 24 Festive Drums Competition",
            "title_zh": "参加第二届全国大学间24节令鼓比赛",
            "description_en": "",
            "description_zh": "",
            "order": 2
        }
    ]
    
    existing_history = await db.history_timeline.count_documents({})
    if existing_history == 0:
        await db.history_timeline.insert_many(history_events)
        print("✓ Seeded history timeline")
    else:
        print("- History already exists")
    
    # Update club info with default values
    await db.club_info.update_one(
        {},
        {
            "$setOnInsert": {
                "established_year": 2011,
                "performances_count": 50,
                "members_count": 30,
                "about_en": "The UTeM 24 Festive Drum Club was established in 2011 as a student organization dedicated to preserving and promoting the traditional art of 24 Festive Drums. We bring together students from diverse backgrounds who share a passion for this unique cultural performance art.",
                "about_zh": "UTeM 二十四节令鼓队成立于 2011 年，是一个致力于保护和推广 24 节令鼓传统艺术的学生组织。我们聚集了来自不同背景的学生，他们对这种独特的文化表演艺术拥有共同的热情。",
                "mission_en": "To preserve and promote the art of 24 Festive Drums while developing discipline, leadership and teamwork among UTeM students.",
                "mission_zh": "保护和推广24节令鼓艺术，同时培养UTeM学生的纪律、领导力和团队精神。"
            }
        },
        upsert=True
    )
    print("✓ Updated club info")
    
    print("\n✓ Database seeding completed!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
