#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    brew install railway
fi

# Configuration
PROJECT_NAME="ai-accountability-bot"

echo -e "${YELLOW}Starting deployment process...${NC}"

# 1. Push to GitHub
echo -e "\n${GREEN}Pushing to GitHub...${NC}"
git add .
git commit -m "Deployment $(date +%Y-%m-%d_%H-%M-%S)" || true
git push origin main || {
    echo -e "${RED}Failed to push to GitHub${NC}"
    exit 1
}

# 2. Login to Railway if needed
if ! railway whoami &> /dev/null; then
    echo -e "\n${YELLOW}Please log in to Railway:${NC}"
    railway login
fi

# 3. Initialize Railway project if needed
if ! railway list 2>/dev/null | grep -q "${PROJECT_NAME}"; then
    echo -e "\n${GREEN}Initializing Railway project...${NC}"
    railway init
fi

# 4. Deploy to Railway
echo -e "\n${GREEN}Deploying to Railway...${NC}"
railway up

# 5. Show deployment status
echo -e "\n${GREEN}Deployment complete! Opening project dashboard...${NC}"
railway open
