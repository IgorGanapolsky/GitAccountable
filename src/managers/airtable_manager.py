from dotenv import load_dotenv
import os
from datetime import datetime
from pyairtable import Api

class AirtableManager:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('AIRTABLE_API_KEY')
        self.base_id = os.getenv('AIRTABLE_BASE_ID')
        # Try AIRTABLE_REPOS_TABLE first, fall back to AIRTABLE_TABLE_NAME for backward compatibility
        self.table_name = os.getenv('AIRTABLE_REPOS_TABLE') or os.getenv('AIRTABLE_TABLE_NAME', 'GitHub Repositories')
        
        if not all([self.api_key, self.base_id, self.table_name]):
            raise ValueError("Missing required Airtable credentials in .env file")
            
        self.api = Api(self.api_key)
        self.table = self.api.table(self.base_id, self.table_name)

    def create_repository(self, name, description):
        """Create a new repository record in Airtable"""
        try:
            fields = {
                "Repository Name": name,
                "Description": description,
                "Created At": datetime.now().isoformat(),
                "Last Updated": datetime.now().isoformat()
            }
            
            record = self.table.create(fields)
            return record
        except Exception as e:
            raise Exception(f"Error creating repository: {str(e)}")

    def get_repository(self, record_id):
        """Retrieve a specific repository by ID"""
        try:
            return self.table.get(record_id)
        except Exception as e:
            raise Exception(f"Error retrieving repository: {str(e)}")

    def update_repository(self, record_id, fields):
        """Update an existing repository"""
        try:
            fields["Last Updated"] = datetime.now().isoformat()
            return self.table.update(record_id, fields)
        except Exception as e:
            raise Exception(f"Error updating repository: {str(e)}")

    def delete_repository(self, record_id):
        """Delete a repository"""
        try:
            self.table.delete(record_id)
            return True
        except Exception as e:
            raise Exception(f"Error deleting repository: {str(e)}")

    def list_repositories(self, formula=None):
        """List all repositories, optionally filtered by formula"""
        try:
            return self.table.all(formula=formula)
        except Exception as e:
            raise Exception(f"Error listing repositories: {str(e)}")

# Example usage:
if __name__ == "__main__":
    try:
        airtable = AirtableManager()
        
        # Example: Create a new repository
        new_repo = airtable.create_repository(
            name="Test Repository",
            description="This is a test repository"
        )
        print(f"Created repository: {new_repo}")
        
        # Example: List all repositories
        repos = airtable.list_repositories()
        print("\nAll repositories:")
        for repo in repos:
            print(f"- {repo.get('fields', {}).get('Repository Name', 'Untitled')}")
    except Exception as e:
        print(f"Error: {str(e)}")
