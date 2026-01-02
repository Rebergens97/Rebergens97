from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

app = FastAPI(title="DrepanHope Foundation API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRole:
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    role: str = UserRole.VIEWER
    password_hash: str = ""
    status: str = "active"
    force_password_change: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str = UserRole.ADMIN
    password: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class AmountCard(BaseModel):
    amount: int
    impact_en: str
    impact_fr: str

class Campaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title_en: str
    title_fr: str
    summary_en: str
    summary_fr: str
    body_en: str
    body_fr: str
    goal_amount: float = 0
    active: bool = True
    cover_image: str = ""
    amount_cards: List[AmountCard] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CampaignCreate(BaseModel):
    slug: str
    title_en: str
    title_fr: str
    summary_en: str
    summary_fr: str
    body_en: str
    body_fr: str
    goal_amount: float = 0
    active: bool = True
    cover_image: str = ""
    amount_cards: List[AmountCard] = []

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_first_name: str
    donor_last_name: str
    email: EmailStr
    country: str
    amount: float
    campaign_id: str
    donation_type: str = "one_time"
    status: str = "pending"
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    donor_first_name: str
    donor_last_name: str
    email: EmailStr
    country: str
    amount: float
    campaign_id: str
    donation_type: str = "one_time"
    message: Optional[str] = None

class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title_en: str
    title_fr: str
    description_en: str
    description_fr: str
    amount_spent: float = 0
    campaign_id: Optional[str] = None
    attachments: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportCreate(BaseModel):
    title_en: str
    title_fr: str
    description_en: str
    description_fr: str
    amount_spent: float = 0
    campaign_id: Optional[str] = None
    attachments: List[str] = []

class Update(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title_en: str
    title_fr: str
    body_en: str
    body_fr: str
    campaign_id: Optional[str] = None
    images: List[str] = []
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UpdateCreate(BaseModel):
    title_en: str
    title_fr: str
    body_en: str
    body_fr: str
    campaign_id: Optional[str] = None
    images: List[str] = []
    published: bool = True

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str
    entity_type: str
    entity_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = {}

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    contact_email: str = "contact@drepanhope.org"
    whatsapp: str = "+1 (000) 000-0000"
    facebook: str = "https://facebook.com/drepanhope"
    twitter: str = "https://twitter.com/drepanhope"
    instagram: str = "https://instagram.com/drepanhope"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_jwt_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("status") != "active":
        raise HTTPException(status_code=401, detail="User account is disabled")
    return user

def require_roles(allowed_roles: List[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

async def create_audit_log(user_id: str, action: str, entity_type: str, entity_id: str, metadata: dict = {}):
    log = AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, metadata=metadata)
    doc = log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(doc)

def serialize_datetime(doc: dict) -> dict:
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def deserialize_datetime(doc: dict, fields: List[str]) -> dict:
    for field in fields:
        if field in doc and isinstance(doc[field], str):
            doc[field] = datetime.fromisoformat(doc[field])
    return doc

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "DrepanHope Foundation API", "status": "running"}

@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns(active_only: bool = True):
    query = {"active": True} if active_only else {}
    campaigns = await db.campaigns.find(query, {"_id": 0}).to_list(100)
    return campaigns

@api_router.get("/campaigns/{slug}")
async def get_campaign_by_slug(slug: str):
    campaign = await db.campaigns.find_one({"slug": slug}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@api_router.post("/donations", response_model=Donation)
async def create_donation(donation_data: DonationCreate):
    donation = Donation(**donation_data.model_dump())
    doc = donation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.donations.insert_one(doc)
    return donation

@api_router.get("/reports", response_model=List[Report])
async def get_reports(campaign_id: Optional[str] = None):
    query = {"campaign_id": campaign_id} if campaign_id else {}
    reports = await db.reports.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return reports

@api_router.get("/reports/{report_id}")
async def get_report(report_id: str):
    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@api_router.get("/updates", response_model=List[Update])
async def get_updates(campaign_id: Optional[str] = None, published_only: bool = True):
    query = {}
    if campaign_id:
        query["campaign_id"] = campaign_id
    if published_only:
        query["published"] = True
    updates = await db.updates.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return updates

@api_router.get("/transparency/summary")
async def get_transparency_summary():
    total_raised = await db.donations.aggregate([
        {"$match": {"status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    total_spent = await db.reports.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount_spent"}}}
    ]).to_list(1)
    last_report = await db.reports.find_one({}, {"_id": 0}, sort=[("date", -1)])
    return {
        "total_raised": total_raised[0]["total"] if total_raised else 0,
        "total_spent": total_spent[0]["total"] if total_spent else 0,
        "last_updated": last_report["date"] if last_report else None
    }

@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    doc = message.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(doc)
    return {"success": True, "message": "Message sent successfully"}

@api_router.get("/settings/public")
async def get_public_settings():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
    return {
        "contact_email": settings.get("contact_email", "contact@drepanhope.org"),
        "whatsapp": settings.get("whatsapp", "+1 (000) 000-0000"),
        "facebook": settings.get("facebook", ""),
        "twitter": settings.get("twitter", ""),
        "instagram": settings.get("instagram", "")
    }

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.get("status") != "active":
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Update last login
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}})
    
    token = create_jwt_token(user["id"], user["email"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "force_password_change": user.get("force_password_change", False)
        }
    }

