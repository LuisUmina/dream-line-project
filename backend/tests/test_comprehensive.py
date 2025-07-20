"""
Comprehensive Test Suite for Dream Line Project Backend
Tests all functionalities including database, models, API endpoints, and agent services
"""

import pytest
import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from bson import ObjectId

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.main import app
from backend.config import settings
from backend.models import AgentConfig, PyObjectId
from backend.db import agents_collection, client, db
from backend.agent_service import create_agent_from_docs, get_agent_response

# Test client for FastAPI
test_client = TestClient(app)

class TestConfig:
    """Test configuration and environment variables"""
    
    def test_settings_exist(self):
        """Test that settings are properly loaded"""
        assert hasattr(settings, 'MONGODB_URI')
        assert hasattr(settings, 'DB_NAME')
        assert hasattr(settings, 'GOOGLE_API_KEY')
        assert settings.MONGODB_URI is not None
        assert settings.DB_NAME is not None
    
    def test_validate_required_keys(self):
        """Test validation of required API keys"""
        # This will depend on whether you have keys in your .env
        try:
            result = settings.validate_required_keys()
            assert result is True
        except ValueError as e:
            # Expected if API keys are not set
            assert "Missing required environment variables" in str(e)

class TestModels:
    """Test Pydantic models"""
    
    def test_py_object_id_validation(self):
        """Test PyObjectId validation"""
        # Valid ObjectId
        valid_id = str(ObjectId())
        validated_id = PyObjectId.validate(valid_id)
        assert isinstance(validated_id, ObjectId)
        
        # Invalid ObjectId
        with pytest.raises(ValueError):
            PyObjectId.validate("invalid_id")
    
    def test_agent_config_model(self):
        """Test AgentConfig model creation and validation"""
        # Valid agent config
        agent_data = {
            "name": "Test Agent",
            "system_prompt": "You are a helpful assistant",
            "knowledge_summary": "Test knowledge base"
        }
        
        agent = AgentConfig(**agent_data)
        assert agent.name == "Test Agent"
        assert agent.system_prompt == "You are a helpful assistant"
        assert agent.knowledge_summary == "Test knowledge base"
        assert agent.id is None  # Should be None when not provided
        
        # Test with ObjectId
        agent_data_with_id = {
            "_id": str(ObjectId()),
            "name": "Test Agent with ID",
            "system_prompt": "You are a helpful assistant"
        }
        
        agent_with_id = AgentConfig(**agent_data_with_id)
        assert agent_with_id.id is not None
        assert agent_with_id.name == "Test Agent with ID"

