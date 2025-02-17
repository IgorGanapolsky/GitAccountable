import requests
import os
from dotenv import load_dotenv

def create_tasks_table():
    load_dotenv()
    
    api_key = os.getenv('AIRTABLE_API_KEY')
    base_id = os.getenv('AIRTABLE_BASE_ID')
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # Define the table schema
    table_data = {
        "name": "Tasks",
        "description": "Task management for AI Accountability Bot",
        "fields": [
            {
                "name": "Title",
                "type": "singleLineText",
                "description": "Task title"
            },
            {
                "name": "Description",
                "type": "multilineText",
                "description": "Detailed task description"
            },
            {
                "name": "Status",
                "type": "singleSelect",
                "options": {
                    "choices": [
                        {"name": "Todo"},
                        {"name": "In Progress"},
                        {"name": "Done"}
                    ]
                }
            },
            {
                "name": "Due Date",
                "type": "date",
                "description": "When the task is due",
                "options": {
                    "dateFormat": {
                        "name": "local"
                    }
                }
            },
            {
                "name": "Priority",
                "type": "singleSelect",
                "options": {
                    "choices": [
                        {"name": "High"},
                        {"name": "Medium"},
                        {"name": "Low"}
                    ]
                }
            },
            {
                "name": "Created Date",
                "type": "date",
                "description": "When the task was created",
                "options": {
                    "dateFormat": {
                        "name": "local"
                    }
                }
            },
            {
                "name": "Last Updated",
                "type": "date",
                "description": "When the task was last modified",
                "options": {
                    "dateFormat": {
                        "name": "local"
                    }
                }
            }
        ]
    }
    
    # Create the table
    url = f'https://api.airtable.com/v0/meta/bases/{base_id}/tables'
    response = requests.post(url, headers=headers, json=table_data)
    
    if response.status_code == 200:
        print("✅ Tasks table created successfully!")
        print(response.json())
    else:
        print("❌ Error creating table:")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    create_tasks_table()
