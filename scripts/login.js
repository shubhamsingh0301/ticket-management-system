// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Simple validation
        if (!username || !password) {
            errorMessage.textContent = 'Please enter both username and password';
            return;
        }

        // Store login status in local storage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
});