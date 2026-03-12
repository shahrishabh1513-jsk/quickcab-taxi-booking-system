// Authentication JavaScript

// User Login
function loginUser(email, password) {
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password) {
                // Store user session
                localStorage.setItem('user', JSON.stringify({
                    name: 'Rahul Sharma',
                    email: email,
                    role: 'user'
                }));
                resolve({ success: true });
            } else {
                reject({ success: false, message: 'Invalid credentials' });
            }
        }, 1000);
    });
}

// User Registration
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Validate user data
            if (userData.email && userData.password) {
                localStorage.setItem('user', JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    role: 'user'
                }));
                resolve({ success: true });
            } else {
                reject({ success: false, message: 'Please fill all fields' });
            }
        }, 1000);
    });
}

// Driver Registration
function registerDriver(driverData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Validate driver data
            if (driverData.license && driverData.vehicle) {
                localStorage.setItem('driver', JSON.stringify({
                    name: driverData.name,
                    email: driverData.email,
                    status: 'pending' // Awaiting admin approval
                }));
                resolve({ success: true, message: 'Registration submitted for approval' });
            } else {
                reject({ success: false, message: 'Please fill all fields' });
            }
        }, 2000);
    });
}

// Logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('driver');
    window.location.href = '../index.html';
}

// Check Auth Status
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('user'));
    const driver = JSON.parse(localStorage.getItem('driver'));
    
    if (requiredRole === 'admin') {
        // Check admin session
        return user && user.role === 'admin';
    } else if (requiredRole === 'driver') {
        return driver && driver.status === 'approved';
    } else {
        return user || driver;
    }
}

// Redirect if not authenticated
function requireAuth(requiredRole = null) {
    if (!checkAuth(requiredRole)) {
        window.location.href = '../login.html';
    }
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await loginUser(email, password);
                if (result.success) {
                    showNotification('Login successful!', 'success');
                    window.location.href = 'dashboard/user-dashboard.html';
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value
            };
            
            try {
                const result = await registerUser(userData);
                if (result.success) {
                    showNotification('Registration successful!', 'success');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
});