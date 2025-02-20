"""
Web server for AI Accountability Bot
"""
import os
import logging
from flask import Flask, jsonify, request, send_from_directory, session
from src.core.chat import ChatService
from src.core.bot import AIAccountabilityBot
from src.managers.task_manager import TaskManager
from src.managers.airtable_manager import AirtableManager
from src.managers.github_manager import GitHubManager
from src.web.auth import auth_bp, login_required
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Required environment variables
REQUIRED_ENV_VARS = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_REDIRECT_URI',
    'FLASK_SECRET_KEY',
    'OPENAI_API_KEY'
]

# Check for required environment variables
missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = Flask(__name__)

# Set Flask secret key
app.secret_key = os.getenv('FLASK_SECRET_KEY')
if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY must be set")

# Configure session security based on environment
is_production = os.getenv('FLASK_ENV', 'development') == 'production'
logger.info(f"Running in {'production' if is_production else 'development'} mode")

app.config.update(
    SESSION_COOKIE_SECURE=is_production,  # Only force HTTPS in production
    SESSION_COOKIE_HTTPONLY=True,  # Prevent JavaScript access to session cookie
    SESSION_COOKIE_SAMESITE='Lax',  # CSRF protection
    PREFERRED_URL_SCHEME='https' if is_production else 'http'
)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

try:
    # Initialize services
    logger.info("Initializing services...")
    
    # Initialize services
    airtable_manager = AirtableManager()
    task_manager = TaskManager(airtable_manager)
    chat_service = ChatService(api_key=os.getenv('OPENAI_API_KEY'))
    bot = AIAccountabilityBot(task_manager, chat_service)
    logger.info("Services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise

@app.route('/')
def home():
    """Home endpoint"""
    try:
        return send_from_directory('static', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
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
        github_health = True  # GitHub health is per-user
        
        return jsonify({
            "status": "healthy" if all([airtable_health, chat_health]) else "unhealthy",
            "services": {
                "airtable": airtable_health,
                "chat": chat_health,
                "github": github_health
            }
        })
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "services": {
                "airtable": False,
                "chat": False,
                "github": False
            }
        }), 500

@app.route('/command', methods=['POST'])
@login_required
def command():
    """Handle bot commands"""
    try:
        data = request.get_json()
        if not data or 'command' not in data:
            return jsonify({
                "status": "error",
                "message": "No command provided"
            }), 400

        # Initialize GitHub manager if we have a token
        if 'github_token' in session:
            github_manager = GitHubManager(session['github_token']['access_token'])
            bot.github_manager = github_manager

        result = bot.process_command(data['command'])
        return jsonify({
            "status": "success",
            "result": result
        })
    except Exception as e:
        logger.error(f"Error processing command: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/repos', methods=['GET'])
@login_required
def list_repos():
    """List user's GitHub repositories"""
    try:
        github_manager = GitHubManager(session['github_token']['access_token'])
        repos = github_manager.get_repositories()
        return jsonify({
            "status": "success",
            "repos": repos
        })
    except Exception as e:
        logger.error(f"Error listing repositories: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/repos/<path:repo_name>/activity', methods=['GET'])
@login_required
def repo_activity(repo_name):
    """Get repository activity"""
    try:
        days = request.args.get('days', 7, type=int)
        github_manager = GitHubManager(session['github_token']['access_token'])
        activity = github_manager.get_repo_activity(repo_name, days)
        return jsonify({
            "status": "success",
            "activity": activity
        })
    except Exception as e:
        logger.error(f"Error getting repository activity: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
