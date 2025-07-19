# Dream Line Project - AI Agent API

## 🚀 Overview

The Dream Line Project is a **Scalable AI Agent API** that allows you to create intelligent agents with custom knowledge bases using Google's Gemini AI. Each agent can be configured with specific system prompts and trained on documents you provide.

### Key Features
- ✅ **Create Custom AI Agents** from documents
- ✅ **Chat with Agents** using their knowledge base
- ✅ **Generate Educational Questions** with multiple choice, coding, and text-based formats
- ✅ **Validate Answers** with automatic scoring and detailed feedback
- ✅ **Persistent Storage** in MongoDB
- ✅ **Google Gemini AI** integration
- ✅ **FastAPI** web framework
- ✅ **RESTful API** endpoints

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Starting the API](#starting-the-api)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
1. **Python 3.8+** 
2. **MongoDB** (running on localhost:27017)
3. **Google AI API Key** (for Gemini)

### Check if MongoDB is running:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/LuisUmina/dream-line-project.git
cd dream-line-project/backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Create Environment File
Create a `.env` file in the `backend` directory:

```env
# API Keys
GOOGLE_API_KEY=your_google_api_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ai_agents_db

# App Configuration
APP_ENV=development
DEBUG=True
```

### 2. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env` file

### 3. Test Configuration
```bash
python test_simple.py
```

---

## 🚀 Starting the API

### Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Verify API is Running
Open your browser and go to:
- **API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/api

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### 1. Create Agent
**POST** `/setup-agent/`

Creates a new AI agent with custom knowledge base.

**Request Body:**
```json
{
  "name": "My Custom Agent",
  "system_prompt": "You are a helpful assistant that specializes in...",
  "documents": [
    "Document content 1...",
    "Document content 2...",
    "Document content 3..."
  ]
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Custom Agent",
  "system_prompt": "You are a helpful assistant that specializes in...",
  "knowledge_summary": "Summarized knowledge from provided documents..."
}
```

### 2. Chat with Agent
**POST** `/agent/{agent_id}/chat/`

Send a message to a specific agent and get a response.

**Path Parameters:**
- `agent_id`: The MongoDB ObjectId of the agent

**Request Body:**
```json
{
  "user_prompt": "What can you tell me about the documents you were trained on?"
}
```

**Response:**
```json
{
  "response": "Based on the documents I was trained on, I can tell you that..."
}
```

### 3. Generate Questions
**POST** `/agent/{agent_id}/generate-questions/`

Generate educational questions based on an agent's knowledge base.

**Path Parameters:**
- `agent_id`: The MongoDB ObjectId of the agent

**Request Body:**
```json
{
  "num_questions": 5,
  "difficulty": "intermediate"
}
```

**Response:**
```json
[
  {
    "id": "q_001",
    "type": "multiple_choice",
    "question": "What is the main advantage of using FastAPI over Flask?",
    "options": [
      "Better performance",
      "Automatic API documentation",
      "Type hints support",
      "All of the above"
    ],
    "correctAnswer": 3,
    "explanation": "FastAPI provides all these advantages...",
    "difficulty": "intermediate",
    "topic": "Web Development",
    "xp": 15
  }
]
```

### 4. Validate Answer
**POST** `/agent/{agent_id}/validate-answer/`

Validate a user's answer to a question using the agent's knowledge.

**Path Parameters:**
- `agent_id`: The MongoDB ObjectId of the agent

**Request Body:**
```json
{
  "question_id": "q_001",
  "question": "What is the main advantage of using FastAPI over Flask?",
  "user_answer": "All of the above",
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "is_successful": true,
  "points_earned": 15,
  "max_points": 15,
  "percentage": 100.0,
  "feedback": "Excellent! You correctly identified that FastAPI provides all these advantages...",
  "correct_answer": null
}
```

---

## 💡 Usage Examples

### Example 1: Creating a Python Programming Assistant

```bash
curl -X POST "http://localhost:8000/api/setup-agent/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Expert",
    "system_prompt": "You are an expert Python programmer who helps with coding questions, best practices, and debugging.",
    "documents": [
      "Python is a high-level programming language known for its simplicity and readability.",
      "FastAPI is a modern web framework for building APIs with Python 3.6+ based on standard Python type hints.",
      "Object-oriented programming in Python uses classes and objects to structure code.",
      "List comprehensions provide a concise way to create lists in Python.",
      "Python decorators are a powerful feature that allows modification of functions or classes."
    ]
  }'
```

### Example 2: Chatting with the Agent

```bash
# First, copy the agent ID from the previous response
curl -X POST "http://localhost:8000/api/agent/507f1f77bcf86cd799439011/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "How do I create a list comprehension in Python?"
  }'
```

### Example 3: Generating Questions

```bash
# Generate 3 intermediate-level questions for the agent
curl -X POST "http://localhost:8000/api/agent/507f1f77bcf86cd799439011/generate-questions/" \
  -H "Content-Type: application/json" \
  -d '{
    "num_questions": 3,
    "difficulty": "intermediate"
  }'
```

### Example 4: Validating an Answer

```bash
# Validate a user's answer to a question
curl -X POST "http://localhost:8000/api/agent/507f1f77bcf86cd799439011/validate-answer/" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "q_001",
    "question": "What is a list comprehension in Python?",
    "user_answer": "A concise way to create lists using a single line of code",
    "difficulty": "beginner"
  }'
```

### Example 5: Using Python Requests

```python
import requests
import json

# Create an agent
agent_data = {
    "name": "Python Programming Tutor",
    "system_prompt": "You are a Python programming tutor who helps students learn programming concepts through interactive questions and detailed explanations.",
    "documents": [
        "Python is a high-level programming language known for its simplicity and readability.",
        "List comprehensions provide a concise way to create lists in Python.",
        "Functions in Python are defined using the 'def' keyword.",
        "Object-oriented programming in Python uses classes and objects.",
        "Exception handling in Python uses try-except blocks."
    ]
}

# Create agent
response = requests.post(
    "http://localhost:8000/api/setup-agent/",
    json=agent_data
)

if response.status_code == 200:
    agent = response.json()
    agent_id = agent["id"]
    print(f"Agent created: {agent['name']} (ID: {agent_id})")
    
    # Chat with agent
    chat_response = requests.post(
        f"http://localhost:8000/api/agent/{agent_id}/chat/",
        json={"user_prompt": "What are list comprehensions in Python?"}
    )
    
    if chat_response.status_code == 200:
        print("Agent Response:", chat_response.json()["response"])
    
    # Generate questions
    questions_response = requests.post(
        f"http://localhost:8000/api/agent/{agent_id}/generate-questions/",
        json={"num_questions": 2, "difficulty": "beginner"}
    )
    
    if questions_response.status_code == 200:
        questions = questions_response.json()
        print(f"\nGenerated {len(questions)} questions:")
        
        for question in questions:
            print(f"\nQuestion: {question['question']}")
            if question['options']:
                for i, option in enumerate(question['options']):
                    print(f"  {i}: {option}")
            
            # Simulate answering the question
            if question['type'] == 'multiple_choice':
                user_answer = str(question['correctAnswer'])  # Simulate correct answer
                
                validation_response = requests.post(
                    f"http://localhost:8000/api/agent/{agent_id}/validate-answer/",
                    json={
                        "question_id": question['id'],
                        "question": question['question'],
                        "user_answer": user_answer,
                        "difficulty": question['difficulty']
                    }
                )
                
                if validation_response.status_code == 200:
                    validation = validation_response.json()
                    print(f"Answer Validation: {validation['percentage']}% - {validation['feedback']}")
else:
    print("Error creating agent:", response.text)
```

### Example 6: JavaScript/Node.js

```javascript
const axios = require('axios');

async function createAndTestAgent() {
    try {
        // Create agent
        const agentResponse = await axios.post('http://localhost:8000/api/setup-agent/', {
            name: 'JavaScript Programming Tutor',
            system_prompt: 'You are a JavaScript programming tutor who helps students learn web development concepts.',
            documents: [
                'JavaScript is a dynamic programming language used for web development.',
                'Functions in JavaScript can be declared using function keyword or arrow syntax.',
                'Promises and async/await are used for handling asynchronous operations.',
                'DOM manipulation allows JavaScript to interact with HTML elements.',
                'ES6 introduced many new features like let, const, destructuring, and modules.'
            ]
        });

        const agent = agentResponse.data;
        console.log(`Agent created: ${agent.name}`);

        // Chat with agent
        const chatResponse = await axios.post(
            `http://localhost:8000/api/agent/${agent.id}/chat/`,
            { user_prompt: 'What are the differences between let, const, and var in JavaScript?' }
        );

        console.log('Agent Response:', chatResponse.data.response);

        // Generate questions
        const questionsResponse = await axios.post(
            `http://localhost:8000/api/agent/${agent.id}/generate-questions/`,
            { num_questions: 2, difficulty: 'intermediate' }
        );

        const questions = questionsResponse.data;
        console.log(`\nGenerated ${questions.length} questions:`);

        for (const question of questions) {
            console.log(`\nQuestion: ${question.question}`);
            if (question.options) {
                question.options.forEach((option, i) => {
                    console.log(`  ${i}: ${option}`);
                });
            }

            // Simulate answering the question
            if (question.type === 'multiple_choice') {
                const userAnswer = question.correctAnswer.toString(); // Simulate correct answer

                const validationResponse = await axios.post(
                    `http://localhost:8000/api/agent/${agent.id}/validate-answer/`,
                    {
                        question_id: question.id,
                        question: question.question,
                        user_answer: userAnswer,
                        difficulty: question.difficulty
                    }
                );

                const validation = validationResponse.data;
                console.log(`Answer Validation: ${validation.percentage}% - ${validation.feedback}`);
            }
        }
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

