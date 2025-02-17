#!/usr/bin/env python3
"""
AI Accountability Bot CLI Entry Point
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Change relative imports to absolute imports
from src.core.chat import ChatService
from src.core.bot import AIAccountabilityBot
from src.managers.task_manager import TaskManager
from src.managers.airtable_manager import AirtableManager

def mask_api_key(api_key: str) -> str:
    """Mask API key for display"""
    return f"{api_key[:10]}{'*' * (len(api_key)-14)}{api_key[-4:]}"

def main() -> int:
    """Main entry point for the CLI application"""
    try:
        # Try multiple locations for .env file
        possible_env_paths = [
            Path.cwd() / '.env',  # Current working directory
            Path(__file__).parent.parent.parent / '.env',  # Project root
            Path.home() / '.env'  # Home directory
        ]
        
        # Try loading from each possible location
        env_loaded = False
        for env_path in possible_env_paths:
            if env_path.exists():
                load_dotenv(env_path)
                env_loaded = True
                break
        
        if not env_loaded:
            print("Warning: No .env file found in any of the expected locations")

        # Initialize ChatService
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Error: No OpenAI API key found in environment variables")
            return 1

        chat_service = ChatService(api_key)
        print(f"Loaded OpenAI API key: {mask_api_key(api_key)}")
        print("\nWelcome to AI Accountability Bot! Type 'help' for commands or 'quit' to exit.")
        print("Available commands:")
        print("Task Management:")
        print("- add task <description> by <due date>")
        print("- list tasks [status]")
        print("- update task <title> as <status>")
        print("- delete task <title>")
        print("- show due [in X days]")
        print("\nRepository Management:")
        print("- repo list")
        print("- repo add <name>")
        print("- repo search <term>")
        print("-" * 50)

        while True:
            try:
                user_input = input("\nEnter command: ").strip()

                if not user_input:
                    continue

                if user_input.lower() in ['quit', 'exit']:
                    print("Goodbye!")
                    break

                if user_input.lower().startswith('repo '):
                    command, *args = user_input[5:].split(maxsplit=1)
                    args = args[0] if args else ''
                    response = chat_service.handle_repository_command(command, args)
                    print(response)
                else:
                    response = chat_service.handle_natural_task_command(user_input)
                    print(response)

            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except EOFError:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"Error: {str(e)}")

        return 0

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
