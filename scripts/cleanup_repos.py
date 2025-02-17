#!/usr/bin/env python3
"""
Script to clean up duplicate test repositories from Airtable.
"""
import os
import sys
# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.managers.airtable_manager import AirtableManager
from collections import defaultdict
from datetime import datetime

def is_test_repo(name: str) -> bool:
    """Check if a repository name indicates it's a test repository"""
    test_indicators = [
        'test',
        'unnamed',
        'test-repo',
        '-20250217',  # Timestamp-based test repos
    ]
    name = name.lower()
    return any(indicator in name for indicator in test_indicators)

def cleanup_test_repos():
    """Clean up duplicate and test repositories"""
    airtable = AirtableManager()
    
    # Get all repositories
    repos = airtable.list_repositories()
    
    # Group repositories by name
    name_groups = defaultdict(list)
    for repo in repos:
        name = repo.get('fields', {}).get('Repository Name', '').lower()
        if name:
            name_groups[name].append(repo)
    
    # Track statistics
    deleted = []
    kept = []
    
    # First, process the main repositories
    main_repos = ['ai-accountability-bot']
    for name in main_repos:
        if name in name_groups:
            kept.extend(name_groups[name])
            del name_groups[name]
    
    # Process remaining groups
    for name, group in name_groups.items():
        # Skip if only one non-test repository
        if len(group) == 1 and not is_test_repo(name):
            kept.extend(group)
            continue
            
        # For test repos or duplicates, keep only the newest one if it's a variant
        # of a main repository (e.g. AI-Accountability-Bot-Testing)
        if any(main in name.lower() for main in main_repos):
            sorted_group = sorted(
                group,
                key=lambda x: x.get('fields', {}).get('Created At', ''),
                reverse=True
            )
            kept.append(sorted_group[0])  # Keep the newest
            deleted.extend(sorted_group[1:])  # Delete the rest
        else:
            # Delete all test repositories
            if is_test_repo(name):
                deleted.extend(group)
            else:
                kept.extend(group)
    
    # Delete the duplicates and test repos
    for repo in deleted:
        try:
            airtable.delete_repository(repo['id'])
            print(f"✅ Deleted repository: {repo.get('fields', {}).get('Repository Name')}")
        except Exception as e:
            print(f"❌ Error deleting {repo.get('fields', {}).get('Repository Name')}: {str(e)}")
    
    # Print summary
    print(f"\n🧹 Cleanup Summary:")
    print(f"- Found {len(repos)} total repositories")
    print(f"- Deleted {len(deleted)} repositories")
    print(f"- Kept {len(kept)} repositories")
    
    # Show remaining repositories
    print("\n📚 Remaining Repositories:")
    remaining = airtable.list_repositories()
    for repo in remaining:
        name = repo.get('fields', {}).get('Repository Name', 'Unnamed')
        created = repo.get('fields', {}).get('Created At', 'Unknown date')
        print(f"- {name} (Created: {created})")

if __name__ == "__main__":
    cleanup_test_repos()
