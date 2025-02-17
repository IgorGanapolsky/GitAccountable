#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}Error: Heroku CLI is not installed${NC}"
    echo "Please install it first: brew install heroku/brew/heroku"
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Heroku. Please log in:${NC}"
    heroku login
fi

# Configuration
APP_NAME="ai-accountability-bot"
GITHUB_REPO="git@github.com:IgorGanapolsky/AI-Accountability-Bot.git"

echo -e "${YELLOW}Starting deployment process...${NC}"

# 1. Push to GitHub
echo -e "\n${GREEN}Pushing to GitHub...${NC}"
git add .
git commit -m "Deployment $(date +%Y-%m-%d_%H-%M-%S)" || true
git push origin main || {
    echo -e "${RED}Failed to push to GitHub${NC}"
    exit 1
}

# 2. Create Heroku app if it doesn't exist
if ! heroku apps:info -a $APP_NAME &> /dev/null; then
    echo -e "\n${GREEN}Creating Heroku app...${NC}"
    heroku create $APP_NAME
fi

# 3. Set up Heroku container stack
echo -e "\n${GREEN}Setting up Heroku container stack...${NC}"
heroku stack:set container -a $APP_NAME

# 4. Configure environment variables
echo -e "\n${GREEN}Configuring environment variables...${NC}"
# Load variables from .env
if [ -f .env ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        # Remove quotes from value if present
        value=$(echo $value | sed -e 's/^"//' -e 's/"$//')
        # Set in Heroku
        heroku config:set "$key=$value" -a $APP_NAME
    done < .env
else
    echo -e "${RED}Warning: .env file not found${NC}"
    echo "Please manually set environment variables in Heroku dashboard"
fi

# 5. Deploy to Heroku
echo -e "\n${GREEN}Deploying to Heroku...${NC}"
git push heroku main

# 6. Scale worker dyno
echo -e "\n${GREEN}Scaling worker dyno...${NC}"
heroku ps:scale worker=1 -a $APP_NAME

# 7. Show logs
echo -e "\n${GREEN}Deployment complete! Showing logs...${NC}"
heroku logs --tail -a $APP_NAME
