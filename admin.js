// Admin Dashboard JavaScript

let currentSession = null;
let currentGroup = null;
let allGroups = {};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadGroupData();
    updateMemberStats();
    loadGroupUpdates();
    initializeAnalytics();
    loadSettings();
});

// Check if admin is authenticated
function checkAdminAuth() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    currentSession = JSON.parse(session);
    if (!currentSession.isAdmin) {
        window.location.href = 'login.html';
        return;
    }

    // Update header info
    document.getElementById('groupInfo').textContent = `Group: ${currentSession.groupName}`;
    document.getElementById('adminInfo').textContent = `Admin: ${currentSession.name}`;

    // Load group data
    allGroups = JSON.parse(localStorage.getItem('engineeringGroups') || '{}');
    currentGroup = allGroups[currentSession.groupId];
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    // Update section-specific data
    switch(sectionName) {
        case 'members':
            loadMembers();
            break;
        case 'groupData':
            loadGroupUpdates();
            break;
        case 'analytics':
            updateAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Show alert
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

// Load and display members
function loadMembers() {
    const container = document.getElementById('membersGrid');
    const members = currentGroup.members || [];
    
    if (members.length === 0) {
        container.innerHTML = `
            <div class="no-members">
                <h3>No members yet</h3>
                <p>Start by adding your first team member</p>
            </div>
        `;
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="member-card">
            <div class="member-header">
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>@${member.username}</p>
                    <p>${member.role}</p>
                    <p>${member.resourceCode || 'No code assigned'}</p>
                </div>
                <div class="member-status ${member.isActive ? 'active' : 'inactive'}">
                    ${member.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>
            
            <div class="member-details">
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${member.email || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Joined</div>
                    <div class="detail-value">${formatDate(member.joinedAt)}</div>
                </div>
            </div>
            
            <div class="member-actions">
                <button class="btn-action edit" onclick="editMember('${member.id}')">Edit</button>
                <button class="btn-action ${member.isActive ? 'delete' : ''}" onclick="toggleMemberStatus('${member.id}')">
                    ${member.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

// Update member statistics
function updateMemberStats() {
    const members = currentGroup.members || [];
    const activeMembers = members.filter(m => m.isActive).length;
    
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('activeMembers').textContent = activeMembers;
}

// Show add member modal
function showAddMemberModal() {
    document.getElementById('addMemberModal').style.display = 'flex';
}

// Hide add member modal
function hideAddMemberModal() {
    document.getElementById('addMemberModal').style.display = 'none';
    document.getElementById('addMemberForm').reset();
}

// Add new member
function addMember(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('memberName').value,
        username: document.getElementById('memberUsername').value,
        password: document.getElementById('memberPassword').value,
        resourceCode: document.getElementById('memberResourceCode').value,
        role: document.getElementById('memberRole').value,
        email: document.getElementById('memberEmail').value
    };

    // Check if username already exists
    const existingMember = currentGroup.members.find(m => m.username === formData.username);
    if (existingMember) {
        showAlert('memberAlert', 'Username already exists in this group', 'error');
        return;
    }

    // Create new member
    const newMember = {
        id: 'ENG' + Date.now(),
        username: formData.username,
        password: formData.password,
        name: formData.name,
        resourceCode: formData.resourceCode,
        role: formData.role,
        email: formData.email,
        joinedAt: new Date().toISOString(),
        isActive: true
    };

    // Add to group
    currentGroup.members.push(newMember);
    allGroups[currentSession.groupId] = currentGroup;
    localStorage.setItem('engineeringGroups', JSON.stringify(allGroups));

    hideAddMemberModal();
    loadMembers();
    updateMemberStats();
    showAlert('memberAlert', `Member ${formData.name} added successfully`, 'success');
}

// Edit member
function editMember(memberId) {
    const member = currentGroup.members.find(m => m.id === memberId);
    if (!member) return;

    // Populate edit form
    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberUsername').value = member.username;
    document.getElementById('editMemberResourceCode').value = member.resourceCode || '';
    document.getElementById('editMemberRole').value = member.role;
    document.getElementById('editMemberEmail').value = member.email || '';

    document.getElementById('editMemberModal').style.display = 'flex';
}

// Hide edit member modal
function hideEditMemberModal() {
    document.getElementById('editMemberModal').style.display = 'none';
    document.getElementById('editMemberForm').reset();
}

// Update member
function updateMember(event) {
    event.preventDefault();
    
    const memberId = document.getElementById('editMemberId').value;
    const memberIndex = currentGroup.members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) return;

    const formData = {
        name: document.getElementById('editMemberName').value,
        username: document.getElementById('editMemberUsername').value,
        password: document.getElementById('editMemberPassword').value,
        resourceCode: document.getElementById('editMemberResourceCode').value,
        role: document.getElementById('editMemberRole').value,
        email: document.getElementById('editMemberEmail').value
    };

    // Update member data
    const member = currentGroup.members[memberIndex];
    member.name = formData.name;
    member.username = formData.username;
    member.resourceCode = formData.resourceCode;
    member.role = formData.role;
    member.email = formData.email;

    if (formData.password) {
        member.password = formData.password;
    }

    // Save changes
    allGroups[currentSession.groupId] = currentGroup;
    localStorage.setItem('engineeringGroups', JSON.stringify(allGroups));

    hideEditMemberModal();
    loadMembers();
    showAlert('memberAlert', `Member ${formData.name} updated successfully`, 'success');
}

// Toggle member status
function toggleMemberStatus(memberId) {
    const memberIndex = currentGroup.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return;

    const member = currentGroup.members[memberIndex];
    member.isActive = !member.isActive;

    // Save changes
    allGroups[currentSession.groupId] = currentGroup;
    localStorage.setItem('engineeringGroups', JSON.stringify(allGroups));

    loadMembers();
    updateMemberStats();
    showAlert('memberAlert', 
        `Member ${member.name} ${member.isActive ? 'activated' : 'deactivated'}`, 
        'success'
    );
}

// Load group updates
function loadGroupUpdates() {
    const updates = JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]');
    const tbody = document.getElementById('groupDataTable');

    if (updates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-updates">No updates available from group members</td></tr>';
        return;
    }

    tbody.innerHTML = updates.map(update => `
        <tr>
            <td>${formatDate(update.date)}</td>
            <td>${update.resourceName}</td>
            <td>${update.siteName}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.projectCategory}</td>
            <td>
                <button class="btn-action" onclick="viewUpdateDetails(${update.id})">View</button>
            </td>
        </tr>
    `).join('');

    // Update member filter
    const memberFilter = document.getElementById('memberFilter');
    const members = [...new Set(updates.map(u => u.resourceName))];
    memberFilter.innerHTML = '<option value="">All Members</option>' +
        members.map(member => `<option value="${member}">${member}</option>`).join('');
}

// Filter group data
function filterGroupData() {
    const memberFilter = document.getElementById('memberFilter').value;
    const dateRangeFilter = document.getElementById('dateRangeFilter').value;
    
    let updates = JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]');
    
    // Apply filters
    if (memberFilter) {
        updates = updates.filter(u => u.resourceName === memberFilter);
    }
    
    if (dateRangeFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch(dateRangeFilter) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
        }
        
        updates = updates.filter(u => new Date(u.date) >= startDate);
    }

    // Display filtered updates
    const tbody = document.getElementById('groupDataTable');
    if (updates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-updates">No updates match the selected filters</td></tr>';
        return;
    }

    tbody.innerHTML = updates.map(update => `
        <tr>
            <td>${formatDate(update.date)}</td>
            <td>${update.resourceName}</td>
            <td>${update.siteName}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.projectCategory}</td>
            <td>
                <button class="btn-action" onclick="viewUpdateDetails(${update.id})">View</button>
            </td>
        </tr>
    `).join('');
}

// Export group data
function exportGroupData() {
    const updates = JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]');
    
    if (updates.length === 0) {
        showAlert('memberAlert', 'No data to export', 'error');
        return;
    }

    const headers = [
        'Date', 'Member', 'Site Name', 'Location', 'Activity', 
        'Status', 'Project Category', 'Media Type', 'Remarks'
    ];

    const csvContent = [
        headers.join(','),
        ...updates.map(update => [
            update.date,
            update.resourceName,
            update.siteName,
            update.location,
            update.activity,
            update.activityStatus,
            update.projectCategory,
            update.mediaType || '',
            (update.remarks || '').replace(/,/g, ';')
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.groupName}-updates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert('memberAlert', 'Group data exported successfully', 'success');
}

// Initialize analytics
function initializeAnalytics() {
    updateAnalytics();
}

// Update analytics
function updateAnalytics() {
    const updates = JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]');
    
    // Status counts
    const statusCounts = {
        completed: updates.filter(u => u.activityStatus === 'Completed').length,
        active: updates.filter(u => u.activityStatus === 'Active').length,
        pending: updates.filter(u => u.activityStatus === 'Pending').length,
        onHold: updates.filter(u => u.activityStatus === 'On Hold').length
    };

    // Update status counts
    document.getElementById('completedCount').textContent = statusCounts.completed;
    document.getElementById('activeCount').textContent = statusCounts.active;
    document.getElementById('pendingCount').textContent = statusCounts.pending;
    document.getElementById('onHoldCount').textContent = statusCounts.onHold;

    // Top performers
    const performerCounts = {};
    updates.forEach(update => {
        performerCounts[update.resourceName] = (performerCounts[update.resourceName] || 0) + 1;
    });

    const topPerformers = Object.entries(performerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const performersContainer = document.getElementById('topPerformers');
    if (topPerformers.length === 0) {
        performersContainer.innerHTML = '<p style="text-align: center; color: #718096;">No activity data available</p>';
    } else {
        performersContainer.innerHTML = topPerformers.map(([name, count]) => `
            <div class="performer-item">
                <span class="performer-name">${name}</span>
                <span class="performer-count">${count}</span>
            </div>
        `).join('');
    }

    // Monthly activity (simplified chart)
    const monthlyContainer = document.getElementById('monthlyActivity');
    monthlyContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">Monthly activity chart would be implemented with a charting library</p>';
}

// Load settings
function loadSettings() {
    document.getElementById('settingsGroupName').value = currentGroup.groupName;
    document.getElementById('settingsGroupDescription').value = currentGroup.description || '';
    document.getElementById('settingsAdminName').value = currentGroup.adminName;
    document.getElementById('settingsAdminEmail').value = currentGroup.adminEmail;
}

// Update group settings
function updateGroupSettings(event) {
    event.preventDefault();
    
    const formData = {
        groupName: document.getElementById('settingsGroupName').value,
        description: document.getElementById('settingsGroupDescription').value
    };

    // Update group data
    currentGroup.groupName = formData.groupName;
    currentGroup.description = formData.description;

    // Save changes
    allGroups[currentSession.groupId] = currentGroup;
    localStorage.setItem('engineeringGroups', JSON.stringify(allGroups));

    // Update session
    currentSession.groupName = formData.groupName;
    localStorage.setItem('userSession', JSON.stringify(currentSession));

    // Update UI
    document.getElementById('groupInfo').textContent = `Group: ${formData.groupName}`;

    alert('Group settings updated successfully!');
}

// Update admin settings
function updateAdminSettings(event) {
    event.preventDefault();
    
    const formData = {
        adminName: document.getElementById('settingsAdminName').value,
        adminEmail: document.getElementById('settingsAdminEmail').value,
        password: document.getElementById('settingsAdminPassword').value
    };

    // Update admin data
    currentGroup.adminName = formData.adminName;
    currentGroup.adminEmail = formData.adminEmail;

    if (formData.password) {
        currentGroup.adminPassword = formData.password;
    }

    // Save changes
    allGroups[currentSession.groupId] = currentGroup;
    localStorage.setItem('engineeringGroups', JSON.stringify(allGroups));

    // Update session
    currentSession.name = formData.adminName;
    localStorage.setItem('userSession', JSON.stringify(currentSession));

    // Update UI
    document.getElementById('adminInfo').textContent = `Admin: ${formData.adminName}`;
    document.getElementById('settingsAdminPassword').value = '';

    alert('Admin settings updated successfully!');
}

// Backup group data
function backupGroupData() {
    const backupData = {
        group: currentGroup,
        updates: JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]'),
        chatMessages: JSON.parse(localStorage.getItem(`chat_messages_${currentSession.groupId}`) || '[]'),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.groupName}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    alert('Group data backup downloaded successfully!');
}

// Show import modal
function showImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    importGroupData(data);
                } catch (error) {
                    alert('Invalid backup file format');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Import group data
function importGroupData(data) {
    if (!data.group || !Array.isArray(data.updates)) {
        alert('Invalid backup file structure');
        return;
    }

    const confirm = window.confirm('This will replace current group data. Continue?');
    if (!confirm) return;

    // Import data
    if (data.updates) {
        localStorage.setItem(`groupUpdates_${currentSession.groupId}`, JSON.stringify(data.updates));
    }
    
    if (data.chatMessages) {
        localStorage.setItem(`chat_messages_${currentSession.groupId}`, JSON.stringify(data.chatMessages));
    }

    // Refresh displays
    loadGroupUpdates();
    updateAnalytics();
    
    alert('Group data imported successfully!');
}

// Confirm data reset
function confirmDataReset() {
    const confirm = window.confirm('This will permanently delete all group data including updates and chat messages. This action cannot be undone. Continue?');
    if (!confirm) return;

    const doubleConfirm = window.confirm('Are you absolutely sure? Type "DELETE" to confirm:');
    if (doubleConfirm) {
        resetAllData();
    }
}

// Reset all data
function resetAllData() {
    // Clear group updates
    localStorage.removeItem(`groupUpdates_${currentSession.groupId}`);
    
    // Clear chat messages
    localStorage.removeItem(`chat_messages_${currentSession.groupId}`);
    
    // Clear site data if any
    localStorage.removeItem(`siteData_${currentSession.groupId}`);

    // Refresh displays
    loadGroupUpdates();
    updateAnalytics();
    
    alert('All group data has been reset!');
}

// View update details
function viewUpdateDetails(updateId) {
    const updates = JSON.parse(localStorage.getItem(`groupUpdates_${currentSession.groupId}`) || '[]');
    const update = updates.find(u => u.id === updateId);
    
    if (!update) return;

    const detailsHtml = `
        <div style="max-width: 600px; margin: 20px auto; padding: 25px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Update Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                <div><strong>Engineer:</strong> ${update.resourceName} (${update.resourceCode})</div>
                <div><strong>Date:</strong> ${formatDate(update.date)}</div>
                <div><strong>Site Name:</strong> ${update.siteName}</div>
                <div><strong>Location:</strong> ${update.location}</div>
                <div><strong>Activity:</strong> ${update.activity}</div>
                <div><strong>Status:</strong> <span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></div>
                <div><strong>Project Category:</strong> ${update.projectCategory}</div>
                <div><strong>Media Type:</strong> ${update.mediaType || 'N/A'}</div>
                <div><strong>Circle:</strong> ${update.circle || 'N/A'}</div>
                <div><strong>IP ID:</strong> ${update.ipId || 'N/A'}</div>
                <div><strong>Bands:</strong> ${update.bands || 'N/A'}</div>
                <div><strong>Sectors:</strong> ${update.sectors || 'N/A'}</div>
            </div>
            ${update.remarks ? `<div style="margin-top: 15px;"><strong>Remarks:</strong><br>${update.remarks}</div>` : ''}
            ${update.updatedActivity ? `<div style="margin-top: 15px;"><strong>Updated Activity:</strong><br>${update.updatedActivity}</div>` : ''}
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">Close</button>
            </div>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 1000; 
        display: flex; align-items: center; justify-content: center;
        padding: 20px; box-sizing: border-box;
    `;
    overlay.innerHTML = detailsHtml;
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
}

// Logout function
function logout() {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Utility functions
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function loadGroupData() {
    // This function would typically load data from a server
    // For demo purposes, we're using localStorage
    console.log('Group data loaded for admin dashboard');
}
