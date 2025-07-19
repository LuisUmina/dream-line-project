"""
Simple Test Runner for Dream Line Project
Tests actual functionality with real API calls (if API keys are configured)
"""

import asyncio
import sys
import os
from bson import ObjectId

# Add backend to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from config import settings
from db import agents_collection, client
from models import AgentConfig
from agent_service import create_agent_from_docs, get_agent_response

async def test_database_connection():
    """Test basic database connectivity"""
    print("🔌 Testing database connection...")
    try:
        await client.admin.command('ping')
        print("✅ Database connected successfully")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_agent_crud_operations():
    """Test basic CRUD operations for agents"""
    print("📝 Testing agent CRUD operations...")
    
    # Create
    test_agent = {
        "name": "CRUD Test Agent",
        "system_prompt": "You are a test agent for CRUD operations",
        "knowledge_summary": "Test knowledge for CRUD"
    }
    
    try:
        # Insert
        result = await agents_collection.insert_one(test_agent)
        agent_id = result.inserted_id
        print("✅ Agent created successfully")
        
        # Read
        found_agent = await agents_collection.find_one({"_id": agent_id})
        assert found_agent["name"] == "CRUD Test Agent"
        print("✅ Agent read successfully")
        
        # Update
        update_result = await agents_collection.update_one(
            {"_id": agent_id},
            {"$set": {"name": "Updated CRUD Test Agent"}}
        )
        assert update_result.modified_count == 1
        print("✅ Agent updated successfully")
        
        # Delete
        delete_result = await agents_collection.delete_one({"_id": agent_id})
        assert delete_result.deleted_count == 1
        print("✅ Agent deleted successfully")
        
        return True
    except Exception as e:
        print(f"❌ CRUD operations failed: {e}")
        return False

async def test_agent_creation_with_api():
    """Test agent creation using Google AI API (requires API key)"""
    print("🤖 Testing agent creation with Google AI...")
    
    if not settings.GOOGLE_API_KEY:
        print("⚠️  Skipping AI test - No Google API key found")
        return True
    
    try:
        name = "AI Test Agent"
        system_prompt = "You are a helpful AI assistant for testing purposes"
        documents = [
            "This is a test document about artificial intelligence.",
            "AI can help solve complex problems and automate tasks.",
            "Testing is important for ensuring software quality."
        ]
        
        # This will make real API call to Google AI
        agent = await create_agent_from_docs(name, system_prompt, documents)
        
        assert agent["name"] == name
        assert agent["system_prompt"] == system_prompt
        assert "knowledge_summary" in agent
        assert agent["knowledge_summary"] is not None
        
        print(f"✅ Agent created: {agent['name']}")
        print(f"📚 Knowledge summary: {agent['knowledge_summary'][:100]}...")
        
        # Test chat with the agent
        agent_id = str(agent["_id"])
        response = await get_agent_response(agent_id, "What can you tell me about testing?")
        
        if response:
            print(f"💬 Agent response: {response[:100]}...")
            print("✅ Agent chat test successful")
        else:
            print("❌ Agent chat test failed")
        
        # Clean up
        await agents_collection.delete_one({"_id": agent["_id"]})
        print("🧹 Test agent cleaned up")
        
        return True
    except Exception as e:
        print(f"❌ AI agent test failed: {e}")
        return False

async def test_model_validation():
    """Test Pydantic model validation"""
    print("🏗️  Testing model validation...")
    
    try:
        # Valid agent config
        valid_data = {
            "name": "Validation Test Agent",
            "system_prompt": "Test prompt",
            "knowledge_summary": "Test knowledge"
        }
        
        agent = AgentConfig(**valid_data)
        assert agent.name == "Validation Test Agent"
        print("✅ Valid model creation successful")
        
        # Test with ObjectId
        agent_with_id = AgentConfig(
            _id=str(ObjectId()),
            name="Agent with ID",
            system_prompt="Test prompt"
        )
        assert agent_with_id.id is not None
        print("✅ Model with ObjectId successful")
        
        return True
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return False

async def test_configuration():
    """Test configuration loading"""
    print("⚙️  Testing configuration...")
    
    try:
        # Check that settings are loaded
        assert hasattr(settings, 'MONGODB_URI')
        assert hasattr(settings, 'DB_NAME')
        assert hasattr(settings, 'GOOGLE_API_KEY')
        
        print(f"✅ MongoDB URI: {settings.MONGODB_URI}")
        print(f"✅ Database Name: {settings.DB_NAME}")
        print(f"✅ Google API Key: {'Set' if settings.GOOGLE_API_KEY else 'Not set'}")
        
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

async def run_manual_tests():
    """Run all tests manually"""
    print("🧪 Dream Line Project - Manual Test Suite")
    print("=" * 50)
    
    test_results = []
    
    # Test configuration
    result = await test_configuration()
    test_results.append(("Configuration", result))
    
    # Test database connection
    result = await test_database_connection()
    test_results.append(("Database Connection", result))
    
    if test_results[-1][1]:  # Only continue if DB connection works
        # Test CRUD operations
        result = await test_agent_crud_operations()
        test_results.append(("CRUD Operations", result))
        
        # Test model validation
        result = await test_model_validation()
        test_results.append(("Model Validation", result))
        
        # Test AI agent creation (if API key available)
        result = await test_agent_creation_with_api()
        test_results.append(("AI Agent Creation", result))
    
    # Print summary
    print("\n📊 Test Results Summary")
    print("-" * 30)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print(f"\nTests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    # Close database connection
    client.close()

if __name__ == "__main__":
    asyncio.run(run_manual_tests())
