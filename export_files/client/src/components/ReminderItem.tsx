import { Reminder, Repository } from "@shared/schema";
import { formatDistanceToNow, isPast, isToday, isTomorrow, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";

interface ReminderItemProps {
  reminder: Reminder;
  repositories: Repository[];
  onComplete: () => void;
  onSnooze: () => void;
}

export default function ReminderItem({ 
  reminder, 
  repositories,
  onComplete,
  onSnooze
}: ReminderItemProps) {
  // Find repository associated with this reminder
  const repository = repositories.find(repo => repo.id === reminder.repositoryId);
  
  // Determine style based on due date
  const getReminderStyle = () => {
    if (reminder.completed) {
      return {
        icon: "ri-check-line",
        color: "text-gh-green"
      };
    }
    
    const dueDate = new Date(reminder.dueDate);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return {
        icon: "ri-alarm-warning-line",
        color: "text-gh-red"
      };
    } else if (isToday(dueDate) || isTomorrow(dueDate)) {
      return {
        icon: "ri-alarm-warning-line",
        color: "text-gh-orange"
      };
    } else {
      return {
        icon: "ri-alarm-warning-line",
        color: "text-gh-blue"
      };
    }
  };

  // Format due date text
  const formatDueDate = () => {
    const dueDate = new Date(reminder.dueDate);
    
    if (reminder.completed) {
      return "Completed";
    }
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return `Overdue by ${formatDistanceToNow(dueDate)}`;
    } else if (isToday(dueDate)) {
      return "Due today";
    } else if (isTomorrow(dueDate)) {
      return "Due tomorrow";
    } else {
      return `Due in ${formatDistanceToNow(dueDate)}`;
    }
  };

  const style = getReminderStyle();

  return (
    <li className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
      <div className="flex items-start">
        <div className={`flex-shrink-0 mt-1 ${style.color}`}>
          <i className={style.icon}></i>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {reminder.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDueDate()}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          onClick={onComplete}
          disabled={reminder.completed}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          onClick={onSnooze}
          disabled={reminder.completed}
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
