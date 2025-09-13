// Authentication and Group Management System

// Default data structure
const defaultGroups = {
    'DNT001': {
        groupId: 'DNT001',
        groupName: 'Delhi Network Team',
        adminName: 'Admin User',
        adminEmail: 'admin@company.com',
        adminUsername: 'admin',
        adminPassword: 'admin123',
        description: 'Delhi region network engineering team',
        createdAt: '2024-01-01T00:00:00Z',
        members: [
            {
                id: 'ENG001',
                username: 'rohit.rajput',
                password: 'password123',
                name: 'Rohit Rajput',
                resourceCode: 'HR02',
                role: 'Network Engineer',
                email: 'rohit@company.com',
                joinedAt: '2024-01-01T00:00:00Z',
                isActive: true
            },
            {
                id: 'ENG002',
                username: 'sanjay.kumar',
                password: 'password123',
                name: 'Sanjay Kumar',
                resourceCode: 'HR03',
                role: 'Senior Engineer',
                email: 'sanjay@company.com',
                joinedAt: '2024-01-02T00:00:00Z',
                isActive: true
            }
        ]
    }
};

// Initialize local storage with default data
function initializeStorage() {
    if (!localStorage.getItem('engineeringGroups')) {
        localStorage.setItem('engineeringGroups', JSON.stringify(defaultGroups));
    }
}

// Get groups from storage
function getGroups() {
    return JSON.parse(localStorage.getItem('engineeringGroups') || '{}');
}

// Save groups to storage
function saveGroups(groups) {
    localStorage.setItem('engineeringGroups', JSON.stringify(groups));
}

// Show alert message
function showAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Form switching functions
function showLogin() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('loginForm').classList.add('active');
}

function showAdminLogin() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('adminLoginForm').classList.add('active');
}

function showRegister() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('registerForm').classList.add('active');
}

// Handle user login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('loginText');
    const submitLoader = document.getElementById('loginLoader');
    
    // Show loading
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Simulate authentication delay
    setTimeout(() => {
        const groups = getGroups();
        let authenticatedUser = null;
        let userGroup = null;
        
        // Search for user in all groups
        for (const groupId in groups) {
            const group = groups[groupId];
            const member = group.members.find(m => 
                m.username === username && 
                m.password === password && 
                m.isActive
            );
            
            if (member) {
                authenticatedUser = member;
                userGroup = group;
                break;
            }
        }
        
        if (authenticatedUser) {
            // Store session data
            const sessionData = {
                userId: authenticatedUser.id,
                username: authenticatedUser.username,
                name: authenticatedUser.name,
                resourceCode: authenticatedUser.resourceCode,
                role: authenticatedUser.role,
                groupId: userGroup.groupId,
                groupName: userGroup.groupName,
                isAdmin: false,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAlert('loginAlert', 'Invalid username or password. Please try again.', 'error');
        }
        
        // Hide loading
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('adminText');
    const submitLoader = document.getElementById('adminLoader');
    
    // Show loading
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const groups = getGroups();
        let authenticatedAdmin = null;
        let adminGroup = null;
        
        // Search for admin in all groups
        for (const groupId in groups) {
            const group = groups[groupId];
            if (group.adminUsername === username && group.adminPassword === password) {
                authenticatedAdmin = {
                    username: group.adminUsername,
                    name: group.adminName,
                    email: group.adminEmail
                };
                adminGroup = group;
                break;
            }
        }
        
        if (authenticatedAdmin) {
            // Store admin session data
            const sessionData = {
                userId: 'ADMIN_' + adminGroup.groupId,
                username: authenticatedAdmin.username,
                name: authenticatedAdmin.name,
                role: 'Group Administrator',
                groupId: adminGroup.groupId,
                groupName: adminGroup.groupName,
                isAdmin: true,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            showAlert('adminAlert', 'Admin login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            showAlert('adminAlert', 'Invalid admin credentials. Please try again.', 'error');
        }
        
        // Hide loading
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

// Handle group registration
function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        groupName: document.getElementById('groupName').value,
        groupId: document.getElementById('groupId').value,
        adminName: document.getElementById('adminName').value,
        adminEmail: document.getElementById('adminEmail').value,
        adminUsername: document.getElementById('adminUserName').value,
        adminPassword: document.getElementById('adminPass').value,
        description: document.getElementById('groupDescription').value
    };
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('registerText');
    const submitLoader = document.getElementById('registerLoader');
    
    // Show loading
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const groups = getGroups();
        
        // Check if group ID already exists
        if (groups[formData.groupId]) {
            showAlert('registerAlert', 'Group ID already exists. Please choose a different ID.', 'error');
            submitText.style.display = 'inline';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }
        
        // Check if admin username already exists
        let usernameExists = false;
        for (const groupId in groups) {
            if (groups[groupId].adminUsername === formData.adminUsername) {
                usernameExists = true;
                break;
            }
        }
        
        if (usernameExists) {
            showAlert('registerAlert', 'Admin username already exists. Please choose a different username.', 'error');
            submitText.style.display = 'inline';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }
        
        // Create new group
        const newGroup = {
            groupId: formData.groupId,
            groupName: formData.groupName,
            adminName: formData.adminName,
            adminEmail: formData.adminEmail,
            adminUsername: formData.adminUsername,
            adminPassword: formData.adminPassword,
            description: formData.description,
            createdAt: new Date().toISOString(),
            members: []
        };
        
        groups[formData.groupId] = newGroup;
        saveGroups(groups);
        
        showAlert('registerAlert', 'Group registered successfully! You can now login as admin.', 'success');
        
        // Clear form
        event.target.reset();
        
        // Switch to admin login after delay
        setTimeout(() => {
            showAdminLogin();
            document.getElementById('adminUsername').value = formData.adminUsername;
        }, 2000);
        
        // Hide loading
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

// Check if user is already logged in
function checkExistingSession() {
    const session = localStorage.getItem('userSession');
    if (session) {
        const sessionData = JSON.parse(session);
        // Check if session is less than 24 hours old
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            // Redirect based on user type
            if (sessionData.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            // Session expired
            localStorage.removeItem('userSession');
        }
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    checkExistingSession();
    
    // Show login form by default
    showLogin();
});