@api_router.post("/auth/change-password")
async def change_password(data: PasswordChange, user: dict = Depends(get_current_user)):
    if not verify_password(data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"id": user["id"]}, 
        {"$set": {"password_hash": new_hash, "force_password_change": False}}
    )
    await create_audit_log(user["id"], "password_change", "user", user["id"])
    return {"success": True, "message": "Password changed successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "force_password_change": user.get("force_password_change", False)
    }

# ==================== ADMIN ROUTES ====================

# Dashboard Stats
@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER]))):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    first_of_month = today.replace(day=1)
    
    donations_today = await db.donations.count_documents({"created_at": {"$gte": today.isoformat()}})
    donations_month = await db.donations.count_documents({"created_at": {"$gte": first_of_month.isoformat()}})
    donations_total = await db.donations.count_documents({})
    
    amount_today = await db.donations.aggregate([
        {"$match": {"created_at": {"$gte": today.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    amount_month = await db.donations.aggregate([
        {"$match": {"created_at": {"$gte": first_of_month.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    amount_total = await db.donations.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    by_campaign = await db.donations.aggregate([
        {"$group": {"_id": "$campaign_id", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(100)
    
    by_type = await db.donations.aggregate([
        {"$group": {"_id": "$donation_type", "count": {"$sum": 1}}}
    ]).to_list(10)
    
    return {
        "donations": {
            "today": donations_today,
            "month": donations_month,
            "total": donations_total
        },
        "amounts": {
            "today": amount_today[0]["total"] if amount_today else 0,
            "month": amount_month[0]["total"] if amount_month else 0,
            "total": amount_total[0]["total"] if amount_total else 0
        },
        "by_campaign": by_campaign,
        "by_type": by_type
    }

# Campaigns Management
@api_router.get("/admin/campaigns")
async def admin_get_campaigns(user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(100)
    return campaigns

@api_router.post("/admin/campaigns")
async def admin_create_campaign(data: CampaignCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    campaign = Campaign(**data.model_dump())
    doc = campaign.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    for card in doc['amount_cards']:
        if isinstance(card, dict) is False:
            card = card.model_dump()
    await db.campaigns.insert_one(doc)
    await create_audit_log(user["id"], "create", "campaign", campaign.id, {"title": data.title_en})
    return campaign

@api_router.put("/admin/campaigns/{campaign_id}")
async def admin_update_campaign(campaign_id: str, data: CampaignCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.campaigns.update_one({"id": campaign_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await create_audit_log(user["id"], "update", "campaign", campaign_id, {"title": data.title_en})
    return {"success": True}

@api_router.delete("/admin/campaigns/{campaign_id}")
async def admin_delete_campaign(campaign_id: str, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    result = await db.campaigns.delete_one({"id": campaign_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await create_audit_log(user["id"], "delete", "campaign", campaign_id)
    return {"success": True}

# Donations Management
@api_router.get("/admin/donations")
async def admin_get_donations(
    status: Optional[str] = None,
    campaign_id: Optional[str] = None,
    donation_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))
):
    query = {}
    if status:
        query["status"] = status
    if campaign_id:
        query["campaign_id"] = campaign_id
    if donation_type:
        query["donation_type"] = donation_type
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        query.setdefault("created_at", {})["$lte"] = end_date
    
    donations = await db.donations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return donations

@api_router.put("/admin/donations/{donation_id}/status")
async def admin_update_donation_status(donation_id: str, status: str, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    if status not in ["pending", "paid", "failed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.donations.update_one({"id": donation_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Donation not found")
    await create_audit_log(user["id"], "update_status", "donation", donation_id, {"new_status": status})
    return {"success": True}

@api_router.get("/admin/donations/export")
async def admin_export_donations(user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    donations = await db.donations.find({}, {"_id": 0}).to_list(10000)
    return {"donations": donations}

# Reports Management
@api_router.get("/admin/reports")
async def admin_get_reports(user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    reports = await db.reports.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return reports

@api_router.post("/admin/reports")
async def admin_create_report(data: ReportCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    report = Report(**data.model_dump())
    doc = report.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reports.insert_one(doc)
    await create_audit_log(user["id"], "create", "report", report.id, {"title": data.title_en})
    return report

@api_router.put("/admin/reports/{report_id}")
async def admin_update_report(report_id: str, data: ReportCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    update_data = data.model_dump()
    result = await db.reports.update_one({"id": report_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    await create_audit_log(user["id"], "update", "report", report_id, {"title": data.title_en})
    return {"success": True}

@api_router.delete("/admin/reports/{report_id}")
async def admin_delete_report(report_id: str, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    result = await db.reports.delete_one({"id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    await create_audit_log(user["id"], "delete", "report", report_id)
    return {"success": True}

# Updates Management
@api_router.get("/admin/updates")
async def admin_get_updates(user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    updates = await db.updates.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return updates

@api_router.post("/admin/updates")
async def admin_create_update(data: UpdateCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    update = Update(**data.model_dump())
    doc = update.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.updates.insert_one(doc)
    await create_audit_log(user["id"], "create", "update", update.id, {"title": data.title_en})
    return update

@api_router.put("/admin/updates/{update_id}")
async def admin_update_update(update_id: str, data: UpdateCreate, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR]))):
    update_data = data.model_dump()
    result = await db.updates.update_one({"id": update_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    await create_audit_log(user["id"], "update", "update", update_id, {"title": data.title_en})
    return {"success": True}

@api_router.delete("/admin/updates/{update_id}")
async def admin_delete_update(update_id: str, user: dict = Depends(require_roles([UserRole.OWNER, UserRole.ADMIN]))):
    result = await db.updates.delete_one({"id": update_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    await create_audit_log(user["id"], "delete", "update", update_id)
    return {"success": True}

# Users Management (Owner only)
@api_router.get("/admin/users")
async def admin_get_users(user: dict = Depends(require_roles([UserRole.OWNER]))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return users

@api_router.post("/admin/users")
async def admin_create_user(data: UserCreate, user: dict = Depends(require_roles([UserRole.OWNER]))):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    temp_password = data.password if data.password else secrets.token_urlsafe(12)
    new_user = User(
        name=data.name,
        email=data.email,
        role=data.role,
        password_hash=hash_password(temp_password),
        force_password_change=True
    )
    doc = new_user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    await create_audit_log(user["id"], "create", "user", new_user.id, {"email": data.email, "role": data.role})
    
    return {
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        },
        "temporary_password": temp_password
    }

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, data: UserCreate, user: dict = Depends(require_roles([UserRole.OWNER]))):
    update_data = {"name": data.name, "email": data.email, "role": data.role}
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(user["id"], "update", "user", user_id, {"email": data.email, "role": data.role})
    return {"success": True}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, user: dict = Depends(require_roles([UserRole.OWNER]))):
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(user["id"], "delete", "user", user_id)
    return {"success": True}

@api_router.put("/admin/users/{user_id}/status")
async def admin_toggle_user_status(user_id: str, status: str, user: dict = Depends(require_roles([UserRole.OWNER]))):
    if status not in ["active", "disabled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
    result = await db.users.update_one({"id": user_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(user["id"], "update_status", "user", user_id, {"new_status": status})
    return {"success": True}

# Settings Management (Owner only)
@api_router.get("/admin/settings")
async def admin_get_settings(user: dict = Depends(require_roles([UserRole.OWNER]))):
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
    return settings

@api_router.put("/admin/settings")
async def admin_update_settings(data: dict, user: dict = Depends(require_roles([UserRole.OWNER]))):
    data["id"] = "settings"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one({"id": "settings"}, {"$set": data}, upsert=True)
    await create_audit_log(user["id"], "update", "settings", "settings")
    return {"success": True}

# Audit Logs
@api_router.get("/admin/audit-logs")
async def admin_get_audit_logs(user: dict = Depends(require_roles([UserRole.OWNER]))):
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).to_list(500)
    return logs

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_database():
    # Check if already seeded
    existing_owner = await db.users.find_one({"role": UserRole.OWNER})
    if existing_owner:
        return {"message": "Database already seeded", "owner_email": existing_owner["email"]}
    
    # Generate temporary password
    temp_password = secrets.token_urlsafe(12)
    
    # Create owner user
    owner = User(
        name="Admin",
        email="admin@drepanhope.org",
        role=UserRole.OWNER,
        password_hash=hash_password(temp_password),
        force_password_change=True
    )
    owner_doc = owner.model_dump()
    owner_doc['created_at'] = owner_doc['created_at'].isoformat()
    await db.users.insert_one(owner_doc)
    
    # Create campaigns with exact impact texts from requirements
    sickle_cell_campaign = Campaign(
        slug="sickle-cell",
        title_en="Sickle Cell Disease Support",
        title_fr="Soutien à la Drépanocytose",
        summary_en="Help us provide screening, treatment, and support for those affected by sickle cell disease.",
        summary_fr="Aidez-nous à fournir dépistage, traitement et soutien aux personnes atteintes de drépanocytose.",
        body_en="""Sickle cell disease is a genetic blood disorder that affects millions of people worldwide. It causes red blood cells to become misshapen, leading to severe pain, organ damage, and other life-threatening complications.

Our mission is to provide comprehensive support including:
- Early screening and diagnosis
- Access to essential medications
- Crisis prevention and emergency care
- Community awareness and education

Every donation helps us reach more families and provide the care they desperately need.""",
        body_fr="""La drépanocytose est une maladie génétique du sang qui touche des millions de personnes dans le monde. Elle provoque la déformation des globules rouges, entraînant des douleurs sévères, des lésions organiques et d'autres complications potentiellement mortelles.

Notre mission est de fournir un soutien complet comprenant :
- Dépistage et diagnostic précoces
- Accès aux médicaments essentiels
- Prévention des crises et soins d'urgence
- Sensibilisation communautaire et éducation

Chaque don nous aide à atteindre plus de familles et à leur fournir les soins dont elles ont désespérément besoin.""",
        goal_amount=50000,
        cover_image="https://images.pexels.com/photos/7465698/pexels-photo-7465698.jpeg",
        amount_cards=[
            AmountCard(amount=25, impact_en="Helps fund a screening test and patient guidance.", impact_fr="Contribue à financer un dépistage et l'orientation d'un patient."),
            AmountCard(amount=50, impact_en="Supports a basic consultation and follow-up care.", impact_fr="Aide à financer une consultation et un suivi de base."),
            AmountCard(amount=100, impact_en="Helps provide essential medicines and crisis prevention support.", impact_fr="Soutient l'accès aux médicaments essentiels et la prévention des crises."),
            AmountCard(amount=250, impact_en="Contributes to urgent care (tests + stabilization).", impact_fr="Contribue à une prise en charge d'urgence (examens + stabilisation)."),
            AmountCard(amount=500, impact_en="Helps fund community screening and awareness outreach.", impact_fr="Aide à financer une campagne de dépistage et de sensibilisation.")
        ]
    )
    
    pregnancy_campaign = Campaign(
        slug="pregnancy-testing",
        title_en="Pregnancy & Genetic Testing",
        title_fr="Grossesse & Dépistage Génétique",
        summary_en="Support expectant mothers with blood type testing and genetic counseling to prevent complications.",
        summary_fr="Soutenez les futures mamans avec des tests de groupe sanguin et un conseil génétique pour prévenir les complications.",
        body_en="""Genetic testing during pregnancy is crucial for identifying potential risks and ensuring the health of both mother and baby. Our program focuses on:

- Blood type and Rh factor testing
- Sickle cell trait screening (AA/AS/SS)
- Genetic counseling for couples
- Prenatal care support
- Newborn risk assessment and care

Early detection and proper care can prevent serious complications and save lives. Your donation makes this possible for families who cannot afford these essential tests.""",
        body_fr="""Le dépistage génétique pendant la grossesse est crucial pour identifier les risques potentiels et assurer la santé de la mère et du bébé. Notre programme se concentre sur :

- Tests de groupe sanguin et facteur Rhésus
- Dépistage du trait drépanocytaire (AA/AS/SS)
- Conseil génétique pour les couples
- Soutien aux soins prénatals
- Évaluation des risques et soins du nouveau-né

La détection précoce et les soins appropriés peuvent prévenir des complications graves et sauver des vies. Votre don rend cela possible pour les familles qui ne peuvent pas se permettre ces tests essentiels.""",
        goal_amount=35000,
        cover_image="https://images.pexels.com/photos/9441512/pexels-photo-9441512.jpeg",
        amount_cards=[
            AmountCard(amount=25, impact_en="Helps fund blood type & Rh testing for an expecting mother.", impact_fr="Contribue au test de groupe sanguin & Rhésus pour une future maman."),
            AmountCard(amount=50, impact_en="Supports sickle-cell screening and basic counseling for a couple.", impact_fr="Aide à financer un dépistage drépanocytose et une information de base pour un couple."),
            AmountCard(amount=100, impact_en="Helps support prenatal follow-up and complication prevention.", impact_fr="Soutient le suivi prénatal et la prévention des complications."),
            AmountCard(amount=250, impact_en="Contributes to Rh prevention and newborn risk care support.", impact_fr="Contribue à la prévention Rhésus et à la prise en charge d'un nouveau-né à risque."),
            AmountCard(amount=500, impact_en="Helps equip a local partner clinic to support multiple families.", impact_fr="Aide à équiper une structure partenaire pour soutenir plusieurs familles.")
        ]
    )
    
    for campaign in [sickle_cell_campaign, pregnancy_campaign]:
        doc = campaign.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.campaigns.insert_one(doc)
    
    # Create sample reports
    report1 = Report(
        title_en="Q4 2024 Impact Report",
        title_fr="Rapport d'Impact T4 2024",
        description_en="In Q4 2024, we successfully screened 250 individuals for sickle cell disease and provided medical support to 45 families in need.",
        description_fr="Au T4 2024, nous avons réussi à dépister 250 personnes pour la drépanocytose et fourni un soutien médical à 45 familles dans le besoin.",
        amount_spent=12500,
        campaign_id=sickle_cell_campaign.id
    )
    
    report2 = Report(
        title_en="Prenatal Testing Program Launch",
        title_fr="Lancement du Programme de Dépistage Prénatal",
        description_en="We launched our prenatal testing program, providing free blood type and genetic screening to 100 expecting mothers.",
        description_fr="Nous avons lancé notre programme de dépistage prénatal, offrant des tests de groupe sanguin et un dépistage génétique gratuits à 100 futures mamans.",
        amount_spent=8750,
        campaign_id=pregnancy_campaign.id
    )
    
    for report in [report1, report2]:
        doc = report.model_dump()
        doc['date'] = doc['date'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.reports.insert_one(doc)
    
    # Create sample updates
    update1 = Update(
        title_en="New Partnership with Local Clinics",
        title_fr="Nouveau Partenariat avec des Cliniques Locales",
        body_en="We are excited to announce new partnerships with 5 local clinics, expanding our reach to more communities in need.",
        body_fr="Nous sommes ravis d'annoncer de nouveaux partenariats avec 5 cliniques locales, élargissant notre portée à plus de communautés dans le besoin.",
        campaign_id=sickle_cell_campaign.id,
        images=["https://images.pexels.com/photos/6129494/pexels-photo-6129494.jpeg"]
    )
    
    update2 = Update(
        title_en="Success Story: Maria's Journey",
        title_fr="Témoignage: Le Parcours de Maria",
        body_en="Thanks to early screening and support from DrepanHope, Maria was able to receive proper prenatal care and gave birth to a healthy baby.",
        body_fr="Grâce au dépistage précoce et au soutien de DrepanHope, Maria a pu recevoir des soins prénatals appropriés et a donné naissance à un bébé en bonne santé.",
        campaign_id=pregnancy_campaign.id
    )
    
    for update in [update1, update2]:
        doc = update.model_dump()
        doc['date'] = doc['date'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.updates.insert_one(doc)
    
    # Create default settings
    settings = Settings()
    settings_doc = settings.model_dump()
    settings_doc['updated_at'] = settings_doc['updated_at'].isoformat()
    await db.settings.insert_one(settings_doc)
    
    return {
        "message": "Database seeded successfully",
        "owner_email": "admin@drepanhope.org",
        "temporary_password": temp_password,
        "important": "Please save this password and change it on first login!"
    }

# Include the router
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
