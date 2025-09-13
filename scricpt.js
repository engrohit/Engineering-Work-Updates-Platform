// Update the current database
        uploadedSiteData = validData;
        currentSiteDatabase = validData;
        isUsingUploadedData = true;

        // Update UI
        updateFileStatus(file, validData.length);
        updateFilterOptions();
        searchSites(); // Refresh the search results
        
        showAlert(`Successfully loaded ${validData.length} sites from ${file.name}`, 'success');
        hideProcessingIndicator();

    } catch (error) {
        console.error('Data processing error:', error);
        showAlert('Error processing uploaded data. Please check the file format.', 'error');
        hideProcessingIndicator();
    }
}

function parseTechnologies(techString) {
    if (!techString) return ['4G'];
    
    const techStr = techString.toString().toUpperCase();
    const technologies = [];
    
    if (techStr.includes('2G')) technologies.push('2G');
    if (techStr.includes('3G')) technologies.push('3G');
    if (techStr.includes('4G')) technologies.push('4G');
    if (techStr.includes('5G')) technologies.push('5G');
    
    return technologies.length > 0 ? technologies : ['4G'];
}

function updateFileStatus(file, recordCount) {
    const statusElement = document.getElementById('uploadStatus');
    const fileInfoElement = document.getElementById('fileInfo');
    const clearBtn = document.getElementById('clearFileBtn');

    statusElement.textContent = `Using uploaded file: ${file.name}`;
    statusElement.className = 'upload-status success';
    
    fileInfoElement.innerHTML = `
        <div><strong>File Details:</strong></div>
        <div class="file-stats">
            <div class="file-stat">
                <div class="file-stat-number">${recordCount}</div>
                <div class="file-stat-label">Sites Loaded</div>
            </div>
            <div class="file-stat">
                <div class="file-stat-number">${(file.size / 1024).toFixed(1)}KB</div>
                <div class="file-stat-label">File Size</div>
            </div>
            <div class="file-stat">
                <div class="file-stat-number">${file.type || 'Unknown'}</div>
                <div class="file-stat-label">File Type</div>
            </div>
        </div>
    `;
    fileInfoElement.style.display = 'block';
    clearBtn.style.display = 'inline-block';
}

function clearUploadedFile() {
    uploadedSiteData = null;
    currentSiteDatabase = [...defaultSiteDatabase];
    isUsingUploadedData = false;

    const statusElement = document.getElementById('uploadStatus');
    const fileInfoElement = document.getElementById('fileInfo');
    const clearBtn = document.getElementById('clearFileBtn');
    const fileInput = document.getElementById('siteFileInput');

    statusElement.textContent = 'No file uploaded - using default site database';
    statusElement.className = 'upload-status';
    fileInfoElement.style.display = 'none';
    clearBtn.style.display = 'none';
    fileInput.value = '';

    updateFilterOptions();
    searchSites(); // Refresh the search results

    showAlert('Switched back to default site database', 'success');
}

function showProcessingIndicator() {
    const statusElement = document.getElementById('uploadStatus');
    statusElement.innerHTML = `
        <div class="processing-indicator">
            <div class="processing-spinner"></div>
            <span>Processing file... Please wait</span>
        </div>
    `;
}

function hideProcessingIndicator() {
    // Status will be updated by other functions
}

function updateFilterOptions() {
    const circles = [...new Set(currentSiteDatabase.map(site => site.circle))].sort();
    const siteTypes = [...new Set(currentSiteDatabase.map(site => site.siteType))].sort();
    const technologies = [...new Set(currentSiteDatabase.flatMap(site => site.technologies))].sort();

    // Update circle filter
    const circleFilter = document.getElementById('circleFilter');
    const currentCircle = circleFilter.value;
    circleFilter.innerHTML = '<option value="">All Circles</option>' + 
        circles.map(circle => `<option value="${circle}">${circle}</option>`).join('');
    circleFilter.value = currentCircle;

    // Update site type filter
    const typeFilter = document.getElementById('siteTypeFilter');
    const currentType = typeFilter.value;
    typeFilter.innerHTML = '<option value="">All Types</option>' + 
        siteTypes.map(type => `<option value="${type}">${type}</option>`).join('');
    typeFilter.value = currentType;

    // Update technology filter
    const techFilter = document.getElementById('technologyFilter');
    const currentTech = techFilter.value;
    techFilter.innerHTML = '<option value="">All Technologies</option>' + 
        technologies.map(tech => `<option value="${tech}">${tech}</option>`).join('');
    techFilter.value = currentTech;
}

// Add drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('drag-over');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('drag-over');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            document.getElementById('siteFileInput').files = files;
            handleSiteFileUpload({ target: { files: files } });
        }
    }

    // Click to upload
    uploadArea.addEventListener('click', () => {
        document.getElementById('siteFileInput').click();
    });
}

