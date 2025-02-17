# AI-Accountability-Bot

A powerful task and repository management bot with natural language processing capabilities and AI-powered interactions.

## Features

1. Task Management
   - Add tasks with natural language input and due dates
   - List tasks with optional status filtering
   - Update task status
   - Delete tasks
   - Check due tasks

2. Repository Management
   - List repositories
   - Add new repositories
   - Search repositories (case-insensitive)

3. AI-Powered Interactions
   - Natural language command processing
   - ChatGPT integration for non-command queries
   - Flexible input handling

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/IgorGanapolsky/AI-Accountability-Bot.git
   cd AI-Accountability-Bot
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `.env.template` to `.env`
   - Fill in your API keys and configuration:
     ```bash
     cp .env.template .env
     ```
   Required variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `AIRTABLE_API_KEY`: Your Airtable API key
   - `AIRTABLE_BASE_ID`: Your Airtable base ID
   - `AIRTABLE_TASKS_TABLE`: Name of your tasks table (default: "Tasks")
   - `AIRTABLE_REPOS_TABLE`: Name of your repositories table (default: "Repositories")

## Usage

1. Start the bot:
   ```bash
   python -m src.cli.main
   ```

2. Available Commands:

   Task Management:
   ```
   add task <description> by <due date>
   list tasks [status]
   update task <title> as <status>
   delete task <title>
   show due [in X days]
   ```

   Repository Management:
   ```
   repo list
   repo add <name>
   repo search <term>
   ```

   General:
   ```
   help - Show available commands
   quit/exit - Exit the bot
   ```

3. Natural Language Examples:
   ```
   "Add task: Implement login page by next Friday"
   "Show my tasks"
   "Mark task 'Implement login' as done"
   "What's due this week?"
   ```

## Project Structure

```
ai-accountability-bot/
├── src/
│   ├── core/
│   │   ├── bot.py         # Main bot logic
│   │   └── chat.py        # ChatGPT integration
│   ├── managers/
│   │   ├── airtable_manager.py
│   │   └── task_manager.py
│   ├── utils/
│   │   ├── command_parser.py
│   │   └── date_parser.py
│   └── cli/
│       └── main.py        # CLI entry point
├── tests/                 # Test directory
├── .env.template          # Environment template
├── requirements.txt       # Dependencies
└── README.md             # This file
```

## Dependencies

- `python-dotenv`: Environment variable management
- `openai`: ChatGPT integration
- `pyairtable`: Airtable API client
- `schedule`: Task scheduling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
