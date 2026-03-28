// ================= IMMERSIVE THEME PROVIDER =================
// Manages ocean abyss and biophilic forest themes with 3D backgrounds

class ThemeProvider {
    constructor() {
        this.currentTheme = localStorage.getItem('placement_os_theme') || 'ocean';
        this.isTransitioning = false;
        this.backgrounds = new Map();
        this.animations = new Map();
        this.audioContext = null;
        
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.applyTheme(this.currentTheme, false);
        this.setupKeyboardShortcuts();
        this.initializeAudio();
    }

    setupThemeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            this.transitionTheme();
        });

        // Add hover effects
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.1) rotate(180deg)';
        });

        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1) rotate(0deg)';
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.transitionTheme();
            }
            
            // Ctrl/Cmd + Shift + L for light/dark within theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.toggleLightMode();
            }
        });
    }

    initializeAudio() {
        // Web Audio API for ambient sounds
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    transitionTheme() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const newTheme = this.currentTheme === 'ocean' ? 'forest' : 'ocean';
        
        // Play transition sound
        this.playTransitionSound();
        
        // Start page transition animation
        this.startPageTransition(() => {
            this.applyTheme(newTheme, true);
            this.currentTheme = newTheme;
            localStorage.setItem('placement_os_theme', newTheme);
            
            // Update UI elements
            this.updateUIElements();
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, 1000);
        });
    }

    applyTheme(theme, animate = true) {
        const root = document.documentElement;
        const body = document.body;
        
        // Remove all theme classes
        root.classList.remove('theme-ocean', 'theme-forest', 'theme-ocean-light', 'theme-forest-light');
        
        // Add new theme class
        root.classList.add(`theme-${theme}`);
        
        // Update body class for 3D background
        body.className = body.className.replace(/theme-\w+/g, '');
        body.classList.add(`theme-${theme}`);
        
        // Initialize 3D background
        this.initializeBackground(theme, animate);
        
        // Update theme toggle button
        this.updateThemeToggle(theme);
        
        // Apply theme-specific optimizations
        this.applyThemeOptimizations(theme);
    }

    initializeBackground(theme, animate = true) {
        if (theme === 'ocean') {
            this.initializeOceanBackground(animate);
        } else if (theme === 'forest') {
            this.initializeForestBackground(animate);
        }
    }

    initializeOceanBackground(animate = true) {
        const canvas = document.getElementById('abyssCaustics');
        const seaSnowCanvas = document.getElementById('abyssSeaSnow');
        
        if (!canvas || !seaSnowCanvas) return;
        
        // Initialize caustics (light patterns on ocean floor)
        this.initCaustics(canvas, animate);
        
        // Initialize sea snow (floating particles)
        this.initSeaSnow(seaSnowCanvas, animate);
        
        // Add ocean-specific effects
        this.addOceanEffects();
    }

    initializeForestBackground(animate = true) {
        // Create forest canopy with dappled sunlight
        this.createForestCanopy(animate);
        
        // Add forest particles (pollen, leaves)
        this.initForestParticles(animate);
        
        // Add forest-specific effects
        this.addForestEffects();
    }

    initCaustics(canvas, animate = true) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let time = 0;
        const caustics = [];
        
        // Generate caustic patterns
        for (let i = 0; i < 8; i++) {
            caustics.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 200 + 100,
                speed: Math.random() * 0.002 + 0.001,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        const drawCaustics = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            caustics.forEach(caustic => {
                const gradient = ctx.createRadialGradient(
                    caustic.x, caustic.y, 0,
                    caustic.x, caustic.y, caustic.radius
                );
                
                gradient.addColorStop(0, `rgba(0, 245, 255, ${caustic.opacity})`);
                gradient.addColorStop(0.5, `rgba(0, 200, 255, ${caustic.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Animate caustic position
                caustic.x += Math.sin(time * caustic.speed) * 2;
                caustic.y += Math.cos(time * caustic.speed * 0.7) * 1;
                
                // Wrap around screen
                if (caustic.x < -caustic.radius) caustic.x = canvas.width + caustic.radius;
                if (caustic.x > canvas.width + caustic.radius) caustic.x = -caustic.radius;
                if (caustic.y < -caustic.radius) caustic.y = canvas.height + caustic.radius;
                if (caustic.y > canvas.height + caustic.radius) caustic.y = -caustic.radius;
            });
            
            time += 1;
            requestAnimationFrame(drawCaustics);
        };
        
        if (animate) {
            drawCaustics();
        }
        
        this.animations.set('caustics', drawCaustics);
    }

    initSeaSnow(canvas, animate = true) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 150;
        
        // Create sea snow particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.2,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        const drawSeaSnow = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();
                
                // Animate particle
                particle.y -= particle.speed;
                particle.x += Math.sin(particle.wobble) * 0.3;
                particle.wobble += 0.05;
                
                // Reset particle when it goes off screen
                if (particle.y < -10) {
                    particle.y = canvas.height + 10;
                    particle.x = Math.random() * canvas.width;
                }
            });
            
            requestAnimationFrame(drawSeaSnow);
        };
        
        if (animate) {
            drawSeaSnow();
        }
        
        this.animations.set('seaSnow', drawSeaSnow);
    }

    createForestCanopy(animate = true) {
        const canopy = document.createElement('div');
        canopy.className = 'forest-canopy';
        canopy.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -5;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        
        // Create dappled sunlight effect
        const sunlightCanvas = document.createElement('canvas');
        sunlightCanvas.id = 'forestSunlight';
        sunlightCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        canopy.appendChild(sunlightCanvas);
        document.body.appendChild(canopy);
        
        // Initialize dappled sunlight
        this.initDappledSunlight(sunlightCanvas, animate);
        
        // Fade in canopy
        if (animate) {
            setTimeout(() => {
                canopy.style.opacity = '1';
            }, 100);
        }
    }

    initDappledSunlight(canvas, animate = true) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let time = 0;
        const lightPatches = [];
        
        // Generate light patches
        for (let i = 0; i < 12; i++) {
            lightPatches.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 150 + 50,
                intensity: Math.random() * 0.3 + 0.1,
                speed: Math.random() * 0.001 + 0.0005
            });
        }
        
        const drawSunlight = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Create green gradient background
            const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGradient.addColorStop(0, 'rgba(34, 139, 34, 0.1)');
            bgGradient.addColorStop(1, 'rgba(0, 100, 0, 0.2)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw dappled sunlight patches
            lightPatches.forEach(patch => {
                const gradient = ctx.createRadialGradient(
                    patch.x, patch.y, 0,
                    patch.x, patch.y, patch.size
                );
                
                gradient.addColorStop(0, `rgba(255, 255, 200, ${patch.intensity})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 150, ${patch.intensity * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Animate light patches
                patch.x += Math.sin(time * patch.speed) * 1;
                patch.y += Math.cos(time * patch.speed * 0.8) * 0.5;
                
                // Wrap around
                if (patch.x < -patch.size) patch.x = canvas.width + patch.size;
                if (patch.x > canvas.width + patch.size) patch.x = -patch.size;
            });
            
            time += 1;
            requestAnimationFrame(drawSunlight);
        };
        
        if (animate) {
            drawSunlight();
        }
        
        this.animations.set('sunlight', drawSunlight);
    }

    initForestParticles(animate = true) {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'forest-particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -4;
        `;
        
        // Create floating leaves and pollen
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'forest-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${Math.random() > 0.5 ? 'rgba(139, 69, 19, 0.6)' : 'rgba(255, 255, 200, 0.4)'};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0%'};
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: fall ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 10}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        document.body.appendChild(particlesContainer);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    addOceanEffects() {
        // Add bioluminescence to cards
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'bioluminescence 3s ease-in-out infinite';
                card.style.animationDelay = `${index * 0.2}s`;
            }, index * 100);
        });
        
        // Add bioluminescence CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bioluminescence {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 245, 255, 0.3); }
                50% { box-shadow: 0 0 40px rgba(0, 245, 255, 0.6), 0 0 60px rgba(0, 200, 255, 0.4); }
            }
        `;
        document.head.appendChild(style);
    }

    addForestEffects() {
        // Add organic shadows to cards
        document.querySelectorAll('.card').forEach(card => {
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        });
    }

    updateThemeToggle(theme) {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;
        
        const toForest = toggleBtn.querySelector('.theme-toggle__to-forest');
        const toOcean = toggleBtn.querySelector('.theme-toggle__to-ocean');
        
        if (theme === 'ocean') {
            toForest.style.display = 'block';
            toOcean.style.display = 'none';
            toggleBtn.setAttribute('title', 'Ocean → Forest');
        } else {
            toForest.style.display = 'none';
            toOcean.style.display = 'block';
            toggleBtn.setAttribute('title', 'Forest → Ocean');
        }
    }

    updateUIElements() {
        // Update navbar, cards, and other UI elements for new theme
        const navbar = document.querySelector('.navbar');
        const cards = document.querySelectorAll('.card');
        
        if (this.currentTheme === 'ocean') {
            navbar?.classList.add('navbar-ocean');
            cards.forEach(card => card.classList.add('card-ocean'));
        } else {
            navbar?.classList.add('navbar-forest');
            cards.forEach(card => card.classList.add('card-forest'));
        }
    }

    applyThemeOptimizations(theme) {
        // Theme-specific performance optimizations
        if (theme === 'ocean') {
            // Reduce particle count for ocean theme
            const particles = document.getElementById('particles');
            if (particles) {
                particles.style.opacity = '0.6';
            }
        } else {
            // Increase performance for forest theme
            const particles = document.getElementById('particles');
            if (particles) {
                particles.style.opacity = '0.3';
            }
        }
    }

    startPageTransition(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'ocean' ? 
                'radial-gradient(circle, rgba(0,245,255,0.8) 0%, rgba(0,0,0,0.9) 100%)' : 
                'radial-gradient(circle, rgba(34,139,34,0.8) 0%, rgba(0,0,0,0.9) 100%)'};
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // Start transition
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Execute callback and complete transition
        setTimeout(() => {
            callback();
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 500);
            }, 100);
        }, 500);
    }

    playTransitionSound() {
        if (!this.audioContext) return;
        
        // Create a simple transition sound using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    toggleLightMode() {
        const root = document.documentElement;
        const isLight = root.classList.contains('light-mode');
        
        if (isLight) {
            root.classList.remove('light-mode');
        } else {
            root.classList.add('light-mode');
        }
        
        localStorage.setItem('placement_os_light_mode', !isLight);
    }

    // Cleanup method
    destroy() {
        this.animations.forEach((animation, key) => {
            cancelAnimationFrame(animation);
        });
        this.animations.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// ================= GLOBAL INITIALIZATION =================
let themeProvider;

document.addEventListener('DOMContentLoaded', () => {
    themeProvider = new ThemeProvider();
    window.themeProvider = themeProvider;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (themeProvider) {
        themeProvider.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeProvider;
}