class TestDatabase:
    """Test database connectivity and operations"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self):
        """Test MongoDB connection"""
        try:
            # Test ping
            await client.admin.command('ping')
            
            # Test database access
            collections = await db.list_collection_names()
            assert isinstance(collections, list)
            
            print("✅ Database connection successful")
        except Exception as e:
            pytest.fail(f"Database connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_agents_collection_operations(self):
        """Test CRUD operations on agents collection"""
        # Create test agent
        test_agent = {
            "name": "test_crud_agent",
            "system_prompt": "Test prompt",
            "knowledge_summary": "Test knowledge"
        }
        
        # Insert
        result = await agents_collection.insert_one(test_agent)
        assert result.inserted_id is not None
        
        # Read
        found_agent = await agents_collection.find_one({"_id": result.inserted_id})
        assert found_agent is not None
        assert found_agent["name"] == "test_crud_agent"
        
        # Update
        update_result = await agents_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"name": "updated_test_agent"}}
        )
        assert update_result.modified_count == 1
        
        # Verify update
        updated_agent = await agents_collection.find_one({"_id": result.inserted_id})
        assert updated_agent["name"] == "updated_test_agent"
        
        # Delete
        delete_result = await agents_collection.delete_one({"_id": result.inserted_id})
        assert delete_result.deleted_count == 1
        
        print("✅ CRUD operations successful")

class TestAgentService:
    """Test agent service functions"""
    
    @pytest.mark.asyncio
    @patch('backend.agent_service.model')
    async def test_create_agent_from_docs(self, mock_model):
        """Test agent creation from documents"""
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "Summarized knowledge base"
        mock_model.generate_content_async = AsyncMock(return_value=mock_response)
        
        # Test data
        name = "Test Agent"
        system_prompt = "You are a test assistant"
        documents = ["Document 1 content", "Document 2 content"]
        
        # Call function
        result = await create_agent_from_docs(name, system_prompt, documents)
        
        # Verify result
        assert result is not None
        assert result["name"] == name
        assert result["system_prompt"] == system_prompt
        assert result["knowledge_summary"] == "Summarized knowledge base"
        
        # Clean up - delete the created agent
        if "_id" in result:
            await agents_collection.delete_one({"_id": result["_id"]})
        
        print("✅ Agent creation test successful")
    
    @pytest.mark.asyncio
    @patch('backend.agent_service.model')
    async def test_get_agent_response(self, mock_model):
        """Test getting response from agent"""
        # Create a test agent first
        test_agent = {
            "name": "response_test_agent",
            "system_prompt": "You are a helpful assistant",
            "knowledge_summary": "Test knowledge base"
        }
        
        insert_result = await agents_collection.insert_one(test_agent)
        agent_id = str(insert_result.inserted_id)
        
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "Test agent response"
        mock_model.generate_content_async = AsyncMock(return_value=mock_response)
        
        # Test getting response
        response = await get_agent_response(agent_id, "Test question")
        
        assert response == "Test agent response"
        
        # Test with invalid agent ID
        invalid_response = await get_agent_response(str(ObjectId()), "Test question")
        assert invalid_response is None
        
        # Clean up
        await agents_collection.delete_one({"_id": insert_result.inserted_id})
        
        print("✅ Agent response test successful")

class TestAPIEndpoints:
    """Test FastAPI endpoints"""
    
    @patch('backend.agent_service.model')
    def test_setup_agent_endpoint(self, mock_model):
        """Test /setup-agent/ endpoint"""
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "Mocked knowledge summary"
        mock_model.generate_content_async = AsyncMock(return_value=mock_response)
        
        # Test data
        payload = {
            "name": "API Test Agent",
            "system_prompt": "You are an API test assistant",
            "documents": ["Test document 1", "Test document 2"]
        }
        
        # Make request
        response = test_client.post("/api/setup-agent/", json=payload)
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "API Test Agent"
        assert data["system_prompt"] == "You are an API test assistant"
        
        print("✅ Setup agent endpoint test successful")
    
    def test_setup_agent_no_documents(self):
        """Test /setup-agent/ endpoint with no documents"""
        payload = {
            "name": "Test Agent",
            "system_prompt": "Test prompt",
            "documents": []
        }
        
        response = test_client.post("/api/setup-agent/", json=payload)
        assert response.status_code == 400
        assert "No documents provided" in response.json()["detail"]
        
        print("✅ No documents validation test successful")
    
    @patch('backend.agent_service.model')
    def test_chat_with_agent_endpoint(self, mock_model):
        """Test /agent/{agent_id}/chat/ endpoint"""
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "Mocked chat response"
        mock_model.generate_content_async = AsyncMock(return_value=mock_response)
        
        # Use a valid ObjectId format
        agent_id = str(ObjectId())
        
        # This will fail because agent doesn't exist, but tests the endpoint structure
        response = test_client.post(
            f"/api/agent/{agent_id}/chat/",
            json={"user_prompt": "Hello, how are you?"}
        )
        
        # Should return 404 since agent doesn't exist
        assert response.status_code == 404
        assert "Agent not found" in response.json()["detail"]
        
        print("✅ Chat endpoint test successful")

class TestIntegration:
    """Integration tests for complete workflows"""
    
    @pytest.mark.asyncio
    @patch('backend.agent_service.model')
    async def test_complete_agent_workflow(self, mock_model):
        """Test complete workflow: create agent, then chat with it"""
        # Mock Gemini responses
        mock_summary_response = MagicMock()
        mock_summary_response.text = "Integrated test knowledge summary"
        
        mock_chat_response = MagicMock()
        mock_chat_response.text = "Hello! I'm your integrated test agent."
        
        mock_model.generate_content_async = AsyncMock(
            side_effect=[mock_summary_response, mock_chat_response]
        )
        
        # Step 1: Create agent
        name = "Integration Test Agent"
        system_prompt = "You are an integration test assistant"
        documents = ["Integration test document"]
        
        created_agent = await create_agent_from_docs(name, system_prompt, documents)
        assert created_agent is not None
        
        agent_id = str(created_agent["_id"])
        
        # Step 2: Chat with agent
        response = await get_agent_response(agent_id, "Hello!")
        assert response == "Hello! I'm your integrated test agent."
        
        # Step 3: Clean up
        await agents_collection.delete_one({"_id": created_agent["_id"]})
        
        print("✅ Complete workflow integration test successful")

def run_all_tests():
    """Run all tests manually"""
    print("🧪 Starting Comprehensive Test Suite")
    print("=" * 50)
    
    # Configuration tests
    print("\n📋 Testing Configuration...")
    config_test = TestConfig()
    config_test.test_settings_exist()
    config_test.test_validate_required_keys()
    
    # Model tests
    print("\n🏗️  Testing Models...")
    model_test = TestModels()
    model_test.test_py_object_id_validation()
    model_test.test_agent_config_model()
    
    # Database tests (async)
    print("\n🗄️  Testing Database...")
    db_test = TestDatabase()
    asyncio.run(db_test.test_database_connection())
    asyncio.run(db_test.test_agents_collection_operations())
    
    # Agent service tests (async)
    print("\n🤖 Testing Agent Service...")
    service_test = TestAgentService()
    asyncio.run(service_test.test_create_agent_from_docs())
    asyncio.run(service_test.test_get_agent_response())
    
    # API tests
    print("\n🌐 Testing API Endpoints...")
    api_test = TestAPIEndpoints()
    api_test.test_setup_agent_endpoint()
    api_test.test_setup_agent_no_documents()
    api_test.test_chat_with_agent_endpoint()
    
    # Integration tests
    print("\n🔗 Testing Integration...")
    integration_test = TestIntegration()
    asyncio.run(integration_test.test_complete_agent_workflow())
    
    print("\n🎉 All tests completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    # Run tests manually without pytest
    run_all_tests()