function searchSites() {
    const searchTerm = document.getElementById('siteSearchInput').value.toLowerCase().trim();
    const circleFilter = document.getElementById('circleFilter').value;
    const siteTypeFilter = document.getElementById('siteTypeFilter').value;
    const technologyFilter = document.getElementById('technologyFilter').value;

    let filteredSites = currentSiteDatabase; // Use current database instead of fixed siteDatabase

    // Apply filters
    if (searchTerm) {
        filteredSites = filteredSites.filter(site => 
            site.siteId.toLowerCase().includes(searchTerm) ||
            site.siteName.toLowerCase().includes(searchTerm) ||
            site.address.toLowerCase().includes(searchTerm)
        );
    }

    if (circleFilter) {
        filteredSites = filteredSites.filter(site => site.circle === circleFilter);
    }

    if (siteTypeFilter) {
        filteredSites = filteredSites.filter(site => site.siteType === siteTypeFilter);
    }

    if (technologyFilter) {
        filteredSites = filteredSites.filter(site => site.technologies.includes(technologyFilter));
    }

    displaySiteResults(filteredSites, searchTerm);
}

function displaySiteResults(sites, searchTerm) {
    const resultsCount = document.getElementById('siteResultsCount');
    const resultsContainer = document.getElementById('siteResultsContainer');

    if (sites.length === 0) {
        resultsCount.textContent = searchTerm ? 
            `No sites found matching "${searchTerm}"` : 
            'No sites match the selected filters';
        
        resultsContainer.innerHTML = `
            <div class="no-sites-found">
                <div class="icon">🔍</div>
                <h3>No Sites Found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
        return;
    }

    resultsCount.textContent = `Found ${sites.length} site${sites.length === 1 ? '' : 's'}`;

    resultsContainer.innerHTML = sites.map(site => `
        <div class="site-card">
            <div class="site-header">
                <div>
                    <div class="site-id">${site.siteId}</div>
                    <div class="site-name">${site.siteName}</div>
                </div>
                <div class="site-status ${site.status}">${site.status.charAt(0).toUpperCase() + site.status.slice(1)}</div>
            </div>

            <div class="site-details">
                <div class="detail-item">
                    <div class="detail-label">Circle</div>
                    <div class="detail-value">${site.circle}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Site Type</div>
                    <div class="detail-value">${site.siteType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Operator</div>
                    <div class="detail-value">${site.operator}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Height</div>
                    <div class="detail-value">${site.height}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">IP ID</div>
                    <div class="detail-value">${site.ipId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Coordinates</div>
                    <div class="detail-value">
                        <a href="#" class="coordinate-link" onclick="showOnMap('${site.siteId}', ${site.coordinates.lat}, ${site.coordinates.lng})">${site.coordinates.lat}, ${site.coordinates.lng}</a>
                    </div>
                </div>
            </div>

            <div class="site-address">
                <div class="address-label">Address</div>
                <div class="address-text">${site.address}</div>
            </div>

            <div class="site-technologies">
                ${site.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>

            <div class="detail-item" style="margin-bottom: 15px;">
                <div class="detail-label">Bands & Sectors</div>
                <div class="detail-value">${site.bands} | ${site.sectors}</div>
            </div>

            <div class="site-actions">
                <button class="btn-site-action" onclick="copyToClipboard('${site.siteId}')">Copy ID</button>
                <button class="btn-site-action" onclick="showSiteHistory('${site.siteId}')">History</button>
                <button class="btn-site-action primary" onclick="useSiteInForm('${site.siteId}', '${site.siteName}')">Use in Form</button>
            </div>
        </div>
    `).join('');
}

function showOnMap(siteId, lat, lng) {
    // This would integrate with a mapping service
    showAlert(`Coordinates for ${siteId}: ${lat}, ${lng}`, 'success');
    // In a real implementation, you could open Google Maps or similar
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
}

function copyToClipboard(siteId) {
    navigator.clipboard.writeText(siteId).then(() => {
        showAlert(`Site ID "${siteId}" copied to clipboard!`, 'success');
    }).catch(() => {
        showAlert('Failed to copy to clipboard', 'error');
    });
}

function showSiteHistory(siteId) {
    const site = currentSiteDatabase.find(s => s.siteId === siteId);
    if (!site) return;

    const historyHtml = `
        <div style="max-width: 600px; margin: 20px auto; padding: 25px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Site History - ${siteId}</h3>
            <div style="font-size: 14px; line-height: 1.6;">
                <div style="margin-bottom: 15px;">
                    <strong>Installation Date:</strong> ${formatDate(site.installDate)}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Last Maintenance:</strong> ${formatDate(site.lastMaintenance)}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Power Source:</strong> ${site.power}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Current Status:</strong> 
                    <span class="status-badge status-${site.status}">${site.status.charAt(0).toUpperCase() + site.status.slice(1)}</span>
                </div>
            </div>
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
    overlay.innerHTML = historyHtml;
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
}

function useSiteInForm(siteId, siteName) {
    // Switch to form section and populate site fields
    showSection('form');
    document.getElementById('siteName').value = siteName;
    
    // Find additional site details
    const site = currentSiteDatabase.find(s => s.siteId === siteId); // Use current database
    if (site) {
        document.getElementById('location').value = site.address.split(',')[0]; // Use first part as location
        document.getElementById('circle').value = site.circle;
        if (site.ipId) {
            document.getElementById('ipId').value = site.ipId;
        }
    }
    
    showAlert(`Site details populated in form for ${siteId}!`, 'success');
    
    // Close modal if open
    const modal = document.querySelector('.site-lookup-modal');
    if (modal) {
        modal.remove();
    }
}

function openSiteLookup() {
    const modalHtml = `
        <div class="site-lookup-modal" onclick="closeSiteLookup(event)">
            <div class="site-lookup-content">
                <div class="modal-header">
                    <h3 style="color: #2d3748; margin: 0;">Select Site from Database</h3>
                    <button class="modal-close" onclick="closeSiteLookup()">&times;</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <input type="text" id="modalSiteSearch" class="search-box" placeholder="Search sites..." 
                           onkeyup="filterModalSites()" style="width: 100%; margin-bottom: 15px;">
                    ${isUsingUploadedData ? '<div style="color: #22543d; font-size: 0.9rem; margin-bottom: 10px;">📊 Using uploaded site data</div>' : '<div style="color: #4a5568; font-size: 0.9rem; margin-bottom: 10px;">📋 Using default site database</div>'}
                </div>
                
                <div id="modalSiteResults" class="quick-site-grid">
                    ${currentSiteDatabase.map(site => `
                        <div class="quick-site-item" onclick="selectSiteFromModal('${site.siteId}', '${site.siteName}')">
                            <div class="quick-site-id">${site.siteId}</div>
                            <div class="quick-site-name">${site.siteName}</div>
                            <div style="font-size: 0.8rem; color: #718096; margin-top: 5px;">${site.circle}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeSiteLookup(event) {
    if (event && event.target.classList.contains('site-lookup-content')) {
        return; // Don't close if clicking inside content
    }
    const modal = document.querySelector('.site-lookup-modal');
    if (modal) {
        modal.remove();
    }
}

function selectSiteFromModal(siteId, siteName) {
    useSiteInForm(siteId, siteName);
}

function filterModalSites() {
    const searchTerm = document.getElementById('modalSiteSearch').value.toLowerCase();
    const resultsContainer = document.getElementById('modalSiteResults');
    
    const filtered = currentSiteDatabase.filter(site => 
        site.siteId.toLowerCase().includes(searchTerm) ||
        site.siteName.toLowerCase().includes(searchTerm) ||
        site.circle.toLowerCase().includes(searchTerm)
    );

    resultsContainer.innerHTML = filtered.map(site => `
        <div class="quick-site-item" onclick="selectSiteFromModal('${site.siteId}', '${site.siteName}')">
            <div class="quick-site-id">${site.siteId}</div>
            <div class="quick-site-name">${site.siteName}</div>
            <div style="font-size: 0.8rem; color: #718096; margin-top: 5px;">${site.circle}</div>
        </div>
    `).join('');
}

// Update user interface with session data
function updateUserInterface(sessionData) {
    // Update header to show user info
    const header = document.querySelector('.header');
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <div class="user-details">
            <span class="user-name">Welcome, ${sessionData.name}</span>
            <span class="user-group">${sessionData.groupName} | ${sessionData.role}</span>
        </div>
        <button class="btn-secondary logout-btn" onclick="logout()">Logout</button>
    `;
    
    // Add user info to header
    header.appendChild(userInfo);
    
    // Pre-fill resource fields with user data
    if (sessionData.resourceCode) {
        const resourceCodeSelect = document.getElementById('resourceCode');
        const resourceNameSelect = document.getElementById('resourceName');
        if (resourceCodeSelect) resourceCodeSelect.value = sessionData.resourceCode;
        if (resourceNameSelect) resourceNameSelect.value = sessionData.name;
    }
}

// Load user-specific data
function loadUserData(sessionData) {
    // Load user's updates from group storage
    const groupUpdates = JSON.parse(localStorage.getItem(`groupUpdates_${sessionData.groupId}`) || '[]');
    const userUpdates = groupUpdates.filter(update => update.resourceCode === sessionData.resourceCode);
    
    // Set engineeringUpdates to user's updates for dashboard
    engineeringUpdates = userUpdates;
}

// Initialize chat system
function initializeChat() {
    // Load chat script dynamically
    const script = document.createElement('script');
    script.src = 'chat.js';
    script.onload = function() {
        // Chat system will initialize automatically
        console.log('Chat system loaded');
    };
    document.head.appendChild(script);
}

// Logout function
function logout() {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Override submitUpdate to save to group storage
function submitUpdate(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-primary');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const sessionData = JSON.parse(localStorage.getItem('userSession'));
        
        const formData = {
            id: Date.now(),
            timestamp: document.getElementById('timestamp').value,
            resourceCode: document.getElementById('resourceCode').value,
            resourceName: document.getElementById('resourceName').value,
            mediaTestPlan: document.getElementById('mediaTestPlan').value,
            date: document.getElementById('date').value,
            circle: document.getElementById('circle').value,
            location: document.getElementById('location').value,
            ipId: document.getElementById('ipId').value,
            siteName: document.getElementById('siteName').value,
            mediaType: document.getElementById('mediaType').value,
            mediaRemarks: document.getElementById('mediaRemarks').value,
            mediaStatus: document.getElementById('mediaStatus').value,
            activity: document.getElementById('activity').value,
            activityStatus: document.getElementById('activityStatus').value,
            remarks: document.getElementById('remarks').value,
            bands: document.getElementById('bands').value,
            sectors: document.getElementById('sectors').value,
            updatedActivity: document.getElementById('updatedActivity').value,
            projectCategory: document.getElementById('projectCategory').value,
            createdAt: new Date().toISOString(),
            userId: sessionData.userId,
            groupId: sessionData.groupId
        };
        
        // Add to local array
        engineeringUpdates.unshift(formData);
        
        // Save to group storage
        const groupUpdates = JSON.parse(localStorage.getItem(`groupUpdates_${sessionData.groupId}`) || '[]');
        groupUpdates.unshift(formData);
        localStorage.setItem(`groupUpdates_${sessionData.groupId}`, JSON.stringify(groupUpdates));
        
        // Save to personal storage
        saveUpdates();
        
        document.getElementById('updateForm').reset();
        setCurrentDateTime();
        
        showAlert('Update submitted successfully!');
        updateDashboard();
        
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

// Add CSS for user interface
const userInterfaceStyles = `
    .user-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding: 15px 25px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        backdrop-filter: blur(5px);
    }

    .user-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .user-name {
        font-weight: 600;
        color: #2d3748;
        font-size: 1.1rem;
    }

    .user-group {
        font-size: 0.9rem;
        color: #718096;
    }

    .logout-btn {
        padding: 8px 20px !important;
        font-size: 0.9rem !important;
    }

    @media (max-width: 768px) {
        .user-info {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }
    }
`;

// Add the styles to the page
const userStyleSheet = document.createElement('style');
userStyleSheet.textContent = userInterfaceStyles;
document.head.appendChild(userStyleSheet);

// Resource mapping data
const resourceMapping = {
    'HR02': 'Rohit Rajput',
    'HR03': 'Sanjay Kumar',
    'HR04': 'Maman',
    'HR05': 'Monu',
    'HR06': 'Sukrampal',
    'HR07': 'Rohit Kumar Chaudhary',
    'HR08': 'Navneet Kumar',
    'HR 09': 'Anoop Kumar',
    'HR10': 'Suresh Sharma',
    'HR12': 'Anil Kumar',
    'HR13': 'Pawn Gupta',
    'HR14': 'Sumit Rana'
};

const nameToCodeMapping = {
    'Rohit Rajput': 'HR02',
    'Sanjay Kumar': 'HR03',
    'Maman': 'HR04',
    'Monu': 'HR05',
    'Sukrampal': 'HR06',
    'Rohit Kumar Chaudhary': 'HR07',
    'Navneet Kumar': 'HR08',
    'Anoop Kumar': 'HR 09',
    'Suresh Sharma': 'HR10',
    'Anil Kumar': 'HR12',
    'Pawn Gupta': 'HR13',
    'Sumit Rana': 'HR14'
};

function updateResourceName() {
    const resourceCode = document.getElementById('resourceCode').value;
    const resourceNameSelect = document.getElementById('resourceName');
    
    if (resourceCode && resourceMapping[resourceCode]) {
        resourceNameSelect.value = resourceMapping[resourceCode];
    } else {
        resourceNameSelect.value = '';
    }
}

function updateResourceCode() {
    const resourceName = document.getElementById('resourceName').value;
    const resourceCodeSelect = document.getElementById('resourceCode');
    
    if (resourceName && nameToCodeMapping[resourceName]) {
        resourceCodeSelect.value = nameToCodeMapping[resourceName];
    } else {
        resourceCodeSelect.value = '';
    }
}

let engineeringUpdates = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUpdates();
    setCurrentDateTime();
    updateDashboard();
    setupDragAndDrop();
    updateFilterOptions();
});

function setCurrentDateTime() {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16);
    const date = now.toISOString().slice(0, 10);
    
    document.getElementById('timestamp').value = timestamp;
    document.getElementById('date').value = date;
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'updates') {
        displayUpdates();
        updateFilters();
    } else if (sectionName === 'siteSearch') {
        // Initialize site search with all sites
        setupDragAndDrop();
        searchSites();
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function validateForm() {
    const requiredFields = document.querySelectorAll('.required');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#f56565';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

function submitUpdate(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-primary');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        const formData = {
            id: Date.now(),
            timestamp: document.getElementById('timestamp').value,
            resourceCode: document.getElementById('resourceCode').value,
            resourceName: document.getElementById('resourceName').value,
            mediaTestPlan: document.getElementById('mediaTestPlan').value,
            date: document.getElementById('date').value,
            circle: document.getElementById('circle').value,
            location: document.getElementById('location').value,
            ipId: document.getElementById('ipId').value,
            siteName: document.getElementById('siteName').value,
            mediaType: document.getElementById('mediaType').value,
            mediaRemarks: document.getElementById('mediaRemarks').value,
            mediaStatus: document.getElementById('mediaStatus').value,
            activity: document.getElementById('activity').value,
            activityStatus: document.getElementById('activityStatus').value,
            remarks: document.getElementById('remarks').value,
            bands: document.getElementById('bands').value,
            sectors: document.getElementById('sectors').value,
            updatedActivity: document.getElementById('updatedActivity').value,
            projectCategory: document.getElementById('projectCategory').value,
            createdAt: new Date().toISOString()
        };
        
        engineeringUpdates.unshift(formData);
        saveUpdates();
        
        document.getElementById('updateForm').reset();
        setCurrentDateTime();
        
        showAlert('Update submitted successfully!');
        updateDashboard();
        
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

function saveUpdates() {
    // In a real application, this would save to a backend database
    // For demo purposes, we'll store in memory
    console.log('Updates saved:', engineeringUpdates.length);
}

function loadUpdates() {
    // In a real application, this would load from a backend database
    // For demo purposes, we'll use sample data
    if (engineeringUpdates.length === 0) {
        engineeringUpdates = [
            {
                id: 1,
                timestamp: '2024-09-12T09:30',
                resourceCode: 'HR02',
                resourceName: 'Rohit Rajput',
                mediaTestPlan: 'MTP-001',
                date: '2024-09-12',
                circle: 'Delhi',
                location: 'Connaught Place',
                ipId: 'IP-001',
                siteName: 'CP-Tower-01',
                mediaType: '5G',
                mediaRemarks: 'Signal strength optimal',
                mediaStatus: 'Active',
                activity: 'Network optimization',
                activityStatus: 'Completed',
                remarks: 'All tests passed successfully',
                bands: 'Band 78, Band 40',
                sectors: 'Sector 1, Sector 2',
                updatedActivity: 'Completed optimization and testing',
                projectCategory: 'Network Optimization',
                createdAt: '2024-09-12T09:30:00Z'
            },
            {
                id: 2,
                timestamp: '2024-09-12T14:15',
                resourceCode: 'HR03',
                resourceName: 'Sanjay Kumar',
                mediaTestPlan: 'MTP-002',
                date: '2024-09-12',
                circle: 'Mumbai',
                location: 'Bandra West',
                ipId: 'IP-002',
                siteName: 'BW-Site-03',
                mediaType: '4G',
                mediaRemarks: 'Experiencing intermittent issues',
                mediaStatus: 'Under Maintenance',
                activity: 'Troubleshooting connectivity',
                activityStatus: 'Active',
                remarks: 'Issue identified, working on resolution',
                bands: 'Band 1, Band 3',
                sectors: 'Sector 3',
                updatedActivity: 'Hardware replacement in progress',
                projectCategory: 'Troubleshooting',
                createdAt: '2024-09-12T14:15:00Z'
            },
            {
                id: 3,
                timestamp: '2024-09-11T16:45',
                resourceCode: 'HR04',
                resourceName: 'Maman',
                mediaTestPlan: 'MTP-003',
                date: '2024-09-11',
                circle: 'Bangalore',
                location: 'Electronic City',
                ipId: 'IP-003',
                siteName: 'EC-Hub-05',
                mediaType: '5G',
                mediaRemarks: 'New site deployment',
                mediaStatus: 'Active',
                activity: 'Site installation',
                activityStatus: 'Pending',
                remarks: 'Waiting for power connection',
                bands: 'Band 78',
                sectors: 'Sector 1, Sector 2, Sector 3',
                updatedActivity: 'Installation 80% complete',
                projectCategory: 'Site Installation',
                createdAt: '2024-09-11T16:45:00Z'
            }
        ];
    }
}

function updateDashboard() {
    const totalUpdates = engineeringUpdates.length;
    const activeProjects = new Set(engineeringUpdates.map(u => u.projectCategory)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayUpdates = engineeringUpdates.filter(u => u.date === today).length;
    const pendingItems = engineeringUpdates.filter(u => u.activityStatus === 'Pending').length;

    document.getElementById('totalUpdates').textContent = totalUpdates;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('todayUpdates').textContent = todayUpdates;
    document.getElementById('pendingItems').textContent = pendingItems;

    displayDashboardTable();
}

function displayDashboardTable() {
    const tbody = document.getElementById('dashboardTable');
    const recentUpdates = engineeringUpdates.slice(0, 10); // Show latest 10 updates

    if (recentUpdates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-updates">No updates available. Add your first update to get started!</td></tr>';
        return;
    }

    tbody.innerHTML = recentUpdates.map(update => `
        <tr>
            <td>${formatDate(update.date)}</td>
            <td>${update.projectCategory}</td>
            <td>
                <button class="btn-secondary" onclick="viewDetails(${update.id})">View</button>
                <button class="btn-secondary" onclick="editUpdate(${update.id})" style="margin-left: 5px;">Edit</button>
            </td>
        </tr>
    `).join('');
}

function updateFilters() {
    const projects = [...new Set(engineeringUpdates.map(u => u.projectCategory))];
    
    // Update project filters
    const projectFilters = [
        document.getElementById('projectFilter'),
        document.getElementById('dashboardProjectFilter')
    ];
    
    projectFilters.forEach(filter => {
        if (filter) {
            const currentValue = filter.value;
            filter.innerHTML = '<option value="">All Projects</option>' +
                projects.map(project => `<option value="${project}">${project}</option>`).join('');
            filter.value = currentValue;
        }
    });
}

function filterUpdates() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    const projectFilter = document.getElementById('projectFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = engineeringUpdates.filter(update => {
        const matchesSearch = !searchTerm || 
            update.resourceName.toLowerCase().includes(searchTerm) ||
            update.siteName.toLowerCase().includes(searchTerm) ||
            update.activity.toLowerCase().includes(searchTerm) ||
            update.location.toLowerCase().includes(searchTerm);

        const matchesDate = !dateFilter || update.date === dateFilter;
        const matchesProject = !projectFilter || update.projectCategory === projectFilter;
        const matchesStatus = !statusFilter || update.activityStatus === statusFilter;

        return matchesSearch && matchesDate && matchesProject && matchesStatus;
    });

    displayUpdates(filtered);
}

function filterDashboard() {
    const dateFilter = document.getElementById('dashboardDateFilter').value;
    const projectFilter = document.getElementById('dashboardProjectFilter').value;
    const statusFilter = document.getElementById('dashboardStatusFilter').value;

    let filtered = engineeringUpdates;

    if (dateFilter) {
        filtered = filtered.filter(update => update.date === dateFilter);
    }
    if (projectFilter) {
        filtered = filtered.filter(update => update.projectCategory === projectFilter);
    }
    if (statusFilter) {
        filtered = filtered.filter(update => update.activityStatus === statusFilter);
    }

    const tbody = document.getElementById('dashboardTable');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-updates">No updates match the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.slice(0, 10).map(update => `
        <tr>
            <td>${formatDate(update.date)}</td>
            <td>${update.projectCategory}</td>
            <td>${update.siteName}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.resourceName}</td>
        </tr>
    `).join('');
}

function searchUpdates() {
    filterUpdates();
}

function viewDetails(id) {
    const update = engineeringUpdates.find(u => u.id === id);
    if (!update) return;

    const detailsHtml = `
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Update Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                <div><strong>Resource:</strong> ${update.resourceName} (${update.resourceCode})</div>
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

function editUpdate(id) {
    const update = engineeringUpdates.find(u => u.id === id);
    if (!update) return;

    // Populate form with existing data
    Object.keys(update).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            field.value = update[key];
        }
    });

    // Switch to form section
    showSection('form');
    
    // Add update mode indicator
    const form = document.getElementById('updateForm');
    form.dataset.editId = id;
    document.querySelector('.btn-primary span').textContent = 'Update Record';
    
    showAlert('Record loaded for editing. Make your changes and submit.', 'success');
}

function exportToCSV() {
    if (engineeringUpdates.length === 0) {
        showAlert('No data to export.', 'error');
        return;
    }

    const headers = [
        'Timestamp', 'Resource Code', 'Resource Name', 'Date', 'Site Name', 
        'Location', 'Activity', 'Activity Status', 'Project Category', 
        'Media Type', 'Circle', 'Remarks'
    ];

    const csvContent = [
        headers.join(','),
        ...engineeringUpdates.map(update => [
            update.timestamp,
            update.resourceCode,
            update.resourceName,
            update.date,
            update.siteName,
            update.location,
            update.activity,
            update.activityStatus,
            update.projectCategory,
            update.mediaType || '',
            update.circle || '',
            (update.remarks || '').replace(/,/g, ';')
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engineering-updates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert('Data exported successfully!', 'success');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Event Listeners
document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const editId = this.dataset.editId;
    if (editId) {
        // Update existing record
        const updateIndex = engineeringUpdates.findIndex(u => u.id == editId);
        if (updateIndex !== -1) {
            const formData = new FormData(this);
            const updatedData = {};
            
            // Get all form fields
            const formElements = this.elements;
            for (let element of formElements) {
                if (element.name && element.type !== 'submit') {
                    updatedData[element.id] = element.value;
                }
            }
            
            // Keep original ID and creation date
            updatedData.id = engineeringUpdates[updateIndex].id;
            updatedData.createdAt = engineeringUpdates[updateIndex].createdAt;
            updatedData.updatedAt = new Date().toISOString();
            
            // Update the record
            engineeringUpdates[updateIndex] = updatedData;
            
            // Reset form
            this.reset();
            delete this.dataset.editId;
            document.querySelector('.btn-primary span').textContent = 'Submit Update';
            setCurrentDateTime();
            
            showAlert('Update modified successfully!', 'success');
            updateDashboard();
            displayUpdates();
            updateFilters();
        }
    } else {
        // Create new record
        submitUpdate(event);
    }
});

// Initialize dashboard on load
updateFilters();
            <td>${update.siteName}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.resourceName}</td>
        </tr>
    `).join('');
}

function displayUpdates(filteredUpdates = null) {
    const updates = filteredUpdates || engineeringUpdates;
    const tbody = document.getElementById('updatesTable');

    if (updates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-updates">No updates found. Use the filters to refine your search.</td></tr>';
        return;
    }

    tbody.innerHTML = updates.map(update => `
        <tr>
            <td>${formatDateTime(update.timestamp)}</td>
            <td>${update.resourceName}<br><small>${update.resourceCode}</small></td>
            <td>${update.siteName}</td>
            <td>${update.location}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.mediaType || 'N/A'}</td>
            <td>${update.projectCategory}</td>// Site database management
let currentSiteDatabase = [];
let uploadedSiteData = null;
let isUsingUploadedData = false;

// Default site database with comprehensive site information
const defaultSiteDatabase = [
    {
        siteId: 'DL001',
        siteName: 'CP Tower Alpha',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Connaught Place, Block A, New Delhi - 110001, Near Metro Station, Opposite PVR Cinema',
        coordinates: { lat: '28.6304', lng: '77.2177' },
        ipId: 'IP-DL-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-03-15',
        lastMaintenance: '2024-08-20',
        operator: 'Airtel',
        height: '45m',
        power: 'Grid + DG'
    },
    {
        siteId: 'DL002',
        siteName: 'Rohini Hub Beta',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G', '5G'],
        address: 'Sector 7, Rohini, New Delhi - 110085, Near Unity Mall, Behind Bus Stand',
        coordinates: { lat: '28.7041', lng: '77.1025' },
        ipId: 'IP-DL-002',
        bands: 'Band 1, Band 3, Band 8, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-11-28',
        lastMaintenance: '2024-09-05',
        operator: 'Jio',
        height: '40m',
        power: 'Grid + Solar'
    },
    {
        siteId: 'MH001',
        siteName: 'Bandra West Central',
        circle: 'Mumbai',
        siteType: 'Macro',
        status: 'maintenance',
        technologies: ['4G'],
        address: 'Hill Road, Bandra West, Mumbai - 400050, Near Bandra Station, Opposite Shoppers Stop',
        coordinates: { lat: '19.0596', lng: '72.8295' },
        ipId: 'IP-MH-001',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2020-07-12',
        lastMaintenance: '2024-09-10',
        operator: 'Vodafone',
        height: '35m',
        power: 'Grid'
    },
    {
        siteId: 'MH002',
        siteName: 'Andheri East Plaza',
        circle: 'Mumbai',
        siteType: 'Small Cell',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'SEEPZ, Andheri East, Mumbai - 400093, Near Metro Station, IT Park Complex',
        coordinates: { lat: '19.1136', lng: '72.8697' },
        ipId: 'IP-MH-002',
        bands: 'Band 40, Band 78',
        sectors: '1 Sector',
        installDate: '2023-01-20',
        lastMaintenance: '2024-07-15',
        operator: 'Airtel',
        height: '20m',
        power: 'Grid'
    },
    {
        siteId: 'BG001',
        siteName: 'Electronic City Hub',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Phase 1, Electronic City, Bangalore - 560100, Near Infosys Campus, Tech Park Area',
        coordinates: { lat: '12.8456', lng: '77.6603' },
        ipId: 'IP-BG-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-09-10',
        lastMaintenance: '2024-08-25',
        operator: 'Jio',
        height: '50m',
        power: 'Grid + DG'
    },
    {
        siteId: 'BG002',
        siteName: 'Whitefield Junction',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G'],
        address: 'ITPL Main Road, Whitefield, Bangalore - 560066, Near Forum Mall, IT Corridor',
        coordinates: { lat: '12.9698', lng: '77.7500' },
        ipId: 'IP-BG-002',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-05-18',
        lastMaintenance: '2024-06-30',
        operator: 'Vodafone',
        height: '42m',
        power: 'Grid'
    },
    {
        siteId: 'CH001',
        siteName: 'OMR Tech Tower',
        circle: 'Chennai',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Old Mahabalipuram Road, Thoraipakkam, Chennai - 600097, Near Sholinganallur, IT Highway',
        coordinates: { lat: '12.9010', lng: '80.2279' },
        ipId: 'IP-CH-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-12-05',
        lastMaintenance: '2024-09-01',
        operator: 'Airtel',
        height: '48m',
        power: 'Grid + Solar'
    },
    {
        siteId: 'KL001',
        siteName: 'Salt Lake Central',
        circle: 'Kolkata',
        siteType: 'Macro',
        status: 'inactive',
        technologies: ['3G', '4G'],
        address: 'Sector V, Salt Lake, Kolkata - 700091, Near City Centre Mall, IT Hub Area',
        coordinates: { lat: '22.5726', lng: '88.3639' },
        ipId: 'IP-KL-001',
        bands: 'Band 1, Band 3',
        sectors: '3 Sectors',
        installDate: '2020-03-22',
        lastMaintenance: '2024-05-10',
        operator: 'Jio',
        height: '38m',
        power: 'Grid'
    },
    {
        siteId: 'HY001',
        siteName: 'HITEC City Node',
        circle: 'Hyderabad',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'HITEC City, Madhapur, Hyderabad - 500081, Near Cyber Towers, Financial District',
        coordinates: { lat: '17.4435', lng: '78.3772' },
        ipId: 'IP-HY-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2023-02-14',
        lastMaintenance: '2024-08-18',
        operator: 'Airtel',
        height: '46m',
        power: 'Grid + DG'
    },
    {
        siteId: 'PN001',
        siteName: 'Hinjewadi IT Park',
        circle: 'Pune',
        siteType: 'Micro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Phase 1, Hinjewadi IT Park, Pune - 411057, Near Wipro Campus, Rajiv Gandhi Infotech Park',
        coordinates: { lat: '18.5904', lng: '73.7394' },
        ipId: 'IP-PN-001',
        bands: 'Band 40, Band 78',
        sectors: '2 Sectors',
        installDate: '2022-06-30',
        lastMaintenance: '2024-07-20',
        operator: 'Jio',
        height: '25m',
        power: 'Grid'
    }
];

// Initialize current database with default data
currentSiteDatabase = [...defaultSiteDatabase];

// File upload and processing functions
function handleSiteFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showProcessingIndicator();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.csv')) {
                processCsvFile(e.target.result, file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processExcelFile(e.target.result, file);
            } else {
                showAlert('Please upload a valid Excel (.xlsx, .xls) or CSV file.', 'error');
                hideProcessingIndicator();
                return;
            }
        } catch (error) {
            console.error('File processing error:', error);
            showAlert('Error processing file. Please check the file format.', 'error');
            hideProcessingIndicator();
        }
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function processCsvFile(csvText, file) {
    // Using Papa Parse (loaded via CDN)
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) {
            processUploadedData(results.data, file);
        },
        error: function(error) {
            showAlert('Error parsing CSV file: ' + error.message, 'error');
            hideProcessingIndicator();
        }
    });
}

