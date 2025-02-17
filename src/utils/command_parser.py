"""
Command parsing utilities for the AI Accountability Bot
"""
from typing import Tuple, Optional

class CommandParser:
    @staticmethod
    def parse_command(user_input: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Parse user input to identify commands and their parameters
        
        Args:
            user_input (str): The raw user input string
            
        Returns:
            Tuple[Optional[str], Optional[str]]: A tuple of (command, arguments)
        """
        if not user_input:
            return None, None
            
        parts = user_input.lower().split()
        if not parts:
            return None, None
        
        command = parts[0]
        args = ' '.join(parts[1:]) if len(parts) > 1 else None
        return command, args

    @staticmethod
    def parse_priority(text: str) -> str:
        """
        Parse priority from text
        
        Args:
            text (str): The text to parse priority from
            
        Returns:
            str: Priority level ('High', 'Medium', or 'Low')
        """
        text = text.lower()
        if any(word in text for word in ['urgent', 'critical', 'asap', 'high']):
            return 'High'
        elif any(word in text for word in ['medium', 'normal']):
            return 'Medium'
        return 'Low'  # Default priority