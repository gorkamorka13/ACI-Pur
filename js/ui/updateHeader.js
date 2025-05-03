// Function to update header elements with user info from JWT
function updateHeaderUserInfo() {
    const usernameElement = document.getElementById('usernameDisplay');
    const avatarElement = document.getElementById('userAvatar');
    const defaultAvatar = '/images/default_avatar.png'; // Ensure this path is correct
    const token = localStorage.getItem('token');

    let username = 'Utilisateur'; // Default username
    let avatarSrc = defaultAvatar; // Default avatar source

    if (token) {
        try {
            // Decode JWT payload (second part)
            const payloadBase64 = token.split('.')[1];
            // Use atob for Base64 decoding (browser environment)
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            // Set username and avatar from payload if available
            if (payload) {
                if (payload.username) {
                    username = payload.username;
                }
                // Use avatar from payload if it exists and is not null/empty, otherwise keep default
                if (payload.avatar && payload.avatar.trim() !== '') {
                    avatarSrc = payload.avatar;
                }
            }
        } catch (e) {
            console.error('Failed to decode JWT token or parse payload:', e);
            // Keep default username and avatar if decoding fails
            // Clear potentially invalid token?
            // localStorage.removeItem('token');
            // window.location.href = '/login.html'; // Optional: redirect on bad token
        }
    } else {
        console.warn('No JWT token found. Displaying default user info.');
        // Optional: Redirect to login if no token and not on login/register page
        // if (!['/login.html', '/register.html'].includes(window.location.pathname)) {
        //     window.location.href = '/login.html';
        // }
    }

    // Update DOM elements if they exist
    if (usernameElement) {
        usernameElement.textContent = username;
    } else {
        // Don't log error on pages where it might not exist (like login/register)
        // console.error("Username display element 'usernameDisplay' not found.");
    }

    if (avatarElement) {
        avatarElement.src = avatarSrc;
        // Add error handling for the image itself
        avatarElement.onerror = () => {
            console.warn(`Failed to load avatar image: ${avatarSrc}. Falling back to default.`);
            avatarElement.src = defaultAvatar; // Set to default on error
        };
    } else {
        // Don't log error on pages where it might not exist
        // console.error("Avatar display element 'userAvatar' not found.");
    }
}

// Run the function when the script is loaded
// Use DOMContentLoaded to ensure elements are available
document.addEventListener('DOMContentLoaded', updateHeaderUserInfo);

// Optional: Export the function if it needs to be called manually elsewhere
// export { updateHeaderUserInfo };
