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

let isDrawingMode = false;
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const notesArea = document.getElementById('notesArea');
    const modeToggle = document.getElementById('modeToggle');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = notesArea.offsetWidth;
        canvas.height = notesArea.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing functionality
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function toggleMode() {
        isDrawingMode = !isDrawingMode;
        if (isDrawingMode) {
            notesArea.classList.add('hidden');
            canvas.classList.remove('hidden');
            modeToggle.innerHTML = '<i data-lucide="type" class="w-4 h-4"></i><span>Switch to Text</span>';
        } else {
            notesArea.classList.remove('hidden');
            canvas.classList.add('hidden');
            modeToggle.innerHTML = '<i data-lucide="edit" class="w-4 h-4"></i><span>Switch to Draw</span>';
        }
        lucide.createIcons();
    }

    function downloadNotes() {
        if (isDrawingMode) {
            // Download as PDF if in drawing mode
            const pdf = new jspdf.jsPDF();
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10);
            pdf.save('study-session-notes.pdf');
        } else {
            // Download as text if in text mode
            const notes = document.getElementById('notesArea').value;
            const blob = new Blob([notes], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'study-session-notes.txt';
            a.click();
        }
    }