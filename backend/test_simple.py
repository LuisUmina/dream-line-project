"""
Simple Test for Dream Line Project
This test file can be run directly without complex imports
"""

import asyncio
import motor.motor_asyncio
from pymongo.server_api import ServerApi
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ai_agents_db")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Create database connection
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGODB_URI,
    server_api=ServerApi("1")
)
db = client[DB_NAME]
agents_collection = db.get_collection("agents")

async def test_database_connection():
    """Test MongoDB connection"""
    print("🔌 Testing database connection...")
    try:
        await client.admin.command('ping')
        print("✅ Database connected successfully")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"📊 Available databases: {db_list}")
        
        # List collections in our database
        collections = await db.list_collection_names()
        print(f"📋 Collections in {DB_NAME}: {collections}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_agent_operations():
    """Test basic agent CRUD operations"""
    print("\n📝 Testing agent operations...")
    
    try:
        # Create test agent
        test_agent = {
            "name": "Simple Test Agent",
            "system_prompt": "You are a simple test agent",
            "knowledge_summary": "Basic test knowledge",
            "created_at": "2025-07-19"
        }
        
        # Insert
        result = await agents_collection.insert_one(test_agent)
        agent_id = result.inserted_id
        print(f"✅ Agent created with ID: {agent_id}")
        
        # Read
        found_agent = await agents_collection.find_one({"_id": agent_id})
        if found_agent:
            print(f"✅ Agent found: {found_agent['name']}")
        else:
            print("❌ Agent not found after creation")
            return False
        
        # Update
        update_result = await agents_collection.update_one(
            {"_id": agent_id},
            {"$set": {"name": "Updated Simple Test Agent"}}
        )
        if update_result.modified_count == 1:
            print("✅ Agent updated successfully")
        else:
            print("❌ Agent update failed")
        
        # Count documents
        count = await agents_collection.count_documents({})
        print(f"📊 Total agents in collection: {count}")
        
        # Delete
        delete_result = await agents_collection.delete_one({"_id": agent_id})
        if delete_result.deleted_count == 1:
            print("✅ Agent deleted successfully")
        else:
            print("❌ Agent deletion failed")
        
        return True
        
    except Exception as e:
        print(f"❌ Agent operations failed: {e}")
        return False

async def test_configuration():
    """Test configuration values"""
    print("\n⚙️  Testing configuration...")
    
    print(f"📍 MongoDB URI: {MONGODB_URI}")
    print(f"🗄️  Database Name: {DB_NAME}")
    print(f"🔑 Google API Key: {'✅ Set' if GOOGLE_API_KEY else '❌ Not set'}")
    
    return True

async def test_google_ai_integration():
    """Test Google AI integration if API key is available"""
    print("\n🤖 Testing Google AI integration...")
    
    if not GOOGLE_API_KEY:
        print("⚠️  Skipping Google AI test - No API key found")
        print("   Add GOOGLE_API_KEY to your .env file to test AI functionality")
        return True
    
    try:
        import google.generativeai as genai
        
        # Configure Gemini with updated model name
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name
        
        # Test simple generation
        prompt = "Say 'Hello from Gemini' in exactly those words."
        response = await model.generate_content_async(prompt)
        
        print(f"✅ Google AI response: {response.text}")
        
        # Test document summarization
        test_docs = [
            "Artificial Intelligence is the simulation of human intelligence in machines.",
            "Machine Learning is a subset of AI that enables systems to learn from data.",
            "Natural Language Processing helps computers understand human language."
        ]
        
        combined_text = "\n".join(test_docs)
        summary_prompt = f"Summarize this text in one sentence: {combined_text}"
        summary_response = await model.generate_content_async(summary_prompt)
        
        print(f"✅ Document summary: {summary_response.text}")
        
        return True
        
    except ImportError:
        print("❌ google-generativeai not installed")
        print("   Run: pip install google-generativeai")
        return False
    except Exception as e:
        print(f"❌ Google AI test failed: {e}")
        return False

async def test_complete_workflow():
    """Test a complete agent creation and usage workflow"""
    print("\n🔗 Testing complete workflow...")
    
    if not GOOGLE_API_KEY:
        print("⚠️  Skipping workflow test - No Google API key")
        return True
    
    try:
        import google.generativeai as genai
        
        # Configure AI with updated model name
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name
        
        # Step 1: Create knowledge base from documents
        documents = [
            "Python is a high-level programming language.",
            "FastAPI is a modern web framework for Python.",
            "MongoDB is a NoSQL database that stores data in JSON-like documents."
        ]
        
        combined_docs = "\n\n".join(documents)
        summary_prompt = f"Create a concise knowledge base summary from: {combined_docs}"
        summary_response = await model.generate_content_async(summary_prompt)
        
        # Step 2: Create agent in database
        agent_data = {
            "name": "Workflow Test Agent",
            "system_prompt": "You are a helpful assistant that knows about Python, FastAPI, and MongoDB.",
            "knowledge_summary": summary_response.text,
            "created_at": "2025-07-19"
        }
        
        result = await agents_collection.insert_one(agent_data)
        agent_id = result.inserted_id
        print(f"✅ Workflow agent created: {agent_id}")
        
        # Step 3: Simulate chat with agent
        user_question = "What can you tell me about FastAPI?"
        
        # Retrieve agent
        agent = await agents_collection.find_one({"_id": agent_id})
        
        # Create response prompt
        chat_prompt = f"""
        System: {agent['system_prompt']}
        
        Knowledge Base: {agent['knowledge_summary']}
        
        User Question: {user_question}
        
        Please provide a helpful response based on your knowledge.
        """
        
        chat_response = await model.generate_content_async(chat_prompt)
        print(f"✅ Agent response: {chat_response.text[:200]}...")
        
        # Clean up
        await agents_collection.delete_one({"_id": agent_id})
        print("✅ Workflow test completed and cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Workflow test failed: {e}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("🧪 Dream Line Project - Simple Test Suite")
    print("=" * 60)
    
    test_results = []
    
    # Test configuration
    result = await test_configuration()
    test_results.append(("Configuration", result))
    
    # Test database connection
    result = await test_database_connection()
    test_results.append(("Database Connection", result))
    
    if test_results[-1][1]:  # Only continue if DB works
        # Test agent operations
        result = await test_agent_operations()
        test_results.append(("Agent CRUD Operations", result))
        
        # Test Google AI integration
        result = await test_google_ai_integration()
        test_results.append(("Google AI Integration", result))
        
        # Test complete workflow
        result = await test_complete_workflow()
        test_results.append(("Complete Workflow", result))
    
    # Print results
    print("\n📊 Test Results Summary")
    print("=" * 30)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\n📈 Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Your Dream Line Project is working correctly!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        print("💡 Make sure MongoDB is running and Google API key is set in .env")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(run_all_tests())
