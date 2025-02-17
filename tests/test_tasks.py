from task_manager import TaskManager
from datetime import datetime, timedelta

def test_task_management():
    try:
        # Initialize the Task manager
        task_manager = TaskManager()
        
        # Test 1: Create a task
        print("\n1. Creating a test task...")
        test_task = task_manager.create_task(
            title="Implement User Authentication",
            description="Add user authentication system using OAuth 2.0",
            due_date=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            priority="High"
        )
        print("✅ Successfully created task!")
        print(f"Task details: {test_task}")
        
        # Test 2: List all tasks
        print("\n2. Listing all tasks...")
        tasks = task_manager.get_tasks_by_status()
        print("\nCurrent tasks:")
        print(task_manager.format_task_list(tasks))
        
        # Test 3: Update task status
        if tasks:
            print("\n3. Updating first task status...")
            first_task_id = tasks[0]['id']
            updated_task = task_manager.update_task_status(first_task_id, "In Progress")
            print(f"✅ Successfully updated task status!")
            print(f"Updated task: {updated_task}")
        
        # Test 4: Get due tasks
        print("\n4. Getting tasks due in the next 7 days...")
        due_tasks = task_manager.get_due_tasks(7)
        print("\nDue tasks:")
        print(task_manager.format_task_list(due_tasks))
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_task_management()
