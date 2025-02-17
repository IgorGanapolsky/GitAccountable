from datetime import datetime, timedelta
from pyairtable import Api
from dotenv import load_dotenv
import os

class TaskManager:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('AIRTABLE_API_KEY')
        self.base_id = os.getenv('AIRTABLE_BASE_ID')
        self.table_name = os.getenv('AIRTABLE_TASKS_TABLE', 'Tasks')
        
        if not all([self.api_key, self.base_id, self.table_name]):
            raise ValueError("Missing required Airtable credentials in .env file")
        
        self.api = Api(self.api_key)
        self.table = self.api.table(self.base_id, self.table_name)

    def create_task(self, title, description, due_date=None, priority="Medium"):
        """Create a new task"""
        try:
            fields = {
                "Title": title,
                "Description": description,
                "Status": "Todo",
                "Priority": priority,
                "Created Date": datetime.now().strftime("%Y-%m-%d"),
                "Last Updated": datetime.now().strftime("%Y-%m-%d")
            }
            
            if due_date:
                fields["Due Date"] = due_date
            
            record = self.table.create(fields)
            return record
        except Exception as e:
            raise Exception(f"Error creating task: {str(e)}")

    def update_task_status(self, task_id, new_status):
        """Update task status"""
        valid_statuses = ["Todo", "In Progress", "Done"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
        
        try:
            fields = {
                "Status": new_status,
                "Last Updated": datetime.now().strftime("%Y-%m-%d")
            }
            return self.table.update(task_id, fields)
        except Exception as e:
            raise Exception(f"Error updating task status: {str(e)}")

    def get_tasks_by_status(self, status=None):
        """Get tasks filtered by status"""
        try:
            formula = None
            if status:
                formula = f"{{Status}} = '{status}'"
            return self.table.all(formula=formula)
        except Exception as e:
            raise Exception(f"Error getting tasks: {str(e)}")

    def get_due_tasks(self, days=7):
        """Get tasks due within specified days"""
        try:
            future_date = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
            formula = f"AND({{Due Date}} <= '{future_date}', {{Status}} != 'Done')"
            return self.table.all(formula=formula)
        except Exception as e:
            raise Exception(f"Error getting due tasks: {str(e)}")

    def get_task_details(self, task_id):
        """Get detailed information about a specific task"""
        try:
            return self.table.get(task_id)
        except Exception as e:
            raise Exception(f"Error getting task details: {str(e)}")

    def delete_task(self, task_id):
        """Delete a task"""
        try:
            self.table.delete(task_id)
            return True
        except Exception as e:
            raise Exception(f"Error deleting task: {str(e)}")

    def format_task_list(self, tasks):
        """Format task list for display"""
        if not tasks:
            return "No tasks found."
        
        output = []
        for task in tasks:
            fields = task['fields']
            status_emoji = {
                "Todo": "📋",
                "In Progress": "⏳",
                "Done": "✅"
            }.get(fields.get('Status', 'Todo'), "📋")
            
            due_date = fields.get('Due Date', 'No due date')
            priority = fields.get('Priority', 'Medium')
            priority_emoji = {
                "High": "🔴",
                "Medium": "🟡",
                "Low": "🟢"
            }.get(priority, "🟡")
            
            output.append(
                f"{status_emoji} {fields['Title']}\n"
                f"   Priority: {priority_emoji} {priority}\n"
                f"   Due: {due_date}\n"
                f"   Status: {fields.get('Status', 'Todo')}"
            )
        
        return "\n\n".join(output)
