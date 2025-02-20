"""
Web server for AI Accountability Bot
"""
import os
import logging
from flask import Flask, jsonify
from src.core.chat import ChatService
from src.core.bot import AIAccountabilityBot
from src.managers.task_manager import TaskManager
from src.managers.airtable_manager import AirtableManager
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

try:
    # Initialize services
    logger.info("Initializing services...")
    
    # Get OpenAI API key
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    # Initialize services
    airtable_manager = AirtableManager()
    task_manager = TaskManager(airtable_manager)
    chat_service = ChatService(api_key=openai_api_key)
    bot = AIAccountabilityBot(task_manager, chat_service)
    logger.info("Services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise

@app.route('/')
def home():
    """Home endpoint"""
    try:
        return jsonify({
            "status": "healthy",
            "message": "AI Accountability Bot is running"
        })
    except Exception as e:
        logger.error(f"Error in home endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    try:
        airtable_health = airtable_manager.is_healthy()
        chat_health = chat_service.is_healthy()
        
        return jsonify({
            "status": "healthy" if all([airtable_health, chat_health]) else "unhealthy",
            "services": {
                "airtable": airtable_health,
                "chat": chat_health
            }
        })
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "services": {
                "airtable": False,
                "chat": False
            }
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
