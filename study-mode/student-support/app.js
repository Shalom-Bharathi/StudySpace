class SupportHub {
    constructor() {
        this.initializeElements();
        this.initializeParticles();
        this.initializeAnimations();
    }

    initializeElements() {
        lucide.createIcons();
    }

    initializeParticles() {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#e2e8f0' },
                shape: { type: 'circle' },
                opacity: {
                    value: 0.5,
                    random: false,
                    animation: { enable: false }
                },
                size: {
                    value: 3,
                    random: true,
                    animation: { enable: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#e2e8f0',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: false },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 }
                }
            },
            retina_detect: true
        });
    }

    initializeAnimations() {
        anime({
            targets: '.fade-up',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuad'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.supportHub = new SupportHub();
});