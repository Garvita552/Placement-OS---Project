// ================= SMOOTH SCROLL & TEXT ANIMATIONS =================
// Lenis-style smooth scrolling with GSAP-inspired text animations

class SmoothScrollManager {
    constructor() {
        this.isScrolling = false;
        this.scrollTarget = 0;
        this.scrollCurrent = 0;
        this.scrollEase = 0.08;
        this.isDestroyed = false;
        
        this.init();
    }

    init() {
        this.setupSmoothScroll();
        this.setupTextAnimations();
        this.setupScrollTriggers();
        this.setupKeyboardNavigation();
    }

    setupSmoothScroll() {
        // Disable default scroll behavior
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Track current scroll position
        this.scrollCurrent = window.pageYOffset;
        
        // Setup scroll event listeners
        let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!isTouchDevice) {
            // Mouse wheel events for desktop
            window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
            window.addEventListener('keydown', this.handleKeydown.bind(this));
        } else {
            // Touch events for mobile (use native scrolling)
            this.setupNativeScroll();
        }
        
        // Start animation loop
        this.startScrollAnimation();
    }

    handleWheel(e) {
        if (this.isDestroyed) return;
        
        e.preventDefault();
        
        // Calculate scroll delta
        const delta = e.deltaY;
        const multiplier = e.shiftKey ? 3 : 1; // Fast scroll with Shift
        
        // Update target scroll position
        this.scrollTarget += delta * multiplier;
        
        // Clamp to document bounds
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollTarget = Math.max(0, Math.min(maxScroll, this.scrollTarget));
        
        // Add scrolling class
        document.body.classList.add('is-smooth-scrolling');
        
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-smooth-scrolling');
        }, 150);
    }

    handleKeydown(e) {
        if (this.isDestroyed) return;
        
        let scrollAmount = 0;
        const multiplier = e.shiftKey ? 100 : 50;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                scrollAmount = -multiplier;
                break;
            case 'ArrowDown':
                e.preventDefault();
                scrollAmount = multiplier;
                break;
            case 'PageUp':
                e.preventDefault();
                scrollAmount = -window.innerHeight * 0.8;
                break;
            case 'PageDown':
                e.preventDefault();
                scrollAmount = window.innerHeight * 0.8;
                break;
            case 'Home':
                e.preventDefault();
                this.scrollTarget = 0;
                return;
            case 'End':
                e.preventDefault();
                this.scrollTarget = document.documentElement.scrollHeight - window.innerHeight;
                return;
            case ' ':
                e.preventDefault();
                scrollAmount = e.shiftKey ? -window.innerHeight * 0.8 : window.innerHeight * 0.8;
                break;
        }
        
        if (scrollAmount !== 0) {
            this.scrollTarget += scrollAmount;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollTarget = Math.max(0, Math.min(maxScroll, this.scrollTarget));
        }
    }

    setupNativeScroll() {
        // For touch devices, use native scroll with enhanced easing
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            this.scrollCurrent = window.pageYOffset;
            this.scrollTarget = this.scrollCurrent;
            
            clearTimeout(scrollTimeout);
            document.body.classList.add('is-smooth-scrolling');
            
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-smooth-scrolling');
            }, 150);
        });
    }

    startScrollAnimation() {
        const animate = () => {
            if (this.isDestroyed) return;
            
            // Smooth easing
            const diff = this.scrollTarget - this.scrollCurrent;
            this.scrollCurrent += diff * this.scrollEase;
            
            // Apply scroll position
            window.scrollTo(0, this.scrollCurrent);
            
            // Update scroll-dependent animations
            this.updateScrollAnimations();
            
            // Continue animation if needed
            if (Math.abs(diff) > 0.1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation loop
        requestAnimationFrame(animate);
    }

    updateScrollAnimations() {
        const scrollProgress = this.scrollCurrent / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Update scroll-based CSS variables
        document.documentElement.style.setProperty('--scroll-progress', scrollProgress);
        document.documentElement.style.setProperty('--scroll-y', `${this.scrollCurrent}px`);
        
        // Trigger scroll-dependent animations
        this.updateParallaxElements();
        this.updateScrollRevealElements();
    }

    updateParallaxElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + this.scrollCurrent;
            const windowHeight = window.innerHeight;
            
            // Calculate parallax offset
            const offset = (this.scrollCurrent - elementTop) * speed;
            
            // Apply transform
            element.style.transform = `translateY(${offset}px)`;
        });
    }

    updateScrollRevealElements() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        revealElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('revealed')) {
                element.classList.add('revealed');
                this.triggerRevealAnimation(element);
            }
        });
    }

    setupTextAnimations() {
        // Animate hero title on load
        this.animateHeroTitle();
        
        // Setup split text animations
        this.setupSplitTextAnimations();
        
        // Setup hover text effects
        this.setupTextHoverEffects();
    }

    animateHeroTitle() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;
        
        // Split text into words
        const words = heroTitle.textContent.split(' ');
        heroTitle.innerHTML = '';
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'hero-word';
            span.textContent = word + ' ';
            span.style.cssText = `
                display: inline-block;
                opacity: 0;
                transform: translateY(50px) rotateX(90deg);
                transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
            `;
            span.style.transitionDelay = `${index * 0.1}s`;
            
            heroTitle.appendChild(span);
            
            // Trigger animation
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0) rotateX(0deg)';
            }, 100 + index * 100);
        });
    }

    setupSplitTextAnimations() {
        const splitElements = document.querySelectorAll('[data-split-text]');
        
        splitElements.forEach(element => {
            const text = element.textContent;
            const type = element.dataset.splitText || 'words'; // 'words', 'chars', 'lines'
            
            let splits = [];
            
            switch(type) {
                case 'chars':
                    splits = text.split('').map(char => `<span class="split-char">${char}</span>`);
                    break;
                case 'words':
                    splits = text.split(' ').map(word => `<span class="split-word">${word}</span>`);
                    break;
                case 'lines':
                    // Simple line split (you might want a more sophisticated solution)
                    splits = text.split('\n').map(line => `<span class="split-line">${line}</span>`);
                    break;
            }
            
            element.innerHTML = splits.join(' ');
            
            // Add initial styles
            const spans = element.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.cssText = `
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                `;
                span.style.transitionDelay = `${index * 0.05}s`;
            });
            
            // Trigger on scroll
            element.dataset.reveal = 'true';
        });
    }

    setupTextHoverEffects() {
        const hoverTextElements = document.querySelectorAll('[data-text-hover]');
        
        hoverTextElements.forEach(element => {
            const effect = element.dataset.textHover || 'glow';
            
            element.addEventListener('mouseenter', () => {
                this.applyTextHoverEffect(element, effect, true);
            });
            
            element.addEventListener('mouseleave', () => {
                this.applyTextHoverEffect(element, effect, false);
            });
        });
    }

    applyTextHoverEffect(element, effect, isHovering) {
        switch(effect) {
            case 'glow':
                element.style.textShadow = isHovering ? 
                    '0 0 20px var(--theme-glow), 0 0 40px var(--theme-accent)' : 
                    'none';
                break;
            case 'wave':
                if (isHovering) {
                    this.animateTextWave(element);
                }
                break;
            case 'scale':
                element.style.transform = isHovering ? 'scale(1.05)' : 'scale(1)';
                break;
            case 'rainbow':
                if (isHovering) {
                    this.animateTextRainbow(element);
                } else {
                    element.style.background = 'none';
                    element.style.webkitBackgroundClip = 'unset';
                    element.style.webkitTextFillColor = 'unset';
                }
                break;
        }
    }

    animateTextWave(element) {
        const chars = element.textContent.split('');
        element.innerHTML = '';
        
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.transition = 'transform 0.3s ease';
            element.appendChild(span);
            
            setTimeout(() => {
                span.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    span.style.transform = 'translateY(0)';
                }, 200);
            }, index * 50);
        });
    }

    animateTextRainbow(element) {
        element.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
        element.style.backgroundSize = '200% 100%';
        element.style.webkitBackgroundClip = 'text';
        element.style.webkitTextFillColor = 'transparent';
        element.style.backgroundClip = 'text';
        element.style.animation = 'rainbow 3s linear infinite';
        
        // Add animation if not exists
        if (!document.querySelector('#rainbow-animation')) {
            const style = document.createElement('style');
            style.id = 'rainbow-animation';
            style.textContent = `
                @keyframes rainbow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupScrollTriggers() {
        // Intersection Observer for scroll-triggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements with scroll triggers
        const triggerElements = document.querySelectorAll('[data-scroll-trigger]');
        triggerElements.forEach(element => {
            observer.observe(element);
        });
    }

    triggerScrollAnimation(element) {
        const animation = element.dataset.scrollTrigger || 'fadeIn';
        
        switch(animation) {
            case 'fadeIn':
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                break;
            case 'slideInLeft':
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                break;
            case 'slideInRight':
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                break;
            case 'scaleIn':
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                break;
            case 'rotateIn':
                element.style.opacity = '1';
                element.style.transform = 'rotate(0deg)';
                break;
        }
        
        element.classList.add('scroll-animated');
    }

    triggerRevealAnimation(element) {
        const type = element.dataset.reveal || 'fadeIn';
        
        // Apply reveal animation based on split text
        const spans = element.querySelectorAll('span');
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    setupKeyboardNavigation() {
        // Smooth scroll to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            });
        });
    }

    scrollToElement(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        this.scrollTarget = targetPosition;
        
        // Add focus for accessibility
        element.focus({ preventScroll: true });
    }

    // Public methods
    scrollToTop() {
        this.scrollTarget = 0;
    }

    scrollToBottom() {
        this.scrollTarget = document.documentElement.scrollHeight - window.innerHeight;
    }

    scrollToElement(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            this.scrollTarget = element.offsetTop - offset;
        }
    }

    setScrollSpeed(speed) {
        this.scrollEase = Math.max(0.01, Math.min(0.2, speed));
    }

    destroy() {
        this.isDestroyed = true;
        
        // Restore default scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Remove event listeners
        window.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('keydown', this.handleKeydown);
    }
}

// ================= ENHANCED TEXT ANIMATIONS =================
class TextAnimator {
    constructor() {
        this.init();
    }

    init() {
        this.setupTypewriterEffect();
        this.setupCounterAnimation();
        this.setupMorphingText();
    }

    setupTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const text = element.dataset.typewriter || element.textContent;
            const speed = parseInt(element.dataset.speed) || 100;
            
            element.textContent = '';
            let index = 0;
            
            const typeChar = () => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeChar, speed);
                }
            };
            
            // Start when element is visible
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    typeChar();
                    observer.disconnect();
                }
            });
            
            observer.observe(element);
        });
    }

    setupCounterAnimation() {
        const counterElements = document.querySelectorAll('[data-counter]');
        
        counterElements.forEach(element => {
            const target = parseInt(element.dataset.counter);
            const duration = parseInt(element.dataset.duration) || 2000;
            const prefix = element.dataset.prefix || '';
            const suffix = element.dataset.suffix || '';
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.animateCounter(element, target, duration, prefix, suffix);
                    observer.disconnect();
                }
            });
            
            observer.observe(element);
        });
    }

    animateCounter(element, target, duration, prefix, suffix) {
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            element.textContent = prefix + current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    setupMorphingText() {
        const morphElements = document.querySelectorAll('[data-morph]');
        
        morphElements.forEach(element => {
            const words = element.dataset.morph.split(',');
            let currentIndex = 0;
            
            const morphWord = () => {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % words.length;
                    element.textContent = words[currentIndex].trim();
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                }, 300);
            };
            
            // Start morphing
            setInterval(morphWord, parseInt(element.dataset.morphInterval) || 3000);
        });
    }
}

// ================= GLOBAL INITIALIZATION =================
let smoothScrollManager;
let textAnimator;

document.addEventListener('DOMContentLoaded', () => {
    smoothScrollManager = new SmoothScrollManager();
    textAnimator = new TextAnimator();
    
    // Make available globally
    window.smoothScrollManager = smoothScrollManager;
    window.textAnimator = textAnimator;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (smoothScrollManager) {
        smoothScrollManager.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmoothScrollManager, TextAnimator };
}
