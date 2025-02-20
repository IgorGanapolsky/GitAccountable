"""
GitHub integration manager for AI Accountability Bot
"""
import os
from typing import Dict, List, Optional
from github import Github
from github.Repository import Repository
from datetime import datetime, timedelta

class GitHubManager:
    def __init__(self, access_token: str):
        """Initialize GitHub manager with access token"""
        self.github = Github(access_token)
        self.user = self.github.get_user()
    
    def get_repositories(self) -> List[Dict]:
        """Get list of user's repositories"""
        repos = []
        for repo in self.user.get_repos():
            repos.append({
                'name': repo.name,
                'full_name': repo.full_name,
                'description': repo.description,
                'url': repo.html_url,
                'language': repo.language,
                'stars': repo.stargazers_count,
                'forks': repo.forks_count
            })
        return repos
    
    def get_repo_activity(self, repo_name: str, days: int = 7) -> Dict:
        """Get recent activity for a repository"""
        repo = self.github.get_repo(repo_name)
        since = datetime.now() - timedelta(days=days)
        
        # Get commits
        commits = list(repo.get_commits(since=since))
        
        # Get pull requests
        pulls = list(repo.get_pulls(state='all', sort='updated', direction='desc'))
        recent_pulls = [pr for pr in pulls if pr.updated_at >= since]
        
        # Get issues
        issues = list(repo.get_issues(state='all', sort='updated', direction='desc'))
        recent_issues = [issue for issue in issues if issue.updated_at >= since]
        
        return {
            'commits': [{
                'sha': c.sha[:7],
                'message': c.commit.message,
                'author': c.commit.author.name,
                'date': c.commit.author.date.isoformat()
            } for c in commits],
            'pull_requests': [{
                'number': pr.number,
                'title': pr.title,
                'state': pr.state,
                'created_at': pr.created_at.isoformat(),
                'updated_at': pr.updated_at.isoformat()
            } for pr in recent_pulls],
            'issues': [{
                'number': issue.number,
                'title': issue.title,
                'state': issue.state,
                'created_at': issue.created_at.isoformat(),
                'updated_at': issue.updated_at.isoformat()
            } for issue in recent_issues]
        }
    
    def create_issue(self, repo_name: str, title: str, body: str) -> Dict:
        """Create a new issue in the repository"""
        repo = self.github.get_repo(repo_name)
        issue = repo.create_issue(title=title, body=body)
        return {
            'number': issue.number,
            'title': issue.title,
            'url': issue.html_url
        }
    
    def update_issue(self, repo_name: str, issue_number: int, state: str) -> Dict:
        """Update an issue's state (open/closed)"""
        repo = self.github.get_repo(repo_name)
        issue = repo.get_issue(issue_number)
        issue.edit(state=state)
        return {
            'number': issue.number,
            'title': issue.title,
            'state': issue.state,
            'url': issue.html_url
        }
    
    def is_healthy(self) -> bool:
        """Check if GitHub connection is working"""
        try:
            self.user.login
            return True
        except Exception:
            return False
