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
    

class ProblemSolver {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeVoice();
        this.initializeAnimations();
        this.voiceEnabled = false;
        this.problemSolved = false;
        this.originalProblem = '';
    }

    initializeElements() {
        // Input elements
        this.problemText = document.getElementById('problemText');
        this.submitButton = document.getElementById('submitProblem');
        this.voiceToggle = document.getElementById('voiceToggle');
        this.userResponse = document.getElementById('userResponse');
        this.sendResponse = document.getElementById('sendResponse');
        this.chatSection = document.getElementById('chatSection');
        this.chatMessages = document.getElementById('chatMessages');

        // Initialize Lucide icons
        lucide.createIcons();
    }

    initializeEventListeners() {
        this.submitButton.addEventListener('click', () => this.handleProblemSubmission());
        this.voiceToggle.addEventListener('click', () => this.toggleVoice());
        this.sendResponse.addEventListener('click', () => this.handleUserResponse());
        this.userResponse.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserResponse();
            }
        });
    }

    initializeVoice() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.voices = [];
            
            // Wait for voices to be loaded
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis.getVoices();
                // Try to find a female English voice
                this.selectedVoice = this.voices.find(voice => 
                    voice.lang.includes('en') && voice.name.includes('Female')
                ) || this.voices.find(voice => 
                    voice.lang.includes('en')
                ) || this.voices[0];
            };
        } else {
            console.warn('Speech synthesis not supported');
            this.voiceToggle.style.display = 'none';
        }
    }

    initializeAnimations() {
        // Initial fade-in animations
        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuad'
        });
    }

    async handleProblemSubmission() {
        const problem = this.problemText.value.trim();
        if (!problem) {
            alert('Please enter a problem first.');
            return;
        }

        // Store the original problem
        this.originalProblem = problem;

        // Show chat section
        this.chatSection.classList.remove('hidden');
        
        // Add initial messages
        this.addMessage('system', 'I will help guide you through this problem. Let\'s break it down step by step.');
        
        // Get initial analysis from GPT
        await this.getGPTResponse(problem, 'initial');
    }

    async handleUserResponse() {
        const response = this.userResponse.value.trim();
        if (!response) return;

        // Add user message
        this.addMessage('user', response);
        this.userResponse.value = '';

        // Get GPT response
        await this.getGPTResponse(response, 'followup');
    }

    async getGPTResponse(input, type) {
        if (this.problemSolved) return;

        try {
            this.addMessage('system', 'Thinking...', true);

            const prompt = type === 'initial' 
                ? `You are a helpful tutor. For this problem: "${input}". Give ONE clear hint or question in 1-2 complete sentences. Be friendly but concise. Never give the answer.`
                : `You are a helpful tutor. Original problem: "${this.originalProblem}". Student response: "${input}". 
                   First, determine if this is the correct answer. If it is correct, respond with "CORRECT:" followed by a brief congratulatory message.
                   If it's not correct, give brief feedback and ONE follow-up question in 1-2 complete sentences. Never give the answer.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{
                        role: "user",
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 100,
                    stop: ["\n", "\r"]
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            let message = data.choices[0].message.content;

            // Check if the answer is correct
            if (message.startsWith('CORRECT:')) {
                this.problemSolved = true;
                message = message.replace('CORRECT:', '').trim();
                
                // Add celebration animation
                this.celebrateSuccess();
            }

            this.removeLastMessage();
            this.addMessage('system', message);

            if (this.voiceEnabled) {
                this.speak(message);
            }

            // If problem is solved, disable the input
            if (this.problemSolved) {
                this.userResponse.disabled = true;
                this.sendResponse.disabled = true;
                this.userResponse.placeholder = 'Problem solved! Great job! 🎉';
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeLastMessage();
            this.addMessage('system', 'Sorry, I encountered an error. Please try again.');
        }
    }

    celebrateSuccess() {
        // Create celebration particles
        const particles = Array.from({ length: 30 }, () => {
            const particle = document.createElement('div');
            particle.className = 'absolute w-2 h-2 rounded-full';
            particle.style.backgroundColor = ['#FFD700', '#FF6B6B', '#4ECB71'][Math.floor(Math.random() * 3)];
            document.body.appendChild(particle);
            return particle;
        });

        // Animate particles
        anime({
            targets: particles,
            translateX: () => anime.random(-200, 200),
            translateY: () => anime.random(-200, 200),
            scale: [1, 0],
            opacity: [1, 0],
            easing: 'easeOutExpo',
            duration: 1000,
            complete: () => {
                particles.forEach(particle => particle.remove());
            }
        });

        // Add success message with animation
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg';
        successMessage.textContent = '🎉 Great job solving this problem! 🎉';
        document.body.appendChild(successMessage);

        anime({
            targets: successMessage,
            translateY: ['-100%', 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .8)',
            complete: () => {
                setTimeout(() => {
                    anime({
                        targets: successMessage,
                        translateY: [0, '-100%'],
                        opacity: [1, 0],
                        duration: 800,
                        easing: 'easeInExpo',
                        complete: () => successMessage.remove()
                    });
                }, 3000);
            }
        });
    }

    addMessage(type, content, isTemporary = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-bubble ${type} ${isTemporary ? 'temporary' : ''} 
                              p-4 rounded-lg ${type === 'user' ? 'bg-zinc-800 text-white ml-auto' : 'bg-white'} 
                              shadow-lg max-w-[80%] ${type === 'user' ? 'ml-auto' : 'mr-auto'}
                              text-sm leading-relaxed`; // Smaller text and tighter leading
        messageDiv.textContent = content;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Animate message
        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateX: type === 'user' ? [20, 0] : [-20, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }

    removeLastMessage() {
        const lastMessage = this.chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('temporary')) {
            this.chatMessages.removeChild(lastMessage);
        }
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.voiceToggle.classList.toggle('bg-zinc-200');
        
        // Add visual feedback
        const message = this.voiceEnabled ? 
            'Voice feedback enabled.' : 
            'Voice feedback disabled.';
            
        this.addMessage('system', message, true);
        setTimeout(() => this.removeLastMessage(), 2000);

        // Animate voice toggle button
        anime({
            targets: this.voiceToggle,
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }

    async speak(text) {
        if (!this.voiceEnabled || !this.synthesis) return;

        try {
            // Stop any current speech
            this.synthesis.cancel();

            // Show speaking indicator
            const speakingIndicator = document.createElement('div');
            speakingIndicator.className = 'fixed bottom-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-full flex items-center space-x-2';
            speakingIndicator.innerHTML = `
                <i data-lucide="volume-2" class="w-4 h-4"></i>
                <span>Speaking...</span>
            `;
            document.body.appendChild(speakingIndicator);
            lucide.createIcons();

            // Animate speaking indicator
            anime({
                targets: speakingIndicator,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });

            // Create and configure utterance
            const utterance = new SpeechSynthesisUtterance(text);
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Handle speech end
            utterance.onend = () => {
                anime({
                    targets: speakingIndicator,
                    opacity: 0,
                    translateY: 10,
                    duration: 300,
                    easing: 'easeInQuad',
                    complete: () => {
                        document.body.removeChild(speakingIndicator);
                    }
                });
            };

            // Start speaking
            this.synthesis.speak(utterance);

        } catch (error) {
            console.error('Speech Error:', error);
            this.addMessage('system', 'Sorry, there was an error with the voice feedback.', true);
            setTimeout(() => this.removeLastMessage(), 3000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProblemSolver();
}); 