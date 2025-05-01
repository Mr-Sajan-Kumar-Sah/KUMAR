// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWMMjn8zoqd9FBSLe8GU0kxzuvPtgd26o",
    authDomain: "sajankumar-7fe56.firebaseapp.com",
    projectId: "sajankumar-7fe56",
    storageBucket: "sajankumar-7fe56.appspot.com",
    messagingSenderId: "530497965075",
    appId: "1:530497965075:web:a29f682c663c1d13b283e6",
    measurementId: "G-4HDJ9D9R32"
};

// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

// DOM Elements
const projectsTableBody = document.getElementById('projectsTableBody');
const blogsTableBody = document.getElementById('blogsTableBody');
const adminNotification = document.getElementById('adminNotification');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const addBlogBtn = document.getElementById('addBlogBtn');
const settingsForm = document.getElementById('settingsForm');

// Initialize Quill editors
let projectEditor, blogEditor;

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApplication();
});

async function initApplication() {
    if (!checkAdminAuth()) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        initThemeToggle();
        initPreloader();
        initEditors();
        initNavigation();
        initModals();
        initForms();
        initCharts();
        
        await loadInitialData();
        displayAdminEmail();
        
    } catch (error) {
        showNotification('Initialization error: ' + error.message, 'error');
    }
}

// ====================== AUTHENTICATION ======================
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    return token !== null && token !== undefined;
}

function adminLogout() {
    auth.signOut().then(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        window.location.href = 'admin-login.html';
    }).catch((error) => {
        showNotification('Logout error: ' + error.message, 'error');
    });
}

// ====================== UI INITIALIZATION ======================
function initThemeToggle() {
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 1000);
    }
}

function initEditors() {
    // Project editor
    projectEditor = new Quill('#projectEditor', {
        modules: { 
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        placeholder: 'Write project details...',
        theme: 'snow'
    });
    
    // Blog editor
    blogEditor = new Quill('#blogEditor', {
        modules: { 
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'video', 'code-block'],
                ['clean']
            ]
        },
        placeholder: 'Write blog content...',
        theme: 'snow'
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    if (!navLinks.length) return;
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
                if (section.id === `${this.dataset.section}Section`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function initModals() {
    // Project modal
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => showProjectModal());
    }
    
    // Blog modal
    if (addBlogBtn) {
        addBlogBtn.addEventListener('click', () => showBlogModal());
    }
    
    // Modal close handlers
    document.querySelectorAll('.admin-modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            hideModal(this.closest('.admin-modal').id);
        });
    });
    
    // Close when clicking outside
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) hideModal(this.id);
        });
    });
}

function initForms() {
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
        blogForm.addEventListener('submit', handleBlogSubmit);
    }
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
}

function initCharts() {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Visitors',
                data: [120, 190, 170, 220, 250, 280, 310, 340, 280, 300, 350, 400],
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ====================== DATA LOADING ======================
async function loadInitialData() {
    await Promise.all([
        loadProjects(),
        loadBlogs(),
        loadSettings()
    ]);
}

async function loadProjects() {
    try {
        const snapshot = await db.ref('projects').get();
        const projects = snapshot.val() || {};
        
        if (projectsTableBody) {
            projectsTableBody.innerHTML = Object.entries(projects)
                .filter(([_, project]) => project.status === 'active')
                .map(([id, project]) => `
                    <tr>
                        <td>${project.title || ''}</td>
                        <td>${project.category || ''}</td>
                        <td>${project.date || ''}</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td class="actions">
                            <button class="btn btn-icon btn-sm btn-edit" data-id="${id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon btn-sm btn-delete" data-id="${id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => showProjectModal(btn.getAttribute('data-id')));
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => confirmDelete('project', btn.getAttribute('data-id')));
            });
        }
        
        updateProjectStats(Object.keys(projects).length);
        
    } catch (error) {
        showNotification('Failed to load projects: ' + error.message, 'error');
    }
}

async function loadBlogs() {
    try {
        const snapshot = await db.ref('blogs').get();
        const blogs = snapshot.val() || {};
        
        if (blogsTableBody) {
            blogsTableBody.innerHTML = Object.entries(blogs)
                .map(([id, blog]) => `
                    <tr>
                        <td>${blog.title || ''}</td>
                        <td>${blog.category || ''}</td>
                        <td>${blog.publishDate || ''}</td>
                        <td>${blog.views || 0}</td>
                        <td class="actions">
                            <button class="btn btn-icon btn-sm btn-edit" data-id="${id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon btn-sm btn-delete" data-id="${id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => showBlogModal(btn.getAttribute('data-id')));
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => confirmDelete('blog', btn.getAttribute('data-id')));
            });
        }
        
        updateBlogStats(Object.keys(blogs).length, calculateTotalViews(blogs));
        
    } catch (error) {
        showNotification('Failed to load blogs: ' + error.message, 'error');
    }
}

