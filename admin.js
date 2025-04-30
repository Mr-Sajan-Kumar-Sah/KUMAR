
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWMMjn8zoqd9FBSLe8GU0kxzuvPtgd26o",
    authDomain: "sajankumar-7fe56.firebaseapp.com",
    projectId: "sajankumar-7fe56",
    storageBucket: "sajankumar-7fe56.firebasestorage.app",
    messagingSenderId: "530497965075",
    appId: "1:530497965075:web:a29f682c663c1d13b283e6",
    measurementId: "G-4HDJ9D9R32"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const projectsTableBody = document.getElementById('projectsTableBody');
const blogsTableBody = document.getElementById('blogsTableBody');
const adminNotification = document.getElementById('adminNotification');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.querySelector('.btn-logout');

// Initialize Quill editors
let projectEditor, blogEditor;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAuth()) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Initialize components
    initEditors();
    initAdminUI();
    initModals();
    initDataTables();
    initCharts();
    
    // Load data
    try {
        await loadProjects();
        await loadBlogs();
        loadSettings();
        
        // Display admin email
        const adminEmail = localStorage.getItem('adminEmail');
        document.getElementById('adminEmail').textContent = adminEmail;
        document.getElementById('adminEmailInput').value = adminEmail;
        
    } catch (error) {
        showNotification('Initialization error: ' + error.message, 'error');
    }
});

// ====================== AUTHENTICATION ======================
function checkAdminAuth() {
    return localStorage.getItem('adminToken') !== null;
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    window.location.href = 'admin-login.html';
}

// ====================== PROJECT FUNCTIONS ======================
async function loadProjects() {
    try {
        const snapshot = await get(ref(db, 'projects'));
        const projects = snapshot.val() || {};
        
        projectsTableBody.innerHTML = Object.entries(projects)
            .filter(([_, project]) => project.status === 'active')
            .map(([id, project]) => `
                <tr>
                    <td>${project.title}</td>
                    <td>${project.category}</td>
                    <td>${project.date}</td>
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
        
        // Update stats
        document.getElementById('totalProjects').textContent = Object.keys(projects).length;
        
        // Add event listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => showProjectModal(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete('project', btn.getAttribute('data-id')));
        });
        
    } catch (error) {
        showNotification('Failed to load projects: ' + error.message, 'error');
    }
}

async function saveProject(projectData) {
    try {
        if (projectData.id) {
            // Update existing project
            await set(ref(db, `projects/${projectData.id}`), projectData);
        } else {
            // Add new project
            const newProjectRef = push(ref(db, 'projects'));
            await set(newProjectRef, projectData);
        }
        showNotification('Project saved successfully!', 'success');
        await loadProjects();
    } catch (error) {
        showNotification('Error saving project: ' + error.message, 'error');
    }
}

// ====================== BLOG FUNCTIONS ======================
async function loadBlogs() {
    try {
        const snapshot = await get(ref(db, 'blogs'));
        const blogs = snapshot.val() || {};
        
        blogsTableBody.innerHTML = Object.entries(blogs)
            .map(([id, blog]) => `
                <tr>
                    <td>${blog.title}</td>
                    <td>${blog.category}</td>
                    <td>${blog.publishDate}</td>
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
        
        // Update stats
        const totalViews = Object.values(blogs).reduce((sum, blog) => sum + (blog.views || 0), 0);
        document.getElementById('totalBlogs').textContent = Object.keys(blogs).length;
        document.getElementById('blogViews').textContent = totalViews;
        
        // Add event listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => showBlogModal(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete('blog', btn.getAttribute('data-id')));
        });
        
    } catch (error) {
        showNotification('Failed to load blogs: ' + error.message, 'error');
    }
}

async function saveBlog(blogData) {
    try {
        if (blogData.id) {
            // Update existing blog
            await set(ref(db, `blogs/${blogData.id}`), blogData);
        } else {
            // Add new blog
            const newBlogRef = push(ref(db, 'blogs'));
            await set(newBlogRef, blogData);
        }
        showNotification('Blog saved successfully!', 'success');
        await loadBlogs();
    } catch (error) {
        showNotification('Error saving blog: ' + error.message, 'error');
    }
}

// ====================== SETTINGS FUNCTIONS ======================
async function loadSettings() {
    try {
        const snapshot = await get(ref(db, 'settings'));
        const settings = snapshot.val() || {
            websiteTitle: "Mr.Sajan Portfolio",
            adminEmail: "sajansah205@gmail.com",
            maintenanceMode: false,
            themeColor: "#00f0ff"
        };
        
        document.getElementById('websiteTitle').value = settings.websiteTitle;
        document.getElementById('adminEmailInput').value = settings.adminEmail;
        document.getElementById('maintenanceMode').checked = settings.maintenanceMode;
        document.getElementById('themeColor').value = settings.themeColor;
        
        applyTheme(settings.themeColor);
    } catch (error) {
        showNotification('Error loading settings: ' + error.message, 'error');
    }
}