function processExcelFile(arrayBuffer, file) {
    // Using SheetJS (loaded via CDN)
    try {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
        });

        // Convert to object format
        if (jsonData.length > 1) {
            const headers = jsonData[0].map(h => String(h).trim());
            const dataRows = jsonData.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });
            
            processUploadedData(dataRows, file);
        } else {
            showAlert('Excel file appears to be empty or invalid.', 'error');
            hideProcessingIndicator();
        }
    } catch (error) {
        console.error('Excel processing error:', error);
        showAlert('Error processing Excel file. Please check the file format.', 'error');
        hideProcessingIndicator();
    }
}

function processUploadedData(data, file) {
    try {
        // Map uploaded data to our site database format
        const mappedData = data.map((row, index) => {
            // Clean headers by removing whitespace and converting to lowercase for matching
            const cleanRow = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.toString().trim().toLowerCase();
                cleanRow[cleanKey] = String(row[key] || '').trim();
            });

            // Map common field variations to our standard format
            const siteData = {
                siteId: cleanRow['site id'] || cleanRow['siteid'] || cleanRow['site_id'] || cleanRow['id'] || `SITE_${index + 1}`,
                siteName: cleanRow['site name'] || cleanRow['sitename'] || cleanRow['site_name'] || cleanRow['name'] || 'Unknown Site',
                circle: cleanRow['circle'] || cleanRow['location'] || cleanRow['city'] || cleanRow['region'] || 'Unknown',
                siteType: cleanRow['site type'] || cleanRow['sitetype'] || cleanRow['type'] || 'Macro',
                status: (cleanRow['status'] || cleanRow['site status'] || 'active').toLowerCase(),
                technologies: parseTechnologies(cleanRow['technology'] || cleanRow['technologies'] || cleanRow['tech'] || '4G'),
                address: cleanRow['address'] || cleanRow['location address'] || cleanRow['site address'] || 'Address not provided',
                coordinates: {
                    lat: cleanRow['latitude'] || cleanRow['lat'] || '0.0000',
                    lng: cleanRow['longitude'] || cleanRow['lng'] || cleanRow['lon'] || '0.0000'
                },
                ipId: cleanRow['ip id'] || cleanRow['ipid'] || cleanRow['ip_id'] || 'N/A',
                bands: cleanRow['bands'] || cleanRow['frequency'] || cleanRow['band'] || 'N/A',
                sectors: cleanRow['sectors'] || cleanRow['sector'] || cleanRow['sector count'] || 'N/A',
                installDate: cleanRow['install date'] || cleanRow['installation date'] || cleanRow['date installed'] || '2022-01-01',
                lastMaintenance: cleanRow['last maintenance'] || cleanRow['maintenance date'] || cleanRow['last maintained'] || '2024-01-01',
                operator: cleanRow['operator'] || cleanRow['carrier'] || cleanRow['network'] || 'Unknown',
                height: cleanRow['height'] || cleanRow['tower height'] || cleanRow['antenna height'] || 'N/A',
                power: cleanRow['power'] || cleanRow['power source'] || cleanRow['power supply'] || 'Grid'
            };

            return siteData;
        });

        // Filter out invalid entries
        const validData = mappedData.filter(site => 
            site.siteId && 
            site.siteName && 
            site.siteId !== 'Unknown' && 
            site.siteName !== 'Unknown Site'
        );

        if (validData.length === 0) {
            showAlert('No valid site data found in the uploaded file. Please check the file format and column headers.', 'error');
            hideProcessingIndicator();
            return;
        }

        // Update the current database
        uploadedSiteData = validData
