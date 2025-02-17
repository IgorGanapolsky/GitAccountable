from datetime import datetime, timedelta
import re

class DateParser:
    DAYS_OF_WEEK = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6
    }

    @staticmethod
    def parse_date(text: str) -> str | None:
        """Parse date from natural language text"""
        try:
            text = text.lower()
            
            if "today" in text:
                return datetime.now().strftime("%Y-%m-%d")
            elif "tomorrow" in text:
                return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            elif "next week" in text:
                return (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                
            # Handle "by [day]"
            for day, offset in DateParser.DAYS_OF_WEEK.items():
                if day in text:
                    current_day = datetime.now().weekday()
                    days_until = (offset - current_day) % 7
                    if days_until == 0:
                        days_until = 7
                    return (datetime.now() + timedelta(days=days_until)).strftime("%Y-%m-%d")
                    
            if re.match(r'\d{4}-\d{2}-\d{2}', text):
                return text
                
            return None
        except Exception:
            return None 