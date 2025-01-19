let API_KEY;
let thingsRefx;
let unsubscribex;
let db = firebase.firestore();
thingsRefx = db.collection('API');

unsubscribex = thingsRefx.onSnapshot(querySnapshot => {
  querySnapshot.docs.forEach(doc => {
    API_KEY = doc.data().API;
  });
});
    

class DoubtClearingHub {
    constructor() {
        this.selectedSubject = null;
        this.isRecording = false;
        this.recognition = null;
        this.initializeElements();
        this.initializeParticles();
        this.initializeAnimations();
        this.initializeSpeechRecognition();
        this.setupEventListeners();
    }

    initializeElements() {
        lucide.createIcons();
        this.elements = {
            questionInput: document.getElementById('questionInput'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            submitBtn: document.getElementById('submitQuestion'),
            subjectTags: document.getElementById('subjectTags'),
            loadingState: document.getElementById('loadingState'),
            resultsSection: document.getElementById('resultsSection'),
            understandingText: document.getElementById('understandingText'),
            stepsContainer: document.getElementById('stepsContainer'),
            resourcesList: document.getElementById('resourcesList'),
            practiceQuestions: document.getElementById('practiceQuestions'),
            helpfulBtn: document.getElementById('helpfulBtn'),
            notHelpfulBtn: document.getElementById('notHelpfulBtn')
        };
    }

    initializeParticles() {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#e2e8f0' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
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
                    straight: false
                }
            }
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

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.questionInput.value = transcript;
                this.toggleRecording();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.toggleRecording();
            };
        }
    }

    setupEventListeners() {
        // Voice input button
        this.elements.voiceInputBtn.addEventListener('click', () => this.toggleRecording());

        // Subject tags
        this.elements.subjectTags.addEventListener('click', (e) => {
            if (e.target.dataset.subject) {
                this.selectSubject(e.target);
            }
        });

        // Submit button
        this.elements.submitBtn.addEventListener('click', () => this.handleSubmit());

        // Feedback buttons
        this.elements.helpfulBtn.addEventListener('click', () => this.handleFeedback(true));
        this.elements.notHelpfulBtn.addEventListener('click', () => this.handleFeedback(false));
    }

    toggleRecording() {
        if (!this.recognition) return;

        if (this.isRecording) {
            this.recognition.stop();
            this.elements.voiceInputBtn.innerHTML = '<i data-lucide="mic" class="w-5 h-5"></i>';
        } else {
            this.recognition.start();
            this.elements.voiceInputBtn.innerHTML = '<i data-lucide="mic-off" class="w-5 h-5"></i>';
        }
        this.isRecording = !this.isRecording;
        lucide.createIcons();
    }

    selectSubject(element) {
        document.querySelectorAll('[data-subject]').forEach(btn => {
            btn.classList.remove('bg-zinc-800', 'text-white');
            btn.classList.add('text-zinc-600');
        });
        element.classList.remove('text-zinc-600');
        element.classList.add('bg-zinc-800', 'text-white');
        this.selectedSubject = element.dataset.subject;
    }

    async handleSubmit() {
        const question = this.elements.questionInput.value.trim();
        if (!question) {
            alert('Please enter your question');
            return;
        }

        this.showLoading();

        const includeVisuals = document.getElementById('includeVisuals').checked;
        const includeExamples = document.getElementById('includeExamples').checked;
        const stepByStep = document.getElementById('stepByStep').checked;

        const prompt = `As an expert tutor, help with this ${this.selectedSubject || ''} question: "${question}"
        ${stepByStep ? '\nProvide a step-by-step explanation' : ''}
        ${includeExamples ? '\nInclude practical examples' : ''}
        ${includeVisuals ? '\nDescribe visual representations where applicable' : ''}

        Format the response with these sections:
        1. UNDERSTANDING: A brief restatement of the question and key concepts involved
        2. EXPLANATION: Clear steps or concepts broken down
        3. EXAMPLES: Practical applications or similar problems
        4. RESOURCES: Suggested learning materials or references
        5. PRACTICE: 2-3 related practice questions with solutions

        Use markdown formatting for better readability.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            this.displayResults(data.choices[0].message.content);
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating explanation. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.resultsSection.classList.add('hidden');
    }

    hideLoading() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.resultsSection.classList.remove('hidden');
    }

    displayResults(content) {
        // Clean up markdown syntax and normalize content
        content = content.replace(/#{1,6}\s/g, '').trim();
        const sections = content.split(/\d+\.\s+/).filter(Boolean);
        
        // Understanding section
        const understanding = sections[0]?.trim();
        if (understanding) {
            this.elements.understandingText.innerHTML = this.formatMarkdown(understanding);
            this.elements.understandingText.closest('.bg-white').style.display = 'block';
        } else {
            this.elements.understandingText.closest('.bg-white').style.display = 'none';
        }

        // Steps section
        const steps = sections[1]?.split('\n').filter(step => step.trim()) || [];
        if (steps.length > 0) {
            this.elements.stepsContainer.innerHTML = steps.map((step, index) => `
                <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 step-card">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <span class="text-blue-600 font-semibold">${index + 1}</span>
                        </div>
                        <div class="flex-grow">
                            ${this.formatMarkdown(step.replace(/^[-*]\s/, ''))}
                        </div>
                    </div>
                </div>
            `).join('');
            this.elements.stepsContainer.style.display = 'block';
        } else {
            this.elements.stepsContainer.style.display = 'none';
        }

        // Examples section
        const examples = sections[2]?.split('\n').filter(example => example.trim().replace(/^[-*]\s/, '')) || [];
        const resourcesSection = this.elements.resourcesList.closest('.bg-white');
        if (examples.length > 0) {
            this.elements.resourcesList.innerHTML = examples.map(example => `
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div class="flex items-start gap-2">
                        <i data-lucide="book-open" class="w-5 h-5 text-purple-600 mt-1"></i>
                        <span class="text-zinc-600">${this.formatMarkdown(example.replace(/^[-*]\s/, ''))}</span>
                    </div>
                </div>
            `).join('');
            resourcesSection.style.display = 'block';
        } else {
            resourcesSection.style.display = 'none';
        }

        // Practice questions
        const questions = sections[4]?.split('\n').filter(q => q.trim().replace(/^[-*]\s/, '')) || [];
        const practiceSection = this.elements.practiceQuestions.closest('.bg-white');
        if (questions.length > 0) {
            this.elements.practiceQuestions.innerHTML = questions.map(question => `
                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div class="prose prose-zinc max-w-none">
                        ${this.formatMarkdown(question.replace(/^[-*]\s/, ''))}
                    </div>
                </div>
            `).join('');
            practiceSection.style.display = 'block';
        } else {
            practiceSection.style.display = 'none';
        }

        // Initialize syntax highlighting
        Prism.highlightAll();
        
        // Reinitialize icons
        lucide.createIcons();

        // Animate only visible results
        anime({
            targets: '#resultsSection > div:not([style*="display: none"])',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    formatMarkdown(text) {
        // Clean up markdown syntax and normalize text
        return text
            .replace(/^[-*]\s/gm, '') // Remove list markers
            .replace(/#{1,6}\s/g, '') // Remove header markers
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `
                <pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>
            `)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>')
            .replace(/\n/g, '<br>')
            .trim();
    }

    handleFeedback(isHelpful) {
        const button = isHelpful ? this.elements.helpfulBtn : this.elements.notHelpfulBtn;
        const otherButton = isHelpful ? this.elements.notHelpfulBtn : this.elements.helpfulBtn;
        
        button.classList.add(isHelpful ? 'bg-green-100' : 'bg-red-100');
        otherButton.classList.remove(isHelpful ? 'bg-red-100' : 'bg-green-100');
        
        // Animate the button
        anime({
            targets: button,
            scale: [1, 1.1, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doubtClearingHub = new DoubtClearingHub();
}); 