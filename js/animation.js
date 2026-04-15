/**
 * Enhanced Animations JavaScript
 * 
 * Handles all animation-related functionality for the portfolio website
 * Includes scroll animations, interactions, and performance optimizations
 *
 * @version: 1.1
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initScrollAnimations();
    initParallaxEffects();
    setupSkillBars();
    createParticles();
    initTestimonialSlider();
    initBackToTop();
});

/**
 * Initialize scroll-triggered animations using Intersection Observer
 * This is more performant than scroll event listeners
 */
function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // If reduced motion is preferred, make all elements visible without animations
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            element.classList.add('animate-in');
        });
        return;
    }

    // Set up the Intersection Observer with options
    const observerOptions = {
        root: null, // use the viewport as the root
        rootMargin: '0px 0px -100px 0px', // trigger slightly before element comes into view
        threshold: 0.1 // trigger when at least 10% of the element is visible
    };

    // Create the observer instance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When element enters the viewport
            if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('animate-in');
                
                // Apply staggered animation delays to child elements if needed
                applyStaggeredDelays(entry.target);
                
                // Stop observing the element after it's animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with the animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
    
    // Add animation to hero section elements on page load
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero h1, .hero .lead, .hero .cta-buttons');
        heroElements.forEach(element => {
            element.style.visibility = 'visible';
        });
    }, 300);
}

/**
 * Apply staggered animation delays to children of container elements
 * Creates a cascading effect for lists, grids, etc.
 */
function applyStaggeredDelays(container) {
    // Check if the container has children that should be staggered
    if (container.classList.contains('projects-grid') || 
        container.classList.contains('skills-container') ||
        container.classList.contains('contact-info') ||
        container.classList.contains('tech-icons')) {
        
        // Get all immediate children that can be animated
        const children = Array.from(container.children);
        
        // Apply incremental delays
        children.forEach((child, index) => {
            // Calculate delay based on position
            const delay = 0.1 * index;
            child.style.transitionDelay = `${delay}s`;
            child.style.animationDelay = `${delay}s`;
        });
    }
}

/**
 * Initialize parallax effects for background elements
 * Creates subtle depth and movement on scroll
 */
function initParallaxEffects() {
    // Elements that will have parallax effects
    const parallaxElements = document.querySelectorAll('.parallax-bg, .hero, .section-title, .about-image');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return; // Don't apply parallax if reduced motion is preferred
    }

    // Use the optimized throttle function from utils.js
    const handleScroll = window.utils.throttle(() => {
        // Get scroll position
        const scrollPos = window.scrollY;
        
        // Apply parallax effect to each element
        parallaxElements.forEach(element => {
            // Get element position relative to viewport
            const rect = element.getBoundingClientRect();
            const elementMiddle = rect.top + rect.height / 2;
            const viewportMiddle = window.innerHeight / 2;
            
            // Calculate distance from middle of viewport
            const distance = elementMiddle - viewportMiddle;
            
            // Get the parallax speed or use a default
            const parallaxSpeed = element.dataset.parallaxSpeed || 
                                 (element.classList.contains('hero') ? 0.4 : 0.1);
            
            // Apply transform based on distance (subtle effect)
            const translateY = distance * parseFloat(parallaxSpeed);
            
            // Use will-change for hardware acceleration
            element.style.willChange = 'transform';
            element.style.transform = `translateY(${translateY}px)`;
            
            // Remove will-change after transform is complete (performance best practice)
            clearTimeout(element.parallaxTimeout);
            element.parallaxTimeout = setTimeout(() => {
                element.style.willChange = 'auto';
            }, 100);
        });
    }, 16); // Throttle to approximately 60fps
    
    // Add the scroll event listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Set up skill bars animation
 * Animates the width of skill level bars when they come into view
 */
function setupSkillBars() {
    // Get all skill items
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        // Get the desired width from the style attribute
        const skillLevel = item.querySelector('.skill-level');
        const targetWidth = skillLevel.style.width;
        
        // Initially set width to 0
        skillLevel.style.width = '0';
        
        // Store the target width as a data attribute for reference
        skillLevel.dataset.targetWidth = targetWidth;
    });
    
    // When the skills section comes into view, animate the skill bars
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-level');
                
                // Animate each skill bar with a slight delay between them
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.targetWidth;
                    }, index * 150); // 150ms delay between each skill bar
                });
                
                // Stop observing after animation
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    // Observe the skills container
    const skillsContainers = document.querySelectorAll('.skill-category');
    skillsContainers.forEach(container => {
        skillsObserver.observe(container);
    });
}

/**
 * Create and animate particles in the hero section
 * Adds a subtle dynamic background effect
 */
function createParticles() {
    // Check if the particles container exists
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Configuration
    const particleCount = 20;
    const particleSizes = [3, 5, 7, 10];
    const particleOpacities = [0.1, 0.2, 0.3];
    
    // Create the particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = particleSizes[Math.floor(Math.random() * particleSizes.length)];
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Random opacity
        const opacity = particleOpacities[Math.floor(Math.random() * particleOpacities.length)];
        particle.style.opacity = opacity;
        
        // Random animation delay and duration
        const animationDelay = Math.random() * 10;
        const animationDuration = 15 + Math.random() * 20;
        particle.style.animationDelay = `${animationDelay}s`;
        particle.style.animationDuration = `${animationDuration}s`;
        
        // Add to container
        particlesContainer.appendChild(particle);
    }
}

/**
 * Initialize the testimonial slider
 * Handles navigation and automatic sliding
 */
function initTestimonialSlider() {
    const container = document.querySelector('.testimonials-container');
    if (!container) return;
    
    const cards = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.testimonial-indicators .indicator');
    const prevBtn = document.querySelector('.testimonial-control.prev');
    const nextBtn = document.querySelector('.testimonial-control.next');
    
    // Set initial state
    let currentIndex = 0;
    let interval;
    const autoplayDelay = 5000; // 5 seconds
    
    // Update the active slide
    function updateSlide(index) {
        // Validate index
        if (index < 0) index = cards.length - 1;
        if (index >= cards.length) index = 0;
        
        // Update current index
        currentIndex = index;
        
        // Update transform
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentIndex);
        });
    }
    
    // Set up click handlers for controls
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            updateSlide(currentIndex - 1);
            resetAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            updateSlide(currentIndex + 1);
            resetAutoplay();
        });
    }
    
    // Set up click handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            updateSlide(index);
            resetAutoplay();
        });
    });
    
    // Set up autoplay
    function startAutoplay() {
        interval = setInterval(() => {
            updateSlide(currentIndex + 1);
        }, autoplayDelay);
    }
    
    function resetAutoplay() {
        clearInterval(interval);
        startAutoplay();
    }
    
    // Start autoplay on page load
    startAutoplay();
    
    // Pause autoplay when user hovers over slider
    container.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    container.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Handle touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(interval);
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });
    
    function handleSwipe() {
        const threshold = 50; // Minimum distance for swipe
        if (touchStartX - touchEndX > threshold) {
            // Swipe left
            updateSlide(currentIndex + 1);
        } else if (touchEndX - touchStartX > threshold) {
            // Swipe right
            updateSlide(currentIndex - 1);
        }
    }
}

/**
 * Initialize the Back to Top button functionality
 * Shows/hides button based on scroll position
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    // Use the throttle function for better performance
    const handleScroll = window.utils.throttle(() => {
        if (window.scrollY > window.innerHeight) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100);
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add click event for smooth scrolling to top
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}