"""
ChatService module for handling OpenAI GPT interactions and natural language commands
"""
from openai import OpenAI
import os
from dotenv import load_dotenv
import re
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any, Tuple

from ..managers.airtable_manager import AirtableManager
from ..managers.task_manager import TaskManager
from ..utils.date_parser import DateParser

class ChatService:
    def __init__(self, api_key: str):
        """Initialize the chat service with OpenAI API key"""
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.openai.com/v1"
        )
        
        # Try to initialize managers
        try:
            self.airtable = AirtableManager()
            self.task_manager = TaskManager()
            self.has_airtable = True
        except ValueError as e:
            print(f"Warning: {str(e)}")
            print("Task and repository management will be disabled.")
            self.has_airtable = False
        
        self.date_parser = DateParser()
        
        # Command patterns
        self.patterns = {
            'add_task': re.compile(r'(?:add|create|new)\s+task:?\s+(.+?)(?:\s+by\s+(.+))?$', re.IGNORECASE),
            'list_tasks': re.compile(r'(?:list|show|display)\s+(?:all\s+)?tasks(?:\s+(.+))?$', re.IGNORECASE),
            'update_task': re.compile(r'(?:mark|set|update)\s+task\s+["\']?(.+?)["\']?\s+as\s+(.+)$', re.IGNORECASE),
            'delete_task': re.compile(r'(?:delete|remove)\s+task\s+["\']?(.+?)["\']?$', re.IGNORECASE),
            'due_tasks': re.compile(r'(?:show|list|what\s+is)\s+due(?:\s+in\s+(\d+)\s+days?)?$', re.IGNORECASE),
            'add_repo': re.compile(r'(?:add|create|new)\s+repo(?:sitory)?\s+(.+)$', re.IGNORECASE),
            'list_repos': re.compile(r'(?:list|show|display)\s+repo(?:sitorie)?s$', re.IGNORECASE),
            'search_repos': re.compile(r'(?:search|find)\s+repo(?:sitorie)?s?\s+(.+)$', re.IGNORECASE)
        }
    
    def handle_natural_task_command(self, text: str) -> str:
        """Handle natural language task commands"""
        try:
            if not self.has_airtable:
                return "Task management is disabled. Please configure Airtable credentials in .env file."
                
            text = text.lower().strip()
            
            # Add task
            match = self.patterns['add_task'].match(text)
            if match:
                title, due_date_str = match.groups()
                due_date = self.date_parser.parse_date(due_date_str) if due_date_str else None
                self.task_manager.create_task(title, f"Created via command: {title}", due_date)
                return f"Added task: {title}" + (f" (due {due_date})" if due_date else "")
            
            # List tasks
            match = self.patterns['list_tasks'].match(text)
            if match:
                status = match.group(1)
                tasks = self.task_manager.get_tasks_by_status(status)
                if not tasks:
                    return "No tasks found."
                return "\n".join([f"- {task['fields']['Title']} (Status: {task['fields'].get('Status', 'Todo')}, Due: {task['fields'].get('Due Date', 'Not set')})" for task in tasks])
            
            # Update task
            match = self.patterns['update_task'].match(text)
            if match:
                title, new_status = match.groups()
                tasks = self.task_manager.get_tasks_by_status(None)
                task_id = None
                for task in tasks:
                    if task['fields']['Title'].lower() == title.lower():
                        task_id = task['id']
                        break
                if task_id:
                    self.task_manager.update_task_status(task_id, new_status)
                    return f"Updated task '{title}' status to {new_status}"
                return f"Could not find task: {title}"
            
            # Delete task
            match = self.patterns['delete_task'].match(text)
            if match:
                title = match.group(1)
                tasks = self.task_manager.get_tasks_by_status(None)
                task_id = None
                for task in tasks:
                    if task['fields']['Title'].lower() == title.lower():
                        task_id = task['id']
                        break
                if task_id:
                    self.task_manager.delete_task(task_id)
                    return f"Deleted task: {title}"
                return f"Could not find task: {title}"
            
            # Due tasks
            match = self.patterns['due_tasks'].match(text)
            if match:
                days = int(match.group(1)) if match.group(1) else 7
                tasks = self.task_manager.get_due_tasks(days)
                if not tasks:
                    return f"No tasks due in the next {days} days."
                return "\n".join([f"- {task['fields']['Title']} (Due: {task['fields'].get('Due Date', 'Not set')})" for task in tasks])
            
            return self.chat_with_gpt(text)
            
        except Exception as e:
            return f"Error processing command: {str(e)}"
    
    def handle_repository_command(self, command: str, args: str) -> str:
        """Handle repository-related commands"""
        try:
            if not self.has_airtable:
                return "Repository management is disabled. Please configure Airtable credentials in .env file."
                
            # Handle common command typos
            command_map = {
                'list': ['list', 'lst', 'ls'],
                'add': ['add', 'create', 'new'],
                'search': ['search', 'find', 'lookup']
            }
            
            # Normalize command
            for cmd, aliases in command_map.items():
                if command in aliases:
                    command = cmd
                    break
            
            if command == 'list':
                repos = self.airtable.list_repositories()
                if not repos:
                    return "No repositories found."
                return "\n".join([f"- {repo['fields'].get('Repository Name', 'Unnamed')}" for repo in repos])
                
            elif command == 'add':
                if not args:
                    return "Please provide a repository name."
                self.airtable.create_repository(args, "Added via command")
                return f"Added repository: {args}"
                
            elif command == 'search':
                if not args:
                    return "Please provide a search term."
                repos = self.airtable.search_repositories(args)
                if not repos:
                    return f"No repositories found matching '{args}'."
                return "\n".join([f"- {repo['fields'].get('Repository Name', 'Unnamed')}" for repo in repos])
                
            else:
                return f"Unknown repository command: {command}"
                
        except Exception as e:
            return f"Error processing repository command: {str(e)}"
    
    def chat_with_gpt(self, text: str) -> str:
        """Send a message to ChatGPT and get a response using the new API"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant for task and repository management. You can help with managing tasks and repositories, and answer questions about the system."},
                    {"role": "user", "content": text}
                ],
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error communicating with ChatGPT: {str(e)}"

    def is_healthy(self) -> bool:
        """Check if OpenAI API connection is healthy"""
        try:
            return bool(self.client.api_key)  # Check if API key is set
        except Exception as e:
            return False

def main():
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    chat_service = ChatService(api_key)
    print(f"Loaded OpenAI API key: {api_key[:10]}{'*' * (len(api_key)-14)}{api_key[-4:]}")

    try:
        while True:
            try:
                user_input = input("You: ")
                if user_input.lower() in ['exit', 'quit']:
                    print("Goodbye!")
                    break

                if not user_input.strip():
                    continue

                if user_input.lower().startswith('repo '):
                    command, args = user_input[5:].split(' ', 1) if ' ' in user_input[5:] else (user_input[5:], '')
                    print(chat_service.handle_repository_command(command, args))
                elif user_input.lower().startswith('task '):
                    print(chat_service.handle_natural_task_command(user_input))
                else:
                    print("ChatGPT:", chat_service.chat_with_gpt(user_input))

            except EOFError:
                print("\nGoodbye! (EOF received)")
                break
            except KeyboardInterrupt:
                print("\nGoodbye! (Interrupted by user)")
                break
            except Exception as e:
                print(f"Error processing input: {str(e)}")
                continue

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
