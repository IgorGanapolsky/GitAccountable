"""
AI Accountability Bot Core Module
"""
import logging
import re
import schedule
import time
from threading import Thread
from typing import Optional, List, Dict

from ..managers.task_manager import TaskManager
from ..utils.command_parser import CommandParser
from ..utils.date_parser import DateParser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AIAccountabilityBot:
    """Core bot class handling task management and reminders"""
    
    def __init__(self, task_manager: TaskManager = None, chat_service = None):
        """Initialize the bot with task manager and command patterns"""
        self.task_manager = task_manager or TaskManager()
        self.chat_service = chat_service
        self.scheduler_thread = None
        self.running = False
        self.command_parser = CommandParser()
        self.date_parser = DateParser()
        
        # Command patterns
        self.patterns = {
            'add': re.compile(r'^(?:add|create|new)\s+task:?\s+(.+?)(?:\s+by\s+(.+))?$', re.IGNORECASE),
            'list': re.compile(r'^(?:list|show|display)\s+(?:all\s+)?tasks(?:\s+(.+))?$', re.IGNORECASE),
            'update': re.compile(r'^(?:mark|set|update)\s+task\s+["\']?(.+?)["\']?\s+as\s+(.+)$', re.IGNORECASE),
            'delete': re.compile(r'^(?:delete|remove)\s+task\s+["\']?(.+?)["\']?$', re.IGNORECASE),
            'due': re.compile(r'^(?:show|list|what\s+is)\s+due(?:\s+in\s+(\d+)\s+days?)?$', re.IGNORECASE)
        }

    def check_due_tasks(self) -> None:
        """Check for tasks due soon and notify"""
        try:
            # Get tasks due in the next 24 hours
            tasks = self.task_manager.get_due_tasks(1)
            if tasks:
                logger.info("🔔 Tasks due in the next 24 hours:")
                for task in tasks:
                    title = task['fields'].get('Title', 'Untitled')
                    due_date = task['fields'].get('Due Date')
                    priority = task['fields'].get('Priority', 'Medium')
                    logger.info(f"📅 {title} - Due: {due_date} - Priority: {priority}")
                    
                    # If task is high priority, log an extra warning
                    if priority.lower() == 'high':
                        logger.warning(f"⚠️ High priority task due soon: {title}")
        except Exception as e:
            logger.error(f"Error checking due tasks: {str(e)}")

    def start_scheduler(self) -> None:
        """Start the scheduler in a separate thread"""
        def run_scheduler():
            # Schedule daily check at 9 AM
            schedule.every().day.at("09:00").do(self.check_due_tasks)
            
            # Also check every 4 hours during the day
            schedule.every(4).hours.do(self.check_due_tasks)
            
            self.running = True
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute

        self.scheduler_thread = Thread(target=run_scheduler, daemon=True)
        self.scheduler_thread.start()
        logger.info("Task reminder scheduler started")

    def stop_scheduler(self) -> None:
        """Stop the scheduler thread"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()
        logger.info("Task reminder scheduler stopped")

    def process_command(self, user_input: str) -> str:
        """Process user input and execute appropriate command"""
        try:
            # Try each command pattern
            for command, pattern in self.patterns.items():
                if match := pattern.match(user_input):
                    if command == 'add':
                        title, due_date = match.groups()
                        return self._handle_add_task(title, due_date)
                        
                    elif command == 'list':
                        status = match.group(1)
                        return self._handle_list_tasks(status)
                        
                    elif command == 'update':
                        title, new_status = match.groups()
                        return self._handle_update_task(title, new_status)
                        
                    elif command == 'delete':
                        title = match.group(1)
                        return self._handle_delete_task(title)
                        
                    elif command == 'due':
                        days = match.group(1)
                        return self._handle_due_tasks(days)

            # If no pattern matches, try natural language processing
            return self._handle_natural_language(user_input)
            
        except Exception as e:
            logger.error(f"Error processing command: {str(e)}")
            return f"Error processing command: {str(e)}"

    def _handle_add_task(self, title: str, due_date: Optional[str] = None) -> str:
        """Handle adding a new task"""
        try:
            parsed_date = self.date_parser.parse_date(due_date) if due_date else None
            task = self.task_manager.create_task(
                title=title,
                description=f"Created via command: {title}",
                due_date=parsed_date,
                priority="Medium"
            )
            return f"✅ Created task: {task['fields']['Title']}"
        except Exception as e:
            return f"Error creating task: {str(e)}"

    def _handle_list_tasks(self, status: Optional[str] = None) -> str:
        """Handle listing tasks"""
        try:
            tasks = self.task_manager.get_tasks_by_status(status)
            if not tasks:
                return "No tasks found"
            return self.task_manager.format_task_list(tasks)
        except Exception as e:
            return f"Error listing tasks: {str(e)}"

    def _handle_update_task(self, title: str, new_status: str) -> str:
        """Handle updating a task's status"""
        try:
            tasks = self.task_manager.get_tasks_by_status(None)
            task_id = None
            for task in tasks:
                if task['fields']['Title'].lower() == title.lower():
                    task_id = task['id']
                    break
            
            if not task_id:
                return f"Could not find task: {title}"
                
            task = self.task_manager.update_task_status(task_id, new_status)
            return f"✅ Updated task '{task['fields']['Title']}' to {new_status}"
        except Exception as e:
            return f"Error updating task: {str(e)}"

    def _handle_delete_task(self, title: str) -> str:
        """Handle deleting a task"""
        try:
            tasks = self.task_manager.get_tasks_by_status(None)
            task_id = None
            for task in tasks:
                if task['fields']['Title'].lower() == title.lower():
                    task_id = task['id']
                    break
            
            if not task_id:
                return f"Could not find task: {title}"
                
            self.task_manager.delete_task(task_id)
            return f"✅ Deleted task: {title}"
        except Exception as e:
            return f"Error deleting task: {str(e)}"

    def _handle_due_tasks(self, days: Optional[str] = None) -> str:
        """Handle checking due tasks"""
        try:
            days_int = int(days) if days else 7
            tasks = self.task_manager.get_due_tasks(days_int)
            if not tasks:
                return f"No tasks due in the next {days_int} days"
            return f"Tasks due in the next {days_int} days:\n" + self.task_manager.format_task_list(tasks)
        except Exception as e:
            return f"Error checking due tasks: {str(e)}"

    def _handle_natural_language(self, text: str) -> str:
        """Handle natural language input using GPT"""
        # This would be implemented to handle more complex natural language queries
        return "I'm not sure how to handle that request. Try using one of the standard commands."
