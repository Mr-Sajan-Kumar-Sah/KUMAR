// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components with null checks
  const initializers = [
      initPreloader,
      initThemeToggle,
      initParticleBackground,
      initSmoothScrolling,
      initScrollAnimations,
      initSkillRadarChart,
      initProjectFiltering,
      initTimelineAnimation,
      initContactForm,
      initCustomCursor,
      initHolographicDisplay,
      initNeuralNetworkAnimation,
      initDataStreamAnimation,
      initNotificationSystem,
      initCurrentYear
  ];

  initializers.forEach(init => {
      try {
          init();
      } catch (error) {
          console.error(`Error in ${init.name}:`, error);
      }
  });
});

/**
* Initialize and animate the preloader with null checks
*/
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  // Simulate loading delay
  setTimeout(() => {
      preloader.classList.add('loaded');
      
      // Remove preloader from DOM after animation completes
      setTimeout(() => {
          preloader.remove();
      }, 500);
  }, 2000);
}

/**
* Initialize theme toggle functionality with null checks
*/
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;
  
  if (!themeToggle) return;

  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
      html.setAttribute('data-theme', savedTheme);
  } else {
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Dispatch custom event for other components to react to theme changes
      document.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  });
}

/**
* Initialize and animate the particle background with null checks
*/
function initParticleBackground() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function setupCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
  setupCanvas();
  
  // Particle system configuration
  const particles = [];
  const particleCount = window.innerWidth < 768 ? 50 : 100;
  const colors = ['#00f0ff', '#ff00e4', '#00ff88', '#ffffff'];
  
  // Particle class
  class Particle {
      constructor() {
          this.reset();
      }
      
      reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 3 + 1;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.speedX = Math.random() * 2 - 1;
          this.speedY = Math.random() * 2 - 1;
          this.opacity = Math.random() * 0.5 + 0.1;
          this.life = Math.random() * 100;
      }
      
      update() {
          this.x += this.speedX;
          this.y += this.speedY;
          
          // Bounce off edges or reset if out of bounds
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
              this.reset();
          }
          
          // Fade in and out
          this.life += 0.1;
          this.opacity = 0.1 + Math.abs(Math.sin(this.life * 0.05)) * 0.4;
      }
      
      draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.opacity;
          ctx.fill();
          ctx.globalAlpha = 1;
      }
  }
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
  }
  
  // Animation loop
  function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connecting lines between particles
      for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 150) {
                  ctx.beginPath();
                  ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
                  ctx.lineWidth = 0.5;
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.stroke();
              }
          }
      }
      
      // Update and draw particles
      particles.forEach(particle => {
          particle.update();
          particle.draw();
      });
      
      requestAnimationFrame(animateParticles);
  }
  
  animateParticles();
  
  // Handle window resize
  window.addEventListener('resize', () => {
      setupCanvas();
  });
}

/**
* Initialize smooth scrolling for anchor links with null checks
*/
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  links.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
              // Close mobile menu if open
              const nav = document.querySelector('.floating-nav');
              if (nav && nav.classList.contains('mobile-open')) {
                  nav.classList.remove('mobile-open');
              }
              
              // Scroll to target
              targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
              
              // Update active nav link
              updateActiveNavLink(targetId);
          }
      });
  });
  
  // Update active nav link on scroll
  window.addEventListener('scroll', debounce(handleScroll, 100));
}

/**
* Update active navigation link based on scroll position
*/
function updateActiveNavLink(targetId) {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === targetId) {
          link.classList.add('active');
      }
  });
}

/**
* Handle scroll events to update active nav link
*/
function handleScroll() {
  const sections = document.querySelectorAll('section');
  if (!sections.length) return;

  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = `#${section.getAttribute('id')}`;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          updateActiveNavLink(sectionId);
      }
  });
}

/**
* Initialize scroll animations for elements with null checks
*/
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('[data-animate]');
  if (!animateElements.length) return;

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('animate');
              observer.unobserve(entry.target);
          }
      });
  }, {
      threshold: 0.1
  });
  
  animateElements.forEach(element => {
      observer.observe(element);
  });
}

/**
* Initialize skill radar chart with null checks
*/
function initSkillRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 400;
  canvas.height = 400;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 150;
  const sides = 5;
  const angle = (Math.PI * 2) / sides;
  
  // Skill data
  const skills = [
      { name: 'Deep Learning', value: 0.95 },
      { name: 'Neural Networks', value: 0.9 },
      { name: 'Reinforcement', value: 0.85 },
      { name: 'Computer Vision', value: 0.88 },
      { name: 'NLP', value: 0.87 }
  ];
  
  // Draw radar chart
  function drawRadar() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      for (let level = 1; level <= 5; level++) {
          ctx.beginPath();
          
          for (let i = 0; i <= sides; i++) {
              const r = (radius / 5) * level;
              const x = centerX + Math.cos(angle * i - Math.PI / 2) * r;
              const y = centerY + Math.sin(angle * i - Math.PI / 2) * r;
              
              if (i === 0) {
                  ctx.moveTo(x, y);
              } else {
                  ctx.lineTo(x, y);
              }
          }
          
          ctx.closePath();
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
      }
      
      // Draw axes
      for (let i = 0; i < sides; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
              centerX + Math.cos(angle * i - Math.PI / 2) * radius,
              centerY + Math.sin(angle * i - Math.PI / 2) * radius
          );
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
      }
      
      // Draw skill data
      ctx.beginPath();
      
      for (let i = 0; i <= sides; i++) {
          const skillIndex = i % sides;
          const r = radius * skills[skillIndex].value;
          const x = centerX + Math.cos(angle * i - Math.PI / 2) * r;
          const y = centerY + Math.sin(angle * i - Math.PI / 2) * r;
          
          if (i === 0) {
              ctx.moveTo(x, y);
          } else {
              ctx.lineTo(x, y);
          }
          
          // Draw skill name
          if (i < sides) {
              const textX = centerX + Math.cos(angle * i - Math.PI / 2) * (radius + 20);
              const textY = centerY + Math.sin(angle * i - Math.PI / 2) * (radius + 20);
              
              ctx.font = '12px var(--font-heading)';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'var(--text)';
              ctx.fillText(skills[i].name, textX, textY);
          }
      }
      
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;
      ctx.stroke();
  }
  
  drawRadar();
  
  // Redraw on theme change
  document.addEventListener('themeChanged', drawRadar);
}

