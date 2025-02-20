"""
Authentication routes for AI Accountability Bot
"""
import os
from flask import Blueprint, redirect, session, url_for, jsonify, request
from requests_oauthlib import OAuth2Session
from functools import wraps

# GitHub OAuth settings
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

auth_bp = Blueprint('auth', __name__)

def get_github_oauth():
    """Get GitHub OAuth session"""
    return OAuth2Session(
        GITHUB_CLIENT_ID,
        redirect_uri=os.getenv('GITHUB_REDIRECT_URI'),
        scope=['repo', 'user']
    )

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'github_token' not in session:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required',
                'login_url': url_for('auth.login')
            }), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login')
def login():
    """Start GitHub OAuth flow"""
    github = get_github_oauth()
    authorization_url, state = github.authorization_url(GITHUB_AUTHORIZE_URL)
    session['oauth_state'] = state
    return redirect(authorization_url)

@auth_bp.route('/auth/github/callback')
def github_callback():
    """Handle GitHub OAuth callback"""
    github = get_github_oauth()
    token = github.fetch_token(
        GITHUB_TOKEN_URL,
        client_secret=GITHUB_CLIENT_SECRET,
        authorization_response=request.url
    )
    session['github_token'] = token
    return redirect(url_for('home'))

@auth_bp.route('/logout')
def logout():
    """Log out user"""
    session.pop('github_token', None)
    return redirect(url_for('home'))

@auth_bp.route('/auth/status')
def auth_status():
    """Check authentication status"""
    return jsonify({
        'authenticated': 'github_token' in session
    })
