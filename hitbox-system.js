// ================= HITBOX WRAPPER SYSTEM =================
// Zero-flicker card interaction system

class HitboxWrapper {
    constructor(element) {
        this.element = element;
        this.hitbox = this.createHitbox();
        this.content = this.getContentElement();
        this.isHovered = false;
        this.animationFrame = null;
        this.mousePosition = { x: 0.5, y: 0.5 };
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        
        this.init();
    }

    createHitbox() {
        const hitbox = document.createElement('div');
        hitbox.className = 'card-hitbox-inner';
        hitbox.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            cursor: pointer;
            background: transparent;
        `;
        return hitbox;
    }

    getContentElement() {
        // Find the actual content within the card
        return this.element.querySelector('.card-content') || 
               this.element.querySelector('h3')?.parentElement ||
               this.element;
    }

    init() {
        // Wrap the element with hitbox structure
        this.element.style.position = 'relative';
        this.element.style.transformStyle = 'preserve-3d';
        this.element.appendChild(this.hitbox);
        
        // Add content wrapper if needed
        if (!this.content.classList.contains('card-content')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'card-content';
            wrapper.innerHTML = this.content.innerHTML;
            this.content.innerHTML = '';
            this.content.appendChild(wrapper);
            this.content = wrapper;
        }
        
        this.setupEventListeners();
        this.startAnimationLoop();
    }

    setupEventListeners() {
        this.hitbox.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.hitbox.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.hitbox.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Touch events for mobile
        this.hitbox.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.hitbox.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.hitbox.addEventListener('touchmove', this.onTouchMove.bind(this));
    }

    onMouseEnter(e) {
        this.isHovered = true;
        this.element.classList.add('hovering');
        this.updateMousePosition(e);
    }

    onMouseLeave(e) {
        this.isHovered = false;
        this.element.classList.remove('hovering');
        // Smooth return to center
        this.targetRotation = { x: 0, y: 0 };
    }

    onMouseMove(e) {
        if (!this.isHovered) return;
        this.updateMousePosition(e);
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.isHovered = true;
        this.element.classList.add('hovering');
        this.updateMousePositionFromTouch(touch);
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.isHovered = false;
        this.element.classList.remove('hovering');
        this.targetRotation = { x: 0, y: 0 };
    }

    onTouchMove(e) {
        e.preventDefault();
        if (!this.isHovered) return;
        const touch = e.touches[0];
        this.updateMousePositionFromTouch(touch);
    }

    updateMousePosition(e) {
        const rect = this.hitbox.getBoundingClientRect();
        this.mousePosition.x = (e.clientX - rect.left) / rect.width;
        this.mousePosition.y = (e.clientY - rect.top) / rect.height;
        
        // Calculate target rotation based on mouse position
        const maxRotation = 15; // Maximum rotation in degrees
        this.targetRotation.x = (this.mousePosition.y - 0.5) * maxRotation * 2;
        this.targetRotation.y = (this.mousePosition.x - 0.5) * maxRotation * -2;
    }

    updateMousePositionFromTouch(touch) {
        const rect = this.hitbox.getBoundingClientRect();
        this.mousePosition.x = (touch.clientX - rect.left) / rect.width;
        this.mousePosition.y = (touch.clientY - rect.top) / rect.height;
        
        const maxRotation = 10; // Slightly less for touch
        this.targetRotation.x = (this.mousePosition.y - 0.5) * maxRotation * 2;
        this.targetRotation.y = (this.mousePosition.x - 0.5) * maxRotation * -2;
    }

    startAnimationLoop() {
        const animate = () => {
            // Smooth interpolation using lerp
            const lerpFactor = this.isHovered ? 0.15 : 0.08;
            
            this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
            this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;
            
            /* Rotate only — no scale/translateZ (those shrink/grow the hit box and cause hover flicker). */
            this.element.style.transform = `
                perspective(1000px)
                rotateX(${this.currentRotation.x}deg)
                rotateY(${this.currentRotation.y}deg)
            `;
            
            // Update content transform for parallax effect
            if (this.content) {
                const contentTranslateX = (this.mousePosition.x - 0.5) * 4;
                const contentTranslateY = (this.mousePosition.y - 0.5) * 4;
                this.content.style.transform = `translateX(${contentTranslateX}px) translateY(${contentTranslateY}px)`;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.hitbox.removeEventListener('mouseenter', this.onMouseEnter);
        this.hitbox.removeEventListener('mouseleave', this.onMouseLeave);
        this.hitbox.removeEventListener('mousemove', this.onMouseMove);
        this.hitbox.removeEventListener('touchstart', this.onTouchStart);
        this.hitbox.removeEventListener('touchend', this.onTouchEnd);
        this.hitbox.removeEventListener('touchmove', this.onTouchMove);
        
        if (this.hitbox.parentNode) {
            this.hitbox.parentNode.removeChild(this.hitbox);
        }
    }
}

// ================= CARD MANAGER =================
class CardManager {
    constructor() {
        this.cards = new Map();
        this.observer = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.initializeExistingCards();
        this.observeNewCards();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.initializeCard(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
    }

    initializeExistingCards() {
        document.querySelectorAll('.card, .resource-card, .glass-box').forEach(card => {
            this.initializeCard(card);
        });
    }

    observeNewCards() {
        // Watch for dynamically added cards
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('card') || 
                            node.classList?.contains('resource-card') || 
                            node.classList?.contains('glass-box')) {
                            this.initializeCard(node);
                        }
                        
                        // Check children
                        node.querySelectorAll?.('.card, .resource-card, .glass-box').forEach(card => {
                            this.initializeCard(card);
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeCard(element) {
        if (this.cards.has(element)) return;
        
        const hitboxWrapper = new HitboxWrapper(element);
        this.cards.set(element, hitboxWrapper);
        
        // Add entrance animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    destroyCard(element) {
        const hitboxWrapper = this.cards.get(element);
        if (hitboxWrapper) {
            hitboxWrapper.destroy();
            this.cards.delete(element);
        }
    }

    destroy() {
        this.cards.forEach((wrapper, element) => {
            wrapper.destroy();
        });
        this.cards.clear();
        
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// ================= GLOBAL INITIALIZATION =================
let cardManager;

document.addEventListener('DOMContentLoaded', () => {
    cardManager = new CardManager();
    window.cardManager = cardManager; // Make available globally
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (cardManager) {
        cardManager.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HitboxWrapper, CardManager };
}
