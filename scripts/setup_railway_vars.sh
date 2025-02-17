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

# Check if logged into Railway
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Not logged into Railway. Please run:${NC}"
    echo "railway login"
    exit 1
fi

# Check if project is linked
if ! railway list &> /dev/null; then
    echo -e "${RED}No Railway project linked. Please run:${NC}"
    echo "railway link"
    exit 1
fi

# Read variables directly from .env
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue

    # Remove leading/trailing whitespace
    key=$(echo $key | xargs)
    value=$(echo $value | xargs)

    # Skip if key or value is empty
    [ -z "$key" ] || [ -z "$value" ] && continue

    echo -e "${GREEN}Setting $key...${NC}"
    railway variables set "$key=$value"
done < .env

echo -e "\n${GREEN}Environment variables have been set in Railway!${NC}"