/**
* Initialize project filtering functionality with null checks
*/
function initProjectFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Update active filter button
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          const filter = button.getAttribute('data-filter');
          
          // Filter projects
          projectCards.forEach(card => {
              const categories = card.getAttribute('data-category').split(' ');
              
              if (filter === 'all' || categories.includes(filter)) {
                  card.style.display = 'block';
                  setTimeout(() => {
                      card.style.opacity = '1';
                      card.style.transform = 'translateY(0)';
                  }, 10);
              } else {
                  card.style.opacity = '0';
                  card.style.transform = 'translateY(20px)';
                  setTimeout(() => {
                      card.style.display = 'none';
                  }, 300);
              }
          });
      });
  });
}

/**
* Initialize timeline animations with null checks
*/
function initTimelineAnimation() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
          }
      });
  }, {
      threshold: 0.1
  });
  
  timelineItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
      observer.observe(item);
  });
}

/**
* Initialize contact form functionality with null checks
*/
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      
      // Simulate form submission
      submitButton.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
      submitButton.disabled = true;
      
      try {
          // In a real implementation, you would send the form data to a server
          // For this demo, we'll simulate a network request
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Show success notification
          showNotification('Message sent successfully!', 'success');
          
          // Reset form
          form.reset();
      } catch (error) {
          // Show error notification
          showNotification('Failed to send message. Please try again.', 'error');
      } finally {
          submitButton.innerHTML = originalButtonText;
          submitButton.disabled = false;
      }
  });
}

/**
* Initialize custom cursor effects with null checks
*/
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.cursor-follower');
  
  if (!cursor || !follower) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let posX = 0;
  let posY = 0;
  
  // Update cursor position
  function updateCursor() {
      const dx = mouseX - posX;
      const dy = mouseY - posY;
      
      posX += dx / 8;
      posY += dy / 8;
      
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      follower.style.transform = `translate(${posX}px, ${posY}px)`;
      
      requestAnimationFrame(updateCursor);
  }
  
  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
  });
  
  // Add hover effects
  const hoverElements = document.querySelectorAll('a, button, .project-card, .nav-link, .category-tab');
  
  hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
          cursor.style.width = '30px';
          cursor.style.height = '30px';
          cursor.style.opacity = '0.5';
          
          follower.style.width = '60px';
          follower.style.height = '60px';
          follower.style.opacity = '0.2';
      });
      
      el.addEventListener('mouseleave', () => {
          cursor.style.width = '20px';
          cursor.style.height = '20px';
          cursor.style.opacity = '1';
          
          follower.style.width = '40px';
          follower.style.height = '40px';
          follower.style.opacity = '0.5';
      });
  });
  
  updateCursor();
}

/**
* Initialize holographic display animation with null checks
*/
function initHolographicDisplay() {
  const hologram = document.querySelector('.hologram-container');
  if (!hologram) return;
  
  let angle = 0;
  
  function animateHologram() {
      angle += 0.002;
      hologram.style.transform = `rotateY(${angle}rad) rotateX(5deg)`;
      requestAnimationFrame(animateHologram);
  }
  
  animateHologram();
}

/**
* Initialize neural network animation with null checks
*/
function initNeuralNetworkAnimation() {
  const neurons = document.querySelectorAll('.neuron');
  if (!neurons.length) return;
  
  neurons.forEach((neuron, index) => {
      neuron.style.setProperty('--delay', index * 0.2);
  });
}

/**
* Initialize data stream animation with null checks
*/
function initDataStreamAnimation() {
  const dataStream = document.querySelector('.data-stream');
  if (!dataStream) return;
  
  // Create data particles
  for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('data-particle');
      
      // Random start and end positions
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 200 - 100;
      const endY = Math.random() * 200 - 100;
      
      particle.style.setProperty('--x', endX);
      particle.style.setProperty('--y', endY);
      particle.style.setProperty('--delay', Math.random() * 5);
      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      
      dataStream.appendChild(particle);
  }
}

/**
* Initialize notification system with null checks
*/
function initNotificationSystem() {
  const notification = document.querySelector('.notification');
  if (!notification) return;
  
  function showNotification(message, type = 'success') {
      const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
      
      notification.querySelector('.notification-text').textContent = message;
      notification.querySelector('i').className = `fas ${icon}`;
      notification.style.backgroundColor = `var(--${type})`;
      
      notification.classList.add('show');
      
      setTimeout(() => {
          notification.classList.remove('show');
      }, 3000);
  }
  
  // Expose to global scope for other functions to use
  window.showNotification = showNotification;
}

/**
* Initialize current year in footer with null check
*/
function initCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
  }
}

/**
* Debounce function to limit the rate of execution
*/
function debounce(func, wait) {
  let timeout;
  return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
          func.apply(context, args);
      }, wait);
  }; 
}