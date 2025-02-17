"""
ChatService module for handling OpenAI GPT interactions and natural language commands
"""
from openai import OpenAI
import os
from dotenv import load_dotenv
import re
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any, Tuple

class ChatService:
    def __init__(self, api_key: str):
        """Initialize the chat service with OpenAI API key"""
        self.client = OpenAI(api_key=api_key)

        # Command patterns
        self.patterns = {
            'add_task': re.compile(r'(?:add|create|new)\s+task:?\s+(.+?)(?:\s+by\s+(.+))?$', re.IGNORECASE),
            'list_tasks': re.compile(r'(?:list|show|display)\s+(?:all\s+)?tasks(?:\s+(.+))?$', re.IGNORECASE),
            'update_task': re.compile(r'(?:mark|set|update)\s+task\s+["\']?(.+?)["\']?\s+as\s+(.+)$', re.IGNORECASE),
            'delete_task': re.compile(r'(?:delete|remove)\s+task\s+["\']?(.+?)["\']?$', re.IGNORECASE),
            'due_tasks': re.compile(r'(?:show|list|what\s+is)\s+due(?:\s+in\s+(\d+)\s+days?)?$', re.IGNORECASE),
        }

    def handle_natural_task_command(self, text: str) -> str:
        """Handle natural language task commands"""
        try:
            text = text.lower().strip()

            # If no command pattern matches, use chat_with_gpt
            return self.chat_with_gpt(text)

        except Exception as e:
            return f"Error processing command: {str(e)}"

    def handle_repository_command(self, command: str, args: str) -> str:
        """Handle repository-related commands"""
        try:
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

            return f"Repository command received: {command} with args: {args}"

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
