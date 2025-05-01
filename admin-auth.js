const ADMIN_EMAIL = 'sajansah205@gmail.com';
function handleGoogleSignIn(response) {
    verifyGoogleToken(response.credential)
        .then(data => {
            if (data.email === ADMIN_EMAIL) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminEmail', data.email);
                window.location.href = 'admin-dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 
                    'You are not authorized to access this portal.';
                document.getElementById('loginError').style.display = 'block';
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

async function verifyGoogleToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
        email: payload.email,
        name: payload.name,
        token: token
    };
}

function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    
    if (!token || email !== ADMIN_EMAIL) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    google.accounts.id.disableAutoSelect();
    window.location.href = 'admin-login.html';
}