// ================= MAGNETIC CURSOR SYSTEM =================
// Custom cursor that morphs between bubble (ocean) and leaf (forest) themes

class MagneticCursor {
    constructor() {
        this.cursor = null;
        this.follower = null;
        this.position = { x: 0, y: 0 };
        this.followerPosition = { x: 0, y: 0 };
        this.targetElements = new Set();
        this.isHovering = false;
        this.currentTheme = 'ocean';
        this.magneticForce = 0.15;
        this.isDestroyed = false;
        
        this.init();
    }

    init() {
        this.createCursorElements();
        this.setupEventListeners();
        this.startAnimationLoop();
        this.observeThemeChanges();
    }

    createCursorElements() {
        // Main cursor
        this.cursor = document.createElement('div');
        this.cursor.className = 'magnetic-cursor';
        this.cursor.innerHTML = `
            <div class="cursor-inner">
                <div class="cursor-core"></div>
                <div class="cursor-ring"></div>
                <div class="cursor-particle"></div>
            </div>
        `;
        
        // Follower (trailing element)
        this.follower = document.createElement('div');
        this.follower.className = 'magnetic-follower';
        
        // Add to DOM
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.follower);
        
        // Hide default cursor
        document.documentElement.style.cursor = 'none';
        
        // Add CSS
        this.addCursorStyles();
    }

    addCursorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .magnetic-cursor {
                position: fixed;
                width: 20px;
                height: 20px;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 10000;
                mix-blend-mode: difference;
                transition: transform 0.1s ease;
            }
            
            .cursor-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d;
            }
            
            .cursor-core {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 4px;
                height: 4px;
                background: var(--theme-accent, #00f5ff);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
            }
            
            .cursor-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                border: 2px solid var(--theme-accent, #00f5ff);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
                opacity: 0.8;
            }
            
            .cursor-particle {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 6px;
                height: 6px;
                background: var(--theme-glow, rgba(0, 245, 255, 0.6));
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                transition: all 0.3s ease;
            }
            
            .magnetic-follower {
                position: fixed;
                width: 40px;
                height: 40px;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9999;
                border: 1px solid var(--theme-accent, #00f5ff);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                opacity: 0.3;
                mix-blend-mode: screen;
            }
            
            /* Theme-specific cursor styles */
            .theme-ocean .cursor-core {
                background: #00f5ff;
                box-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
            }
            
            .theme-ocean .cursor-ring {
                border-color: #00f5ff;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
            }
            
            .theme-ocean .cursor-particle {
                background: radial-gradient(circle, rgba(0, 245, 255, 0.8), rgba(0, 200, 255, 0.4));
            }
            
            .theme-forest .cursor-core {
                background: #52b788;
                box-shadow: 0 0 10px rgba(82, 183, 136, 0.8);
            }
            
            .theme-forest .cursor-ring {
                border-color: #52b788;
                box-shadow: 0 0 20px rgba(82, 183, 136, 0.4);
            }
            
            .theme-forest .cursor-particle {
                background: radial-gradient(circle, rgba(82, 183, 136, 0.8), rgba(34, 139, 34, 0.4));
            }
            
            /* Hover states */
            .magnetic-cursor.hovering .cursor-core {
                transform: translate(-50%, -50%) scale(2);
            }
            
            .magnetic-cursor.hovering .cursor-ring {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0.3;
            }
            
            .magnetic-cursor.hovering .cursor-particle {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
            }
            
            .magnetic-follower.hovering {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0.6;
            }
            
            /* Button hover effects */
            .magnetic-cursor.on-button .cursor-ring {
                transform: translate(-50%, -50%) scale(0.8);
                border-color: #fff;
            }
            
            .magnetic-cursor.on-button .cursor-core {
                background: #fff;
            }
            
            .magnetic-follower.on-button {
                transform: translate(-50%, -50%) scale(0.8);
                border-color: #fff;
                opacity: 0.8;
            }
            
            /* Text hover effects */
            .magnetic-cursor.on-text .cursor-core {
                transform: translate(-50%, -50%) scale(1.5);
            }
            
            .magnetic-cursor.on-text .cursor-ring {
                transform: translate(-50%, -50%) scale(1.2);
                border-width: 1px;
            }
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                .magnetic-cursor,
                .magnetic-follower {
                    display: none;
                }
                
                * {
                    cursor: auto !important;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .magnetic-cursor,
                .magnetic-follower {
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Mouse move
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Touch events for mobile (hide cursor)
        document.addEventListener('touchstart', this.hideCursor.bind(this));
        document.addEventListener('touchend', this.showCursor.bind(this));
        
        // Mouse enter/leave for interactive elements
        this.setupInteractiveElements();
        
        // Window resize
        window.addEventListener('resize', this.updateCursorBounds.bind(this));
        
        // Page visibility
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    setupInteractiveElements() {
        // Add hover detection for buttons, links, cards
        const interactiveSelectors = [
            'button', '.btn', 'a', '.card', '.resource-card', 
            '.glass-box', 'input', 'select', 'textarea',
            '[role="button"]', '[tabindex]'
        ];
        
        const observer = new MutationObserver(() => {
            this.updateInteractiveElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.updateInteractiveElements();
    }

    updateInteractiveElements() {
        const interactiveElements = document.querySelectorAll(`
            button, .btn, a, .card, .resource-card, 
            .glass-box, input, select, textarea,
            [role="button"], [tabindex]:not([tabindex="-1"])
        `);
        
        interactiveElements.forEach(element => {
            if (!this.targetElements.has(element)) {
                this.targetElements.add(element);
                element.addEventListener('mouseenter', this.onElementEnter.bind(this));
                element.addEventListener('mouseleave', this.onElementLeave.bind(this));
            }
        });
    }

    onMouseMove(e) {
        if (this.isDestroyed) return;
        
        this.position.x = e.clientX;
        this.position.y = e.clientY;
        
        // Check for magnetic elements
        const magneticElement = this.findMagneticElement(e.clientX, e.clientY);
        if (magneticElement) {
            this.applyMagneticForce(magneticElement, e.clientX, e.clientY);
        } else {
            this.releaseMagneticForce();
        }
    }

    findMagneticElement(x, y) {
        const elements = document.querySelectorAll('[data-magnetic="true"], .card, .btn, button');
        
        for (const element of elements) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            
            if (distance < 100) { // Magnetic range
                return { element, rect, centerX, centerY, distance };
            }
        }
        
        return null;
    }

    applyMagneticForce(magneticElement, mouseX, mouseY) {
        const { element, rect, centerX, centerY } = magneticElement;
        
        // Calculate magnetic pull
        const pullX = (centerX - mouseX) * this.magneticForce;
        const pullY = (centerY - mouseY) * this.magneticForce;
        
        // Apply magnetic offset
        this.position.x += pullX;
        this.position.y += pullY;
        
        // Add magnetic class
        element.classList.add('magnetic-active');
        this.cursor.classList.add('magnetic');
        this.follower.classList.add('magnetic');
        
        // Scale effect based on distance
        const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
        const scale = 1 + (100 - distance) / 200;
        this.cursor.style.transform = `scale(${Math.min(scale, 1.5)})`;
    }

    releaseMagneticForce() {
        // Remove magnetic classes
        document.querySelectorAll('.magnetic-active').forEach(el => {
            el.classList.remove('magnetic-active');
        });
        
        this.cursor.classList.remove('magnetic');
        this.follower.classList.remove('magnetic');
        this.cursor.style.transform = 'scale(1)';
    }

    onElementEnter(e) {
        if (this.isDestroyed) return;
        
        const element = e.target;
        this.isHovering = true;
        
        // Add hover classes
        this.cursor.classList.add('hovering');
        this.follower.classList.add('hovering');
        
        // Element-specific classes
        if (element.matches('button, .btn, [role="button"]')) {
            this.cursor.classList.add('on-button');
            this.follower.classList.add('on-button');
        } else if (element.matches('a, h1, h2, h3, h4, h5, h6, p, span')) {
            this.cursor.classList.add('on-text');
            this.follower.classList.add('on-text');
        }
        
        // Trigger morphing animation
        this.morphCursor(element);
    }

    onElementLeave(e) {
        if (this.isDestroyed) return;
        
        this.isHovering = false;
        
        // Remove hover classes
        this.cursor.classList.remove('hovering', 'on-button', 'on-text');
        this.follower.classList.remove('hovering', 'on-button', 'on-text');
        
        // Reset cursor
        this.resetCursor();
    }

    morphCursor(element) {
        const core = this.cursor.querySelector('.cursor-core');
        const ring = this.cursor.querySelector('.cursor-ring');
        const particle = this.cursor.querySelector('.cursor-particle');
        
        if (this.currentTheme === 'ocean') {
            // Bubble morph effect
            core.style.transform = 'translate(-50%, -50%) scale(1.5)';
            ring.style.transform = 'translate(-50%, -50%) scale(1.2)';
            
            // Create bubble particles
            this.createBubbleParticles();
        } else if (this.currentTheme === 'forest') {
            // Leaf morph effect
            core.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(45deg)';
            ring.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(45deg)';
            
            // Create leaf particles
            this.createLeafParticles();
        }
    }

    resetCursor() {
        const core = this.cursor.querySelector('.cursor-core');
        const ring = this.cursor.querySelector('.cursor-ring');
        const particle = this.cursor.querySelector('.cursor-particle');
        
        core.style.transform = 'translate(-50%, -50%) scale(1)';
        ring.style.transform = 'translate(-50%, -50%) scale(1)';
        particle.style.transform = 'translate(-50%, -50%) scale(0)';
    }

    createBubbleParticles() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'cursor-bubble-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, rgba(0, 245, 255, 0.8), transparent);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9998;
                    left: ${this.position.x}px;
                    top: ${this.position.y}px;
                    animation: bubble-rise 1s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    document.body.removeChild(particle);
                }, 1000);
            }, i * 100);
        }
        
        // Add animation
        if (!document.querySelector('#bubble-animation')) {
            const style = document.createElement('style');
            style.id = 'bubble-animation';
            style.textContent = `
                @keyframes bubble-rise {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -150%) scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createLeafParticles() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'cursor-leaf-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 3px;
                    background: linear-gradient(45deg, #52b788, #2d6a4f);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9998;
                    left: ${this.position.x}px;
                    top: ${this.position.y}px;
                    animation: leaf-fall 1s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    document.body.removeChild(particle);
                }, 1000);
            }, i * 100);
        }
        
        // Add animation
        if (!document.querySelector('#leaf-animation')) {
            const style = document.createElement('style');
            style.id = 'leaf-animation';
            style.textContent = `
                @keyframes leaf-fall {
                    0% {
                        transform: translate(-50%, -50%) scale(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, 100px) scale(1) rotate(180deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    startAnimationLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            
            // Smooth follower animation
            this.followerPosition.x += (this.position.x - this.followerPosition.x) * 0.1;
            this.followerPosition.y += (this.position.y - this.followerPosition.y) * 0.1;
            
            // Update positions
            this.cursor.style.left = `${this.position.x}px`;
            this.cursor.style.top = `${this.position.y}px`;
            
            this.follower.style.left = `${this.followerPosition.x}px`;
            this.follower.style.top = `${this.followerPosition.y}px`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    observeThemeChanges() {
        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const html = document.documentElement;
                    if (html.classList.contains('theme-ocean')) {
                        this.currentTheme = 'ocean';
                    } else if (html.classList.contains('theme-forest')) {
                        this.currentTheme = 'forest';
                    }
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Set initial theme
        if (document.documentElement.classList.contains('theme-forest')) {
            this.currentTheme = 'forest';
        }
    }

    updateCursorBounds() {
        // Ensure cursor stays within viewport
        this.position.x = Math.max(0, Math.min(window.innerWidth, this.position.x));
        this.position.y = Math.max(0, Math.min(window.innerHeight, this.position.y));
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.hideCursor();
        } else {
            this.showCursor();
        }
    }

    hideCursor() {
        this.cursor.style.opacity = '0';
        this.follower.style.opacity = '0';
    }

    showCursor() {
        this.cursor.style.opacity = '1';
        this.follower.style.opacity = '0.3';
    }

    // Public methods
    setMagneticForce(force) {
        this.magneticForce = Math.max(0, Math.min(1, force));
    }

    destroy() {
        this.isDestroyed = true;
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('touchstart', this.hideCursor);
        document.removeEventListener('touchend', this.showCursor);
        
        // Remove DOM elements
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
        }
        
        if (this.follower && this.follower.parentNode) {
            this.follower.parentNode.removeChild(this.follower);
        }
        
        // Restore default cursor
        document.documentElement.style.cursor = 'auto';
        
        // Clean up target elements
        this.targetElements.clear();
    }
}

// ================= GLOBAL INITIALIZATION =================
let magneticCursor;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on desktop devices
    if (window.innerWidth > 768 && !('ontouchstart' in window)) {
        magneticCursor = new MagneticCursor();
        window.magneticCursor = magneticCursor;
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (magneticCursor) {
        magneticCursor.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MagneticCursor;
}