async function loadSettings() {
    try {
        const snapshot = await db.ref('settings').get();
        const settings = snapshot.val() || {
            websiteTitle: "Mr.Sajan Portfolio",
            adminEmail: "sajansah205@gmail.com",
            maintenanceMode: false,
            themeColor: "#00f0ff"
        };
        
        if (document.getElementById('websiteTitle')) {
            document.getElementById('websiteTitle').value = settings.websiteTitle;
        }
        if (document.getElementById('adminEmailInput')) {
            document.getElementById('adminEmailInput').value = settings.adminEmail;
        }
        if (document.getElementById('maintenanceMode')) {
            document.getElementById('maintenanceMode').checked = settings.maintenanceMode;
        }
        if (document.getElementById('themeColor')) {
            document.getElementById('themeColor').value = settings.themeColor;
        }
        
        applyTheme(settings.themeColor);
        
    } catch (error) {
        showNotification('Error loading settings: ' + error.message, 'error');
    }
}

function updateProjectStats(count) {
    const totalProjectsElement = document.getElementById('totalProjects');
    if (totalProjectsElement) {
        totalProjectsElement.textContent = count;
    }
}

function updateBlogStats(count, views) {
    const totalBlogsElement = document.getElementById('totalBlogs');
    const blogViewsElement = document.getElementById('blogViews');
    
    if (totalBlogsElement) {
        totalBlogsElement.textContent = count;
    }
    if (blogViewsElement) {
        blogViewsElement.textContent = views.toLocaleString();
    }
}

function calculateTotalViews(blogs) {
    return Object.values(blogs).reduce((sum, blog) => sum + (blog.views || 0), 0);
}

// ====================== MODAL FUNCTIONS ======================
async function showProjectModal(projectId = null) {
    const form = document.getElementById('projectForm');
    if (!form) return;
    
    form.reset();
    
    if (projectId) {
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectId').value = projectId;
        
        try {
            const snapshot = await db.ref(`projects/${projectId}`).get();
            const project = snapshot.val();
            
            if (project) {
                document.getElementById('projectTitle').value = project.title || '';
                document.getElementById('projectCategory').value = project.category || '';
                document.getElementById('projectDescription').value = project.description || '';
                document.getElementById('projectTech').value = project.tech?.join(', ') || '';
                document.getElementById('projectImage').value = project.image || '';
                document.getElementById('projectDemoUrl').value = project.demoUrl || '';
                document.getElementById('projectCodeUrl').value = project.codeUrl || '';
                
                if (projectEditor) {
                    projectEditor.root.innerHTML = project.details || '';
                }
            }
        } catch (error) {
            showNotification('Error loading project: ' + error.message, 'error');
        }
    } else {
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
        document.getElementById('projectId').value = '';
        
        if (projectEditor) {
            projectEditor.root.innerHTML = '';
        }
    }
    
    showModal('projectModal');
}

async function showBlogModal(blogId = null) {
    const form = document.getElementById('blogForm');
    if (!form) return;
    
    form.reset();
    
    if (blogId) {
        document.getElementById('blogModalTitle').textContent = 'Edit Blog';
        document.getElementById('blogId').value = blogId;
        
        try {
            const snapshot = await db.ref(`blogs/${blogId}`).get();
            const blog = snapshot.val();
            
            if (blog) {
                document.getElementById('blogTitle').value = blog.title || '';
                document.getElementById('blogCategory').value = blog.category || '';
                document.getElementById('blogImage').value = blog.image || '';
                document.getElementById('blogExcerpt').value = blog.excerpt || '';
                document.getElementById('blogTags').value = blog.tags?.join(', ') || '';
                document.getElementById('blogPublishDate').value = blog.publishDate || '';
                
                if (blogEditor) {
                    blogEditor.root.innerHTML = blog.content || '';
                }
            }
        } catch (error) {
            showNotification('Error loading blog: ' + error.message, 'error');
        }
    } else {
        document.getElementById('blogModalTitle').textContent = 'Add New Blog';
        document.getElementById('blogId').value = '';
        document.getElementById('blogPublishDate').value = new Date().toISOString().split('T')[0];
        
        if (blogEditor) {
            blogEditor.root.innerHTML = '';
        }
    }
    
    showModal('blogModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showConfirmation(title, message, callback) {
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    if (confirmModalTitle && confirmModalMessage && confirmActionBtn) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        
        confirmActionBtn.onclick = function() {
            callback();
            hideModal('confirmModal');
        };
        
        showModal('confirmModal');
    }
}

