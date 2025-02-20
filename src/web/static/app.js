// Check authentication status on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Handle enter key in command input
document.getElementById('command')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendCommand();
    }
});

// Check if user is authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        
        if (document.getElementById('not-authenticated')) {
            document.getElementById('not-authenticated').classList.toggle('hidden', data.authenticated);
        }
        if (document.getElementById('authenticated')) {
            document.getElementById('authenticated').classList.toggle('hidden', !data.authenticated);
        }
        if (document.getElementById('command-interface')) {
            document.getElementById('command-interface').classList.toggle('hidden', !data.authenticated);
        }
        
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Logout function
function logout() {
    window.location.href = '/auth/logout';
}

// Send command to the bot
async function sendCommand() {
    const commandInput = document.getElementById('command');
    const responseArea = document.getElementById('response');
    const command = commandInput?.value.trim();

    if (!command) return;

    try {
        responseArea.textContent = 'Processing...';
        responseArea.className = 'bg-gray-50 rounded-md p-4 min-h-[100px] whitespace-pre-wrap';
        
        const response = await fetch('/command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: command })
        });

        const data = await response.json();
        
        // If not authenticated, redirect to login
        if (response.status === 401) {
            window.location.href = data.login_url || '/auth/login';
            return;
        }
        
        // Update response area
        responseArea.textContent = data.status === 'success' 
            ? (typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2))
            : `Error: ${data.message || 'Unknown error'}`;
            
        // Add status class
        responseArea.classList.add(data.status === 'success' ? 'text-green-600' : 'text-red-600');

        // Clear input on success
        if (data.status === 'success' && commandInput) {
            commandInput.value = '';
        }

    } catch (error) {
        console.error('Error sending command:', error);
        if (responseArea) {
            responseArea.textContent = 'Error: Could not connect to the server. Please try again.';
            responseArea.classList.add('text-red-600');
        }
    }
}

// Handle quick command buttons
function useQuickCommand(command) {
    const commandInput = document.getElementById('command');
    if (commandInput) {
        commandInput.value = command;
        sendCommand();
    }
}
