"""
Authentication routes for AI Accountability Bot
"""
import os
import logging
from urllib.parse import urljoin
from flask import Blueprint, redirect, session, url_for, jsonify, request, current_app
from requests_oauthlib import OAuth2Session
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# GitHub OAuth settings
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

auth_bp = Blueprint('auth', __name__)

def get_github_oauth():
    """Get GitHub OAuth session"""
    if not GITHUB_CLIENT_ID:
        raise ValueError("GITHUB_CLIENT_ID not found in environment variables")
    
    redirect_uri = os.getenv('GITHUB_REDIRECT_URI')
    if not redirect_uri:
        # Fallback to constructing the redirect URI
        redirect_uri = url_for('auth.github_callback', _external=True)
        logger.info(f"Using constructed redirect URI: {redirect_uri}")
    
    logger.info(f"Initializing GitHub OAuth with redirect URI: {redirect_uri}")
    return OAuth2Session(
        GITHUB_CLIENT_ID,
        redirect_uri=redirect_uri,
        scope=['repo', 'user']
    )

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'github_token' not in session:
            logger.warning("Unauthenticated access attempt")
            return jsonify({
                'status': 'error',
                'message': 'Authentication required',
                'login_url': url_for('auth.login', _external=True)
            }), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login')
def login():
    """Start GitHub OAuth flow"""
    try:
        github = get_github_oauth()
        authorization_url, state = github.authorization_url(GITHUB_AUTHORIZE_URL)
        session['oauth_state'] = state
        logger.info(f"Starting OAuth flow, redirecting to: {authorization_url}")
        return redirect(authorization_url)
    except Exception as e:
        logger.error(f"Error starting OAuth flow: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to start GitHub authentication. Please try again.'
        }), 500

@auth_bp.route('/github/callback')
def github_callback():
    """Handle GitHub OAuth callback"""
    try:
        if 'error' in request.args:
            error_msg = request.args.get('error_description', request.args.get('error'))
            logger.error(f"GitHub OAuth error: {error_msg}")
            return jsonify({
                'status': 'error',
                'message': f'GitHub authentication failed: {error_msg}'
            }), 400

        github = get_github_oauth()
        
        # Get the full URL including scheme and host
        full_url = request.url
        if request.headers.get('X-Forwarded-Proto') == 'https':
            full_url = full_url.replace('http://', 'https://')
        
        logger.info(f"Processing OAuth callback with URL: {full_url}")
        
        token = github.fetch_token(
            GITHUB_TOKEN_URL,
            client_secret=GITHUB_CLIENT_SECRET,
            authorization_response=full_url
        )
        
        session['github_token'] = token
        logger.info("Successfully obtained GitHub token")
        
        return redirect(url_for('home', _external=True))
    except Exception as e:
        logger.error(f"Error in GitHub callback: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to complete GitHub authentication. Please try again.'
        }), 500

@auth_bp.route('/logout')
def logout():
    """Log out user"""
    session.pop('github_token', None)
    logger.info("User logged out")
    return redirect(url_for('home', _external=True))

@auth_bp.route('/status')
def auth_status():
    """Check authentication status"""
    is_authenticated = 'github_token' in session
    logger.debug(f"Auth status check: {'authenticated' if is_authenticated else 'not authenticated'}")
    return jsonify({
        'authenticated': is_authenticated
    })
