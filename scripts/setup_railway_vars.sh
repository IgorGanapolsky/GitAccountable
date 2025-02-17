#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Railway environment variables...${NC}"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    brew install railway
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "\n${YELLOW}Please log in to Railway:${NC}"
    railway login
fi

# Initialize command
cmd="railway variables set"

# Read .env file and set variables
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue

    # Remove leading/trailing whitespace and quotes
    key=$(echo $key | xargs)
    value=$(echo $value | xargs | sed -e 's/^"//' -e 's/"$//')

    # Skip if key or value is empty
    [ -z "$key" ] || [ -z "$value" ] && continue

    # Escape special characters in value
    value=$(printf '%q' "$value")

    # Add to our command
    cmd="$cmd --set \"$key=$value\""

    echo -e "${GREEN}Processing ${key}...${NC}"
done < .env

# Set all variables at once
echo -e "${GREEN}Uploading variables to Railway...${NC}"
eval "$cmd"

echo -e "\n${GREEN}Environment variables have been set in Railway!${NC}"
echo -e "You can verify them by running: railway variables"
