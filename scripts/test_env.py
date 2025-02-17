import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Test all required environment variables
env_vars = [
    'OPENAI_API_KEY',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'AIRTABLE_REPOS_TABLE',
    'AIRTABLE_TASKS_TABLE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
]

print("Environment Variables Status:")
print("-" * 30)

all_present = True
for var in env_vars:
    value = os.getenv(var)
    status = "✅ Present" if value else "❌ Missing"
    print(f"{var}: {status}")
    if not value:
        all_present = False

print("-" * 30)
if all_present:
    print("All environment variables are properly set!")
else:
    print("Some environment variables are missing. Please check your .env file.")
