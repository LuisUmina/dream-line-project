import motor.motor_asyncio
from pymongo.server_api import ServerApi
from config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(
    settings.MONGODB_URI,
    server_api=ServerApi("1")
)
db = client[settings.DB_NAME]
agents_collection = db.get_collection("agents")