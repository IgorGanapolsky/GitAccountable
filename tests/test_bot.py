import unittest
from chatbot import process_input, AirtableManager, TaskManager
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

class TestAIAccountabilityBot(unittest.TestCase):
    def setUp(self):
        load_dotenv()
        self.airtable_manager = AirtableManager()
        self.task_manager = TaskManager()
        
    def test_repository_management(self):
        print("\n=== Testing Repository Management ===")
        
        # Test repo add
        print("\nTesting repo add...")
        test_repo = "Test-Repo-" + datetime.now().strftime("%Y%m%d%H%M%S")
        process_input(f"repo add {test_repo} | Test repository for automated testing")
        
        # Test repo list
        print("\nTesting repo list...")
        process_input("repo list")
        
        # Test repo search
        print("\nTesting repo search...")
        process_input(f"repo search {test_repo}")
        
    def test_task_management(self):
        print("\n=== Testing Task Management ===")
        
        # Test task add
        print("\nTesting task add...")
        due_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        process_input(f"task add Test Task | This is a test task | {due_date} | High")
        
        # Test task list
        print("\nTesting task list...")
        process_input("task list")
        
        # Test task list with status
        print("\nTesting task list with status filter...")
        process_input("task list Todo")
        
        # Test due tasks
        print("\nTesting due tasks...")
        process_input("task due 7")
        
    def test_chatbot_interaction(self):
        print("\n=== Testing ChatGPT Interaction ===")
        
        # Test general conversation
        print("\nTesting general conversation...")
        process_input("What can you help me with?")
        
        # Test invalid command handling
        print("\nTesting invalid command handling...")
        process_input("invalid_command")

def run_tests():
    print("Starting AI Accountability Bot Tests...")
    unittest.main(argv=[''], verbosity=2, exit=False)

if __name__ == "__main__":
    run_tests()
