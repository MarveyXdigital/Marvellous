// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initTypingEffect();
    initProjectFilter();
    initCounterAnimation();
    initFormValidation();
    initBackToTop();
    initParticles();
    initImageLazyLoading();
    initAccessibility();
});

/**
 * Initialize mobile navigation
 */
function initNavigation() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navList.classList.toggle('mobile-active');
            
            // Update aria attributes for accessibility
            const isExpanded = menuToggle.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Prevent body scrolling when menu is open
            document.body.classList.toggle('no-scroll');
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navList.classList.remove('mobile-active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        });
    });

    // Add scrolled class to header when scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Update active nav link based on scroll position
    window.addEventListener('scroll', debounce(() => {
        let current = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navList.classList.contains('mobile-active') && 
            !navList.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navList.classList.remove('mobile-active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }
    });
}

/**
 * Initialize scroll animations with Intersection Observer
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
            element.classList.add('animate-in');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add specific animation class if specified
                const animationType = entry.target.dataset.animation;
                if (animationType) {
                    entry.target.classList.add(`animate-${animationType}`);
                }
                
                // Apply delay if specified
                const delay = entry.target.dataset.delay;
                if (delay) {
                    entry.target.style.animationDelay = `${delay}s`;
                    entry.target.style.transitionDelay = `${delay}s`;
                }
                
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
                
                // Remove will-change after animation completes for better performance
                setTimeout(() => {
                    entry.target.classList.add('animate-completed');
                }, 1000);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px' // Trigger slightly before element comes into view
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Initialize skill bars animation with Intersection Observer
 */
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    
    skillLevels.forEach(level => {
        const percentage = level.getAttribute('data-level');
        level.style.setProperty('--level', `${percentage}%`);
    });
    
    const skillCategories = document.querySelectorAll('.skill-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    skillCategories.forEach(category => {
        observer.observe(category);
    });
}

/**
 * Initialize typing effect for hero section
 */
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const textsArray = JSON.parse(typingElement.getAttribute('data-texts').replace(/'/g, '"'));
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = textsArray[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 1500; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textsArray.length;
            typingSpeed = 500; // Pause before typing next string
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing effect
    setTimeout(type, 1000);
}

/**
 * Initialize project filter
 */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Filter projects
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
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
 * Initialize counter animation with Intersection Observer
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-count'));
                let count = 0;
                const duration = 2000; // 2 seconds
                const increment = Math.ceil(countTo / (duration / 30)); // Update every 30ms
                
                function updateCount() {
                    count += increment;
                    if (count >= countTo) {
                        target.textContent = countTo;
                        return;
                    }
                    
                    target.textContent = count;
                    requestAnimationFrame(() => {
                        setTimeout(updateCount, 30);
                    });
                }
                
                updateCount();
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.classList.remove('visible');
            message.textContent = '';
        });
        
        // Reset invalid classes
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.classList.remove('invalid'));
        
        // Validate name
        const nameInput = document.getElementById('name');
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            return;
        }
        
        // Validate email
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        // Validate subject
        const subjectInput = document.getElementById('subject');
        if (!subjectInput.value) {
            showError(subjectInput, 'Please select a project type');
            return;
        }
        
        // Validate message
        const messageInput = document.getElementById('message');
        if (messageInput.value.trim().length < 10) {
            showError(messageInput, 'Please enter a message (at least 10 characters)');
            return;
        }
        
        const budgetInput = document.getElementById('budget');
        const budgetText = budgetInput && budgetInput.value ? budgetInput.options[budgetInput.selectedIndex].text : 'Not specified';
        const projectType = subjectInput.options[subjectInput.selectedIndex]?.text || subjectInput.value;
        const mailSubject = `Portfolio contact - ${projectType}`;
        const mailBody = `Name: ${nameInput.value.trim()}
Email: ${emailInput.value.trim()}
Project Type: ${projectType}
Budget: ${budgetText}

Message:
${messageInput.value.trim()}`;
        const mailtoUrl = `mailto:ajayimarvellous22@gmail.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

        // Open the user's email client with the filled message details
        window.location.assign(mailtoUrl);

        const successMessage = document.querySelector('.form-success');
        if (successMessage) {
            successMessage.textContent = 'Your email client should open with the message details. Send the email to complete.';
            successMessage.classList.add('visible');
            setTimeout(() => {
                successMessage.classList.remove('visible');
            }, 8000);
        }

        contactForm.reset();
    });
    
    function showError(input, message) {
        input.classList.add('invalid');
        const errorElement = document.getElementById(`${input.id}Error`);
        errorElement.textContent = message;
        errorElement.classList.add('visible');
        input.focus();
    }
    
    // Real-time validation feedback
    contactForm.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                // Clear error when user starts correcting
                field.classList.remove('invalid');
                const errorElement = document.getElementById(`${field.id}Error`);
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('visible');
                }
            }
        });
    });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;
    
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, 100));
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: supportsSmoothScroll() ? 'smooth' : 'auto'
        });
    });
}

/**
 * Initialize particle system for hero section
 */
function initParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 15 + 5;
        
        // Random opacity
        const opacity = Math.random() * 0.3 + 0.1;
        
        // Random animation delay
        const delay = Math.random() * 5;
        
        // Random animation duration
        const duration = Math.random() * 10 + 10;
        
        // Apply styles
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
}

/**
 * Initialize lazy loading for images
 */
function initImageLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
}

/**
 * Initialize accessibility improvements
 */
function initAccessibility() {
    // Add tab index to interactive elements that might not have it
    document.querySelectorAll('.tech-item, .project-card').forEach(element => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    });
    
    // Add keyboard navigation for interactive elements
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('.project-btn');
                if (link) {
                    link.click();
                }
            }
        });
    });
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Apply reduced motion styles
        document.body.classList.add('reduced-motion');
    }
    
    // Listen for changes to the reduced motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    });
}

/**
 * Utility function: Debounce to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility function: Check if browser supports smooth scrolling
 */
function supportsSmoothScroll() {
    return 'scrollBehavior' in document.documentElement.style;
}

/**
 * Utility function: Detect when animations have completed
 */
function whichAnimationEvent() {
    const el = document.createElement('div');
    const animations = {
        'animation': 'animationend',
        'OAnimation': 'oAnimationEnd',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    };
    
    for (const key in animations) {
        if (el.style[key] !== undefined) {
            return animations[key];
        }
    }
    return 'animationend'; // Default
}