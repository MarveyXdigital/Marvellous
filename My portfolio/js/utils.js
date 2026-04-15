/**
 * Enhanced Utilities JavaScript
 * 
 * Contains helper functions and utilities for the portfolio website
 * Includes performance optimizers, polyfills, and reusable functions
 * 
 * @author: John Doe
 * @version: 1.1
 */

/**
 * Namespace for utility functions
 * Prevents global scope pollution
 */
(function(window) {
    /**
     * Throttle function to limit the rate at which a function is executed
     * Useful for scroll and resize events
     * 
     * @param {Function} func - The function to throttle
     * @param {Number} limit - The time limit in milliseconds
     * @return {Function} - Throttled function
     */
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        
        return function() {
            const context = this;
            const args = arguments;
            
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    /**
     * Debounce function to delay execution until after a wait period
     * Useful for resize events or input fields
     * 
     * @param {Function} func - The function to debounce
     * @param {Number} wait - The wait time in milliseconds
     * @param {Boolean} immediate - Whether to execute immediately
     * @return {Function} - Debounced function
     */
    function debounce(func, wait, immediate) {
        let timeout;
        
        return function() {
            const context = this;
            const args = arguments;
            
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Check if an element is in the viewport
     * Enhanced with options for offset and threshold
     * 
     * @param {HTMLElement} element - The element to check
     * @param {Object} options - Optional settings
     * @param {Number} options.offset - Offset to trigger before element is fully visible
     * @param {Number} options.threshold - Percentage of element that must be visible (0-1)
     * @return {Boolean} - Whether the element is in viewport
     */
    function isInViewport(element, options = {}) {
        const offset = options.offset || 0;
        const threshold = options.threshold || 0;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Calculate visibility percentage
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
        const visibleArea = visibleHeight * visibleWidth;
        const elementArea = rect.height * rect.width;
        
        const visiblePercentage = elementArea > 0 ? visibleArea / elementArea : 0;
        
        return (
            rect.top <= (windowHeight + offset) &&
            rect.bottom >= (0 - offset) &&
            rect.left <= (windowWidth + offset) &&
            rect.right >= (0 - offset) &&
            visiblePercentage >= threshold
        );
    }

    /**
     * Preload images for better performance
     * Enhanced with progress tracking and error handling
     * 
     * @param {Array} imageUrls - Array of image URLs to preload
     * @param {Object} options - Optional settings
     * @param {Function} options.onProgress - Callback with progress percentage
     * @param {Function} options.onComplete - Callback when all images are loaded
     * @param {Function} options.onError - Callback for any loading errors
     */
    function preloadImages(imageUrls, options = {}) {
        const onProgress = options.onProgress || function() {};
        const onComplete = options.onComplete || function() {};
        const onError = options.onError || function() {};
        
        let loadedCount = 0;
        const totalImages = imageUrls.length;
        const results = { 
            successful: [], 
            failed: [] 
        };
        
        // If no images, call callback immediately
        if (totalImages === 0) {
            onComplete(results);
            return;
        }
        
        // Function to update progress
        const updateProgress = (url, success) => {
            loadedCount++;
            
            // Track result
            if (success) {
                results.successful.push(url);
            } else {
                results.failed.push(url);
            }
            
            // Calculate progress percentage
            const progressPercent = Math.round((loadedCount / totalImages) * 100);
            
            // Call progress callback
            onProgress(progressPercent, url, success);
            
            // If all images loaded, call complete callback
            if (loadedCount === totalImages) {
                onComplete(results);
            }
        };
        
        // Preload each image
        imageUrls.forEach(url => {
            const img = new Image();
            
            img.onload = function() {
                updateProgress(url, true);
            };
            
            img.onerror = function() {
                updateProgress(url, false);
                onError(url);
            };
            
            img.src = url;
        });
    }

    /**
     * Detect user's preferred color scheme
     * 
     * @return {String} - 'dark', 'light', or 'no-preference'
     */
    function getPreferredColorScheme() {
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light';
            }
        }
        
        return 'no-preference';
    }

    /**
     * Detect if user prefers reduced motion
     * 
     * @return {Boolean} - Whether user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Get viewport dimensions
     * 
     * @return {Object} - Object containing width and height of viewport
     */
    function getViewportDimensions() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    /**
     * Add event listener with automatic removal
     * Prevents memory leaks by removing event listeners when element is removed
     * 
     * @param {HTMLElement} element - Element to add event listener to
     * @param {String} event - Event name
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event listener options
     */
    function addEventListenerWithCleanup(element, event, handler, options = {}) {
        // Add the event listener
        element.addEventListener(event, handler, options);
        
        // Create a mutation observer to watch for element removal
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(removedNode => {
                    // Check if the removed node is our element or contains our element
                    if (removedNode === element || removedNode.contains(element)) {
                        // Remove the event listener
                        element.removeEventListener(event, handler, options);
                        // Disconnect the observer
                        observer.disconnect();
                    }
                });
            });
        });
        
        // Start observing the document
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Return a function to manually clean up
        return function() {
            element.removeEventListener(event, handler, options);
            observer.disconnect();
        };
    }

    /**
     * Detect browser and device capabilities
     * Enhanced with more detailed information
     * 
     * @return {Object} - Object containing detected capabilities
     */
    function detectCapabilities() {
        // Browser detection
        const userAgent = navigator.userAgent;
        let browserName;
        let browserVersion;
        
        // Detect Chrome
        if (/Chrome/.test(userAgent) && !/Chromium|Edge|Edg|OPR|Opera/.test(userAgent)) {
            browserName = 'Chrome';
            browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
        } 
        // Detect Firefox
        else if (/Firefox/.test(userAgent)) {
            browserName = 'Firefox';
            browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
        }
        // Detect Safari
        else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
            browserName = 'Safari';
            browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
        }
        // Detect Edge
        else if (/Edge|Edg/.test(userAgent)) {
            browserName = 'Edge';
            browserVersion = userAgent.match(/Edge\/(\d+\.\d+)|Edg\/(\d+\.\d+)/)[1];
        }
        // Detect Opera
        else if (/OPR|Opera/.test(userAgent)) {
            browserName = 'Opera';
            browserVersion = userAgent.match(/OPR\/(\d+\.\d+)|Opera\/(\d+\.\d+)/)[1];
        }
        // Other browsers
        else {
            browserName = 'Unknown';
            browserVersion = 'Unknown';
        }
        
        // Device type detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /(iPad|tablet|Tablet|Android(?!.*Mobile))/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        // Feature detection
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        // Canvas support for checking WebGL
        const canvas = document.createElement('canvas');
        let webGLSupport = false;
        
        try {
            webGLSupport = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch(e) {
            webGLSupport = false;
        }
        
        // WebP support detection
        let webpSupport = false;
        const webp = new Image();
        webp.onload = function() { webpSupport = (webp.height === 1); };
        webp.onerror = function() { webpSupport = false; };
        webp.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        
        return {
            browser: {
                name: browserName,
                version: browserVersion,
                cookiesEnabled: navigator.cookieEnabled,
                language: navigator.language
            },
            device: {
                isMobile: isMobile,
                isTablet: isTablet, 
                isDesktop: isDesktop,
                pixelRatio: window.devicePixelRatio || 1,
                touchSupport: isTouch,
                maxTouchPoints: navigator.maxTouchPoints || 0
            },
            display: {
                colorDepth: window.screen.colorDepth,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                viewport: getViewportDimensions()
            },
            features: {
                webp: webpSupport,
                webGL: webGLSupport,
                webWorkers: 'Worker' in window,
                serviceWorker: 'serviceWorker' in navigator,
                geolocation: 'geolocation' in navigator,
                localStorage: (() => {
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch(e) {
                        return false;
                    }
                })()
            },
            preferences: {
                reducedMotion: prefersReducedMotion(),
                colorScheme: getPreferredColorScheme(),
                contrast: window.matchMedia('(prefers-contrast: more)').matches ? 'high' : 'normal'
            }
        };
    }

    /**
     * Generate random ID strings
     * Useful for creating unique IDs for elements
     * 
     * @param {Number} length - Length of the ID to generate
     * @param {String} prefix - Optional prefix for the ID
     * @return {String} - The generated ID
     */
    function generateId(length = 8, prefix = '') {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = prefix;
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    /**
     * Detect animation support
     * 
     * @return {Boolean} - Whether CSS animations are supported
     */
    function supportsAnimation() {
        const elem = document.createElement('div');
        const animations = {
            'animation': 'animationend',
            'OAnimation': 'oAnimationEnd',
            'MozAnimation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd'
        };
        
        for (const animation in animations) {
            if (elem.style[animation] !== undefined) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get animation end event name
     * 
     * @return {String} - The animation end event name for the current browser
     */
    function getAnimationEndEvent() {
        const elem = document.createElement('div');
        const animations = {
            'animation': 'animationend',
            'OAnimation': 'oAnimationEnd',
            'MozAnimation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd'
        };
        
        for (const animation in animations) {
            if (elem.style[animation] !== undefined) {
                return animations[animation];
            }
        }
        
        return 'animationend'; // Default
    }

    /**
     * Format date to readable string
     * 
     * @param {Date|String} date - The date to format
     * @param {String} format - The format string
     * @return {String} - Formatted date string
     */
    function formatDate(date, format = 'MMMM DD, YYYY') {
        const d = new Date(date);
        
        // Check if date is valid
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const shortMonths = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
            'Thursday', 'Friday', 'Saturday'
        ];
        
        const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Get date components
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        const dayOfWeek = d.getDay();
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();
        
        // Format replacements
        format = format.replace('YYYY', year);
        format = format.replace('YY', String(year).slice(-2));
        format = format.replace('MMMM', months[month]);
        format = format.replace('MMM', shortMonths[month]);
        format = format.replace('MM', (month + 1).toString().padStart(2, '0'));
        format = format.replace('M', month + 1);
        format = format.replace('DDDD', days[dayOfWeek]);
        format = format.replace('DDD', shortDays[dayOfWeek]);
        format = format.replace('DD', day.toString().padStart(2, '0'));
        format = format.replace('D', day);
        format = format.replace('HH', hours.toString().padStart(2, '0'));
        format = format.replace('H', hours);
        format = format.replace('hh', (hours % 12 || 12).toString().padStart(2, '0'));
        format = format.replace('h', hours % 12 || 12);
        format = format.replace('mm', minutes.toString().padStart(2, '0'));
        format = format.replace('m', minutes);
        format = format.replace('ss', seconds.toString().padStart(2, '0'));
        format = format.replace('s', seconds);
        format = format.replace('a', hours < 12 ? 'am' : 'pm');
        format = format.replace('A', hours < 12 ? 'AM' : 'PM');
        
        return format;
    }

    /**
     * Scroll to element with smooth animation
     * 
     * @param {HTMLElement|String} target - Element or selector to scroll to
     * @param {Object} options - Scroll options
     * @param {Number} options.offset - Offset from the element (e.g., for fixed headers)
     * @param {Number} options.duration - Duration of animation in ms
     * @param {Function} options.callback - Function to call after scrolling
     */
    function scrollTo(target, options = {}) {
        // Default options
        const settings = Object.assign({
            offset: 0,
            duration: 800,
            callback: null
        }, options);
        
        // Get target element
        const targetElement = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (!targetElement) {
            console.warn('Target element not found');
            return;
        }
        
        // Calculate target position
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset + settings.offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        // Check if smooth scrolling is supported and user doesn't prefer reduced motion
        if ('scrollBehavior' in document.documentElement.style && !prefersReducedMotion()) {
            // Use native smooth scrolling
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Call callback after animation
            if (settings.callback && typeof settings.callback === 'function') {
                setTimeout(settings.callback, settings.duration);
            }
            
            return;
        }
        
        // Fall back to JS animation
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / settings.duration, 1);
            
            // Easing function (easeInOutQuad)
            const easing = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;
            
            window.scrollTo(0, startPosition + distance * easing);
            
            if (timeElapsed < settings.duration) {
                requestAnimationFrame(animation);
            } else if (settings.callback && typeof settings.callback === 'function') {
                settings.callback();
            }
        }
        
        requestAnimationFrame(animation);
    }

    // Export utilities to global scope
    window.utils = {
        throttle,
        debounce,
        isInViewport,
        preloadImages,
        getPreferredColorScheme,
        prefersReducedMotion,
        getViewportDimensions,
        addEventListenerWithCleanup,
        detectCapabilities,
        generateId,
        supportsAnimation,
        getAnimationEndEvent,
        formatDate,
        scrollTo
    };
})(window);