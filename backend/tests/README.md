# Dream Line Project - Test Suite Documentation

## Overview
This directory contains comprehensive tests for all functionalities of the Dream Line Project backend.

## Test Files Created

### 1. `test_simple.py` - ⭐ **RECOMMENDED FOR QUICK TESTING**
**Purpose:** Simple, standalone test that works without complex imports
**Features:**
- ✅ Database connectivity testing
- ✅ Agent CRUD operations
- ✅ Google AI integration testing
- ✅ Complete workflow testing (create agent → chat → cleanup)
- ✅ Configuration validation

**How to run:**
```bash
python test_simple.py
```

**Output:** User-friendly test results with emojis and clear pass/fail indicators

### 2. `test_comprehensive.py` - 🧪 **FULL PYTEST SUITE**
**Purpose:** Professional test suite with mocking for unit testing
**Features:**
- Uses pytest framework
- Mocks external API calls
- Tests all classes and functions individually
- Includes integration tests
- Proper test isolation

**How to run:**
```bash
pytest test_comprehensive.py -v
```

### 3. `test_manual.py` - 🔧 **MANUAL TESTING**
**Purpose:** Manual test runner with detailed output
**Features:**
- Tests real API functionality
- No mocking - tests actual behavior
- Detailed error reporting
- Async test support

**How to run:**
```bash
python test_manual.py
```

## Test Coverage

### ✅ What is Tested

1. **Configuration Management**
   - Environment variable loading
   - Settings validation
   - API key presence

2. **Database Operations**
   - MongoDB connection
   - CRUD operations on agents collection
   - Database and collection listing

3. **Data Models**
   - Pydantic model validation
   - ObjectId handling
   - Field validation

4. **Agent Service**
   - Agent creation from documents
   - Knowledge base summarization
   - Chat response generation

5. **API Endpoints**
   - `/setup-agent/` endpoint
   - `/agent/{id}/chat/` endpoint
   - Error handling and validation

6. **Google AI Integration**
   - API connectivity
   - Document summarization
   - Response generation

7. **Complete Workflows**
   - End-to-end agent creation and usage
   - Data persistence
   - Cleanup operations

## Test Results (Latest Run)

```
🧪 Dream Line Project - Simple Test Suite
============================================================
Configuration             ✅ PASS
Database Connection       ✅ PASS
Agent CRUD Operations     ✅ PASS
Google AI Integration     ✅ PASS
Complete Workflow         ✅ PASS

📈 Tests passed: 5/5
🎉 All tests passed! Your Dream Line Project is working correctly!
```

## Requirements for Testing

### Core Dependencies (already in requirements.txt):
- motor (MongoDB async driver)
- pymongo (MongoDB driver)
- fastapi (web framework)
- pydantic (data validation)
- python-dotenv (environment variables)
- google-generativeai (Google AI)

### Additional Test Dependencies:
```bash
pip install -r requirements-test.txt
```

Contains:
- pytest
- pytest-asyncio
- httpx
- pytest-mock

## Environment Setup for Testing

1. **MongoDB:** Must be running on localhost:27017
2. **Environment Variables:** Create `.env` file with:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=ai_agents_db
   ```

## Quick Test Commands

### Run the simplest test:
```bash
cd backend
python test_simple.py
```

### Run with pytest (for CI/CD):
```bash
cd backend
pytest test_comprehensive.py -v
```

### Install test dependencies:
```bash
pip install -r requirements-test.txt
```

## Test Categories

- 🔧 **Unit Tests:** Individual function testing
- 🔗 **Integration Tests:** Component interaction testing
- 🌐 **API Tests:** HTTP endpoint testing
- 🗄️ **Database Tests:** MongoDB operation testing
- 🤖 **AI Tests:** Google AI integration testing

## Troubleshooting

### Common Issues:

1. **Import Errors:**
   - Use `test_simple.py` - it handles imports automatically

2. **Database Connection Failed:**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`

3. **Google AI Tests Fail:**
   - Verify `GOOGLE_API_KEY` in `.env`
   - Check model name (updated to `gemini-1.5-flash`)

4. **Module Not Found:**
   - Run tests from the `backend` directory
   - Use the simple test file for easy execution

## Continuous Integration

For CI/CD pipelines, use:
```bash
pytest test_comprehensive.py --tb=short -v
```

This provides clean output suitable for automated testing environments.

---

**Note:** All tests include proper cleanup to avoid leaving test data in the database.
