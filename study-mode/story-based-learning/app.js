class StoryLearning {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeAnimations();
        this.createClouds();
        this.lastGeneratedStory = null;
    }

    initializeElements() {
        this.storyForm = document.getElementById('storyForm');
        this.storyDisplay = document.getElementById('storyDisplay');
        this.storyContent = document.getElementById('storyContent');
        
        // Initialize Lucide icons
        lucide.createIcons();
    }

    initializeEventListeners() {
        this.storyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateStory();
        });
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

    createClouds() {
        const cloudsContainer = document.getElementById('clouds');
        const numClouds = 10;

        for (let i = 0; i < numClouds; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.width = Math.random() * 100 + 50 + 'px';
            cloud.style.height = Math.random() * 40 + 20 + 'px';
            cloud.style.left = Math.random() * 100 + 'vw';
            cloud.style.top = Math.random() * 100 + 'vh';

            cloudsContainer.appendChild(cloud);

            // Animate cloud
            anime({
                targets: cloud,
                translateX: [
                    { value: -100, duration: Math.random() * 5000 + 5000 },
                    { value: 100, duration: Math.random() * 5000 + 5000 }
                ],
                translateY: [
                    { value: -20, duration: Math.random() * 2000 + 2000 },
                    { value: 20, duration: Math.random() * 2000 + 2000 }
                ],
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutQuad'
            });
        }
    }

    formatText(text) {
        return text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            // Underline
            .replace(/__(.*?)__/g, '<u>$1</u>')
            // Highlight
            .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 rounded px-1">$1</mark>')
            // Superscript
            .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
            // Subscript
            .replace(/~(.*?)~/g, '<sub>$1</sub>')
            // Code/Mathematical expressions
            .replace(/`(.*?)`/g, '<code class="bg-zinc-100 rounded px-1">$1</code>');
    }

    async generateStory() {
        const topic = document.getElementById('topic').value;
        const genre = document.getElementById('genre').value;
        const length = document.getElementById('length').value;

        if (!topic) {
            alert('Please enter a topic');
            return;
        }

        // Show loading state
        const submitButton = this.storyForm.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        submitButton.innerHTML = `
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span class="ml-2">Creating your story...</span>
        `;
        submitButton.disabled = true;

        try {
            const prompt = `Create an educational story about ${topic} in the ${genre} genre. 
                          Make it a ${length} story. Format it with clear paragraphs. 
                          Make it engaging and ensure it teaches the key concepts of ${topic}.
                          Include a title at the start.
                          Use markdown-style formatting:
                          - Use **text** for important terms and key concepts
                          - Use *text* for emphasis
                          - Use __text__ for underlining important points
                          - Use ==text== for highlighting key facts
                          - Use \`text\` for mathematical expressions or code
                          - Use ^text^ for superscript
                          - Use ~text~ for subscript`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer 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`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{
                        role: "user",
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) throw new Error('Failed to generate story');

            const data = await response.json();
            const story = data.choices[0].message.content;
            this.lastGeneratedStory = story;

            // Display the story
            this.displayStory(story);

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating story. Please try again.');
        } finally {
            submitButton.innerHTML = originalButtonContent;
            submitButton.disabled = false;
        }
    }

    displayStory(story) {
        // Split story into paragraphs and add formatting
        const paragraphs = story.split('\n\n').filter(p => p.trim());
        this.storyContent.innerHTML = paragraphs
            .map(p => `<p class="mb-4">${this.formatText(p)}</p>`)
            .join('');

        // Show story display
        this.storyDisplay.classList.remove('hidden');

        // Scroll to story
        this.storyDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async downloadStory() {
        if (!this.lastGeneratedStory) return;

        try {
            // Create a temporary container with the same styling as the story display
            const container = document.createElement('div');
            container.className = 'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8';
            container.style.width = '800px';
            container.style.margin = '20px';
            container.style.background = 'white';
            
            // Add the formatted story content
            container.innerHTML = this.lastGeneratedStory
                .split('\n\n')
                .map(p => `<p class="mb-4">${this.formatText(p)}</p>`)
                .join('');

            // Temporarily add to document (hidden)
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            // Use html2canvas to create image
            const canvas = await html2canvas(container, {
                scale: 2, // Higher resolution
                backgroundColor: 'white',
                logging: false,
                useCORS: true
            });

            // Remove temporary container
            document.body.removeChild(container);

            // Create download link
            const link = document.createElement('a');
            link.download = 'educational-story.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error downloading story. Please try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.storyLearning = new StoryLearning();
});
