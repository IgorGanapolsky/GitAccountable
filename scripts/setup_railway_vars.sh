#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Railway environment variables...${NC}"

# Read from .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Function to safely set Railway variables
set_railway_var() {
    local key=$1
    local value=$2
    echo -e "${GREEN}Setting $key...${NC}"
    railway variables set "$key=$value"
}

# Set each variable from .env
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Remove leading/trailing whitespace and quotes
    key=$(echo $key | xargs)
    value=$(echo $value | xargs | sed -e 's/^"//' -e 's/"$//')
    
    # Skip if key or value is empty
    [ -z "$key" ] || [ -z "$value" ] && continue
    
    set_railway_var "$key" "$value"
done < .env

echo -e "\n${GREEN}Environment variables have been set in Railway!${NC}"
echo -e "You can verify them by running: railway variables list"
