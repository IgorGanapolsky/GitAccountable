#!/usr/bin/env python3
import os
import sys
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add parent directory to path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import AIAccountabilityBot
from task_manager import TaskManager

class TestAIAccountabilityBot(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test"""
        self.bot = AIAccountabilityBot()
        
        # Create a mock task for testing
        self.mock_task = {
            'id': 'rec123',
            'fields': {
                'Title': 'Test Task',
                'Description': 'A test task',
                'Status': 'Todo',
                'Due Date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                'Priority': 'High'
            }
        }

    def test_add_task_command(self):
        """Test adding a task with various command formats"""
        test_cases = [
            "add task: Review code by tomorrow",
            "create task: Write documentation by next week",
            "new task: Fix bugs by Friday",
            "add task: Update README",  # No due date
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                mock_handler.assert_called_once()
                # Reset the mock for the next test
                mock_handler.reset_mock()

    def test_list_tasks_command(self):
        """Test listing tasks with various command formats"""
        test_cases = [
            "list tasks",
            "show tasks",
            "display tasks",
            "list all tasks",
            "show todo tasks",
            "list completed tasks"
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                mock_handler.assert_called_once()
                mock_handler.reset_mock()

    def test_update_task_command(self):
        """Test updating task status with various command formats"""
        test_cases = [
            "mark task 'Test Task' as complete",
            "set task 'Write docs' as in progress",
            "update task Debug issue as done"
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                mock_handler.assert_called_once()
                mock_handler.reset_mock()

    def test_delete_task_command(self):
        """Test deleting tasks with various command formats"""
        test_cases = [
            "delete task 'Test Task'",
            "remove task Write docs",
            "delete task Debug issue"
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                mock_handler.assert_called_once()
                mock_handler.reset_mock()

    def test_due_tasks_command(self):
        """Test checking due tasks with various command formats"""
        test_cases = [
            "what is due",
            "show due tasks",
            "list due tasks",
            "what is due in 7 days",
            "show due in 14 days"
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                mock_handler.assert_called_once()
                mock_handler.reset_mock()

    def test_reminder_system(self):
        """Test the task reminder system"""
        with patch.object(TaskManager, 'get_due_tasks') as mock_get_due:
            # Mock a task due soon
            mock_get_due.return_value = [self.mock_task]
            
            # Test the reminder check
            self.bot.check_due_tasks()
            mock_get_due.assert_called_once_with(1)  # Should check for tasks due in 1 day

    def test_scheduler_start_stop(self):
        """Test starting and stopping the reminder scheduler"""
        # Start scheduler
        self.bot.start_scheduler()
        self.assertTrue(self.bot.scheduler_thread.is_alive())
        
        # Stop scheduler
        self.bot.stop_scheduler()
        self.assertFalse(self.bot.running)

    def test_invalid_commands(self):
        """Test handling of invalid commands"""
        test_cases = [
            "",  # Empty command
            "invalid command",
            "task something",
            "add invalid"
        ]
        
        for command in test_cases:
            with patch('src.main.handle_natural_task_command') as mock_handler:
                self.bot.process_command(command)
                # Should still try to handle as natural language
                mock_handler.assert_called_once()
                mock_handler.reset_mock()

if __name__ == '__main__':
    unittest.main()
