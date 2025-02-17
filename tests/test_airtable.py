from airtable_manager import AirtableManager

def test_connection():
    try:
        # Initialize the Airtable manager
        airtable = AirtableManager()
        
        # Try to list existing repositories
        print("Fetching existing repositories...")
        repos = airtable.list_repositories()
        print(f"\nFound {len(repos)} repositories:")
        for repo in repos:
            fields = repo.get('fields', {})
            print(f"- {fields.get('Repository Name')}: {fields.get('Description')}")
        
        # Try to create a test repository
        print("\nCreating test repository...")
        test_repo = airtable.create_repository(
            name="Test-Repository",
            description="This is a test repository to verify Airtable connection"
        )
        print(f"✅ Successfully created test repository!")
        print(f"Repository details: {test_repo}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_connection()
