"""
Web server for AI Accountability Bot
"""
import os
from flask import Flask, jsonify
from src.core.chat import ChatService
from src.core.bot import AIAccountabilityBot
from src.managers.task_manager import TaskManager
from src.managers.airtable_manager import AirtableManager

app = Flask(__name__)

# Initialize services
airtable_manager = AirtableManager()
task_manager = TaskManager(airtable_manager)
chat_service = ChatService()
bot = AIAccountabilityBot(task_manager, chat_service)

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "AI Accountability Bot is running"
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "airtable": airtable_manager.is_healthy(),
            "chat": chat_service.is_healthy()
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
