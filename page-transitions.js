// ================= PAGE TRANSITION ANIMATIONS =================
// "Dive" (ocean) and "Breeze" (forest) page transitions

class PageTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.currentTheme = 'ocean';
        this.transitionDuration = 1200;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        this.setupNavigationInterceptors();
        this.setupKeyboardShortcuts();
        this.initializeAudio();
        this.createTransitionOverlay();
    }

    setupNavigationInterceptors() {
        // Intercept all navigation clicks
        document.addEventListener('click', this.handleNavigationClick.bind(this));
        
        // Intercept form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Handle browser back/forward
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    setupKeyboardShortcuts() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Alt + Arrow keys for navigation
            if (e.altKey) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.goBack();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.goForward();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.goHome();
                        break;
                }
            }
        });
    }

    initializeAudio() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    createTransitionOverlay() {
        // Create reusable transition overlay
        if (!document.getElementById('pageTransitionOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'pageTransitionOverlay';
            overlay.className = 'page-transition-overlay';
            overlay.innerHTML = `
                <div class="transition-content">
                    <div class="transition-icon"></div>
                    <div class="transition-text">Loading...</div>
                    <div class="transition-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    handleNavigationClick(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Skip external links, anchors, and special links
        if (!href || href.startsWith('#') || href.startsWith('http') || 
            href.startsWith('mailto:') || href.startsWith('tel:') ||
            link.hasAttribute('data-no-transition')) {
            return;
        }

        // Check if it's an internal navigation
        if (this.isInternalLink(href)) {
            e.preventDefault();
            this.navigateTo(href, link.textContent || 'Loading...');
        }
    }

    handleFormSubmit(e) {
        const form = e.target;
        
        // Skip if form has no-transition attribute
        if (form.hasAttribute('data-no-transition')) return;
        
        // Add form submission transition
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            this.startFormTransition(form, submitButton);
        }
    }

    handlePopState(e) {
        // Handle browser back/forward with transition
        const currentUrl = window.location.pathname;
        this.startPageTransition('back', currentUrl);
    }

    isInternalLink(href) {
        // Check if link is internal to the app
        const currentDomain = window.location.hostname;
        const linkDomain = new URL(href, window.location.origin).hostname;
        
        return currentDomain === linkDomain && !href.includes('://');
    }

    navigateTo(href, title = 'Loading...') {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Start transition animation
        this.startPageTransition('navigate', href, title);
        
        // Load the new page
        this.loadPage(href);
    }

    startPageTransition(type, target, title = 'Loading...') {
        const overlay = document.getElementById('pageTransitionOverlay');
        const icon = overlay.querySelector('.transition-icon');
        const text = overlay.querySelector('.transition-text');
        const progressBar = overlay.querySelector('.progress-bar');
        
        // Set transition type based on theme
        const transitionType = this.currentTheme === 'ocean' ? 'dive' : 'breeze';
        
        // Update overlay content
        text.textContent = title;
        
        // Set appropriate icon and animation
        if (type === 'navigate') {
            this.setTransitionIcon(icon, transitionType);
            this.animateProgress(progressBar, this.transitionDuration);
        } else if (type === 'back') {
            this.setTransitionIcon(icon, transitionType === 'dive' ? 'rise' : 'wind-back');
        }
        
        // Show overlay
        overlay.classList.add('active', `transition-${transitionType}`);
        
        // Play transition sound
        this.playTransitionSound(transitionType);
        
        // Add theme-specific effects
        this.addThemeTransitionEffects(transitionType);
    }

    setTransitionIcon(icon, type) {
        const icons = {
            'dive': '🌊',
            'rise': '⬆️',
            'breeze': '🍃',
            'wind-back': '🌬️'
        };
        
        icon.textContent = icons[type] || '🔄';
        icon.className = `transition-icon icon-${type}`;
    }

    animateProgress(progressBar, duration) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        // Force reflow
        progressBar.offsetHeight;
        
        progressBar.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        progressBar.style.width = '100%';
    }

    addThemeTransitionEffects(type) {
        const body = document.body;
        
        if (type === 'dive') {
            // Ocean dive effects
            body.classList.add('dive-transition');
            this.createDiveParticles();
        } else if (type === 'breeze') {
            // Forest breeze effects
            body.classList.add('breeze-transition');
            this.createBreezeParticles();
        }
        
        // Remove effects after transition
        setTimeout(() => {
            body.classList.remove('dive-transition', 'breeze-transition');
        }, this.transitionDuration);
    }

    createDiveParticles() {
        const container = document.createElement('div');
        container.className = 'dive-particles';
        
        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'dive-bubble';
            bubble.style.cssText = `
                position: fixed;
                width: ${Math.random() * 20 + 5}px;
                height: ${Math.random() * 20 + 5}px;
                background: radial-gradient(circle, rgba(0, 245, 255, 0.8), rgba(0, 200, 255, 0.4));
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: dive-rise ${Math.random() * 2 + 1}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(bubble);
        }
        
        document.body.appendChild(container);
        
        // Clean up after animation
        setTimeout(() => {
            document.body.removeChild(container);
        }, this.transitionDuration);
    }

    createBreezeParticles() {
        const container = document.createElement('div');
        container.className = 'breeze-particles';
        
        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'breeze-leaf';
            leaf.style.cssText = `
                position: fixed;
                width: ${Math.random() * 15 + 8}px;
                height: ${Math.random() * 8 + 4}px;
                background: linear-gradient(45deg, #52b788, #2d6a4f);
                border-radius: ${Math.random() > 0.5 ? '50%' : '0%'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: breeze-float ${Math.random() * 3 + 2}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(leaf);
        }
        
        document.body.appendChild(container);
        
        // Clean up after animation
        setTimeout(() => {
            document.body.removeChild(container);
        }, this.transitionDuration);
    }

    playTransitionSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Different sounds for different transitions
        if (type === 'dive') {
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        } else if (type === 'breeze') {
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.5);
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    async loadPage(href) {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Fetch the new page content
            const response = await fetch(href);
            const html = await response.text();
            
            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Update the URL
            history.pushState({}, '', href);
            
            // Update page content
            this.updatePageContent(doc);
            
            // Complete transition
            setTimeout(() => {
                this.completeTransition();
            }, 300);
            
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showErrorState(error);
        }
    }

    updatePageContent(doc) {
        // Update title
        document.title = doc.title;
        
        // Update main content
        const newContent = doc.querySelector('.container');
        const currentContent = document.querySelector('.container');
        
        if (newContent && currentContent) {
            // Fade out current content
            currentContent.style.opacity = '0';
            currentContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                // Replace content
                currentContent.innerHTML = newContent.innerHTML;
                
                // Fade in new content
                currentContent.style.opacity = '1';
                currentContent.style.transform = 'translateY(0)';
                
                // Re-initialize components
                this.reinitializeComponents();
            }, 300);
        }
        
        // Update navbar if needed
        this.updateNavbar(doc);
        
        // Update theme if needed
        this.updateTheme(doc);
    }

    reinitializeComponents() {
        // Re-initialize all the components that might be affected
        if (window.cardManager) {
            window.cardManager.destroy();
            window.cardManager = new CardManager();
        }
        
        if (window.smoothScrollManager) {
            window.smoothScrollManager.scrollToTop();
        }
        
        if (window.textAnimator) {
            window.textAnimator.init();
        }
        
        // Re-run any setup functions
        if (typeof requireSetup === 'function') {
            requireSetup();
        }
    }

    updateNavbar(doc) {
        const newNavbar = doc.querySelector('.navbar');
        const currentNavbar = document.querySelector('.navbar');
        
        if (newNavbar && currentNavbar) {
            // Update user info if needed
            const newUserLabel = newNavbar.querySelector('#usernameLabel');
            const currentUserLabel = currentNavbar.querySelector('#usernameLabel');
            
            if (newUserLabel && currentUserLabel) {
                currentUserLabel.textContent = newUserLabel.textContent;
            }
        }
    }

    updateTheme(doc) {
        // Check if theme changed in new page
        const htmlElement = doc.documentElement;
        const newTheme = htmlElement.classList.contains('theme-forest') ? 'forest' : 'ocean';
        
        if (newTheme !== this.currentTheme && window.themeProvider) {
            this.currentTheme = newTheme;
            window.themeProvider.applyTheme(newTheme, false);
        }
    }

    completeTransition() {
        const overlay = document.getElementById('pageTransitionOverlay');
        
        // Hide overlay
        overlay.classList.remove('active');
        
        // Reset progress bar
        const progressBar = overlay.querySelector('.progress-bar');
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        // Allow new transitions
        this.isTransitioning = false;
        
        // Focus management for accessibility
        const mainContent = document.querySelector('.container');
        if (mainContent) {
            mainContent.focus({ preventScroll: true });
        }
    }

    showLoadingState() {
        const text = document.querySelector('.transition-text');
        if (text) {
            text.textContent = 'Loading...';
        }
    }

    showErrorState(error) {
        const text = document.querySelector('.transition-text');
        if (text) {
            text.textContent = 'Error loading page';
            text.style.color = '#ff6b6b';
        }
        
        setTimeout(() => {
            this.completeTransition();
        }, 2000);
    }

    startFormTransition(form, submitButton) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Disable form
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = true);
        
        // Show loading state on button
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Create form transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'form-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div class="form-loading">
                <div class="loading-spinner"></div>
                <p>Processing your request...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Show overlay
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Auto-hide after timeout (fallback)
        setTimeout(() => {
            this.hideFormTransition(overlay, submitButton, originalText, inputs);
        }, 5000);
    }

    hideFormTransition(overlay, submitButton, originalText, inputs) {
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // Re-enable form
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            inputs.forEach(input => input.disabled = false);
            
            this.isTransitioning = false;
        }, 300);
    }

    // Public navigation methods
    goBack() {
        if (this.isTransitioning) return;
        window.history.back();
    }

    goForward() {
        if (this.isTransitioning) return;
        window.history.forward();
    }

    goHome() {
        if (this.isTransitioning) return;
        this.navigateTo('index.html', 'Home');
    }

    // Public API
    setTransitionDuration(duration) {
        this.transitionDuration = Math.max(300, Math.min(3000, duration));
    }

    setCurrentTheme(theme) {
        this.currentTheme = theme;
    }

    destroy() {
        // Clean up event listeners
        document.removeEventListener('click', this.handleNavigationClick);
        document.removeEventListener('submit', this.handleFormSubmit);
        window.removeEventListener('popstate', this.handlePopState);
        
        // Remove overlay
        const overlay = document.getElementById('pageTransitionOverlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// ================= ENHANCED NAVIGATION SYSTEM =================
class EnhancedNavigation {
    constructor() {
        this.transitionManager = new PageTransitionManager();
        this.setupEnhancedNavigation();
    }

    setupEnhancedNavigation() {
        // Add data-dive-href support
        document.querySelectorAll('[data-dive-href]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const href = element.getAttribute('data-dive-href');
                const title = element.textContent || 'Loading...';
                this.transitionManager.navigateTo(href, title);
            });
        });
        
        // Add magnetic navigation
        this.setupMagneticNavigation();
        
        // Add keyboard navigation hints
        this.setupNavigationHints();
    }

    setupMagneticNavigation() {
        const navLinks = document.querySelectorAll('.nav-links span, .nav-links a');
        
        navLinks.forEach(link => {
            link.setAttribute('data-magnetic', 'true');
            
            // Add hover effects
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'scale(1.1)';
                link.style.textShadow = '0 0 15px var(--theme-glow)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'scale(1)';
                link.style.textShadow = 'none';
            });
        });
    }

    setupNavigationHints() {
        // Add keyboard navigation hints
        const hints = document.createElement('div');
        hints.className = 'navigation-hints';
        hints.innerHTML = `
            <div class="hint-item">
                <kbd>Alt</kbd> + <kbd>←</kbd> Back
            </div>
            <div class="hint-item">
                <kbd>Alt</kbd> + <kbd>→</kbd> Forward
            </div>
            <div class="hint-item">
                <kbd>Alt</kbd> + <kbd>↑</kbd> Home
            </div>
        `;
        
        hints.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(hints);
        
        // Show hints on Alt key press
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                hints.style.opacity = '1';
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!e.altKey) {
                hints.style.opacity = '0';
            }
        });
    }
}

// ================= GLOBAL INITIALIZATION =================
let pageTransitionManager;
let enhancedNavigation;

document.addEventListener('DOMContentLoaded', () => {
    pageTransitionManager = new PageTransitionManager();
    enhancedNavigation = new EnhancedNavigation();
    
    // Make available globally
    window.pageTransitionManager = pageTransitionManager;
    window.enhancedNavigation = enhancedNavigation;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (pageTransitionManager) {
        pageTransitionManager.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageTransitionManager, EnhancedNavigation };
}