// ====================== FORM HANDLERS ======================
async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        category: document.getElementById('projectCategory').value,
        description: document.getElementById('projectDescription').value,
        tech: document.getElementById('projectTech').value.split(',').map(t => t.trim()),
        image: document.getElementById('projectImage').value,
        details: projectEditor ? projectEditor.root.innerHTML : '',
        demoUrl: document.getElementById('projectDemoUrl').value,
        codeUrl: document.getElementById('projectCodeUrl').value,
        date: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    const projectId = document.getElementById('projectId').value;
    
    try {
        if (projectId) {
            await db.ref(`projects/${projectId}`).set(projectData);
        } else {
            const newProjectRef = db.ref('projects').push();
            await newProjectRef.set(projectData);
        }
        
        showNotification('Project saved successfully!', 'success');
        hideModal('projectModal');
        await loadProjects();
    } catch (error) {
        showNotification('Error saving project: ' + error.message, 'error');
    }
}

async function handleBlogSubmit(e) {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('blogTitle').value,
        category: document.getElementById('blogCategory').value,
        image: document.getElementById('blogImage').value,
        excerpt: document.getElementById('blogExcerpt').value,
        content: blogEditor ? blogEditor.root.innerHTML : '',
        tags: document.getElementById('blogTags').value.split(',').map(t => t.trim()),
        publishDate: document.getElementById('blogPublishDate').value || 
                    new Date().toISOString().split('T')[0],
        views: 0
    };
    
    const blogId = document.getElementById('blogId').value;
    
    try {
        if (blogId) {
            await db.ref(`blogs/${blogId}`).set(blogData);
        } else {
            const newBlogRef = db.ref('blogs').push();
            await newBlogRef.set(blogData);
        }
        
        showNotification('Blog saved successfully!', 'success');
        hideModal('blogModal');
        await loadBlogs();
    } catch (error) {
        showNotification('Error saving blog: ' + error.message, 'error');
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const settings = {
        websiteTitle: document.getElementById('websiteTitle').value,
        adminEmail: document.getElementById('adminEmailInput').value,
        maintenanceMode: document.getElementById('maintenanceMode').checked,
        themeColor: document.getElementById('themeColor').value
    };
    
    try {
        await db.ref('settings').set(settings);
        applyTheme(settings.themeColor);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

// ====================== UTILITY FUNCTIONS ======================
function applyTheme(color) {
    document.documentElement.style.setProperty('--primary', color);
}

function displayAdminEmail() {
    const adminEmail = localStorage.getItem('adminEmail');
    const adminEmailElement = document.getElementById('adminEmail');
    const adminEmailInput = document.getElementById('adminEmailInput');
    
    if (adminEmail && adminEmailElement) {
        adminEmailElement.textContent = adminEmail;
    }
    if (adminEmail && adminEmailInput) {
        adminEmailInput.value = adminEmail;
    }
}

async function confirmDelete(type, id) {
    try {
        const snapshot = await db.ref(`${type}s/${id}`).get();
        const item = snapshot.val();
        
        if (!item) {
            showNotification(`${type} not found`, 'error');
            return;
        }
        
        showConfirmation(
            `Delete ${type}`,
            `Are you sure you want to delete "${item.title}"?`,
            async () => {
                try {
                    await db.ref(`${type}s/${id}`).remove();
                    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted!`, 'success');
                    
                    if (type === 'project') {
                        await loadProjects();
                    } else {
                        await loadBlogs();
                    }
                } catch (error) {
                    showNotification(`Error deleting ${type}: ${error.message}`, 'error');
                }
            }
        );
    } catch (error) {
        showNotification(`Error loading ${type}: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'success') {
    if (!adminNotification) return;
    
    adminNotification.textContent = message;
    adminNotification.className = `admin-notification ${type} active`;
    
    setTimeout(() => {
        adminNotification.classList.remove('active');
    }, 3000);
}

// Make functions available globally
window.adminLogout = adminLogout;
window.showProjectModal = showProjectModal;
window.showBlogModal = showBlogModal;
window.showConfirmation = showConfirmation;