async function saveSettings() {
    try {
        const settings = {
            websiteTitle: document.getElementById('websiteTitle').value,
            adminEmail: document.getElementById('adminEmailInput').value,
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            themeColor: document.getElementById('themeColor').value
        };
        
        await set(ref(db, 'settings'), settings);
        applyTheme(settings.themeColor);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

function applyTheme(color) {
    document.documentElement.style.setProperty('--primary', color);
}

// ====================== UTILITY FUNCTIONS ======================
async function confirmDelete(type, id) {
    try {
        const snapshot = await get(ref(db, `${type}s/${id}`));
        const item = snapshot.val();
        
        showConfirmation(
            `Delete ${type}`,
            `Are you sure you want to delete "${item.title}"?`,
            async () => {
                await remove(ref(db, `${type}s/${id}`));
                showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted!`, 'success');
                if (type === 'project') await loadProjects();
                else await loadBlogs();
            }
        );
    } catch (error) {
        showNotification(`Error deleting ${type}: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'success') {
    adminNotification.textContent = message;
    adminNotification.className = `admin-notification ${type} active`;
    setTimeout(() => adminNotification.classList.remove('active'), 3000);
}

// ====================== MODAL FUNCTIONS ======================
async function showProjectModal(projectId = null) {
    const form = document.getElementById('projectForm');
    form.reset();
    
    if (projectId) {
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectId').value = projectId;
        
        const snapshot = await get(ref(db, `projects/${projectId}`));
        const project = snapshot.val();
        
        if (project) {
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectCategory').value = project.category;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectTech').value = project.tech?.join(', ') || '';
            document.getElementById('projectImage').value = project.image || '';
            document.getElementById('projectDemoUrl').value = project.demoUrl || '';
            document.getElementById('projectCodeUrl').value = project.codeUrl || '';
            projectEditor.root.innerHTML = project.details || '';
        }
    } else {
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
        document.getElementById('projectId').value = '';
        projectEditor.root.innerHTML = '';
    }
    
    showModal('projectModal');
}

async function showBlogModal(blogId = null) {
    const form = document.getElementById('blogForm');
    form.reset();
    
    if (blogId) {
        document.getElementById('blogModalTitle').textContent = 'Edit Blog';
        document.getElementById('blogId').value = blogId;
        
        const snapshot = await get(ref(db, `blogs/${blogId}`));
        const blog = snapshot.val();
        
        if (blog) {
            document.getElementById('blogTitle').value = blog.title;
            document.getElementById('blogCategory').value = blog.category;
            document.getElementById('blogImage').value = blog.image || '';
            document.getElementById('blogExcerpt').value = blog.excerpt || '';
            document.getElementById('blogTags').value = blog.tags?.join(', ') || '';
            document.getElementById('blogPublishDate').value = blog.publishDate || '';
            blogEditor.root.innerHTML = blog.content || '';
        }
    } else {
        document.getElementById('blogModalTitle').textContent = 'Add New Blog';
        document.getElementById('blogId').value = '';
        document.getElementById('blogPublishDate').value = new Date().toISOString().split('T')[0];
        blogEditor.root.innerHTML = '';
    }
    
    showModal('blogModal');
}

// ====================== INITIALIZATION FUNCTIONS ======================
function initAdminUI() {
    // Navigation tabs
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
                if (section.id === `${this.dataset.section}Section`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', adminLogout);
    }
}

function initEditors() {
    // Project editor
    projectEditor = new Quill('#projectEditor', {
        modules: { toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ]},
        placeholder: 'Write project details...',
        theme: 'snow'
    });
    
    // Blog editor
    blogEditor = new Quill('#blogEditor', {
        modules: { toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'video', 'code-block'],
            ['clean']
        ]},
        placeholder: 'Write blog content...',
        theme: 'snow'
    });
}

function initModals() {
    // Project modal
    document.getElementById('addProjectBtn').addEventListener('click', () => showProjectModal());
    
    // Blog modal
    document.getElementById('addBlogBtn').addEventListener('click', () => showBlogModal());
    
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

function initDataTables() {
    // Project form
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            title: document.getElementById('projectTitle').value,
            category: document.getElementById('projectCategory').value,
            description: document.getElementById('projectDescription').value,
            tech: document.getElementById('projectTech').value.split(',').map(t => t.trim()),
            image: document.getElementById('projectImage').value,
            details: projectEditor.root.innerHTML,
            demoUrl: document.getElementById('projectDemoUrl').value,
            codeUrl: document.getElementById('projectCodeUrl').value,
            date: document.getElementById('projectId').value ? 
                document.getElementById('projectDate').value : 
                new Date().toISOString().split('T')[0],
            status: 'active'
        };
        
        if (document.getElementById('projectId').value) {
            projectData.id = document.getElementById('projectId').value;
        }
        
        await saveProject(projectData);
        hideModal('projectModal');
    });
    
    // Blog form
    document.getElementById('blogForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const blogData = {
            title: document.getElementById('blogTitle').value,
            category: document.getElementById('blogCategory').value,
            image: document.getElementById('blogImage').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: blogEditor.root.innerHTML,
            tags: document.getElementById('blogTags').value.split(',').map(t => t.trim()),
            publishDate: document.getElementById('blogPublishDate').value || 
                        new Date().toISOString().split('T')[0],
            views: 0
        };
        
        if (document.getElementById('blogId').value) {
            blogData.id = document.getElementById('blogId').value;
        }
        
        await saveBlog(blogData);
        hideModal('blogModal');
    });
    
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
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

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

function showConfirmation(title, message, callback) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').textContent = message;
    
    document.getElementById('confirmActionBtn').onclick = function() {
        callback();
        hideModal('confirmModal');
    };
    
    showModal('confirmModal');
}

// Make functions available globally for HTML event handlers
window.showProjectModal = showProjectModal;
window.showBlogModal = showBlogModal;
window.adminLogout = adminLogout;
window.showConfirmation = showConfirmation;