createAndTestAgent();
```

---

## 🧪 Testing

### Quick Test
```bash
python test_simple.py
```

### Full Test Suite
```bash
pytest test_comprehensive.py -v
```

### Manual API Testing
Use the interactive API documentation at: http://localhost:8000/docs

---

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request (e.g., no documents provided) |
| 404  | Agent not found |
| 422  | Validation Error |
| 500  | Internal Server Error |

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **API Key Errors**
```
Error: Missing required environment variables: GOOGLE_API_KEY
```
**Solution:** Add your Google AI API key to the `.env` file

#### 2. **Database Connection Failed**
```
Error: Cannot connect to MongoDB server
```
**Solution:** 
- Ensure MongoDB is running: `mongod`
- Check MongoDB is installed and running on port 27017

#### 3. **Model Not Found Error**
```
Error: models/gemini-pro is not found
```
**Solution:** The API automatically uses `gemini-1.5-flash` (latest model)

#### 4. **Import Errors**
```
ModuleNotFoundError: No module named 'backend'
```
**Solution:** Run commands from the `backend` directory and ensure virtual environment is activated

#### 5. **Port Already in Use**
```
Error: [Errno 48] Address already in use
```
**Solution:** Change port or kill existing process:
```bash
# Use different port
uvicorn main:app --port 8001

