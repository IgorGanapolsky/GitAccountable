#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Railway environment variables...${NC}"

# Check if Railway CLI is installed and logged in
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI is not installed. Please install it first:${NC}"
    echo "npm i -g @railway/cli"
    exit 1
fi

# Read from .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Create a temporary file to store the variables command
cmd="railway variables"

# Read and process each variable from .env
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
