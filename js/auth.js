document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // Function to display messages
    function displayMessage(msg, isError = false) {
        messageDiv.textContent = msg;
        messageDiv.className = isError ? 'error' : '';
    }

    // Handle Registration Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;

            displayMessage('Registering...');

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message || 'Registration successful!');
                    // Optionally clear the form or redirect
                    registerForm.reset();
                } else {
                    displayMessage(data.message || 'Registration failed.', true);
                }
            } catch (error) {
                console.error('Registration Error:', error);
                displayMessage('An error occurred during registration.', true);
            }
        });
    }

    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const loginIdentifier = document.getElementById('loginIdentifier').value;
            const password = document.getElementById('loginPassword').value;

            displayMessage('Logging in...');

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ loginIdentifier, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message || 'Login successful!');
                    // Store the JWT
                    localStorage.setItem('token', data.token);
                    // Redirect to the main application page (e.g., index.html)
                    window.location.href = 'index.html'; // Adjust if your main page is different
                } else {
                    displayMessage(data.message || 'Login failed.', true);
                }
            } catch (error) {
                console.error('Login Error:', error);
                displayMessage('An error occurred during login.', true);
            }
        });
    }

    // Handle Logout Button Click
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            localStorage.removeItem('token'); // Remove the JWT from localStorage
        window.location.href = '/login.html'; // Redirect to the login page
        });
    }

    // --- Example of using getAuthenticatedHeaders (Conceptual) ---
    // In another file like js/main.js, when fetching protected data:
    /*
    async function fetchProtectedData() {
        const headers = window.getAuthenticatedHeaders();
        if (!headers['Authorization']) {
             // Handle case where no token is available (e.g., redirect to login)
             console.error('Cannot fetch protected data: User not logged in.');
             return; // Stop execution
        }
        try {
            const response = await fetch('/api/some-protected-route', {
                method: 'GET', // or POST, PUT, DELETE
                headers: headers,
                // body: JSON.stringify(yourData) // for POST/PUT
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Protected data:', data);
            } else if (response.status === 401 || response.status === 403) {
                // Token expired or invalid - handle logout/redirect
                console.error('Authentication failed for protected route.');
                localStorage.removeItem('token'); // Clear invalid token
                window.location.href = 'login.html'; // Redirect to login
            } else {
                console.error('Error fetching protected data:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch error for protected data:', error);
        }
    }
    */
});

// --- Function to include JWT in future requests ---
// This is a helper function you can use in other JS files
// to make authenticated requests.
window.getAuthenticatedHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    } else {
        // No token found, might need to redirect to login or handle
        // This depends on how you structure your app's flow
        console.warn('No JWT token found. User may not be authenticated.');
        // Optionally redirect to login page if not already there
        // if (window.location.pathname !== '/login.html') {
        //     window.location.href = 'login.html';
        // }
        return {
             'Content-Type': 'application/json'
        }; // Return headers without auth
    }
};