# Or kill process on port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

### Debug Mode
Set `DEBUG=True` in your `.env` file for detailed error messages.

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   FastAPI       │───▶│   Google AI     │
│                 │    │   (main.py)     │    │   (Gemini)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Agents DB)   │
                       └─────────────────┘
```

### Key Components:
- **FastAPI:** Web framework handling HTTP requests
- **MongoDB:** Database storing agent configurations
- **Google Gemini:** AI model for text generation
- **Pydantic:** Data validation and serialization

---

## 📝 Example Use Cases

### 1. **Customer Support Bot**
Create agents trained on your product documentation, FAQs, and support articles.

### 2. **Interactive Learning Platform**
Train agents on educational content and use the question generation and answer validation features to create interactive learning experiences with automatic grading.

### 3. **Programming Tutors**
Create specialized programming tutors that can generate coding questions, validate student answers, and provide detailed feedback for different difficulty levels.

### 4. **Code Review Assistant**
Create agents with knowledge of coding standards, best practices, and documentation.

### 5. **Content Creator**
Train agents on brand guidelines, writing styles, and content examples.

### 6. **Research Assistant**
Create agents with domain-specific knowledge from research papers and articles.

### 7. **Training & Certification Systems**
Build training platforms where agents generate questions based on training materials and automatically validate employee responses for skill assessment.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python test_simple.py`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Issues:** Open an issue on GitHub
- **Documentation:** Check the `/docs` endpoint when API is running
- **Tests:** Run `python test_simple.py` for health checks

---

**Happy coding! 🚀**
