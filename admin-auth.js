const ADMIN_EMAIL = 'sajansah205@gmail.com';

async function handleGoogleSignIn(response) {
    try {
        const data = await verifyGoogleToken(response.credential);
        
        if (data.email === ADMIN_EMAIL) {
            // Sign in with Firebase using the Google token
            const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
            await firebase.auth().signInWithCredential(credential);
            
            // Store minimal data in localStorage
            localStorage.setItem('adminEmail', data.email);
            window.location.href = 'admin-dashboard.html';
        } else {
            throw new Error('You are not authorized to access this portal.');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        document.getElementById('loginError').textContent = 
            error.message || 'Authentication failed. Please try again.';
        document.getElementById('loginError').style.display = 'block';
        google.accounts.id.disableAutoSelect();
    }
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
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user && user.email === ADMIN_EMAIL) {
                localStorage.setItem('adminEmail', user.email);
                resolve(true);
            } else {
                localStorage.removeItem('adminEmail');
                window.location.href = 'admin-login.html';
                resolve(false);
            }
        });
    });
}

function adminLogout() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem('adminEmail');
        google.accounts.id.disableAutoSelect();
        window.location.href = 'admin-login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}