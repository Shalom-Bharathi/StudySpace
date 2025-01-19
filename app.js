// Initialize Lucide icons
lucide.createIcons();

// Mobile menu functionality
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
let isMenuOpen = false;

menuButton.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle('hidden');
    menuButton.innerHTML = isMenuOpen 
        ? '<i data-lucide="x" class="h-5 w-5"></i>' 
        : '<i data-lucide="menu" class="h-5 w-5"></i>';
    lucide.createIcons();
});

// Hero section animations
document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animations
    const heroContent = document.querySelector('#heroContent');
    const heroElements = heroContent.children;
    
    gsap.to(heroContent, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    });

    gsap.from(heroElements, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Scroll-based animations for sections
    gsap.utils.toArray('section').forEach((section, i) => {
        // Content animation
        const content = section.children[0];
        const elements = content.children;

        gsap.from(elements, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Enhanced card hover animations with optimized performance
    const cards = document.querySelectorAll('.bg-white.p-6, .bg-white.p-8');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -5,
                scale: 1.01,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    });
});

// Tab functionality
const tabButtons = document.querySelectorAll('[data-tab]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.querySelector(`[data-tab-content="${target}"]`).classList.add('active');
    });
});

// Update current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollBy({
                top: offsetPosition,
                behavior: 'auto'
            });
            
            // Close mobile menu if open
            if (isMenuOpen) {
                isMenuOpen = false;
                mobileMenu.classList.add('hidden');
                menuButton.innerHTML = '<i data-lucide="menu" class="h-5 w-5"></i>';
                lucide.createIcons();
            }
        }
    });
});

// Form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted:', e.target.id);
    });
});

// Pricing hover effects
const pricingCards = document.querySelectorAll('#pricing .bg-white');
pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -10,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Initialize all icons after dynamic content updates
lucide.createIcons(); 

// Enhanced scroll animations for sections
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    gsap.from(section.children, {
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
    });
}); 