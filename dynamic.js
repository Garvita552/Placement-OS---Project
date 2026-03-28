// ================= DYNAMIC CONTENT & STATE MANAGEMENT =================

class ContentManager {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Set();
        this.observers = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupErrorHandling();
        this.setupPerformanceOptimizations();
    }

    // Lazy loading with intersection observer
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadContent(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px 0px'
            }
        );

        this.observers.push(observer);
        
        // Observe all lazy-load elements
        document.querySelectorAll('.lazy-load').forEach(el => {
            observer.observe(el);
        });
    }

    // Dynamic content loading
    async loadContent(element) {
        const src = element.dataset.src;
        if (!src || this.cache.has(src)) return;

        this.showLoadingState(element);
        
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const content = await response.text();
            this.cache.set(src, content);
            
            this.renderContent(element, content);
        } catch (error) {
            this.showErrorState(element, error);
        } finally {
            this.hideLoadingState(element);
        }
    }

    renderContent(element, content) {
        if (element.dataset.target) {
            const target = document.querySelector(element.dataset.target);
            if (target) {
                target.innerHTML = content;
                target.classList.add('loaded');
            }
        } else {
            element.innerHTML = content;
            element.classList.add('loaded');
        }
        
        // Re-initialize any dynamic components
        this.reinitializeComponents(element);
    }

    showLoadingState(element) {
        this.loadingStates.add(element);
        element.classList.add('loading');
        
        if (!element.querySelector('.skeleton')) {
            const skeleton = document.createElement('div');
            skeleton.className = 'loading-skeleton';
            skeleton.style.cssText = 'height: 100%; width: 100%; position: absolute; top: 0; left: 0;';
            element.style.position = 'relative';
            element.appendChild(skeleton);
        }
    }

    hideLoadingState(element) {
        this.loadingStates.delete(element);
        element.classList.remove('loading');
        
        const skeleton = element.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
    }

    showErrorState(element, error) {
        element.classList.add('error');
        element.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ff6b6b;">
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div>Failed to load content</div>
                <button onclick="contentManager.retryLoad(this.parentElement.parentElement)" 
                        style="margin-top: 10px; padding: 8px 16px; background: rgba(255, 107, 107, 0.2); border: 1px solid #ff6b6b; border-radius: 8px; color: #fff; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }

    retryLoad(element) {
        const src = element.dataset.src;
        if (src) {
            this.cache.delete(src);
            this.loadContent(element);
        }
    }

    // Re-initialize components after dynamic content loads
    reinitializeComponents(container) {
        // Re-attach event listeners
        container.querySelectorAll('.card').forEach(card => {
            if (typeof attachTilt === 'function') {
                attachTilt(card);
            }
        });

        // Re-initialize charts if present
        if (typeof renderChart === 'function') {
            const chartElements = container.querySelectorAll('canvas');
            chartElements.forEach(canvas => {
                if (canvas.id.includes('Chart')) {
                    renderChart();
                }
            });
        }

        // Re-apply reveal animations
        if (typeof applyReveal === 'function') {
            applyReveal();
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.warn('Content loading error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.warn('Unhandled promise rejection:', e.reason);
        });
    }

    setupPerformanceOptimizations() {
        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Optimize scroll performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
            }, 100);
        }, { passive: true });
    }

    handleResize() {
        // Re-evaluate lazy loading on resize
        document.querySelectorAll('.lazy-load:not(.loaded)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 200) {
                this.loadContent(el);
            }
        });
    }

    // State management
    setState(key, value) {
        try {
            localStorage.setItem(`placement_os_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }

    getState(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`placement_os_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to load state:', e);
            return defaultValue;
        }
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
}

// Enhanced UI interactions
class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupKeyboardNavigation();
        this.setupMobileGestures();
        this.setupThemeToggle();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC to close mobile menu
            if (e.key === 'Escape') {
                const navLinks = document.getElementById('navLinks');
                const hamburger = document.getElementById('hamburgerMenu');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }

            // Alt + N for mobile menu toggle
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                const hamburger = document.getElementById('hamburgerMenu');
                if (hamburger) hamburger.click();
            }
        });
    }

    setupMobileGestures() {
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                const navLinks = document.getElementById('navLinks');
                const hamburger = document.getElementById('hamburgerMenu');
                
                if (diff > 0 && navLinks.classList.contains('active')) {
                    // Swipe left to close menu
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                } else if (diff < 0 && !navLinks.classList.contains('active')) {
                    // Swipe right to open menu
                    navLinks.classList.add('active');
                    hamburger.classList.add('active');
                }
            }
        };
    }

    setupThemeToggle() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('placement_os_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }

        // Add theme toggle button if it doesn't exist
        if (!document.getElementById('themeToggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'themeToggle';
            themeBtn.innerHTML = '🌙';
            themeBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(0, 245, 255, 0.2);
                border: 2px solid rgba(0, 245, 255, 0.5);
                color: white;
                font-size: 20px;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            
            themeBtn.addEventListener('click', () => this.toggleTheme());
            document.body.appendChild(themeBtn);
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('themeToggle');
        
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        themeBtn.innerHTML = isLight ? '☀️' : '🌙';
        localStorage.setItem('placement_os_theme', isLight ? 'light' : 'dark');
    }
}

// Initialize everything when DOM is ready
let contentManager;
let uiEnhancements;

document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentManager();
    uiEnhancements = new UIEnhancements();
    
    // Make available globally for other scripts
    window.contentManager = contentManager;
    window.uiEnhancements = uiEnhancements;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContentManager, UIEnhancements };
}
