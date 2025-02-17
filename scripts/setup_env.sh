#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up environment variables...${NC}"

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}Existing .env file found. Creating backup...${NC}"
    cp .env .env.backup
fi

# Function to prompt for variable
get_var() {
    local var_name=$1
    local description=$2
    local default_value=$3
    
    if [ -f .env ] && [ -n "$(grep "^${var_name}=" .env)" ]; then
        local current_value=$(grep "^${var_name}=" .env | cut -d '=' -f2)
        echo -e "${YELLOW}Current ${var_name}: ${current_value}${NC}"
        read -p "Enter new value for ${var_name} (press Enter to keep current value) [${description}]: " value
        if [ -z "$value" ]; then
            value=$current_value
        fi
    else
        read -p "Enter ${var_name} [${description}]: " value
        if [ -z "$value" ] && [ -n "$default_value" ]; then
            value=$default_value
        fi
    fi
    echo "${var_name}=${value}"
}

# Create new .env file
{
    echo "# OpenAI API Key"
    get_var "OPENAI_API_KEY" "Required for AI functionality"
    echo
    echo "# Airtable Configuration"
    get_var "AIRTABLE_API_KEY" "Required for Airtable integration"
    get_var "AIRTABLE_BASE_ID" "Your Airtable base ID"
    echo
    echo "# Table names"
    get_var "AIRTABLE_TASKS_TABLE" "Name of your tasks table" "Tasks"
    get_var "AIRTABLE_REPOS_TABLE" "Name of your repositories table" "GitHub Repositories"
    echo
    echo "# Optional Analytics Configuration"
    get_var "FIREBASE_CONFIG" "Firebase configuration JSON (optional)"
} > .env

echo -e "${GREEN}Environment variables have been set up successfully!${NC}"
echo -e "You can find your environment variables in the .env file"
echo -e "A backup of your previous configuration (if any) is saved as .env.backup"
