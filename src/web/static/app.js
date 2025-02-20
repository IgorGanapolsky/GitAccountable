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
        
        document.getElementById('not-authenticated').classList.toggle('hidden', data.authenticated);
        document.getElementById('authenticated').classList.toggle('hidden', !data.authenticated);
        document.getElementById('command-interface').classList.toggle('hidden', !data.authenticated);
        
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Logout function
function logout() {
    window.location.href = '/logout';
}

// Send command to the bot
async function sendCommand() {
    const commandInput = document.getElementById('command');
    const responseArea = document.getElementById('response');
    const command = commandInput.value.trim();

    if (!command) return;

    // Show loading state
    responseArea.classList.add('loading');
    responseArea.textContent = 'Processing...';

    try {
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
            window.location.href = data.login_url;
            return;
        }
        
        // Update response area with animation
        responseArea.classList.remove('loading');
        responseArea.classList.remove('status-success', 'status-error');
        responseArea.classList.add(data.status === 'success' ? 'status-success' : 'status-error');
        
        // Format the response
        if (data.status === 'success') {
            responseArea.textContent = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
        } else {
            responseArea.textContent = `Error: ${data.message}`;
        }

        // Clear input on success
        if (data.status === 'success') {
            commandInput.value = '';
        }

    } catch (error) {
        responseArea.classList.remove('loading');
        responseArea.classList.add('status-error');
        responseArea.textContent = `Error: Could not connect to the server. Please try again.`;
    }

    // Add fade-in animation
    responseArea.classList.add('fade-in');
    setTimeout(() => responseArea.classList.remove('fade-in'), 300);
}

// Handle quick command buttons
function useQuickCommand(command) {
    const commandInput = document.getElementById('command');
    commandInput.value = command;
    sendCommand();
}
