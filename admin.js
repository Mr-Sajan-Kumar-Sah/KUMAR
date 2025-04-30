// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!checkAdminAuth()) return;
    
    // Initialize components
    initAdminUI();
    initEditors();
    initModals();
    initDataTables();
    initCharts();
    loadProjects();
    loadBlogs();
    
    // Display admin email
    document.getElementById('adminEmail').textContent = localStorage.getItem('adminEmail');
});

// Initialize admin UI components
function initAdminUI() {
    // Navigation tabs
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}Section`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.addEventListener('click', function() {
        document.querySelector('.admin-sidebar').classList.toggle('mobile-open');
    });
    
    document.querySelector('.admin-header-left').prepend(mobileMenuToggle);
    
    // Mobile floating action button
    const fab = document.createElement('button');
    fab.className = 'admin-fab';
    fab.innerHTML = '<i class="fas fa-plus"></i>';
    fab.addEventListener('click', function() {
        const activeSection = document.querySelector('.admin-section.active').id;
        
        if (activeSection === 'projectsSection') {
            showProjectModal();
        } else if (activeSection === 'blogsSection') {
            showBlogModal();
        }
    });
    
    document.body.appendChild(fab);
}

// Initialize rich text editors
function initEditors() {
    // Project editor
    const projectEditor = new Quill('#projectEditor', {
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
        placeholder: 'Write detailed project description...',
        theme: 'snow'
    });
    
    // Blog editor
    const blogEditor = new Quill('#blogEditor', {
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
        placeholder: 'Write your blog content here...',
        theme: 'snow'
    });
    
    window.projectEditor = projectEditor;
    window.blogEditor = blogEditor;
}

// Initialize modals
function initModals() {
    // Project modal
    const projectModal = document.getElementById('projectModal');
    const addProjectBtn = document.getElementById('addProjectBtn');
    
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', showProjectModal);
    }
    
    // Blog modal
    const blogModal = document.getElementById('blogModal');
    const addBlogBtn = document.getElementById('addBlogBtn');
    
    if (addBlogBtn) {
        addBlogBtn.addEventListener('click', showBlogModal);
    }
    
    // Upload modal
    const uploadModal = document.getElementById('uploadModal');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const uploadBlogImageBtn = document.getElementById('uploadBlogImageBtn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    const uploadProgress = document.getElementById('uploadProgress');
    const confirmUploadBtn = document.getElementById('confirmUploadBtn');
    
    // Open upload modal
    function openUploadModal(targetField) {
        uploadModal.dataset.target = targetField;
        showModal(uploadModal);
    }
    
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => openUploadModal('projectImage'));
    }
    
    if (uploadBlogImageBtn) {
        uploadBlogImageBtn.addEventListener('click', () => openUploadModal('blogImage'));
    }
    
    // Handle file selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
    
    // Click on drop zone to trigger file input
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Handle file upload
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.getElementById('imagePreview').style.display = 'block';
            uploadProgress.style.display = 'none';
            confirmUploadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    // Confirm upload
    confirmUploadBtn.addEventListener('click', () => {
        const targetField = uploadModal.dataset.target;
        const fileUrl = URL.createObjectURL(fileInput.files[0]);
        
        // Simulate upload progress
        uploadProgress.style.display = 'block';
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            uploadProgress.querySelector('.progress-bar').style.width = `${progress}%`;
            uploadProgress.querySelector('.progress-text').textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Update the target field with the image URL
                document.getElementById(targetField).value = fileUrl;
                hideModal(uploadModal);
                
                // Reset upload modal
                setTimeout(() => {
                    previewImage.src = '';
                    previewImage.style.display = 'none';
                    uploadProgress.querySelector('.progress-bar').style.width = '0%';
                    uploadProgress.querySelector('.progress-text').textContent = '0%';
                    confirmUploadBtn.disabled = true;
                    fileInput.value = '';
                }, 300);
            }
        }, 100);
    });
    
    // Close modal handlers
    document.querySelectorAll('.admin-modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            hideModal(modal);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this);
            }
        });
    });
    
    // Confirmation modal
    const confirmModal = document.getElementById('confirmModal');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    window.showConfirmation = function(title, message, callback) {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        
        confirmActionBtn.onclick = function() {
            callback();
            hideModal(confirmModal);
        };
        
        showModal(confirmModal);
    };
}

// Show modal function
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide modal function
function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Show project modal
function showProjectModal(projectId) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    
    if (projectId) {
        // Edit existing project
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectId').value = projectId;
        
        // Load project data (in a real app, this would come from your database)
        const project = getProjectById(projectId);
        if (project) {
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectCategory').value = project.category;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectTech').value = project.tech.join(', ');
            document.getElementById('projectImage').value = project.image;
            document.getElementById('projectDemoUrl').value = project.demoUrl;
            document.getElementById('projectCodeUrl').value = project.codeUrl;
            projectEditor.root.innerHTML = project.details;
        }
    } else {
        // Add new project
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
        form.reset();
        projectEditor.root.innerHTML = '';
    }
    
    showModal(modal);
}

// Show blog modal
function showBlogModal(blogId) {
    const modal = document.getElementById('blogModal');
    const form = document.getElementById('blogForm');
    
    if (blogId) {
        // Edit existing blog
        document.getElementById('blogModalTitle').textContent = 'Edit Blog';
        document.getElementById('blogId').value = blogId;
        
        // Load blog data (in a real app, this would come from your database)
        const blog = getBlogById(blogId);
        if (blog) {
            document.getElementById('blogTitle').value = blog.title;
            document.getElementById('blogCategory').value = blog.category;
            document.getElementById('blogImage').value = blog.image;
            document.getElementById('blogExcerpt').value = blog.excerpt;
            document.getElementById('blogTags').value = blog.tags.join(', ');
            document.getElementById('blogPublishDate').value = blog.publishDate;
            blogEditor.root.innerHTML = blog.content;
        }
    } else {
        // Add new blog
        document.getElementById('blogModalTitle').textContent = 'Add New Blog';
        form.reset();
        blogEditor.root.innerHTML = '';
    }
    
    showModal(modal);
}

// Initialize data tables
function initDataTables() {
    // Project form submission
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const projectId = document.getElementById('projectId').value;
            const projectData = {
                title: document.getElementById('projectTitle').value,
                category: document.getElementById('projectCategory').value,
                description: document.getElementById('projectDescription').value,
                tech: document.getElementById('projectTech').value.split(',').map(t => t.trim()),
                image: document.getElementById('projectImage').value,
                details: projectEditor.root.innerHTML,
                demoUrl: document.getElementById('projectDemoUrl').value,
                codeUrl: document.getElementById('projectCodeUrl').value,
                date: new Date().toISOString().split('T')[0]
            };
            
            if (projectId) {
                // Update existing project
                updateProject(projectId, projectData);
                showNotification('Project updated successfully!');
            } else {
                // Add new project
                addProject(projectData);
                showNotification('Project added successfully!');
            }
            
            hideModal(document.getElementById('projectModal'));
            loadProjects();
        });
    }
    
    // Blog form submission
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
        blogForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const blogId = document.getElementById('blogId').value;
            const blogData = {
                title: document.getElementById('blogTitle').value,
                category: document.getElementById('blogCategory').value,
                image: document.getElementById('blogImage').value,
                excerpt: document.getElementById('blogExcerpt').value,
                content: blogEditor.root.innerHTML,
                tags: document.getElementById('blogTags').value.split(',').map(t => t.trim()),
                publishDate: document.getElementById('blogPublishDate').value || new Date().toISOString().split('T')[0],
                views: 0
            };
            
            if (blogId) {
                // Update existing blog
                updateBlog(blogId, blogData);
                showNotification('Blog updated successfully!');
            } else {
                // Add new blog
                addBlog(blogData);
                showNotification('Blog published successfully!');
            }
            
            hideModal(document.getElementById('blogModal'));
            loadBlogs();
        });
    }
}

// Initialize charts
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
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Project CRUD operations
function loadProjects() {
    // In a real app, this would fetch from your API
    const projects = [
        {
            id: '1',
            title: 'Quantum Neural Architecture Search',
            category: 'quantum',
            description: 'Developed a quantum-enhanced neural architecture search algorithm',
            tech: ['Qiskit', 'PyTorch', 'TensorFlow'],
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
            details: '<p>Details about the project...</p>',
            demoUrl: '#',
            codeUrl: '#',
            date: '2023-05-15'
        },
        // Add more sample projects
    ];
    
    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = '';
    
    projects.forEach(project => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${project.title}</td>
            <td>${project.category}</td>
            <td>${project.date}</td>
            <td><span class="status-badge active">Active</span></td>
            <td class="actions">
                <button class="btn btn-icon btn-sm btn-edit" data-id="${project.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-sm btn-delete" data-id="${project.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            showProjectModal(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            
            showConfirmation(
                'Delete Project',
                'Are you sure you want to delete this project? This action cannot be undone.',
                function() {
                    deleteProject(projectId);
                    showNotification('Project deleted successfully!');
                    loadProjects();
                }
            );
        });
    });
}

function getProjectById(id) {
    // In a real app, this would fetch from your API
    return {
        id: '1',
        title: 'Quantum Neural Architecture Search',
        category: 'quantum',
        description: 'Developed a quantum-enhanced neural architecture search algorithm',
        tech: ['Qiskit', 'PyTorch', 'TensorFlow'],
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
        details: '<p>Details about the project...</p>',
        demoUrl: '#',
        codeUrl: '#',
        date: '2023-05-15'
    };
}

function addProject(project) {
    // In a real app, this would send to your API
    console.log('Adding project:', project);
}

function updateProject(id, project) {
    // In a real app, this would send to your API
    console.log('Updating project:', id, project);
}

function deleteProject(id) {
    // In a real app, this would send to your API
    console.log('Deleting project:', id);
}

// Blog CRUD operations
function loadBlogs() {
    // In a real app, this would fetch from your API
    const blogs = [
        {
            id: '1',
            title: 'Introduction to Quantum Machine Learning',
            category: 'quantum',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
            excerpt: 'An introduction to the exciting field of quantum machine learning',
            content: '<p>Blog content goes here...</p>',
            tags: ['quantum', 'machine-learning'],
            publishDate: '2023-06-20',
            views: 1248
        },
        // Add more sample blogs
    ];
    
    const tbody = document.getElementById('blogsTableBody');
    tbody.innerHTML = '';
    
    blogs.forEach(blog => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${blog.title}</td>
            <td>${blog.category}</td>
            <td>${blog.publishDate}</td>
            <td>${blog.views}</td>
            <td class="actions">
                <button class="btn btn-icon btn-sm btn-edit" data-id="${blog.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-sm btn-delete" data-id="${blog.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            showBlogModal(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const blogId = this.getAttribute('data-id');
            
            showConfirmation(
                'Delete Blog',
                'Are you sure you want to delete this blog? This action cannot be undone.',
                function() {
                    deleteBlog(blogId);
                    showNotification('Blog deleted successfully!');
                    loadBlogs();
                }
            );
        });
    });
}

function getBlogById(id) {
    // In a real app, this would fetch from your API
    return {
        id: '1',
        title: 'Introduction to Quantum Machine Learning',
        category: 'quantum',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
        excerpt: 'An introduction to the exciting field of quantum machine learning',
        content: '<p>Blog content goes here...</p>',
        tags: ['quantum', 'machine-learning'],
        publishDate: '2023-06-20',
        views: 1248
    };
}

function addBlog(blog) {
    // In a real app, this would send to your API
    console.log('Adding blog:', blog);
}

function updateBlog(id, blog) {
    // In a real app, this would send to your API
    console.log('Updating blog:', id, blog);
}

function deleteBlog(id) {
    // In a real app, this would send to your API
    console.log('Deleting blog:', id);
}