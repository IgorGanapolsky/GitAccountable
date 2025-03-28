# GitHub Accountability Assistant

A web-based accountability assistant for GitHub repositories with conversational AI interface.

## Features

- **Dashboard**: View repository health metrics and recent activities
- **Repository Tracking**: Monitor repository status and get alerts for inactive repositories
- **Conversational Interface**: Chat with an AI assistant powered by OpenAI GPT-4o
- **Reminders**: Set and manage reminders for repository-related tasks
- **GitHub Integration**: Sync with your GitHub repositories and track activities

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **APIs**: GitHub API, OpenAI API
- **Storage**: In-memory storage (can be extended to PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token with repository permissions
- OpenAI API Key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/IgorGanapolsky/AI-Accountability-Bot.git
   cd AI-Accountability-Bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `OPENAI_API_KEY`: Your OpenAI API key

4. Start the application:
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:5000`

## Usage

- **Dashboard**: View overall repository health and activity metrics
- **Repositories**: Browse your GitHub repositories and their current status
- **Conversations**: Review past AI assistant conversations
- **Settings**: Configure your GitHub username and token

## License

MIT