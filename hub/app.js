
        // Study modes data
const studyModes = [
    { 
        icon: 'book', 
        title: 'Customized Quizzes', 
        description: 'Tailored quizzes based on your learning progress',
        path: '../study-mode/quiz/index.html'
    },
    { icon: 'message-square', title: 'Interactive Sessions', description: 'Engage in dynamic, AI-guided study sessions', path: '../study-mode/interactive-sessions/index.html' },
    { icon: 'file-text', title: 'Problem Breakdown', description: 'Step-by-step explanations for complex problems', path: '../study-mode/problem-solver/index.html' },
    { icon: 'help-circle', title: 'Doubt Clearing', description: 'Get instant clarification on your doubts', path: '../study-mode/doubt-clearing/index.html' },
    { icon: 'search', title: 'Formula Hunt', description: 'Find formulas, understand their derivations, and see practical examples', path: '../study-mode/formula-hunt/index.html' },
    { icon: 'languages', title: 'Language Translation', description: 'Translate and explain concepts in multiple languages', path: '../study-mode/language-translation/index.html' },
    { icon: 'book-open', title: 'Interactive Story-based Learning', description: 'Learn through immersive, interactive stories', path: '../study-mode/story-based-learning/index.html' },
    { icon: 'award', title: 'Exam Strategy and Tips', description: 'Expert advice on exam preparation and techniques', path: '../study-mode/exam-guidance/index.html' },
    { 
        icon: 'compass', 
        title: 'Career Guidance', 
        description: 'Get personalized career advice and explore future paths',
        path: '../study-mode/career-guidance/index.html'
    },
    { 
        icon: 'heart', 
        title: 'Student Support & Therapy', 
        description: 'Confidential support for academic and personal well-being',
        path: '../study-mode/student-support/index.html'
    },
];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons
    lucide.createIcons();

    // Initialize header animation
    const header = document.getElementById('header');
    if (header) {
        header.style.opacity = '1';
        header.style.transition = 'opacity 0.5s ease-in-out';
    }

    // Initialize title animation
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.style.opacity = '1';
        pageTitle.style.transition = 'opacity 0.5s ease-in-out';
    }

    // Initialize search container animation
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
        searchContainer.style.opacity = '1';
        searchContainer.style.transition = 'opacity 0.5s ease-in-out';
    }

    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterStudyModes(e.target.value.trim());
        });
    }

    // Initial render of study modes
    filterStudyModes();

    // Update current year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Create and render study mode card
function createStudyCard(mode) {
    const card = document.createElement('div');
    card.className = 'study-card cursor-pointer border border-zinc-200 hover:border-zinc-400 hover:bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ';
    
    // Add click event listener
    card.addEventListener('click', () => {
        window.location.href = mode.path;
    });

    card.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center">
            <div class="w-12 h-12 mb-4 flex items-center justify-center">
                <i data-lucide="${mode.icon}" class="w-full h-full text-zinc-700"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">${mode.title}</h2>
            <p class="text-sm text-zinc-600">${mode.description}</p>
        </div>
    `;
    return card;
}

// Filter and render study modes
function filterStudyModes(searchTerm = '') {
    const studyModesContainer = document.getElementById('studyModes');
    const noResults = document.getElementById('noResults');
    
    if (!studyModesContainer) return;
    
    // Clear existing cards
    studyModesContainer.innerHTML = '';
    
    // Filter study modes based on search term
    const filteredModes = studyModes.filter(mode => 
        mode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mode.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredModes.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
    } else {
        if (noResults) noResults.classList.add('hidden');
        
        // Create and append cards for filtered modes
        filteredModes.forEach((mode, index) => {
            const card = createStudyCard(mode);
            studyModesContainer.appendChild(card);
            
            // Animate card entrance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Initialize icons for new cards
        lucide.createIcons();
    }
} 
