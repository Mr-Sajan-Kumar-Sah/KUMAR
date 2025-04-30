// Allowed admin email
const ADMIN_EMAIL = 'sajansah205@gmail.com';

// Handle Google Sign-In response
function handleGoogleSignIn(response) {
    // Verify the credential with your backend
    verifyGoogleToken(response.credential)
        .then(data => {
            if (data.email === ADMIN_EMAIL) {
                // Successful admin login
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminEmail', data.email);
                window.location.href = 'admin-dashboard.html';
            } else {
                // Not the admin
                document.getElementById('loginError').textContent = 
                    'You are not authorized to access this portal.';
                document.getElementById('loginError').style.display = 'block';
                
                // Sign out from Google
                google.accounts.id.disableAutoSelect();
            }
        })
        .catch(error => {
            console.error('Authentication error:', error);
            document.getElementById('loginError').textContent = 
                'Authentication failed. Please try again.';
            document.getElementById('loginError').style.display = 'block';
        });
}

// Verify the Google token with your backend
async function verifyGoogleToken(token) {
    // In a real implementation, you would send this to your backend
    // For this example, we'll decode it client-side (not secure for production)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
        email: payload.email,
        name: payload.name,
        token: token
    };
}

// Check admin authentication on protected pages
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    
    if (!token || email !== ADMIN_EMAIL) {
        // Redirect to login page if not authenticated
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

// Admin logout function
function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    google.accounts.id.disableAutoSelect();
    window.location.href = 'admin-login.html';
}