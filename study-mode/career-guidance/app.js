lucide.createIcons();

class CareerCompass {
    constructor() {
        this.currentStep = 1;
        this.selectedSkills = new Set();
        this.selectedPersonality = null;
        this.initializeUI();
        this.initializeAnimations();
    }

    initializeUI() {
        // Skills data
        const skills = [
            'Problem Solving', 'Creativity', 'Communication', 'Leadership',
            'Technical', 'Analytical', 'Design', 'Research', 'Writing',
            'Organization', 'Teaching', 'Empathy', 'Decision Making',
            'Critical Thinking', 'Adaptability', 'Innovation'
        ];

        // Personality types
        const personalities = [
            { type: 'Innovator', desc: 'You love creating new solutions and thinking outside the box' },
            { type: 'Analyzer', desc: 'You excel at breaking down complex problems and finding patterns' },
            { type: 'Leader', desc: 'You naturally guide and inspire others towards common goals' },
            { type: 'Collaborator', desc: 'You thrive in team settings and build strong relationships' }
        ];

        // Populate skills
        const skillsContainer = document.getElementById('skillsTags');
        skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200';
            tag.textContent = skill;
            tag.onclick = () => this.toggleSkill(tag, skill);
            skillsContainer.appendChild(tag);
        });

        // Populate personality cards
        const personalityContainer = document.getElementById('personalityCards');
        personalities.forEach(p => {
            const card = document.createElement('div');
            card.className = 'personality-card p-6 bg-gray-50 rounded-xl border border-gray-200';
            card.innerHTML = `
                <h3 class="text-xl font-semibold mb-2">${p.type}</h3>
                <p class="text-gray-600">${p.desc}</p>
            `;
            card.onclick = () => this.selectPersonality(card, p.type);
            personalityContainer.appendChild(card);
        });

        // Navigation buttons
        document.getElementById('nextBtn').onclick = () => this.nextStep();
        document.getElementById('prevBtn').onclick = () => this.previousStep();
    }

    initializeAnimations() {
        // Particles background
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#6B7280' },
                shape: { type: 'circle' },
                opacity: { value: 0.1, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#6B7280', opacity: 0.1, width: 1 },
                move: { enable: true, speed: 2, direction: 'none', random: false, straight: false }
            }
        });

        // Initial animations
        anime({
            targets: '.fade-up',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutElastic(1, .8)'
        });

        anime({
            targets: '.slide-in',
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 800,
            delay: 300,
            easing: 'easeOutElastic(1, .8)'
        });

        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutQuad'
        });
    }

    toggleSkill(element, skill) {
        if (this.selectedSkills.has(skill)) {
            this.selectedSkills.delete(skill);
            element.classList.remove('selected');
        } else if (this.selectedSkills.size < 5) {
            this.selectedSkills.add(skill);
            element.classList.add('selected');
        }
    }

    selectPersonality(element, type) {
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedPersonality = type;
    }

    updateProgress() {
        const progress = ((this.currentStep - 1) / 3) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    async nextStep() {
        if (this.currentStep === 1 && this.selectedSkills.size === 0) {
            alert('Please select at least one skill');
            return;
        }
        if (this.currentStep === 2 && !this.selectedPersonality) {
            alert('Please select a personality type');
            return;
        }

        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateUI();
        } else {
            await this.generateResults();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    updateUI() {
        const steps = ['skillsStep', 'personalityStep', 'goalsStep'];
        steps.forEach((step, index) => {
            document.getElementById(step).classList.toggle('hidden', index + 1 !== this.currentStep);
        });

        document.getElementById('prevBtn').classList.toggle('hidden', this.currentStep === 1);
        document.getElementById('nextBtn').textContent = this.currentStep === 3 ? 'Generate Analysis' : 'Next';
        
        this.updateProgress();
    }

    async generateResults() {
        // Hide the main form section
        document.querySelector('.slide-in').classList.add('hidden');
        
        // Show loading screen with improved animation
        const loadingHTML = `
            <div id="loadingSection" class="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 mb-8 slide-in">
                <div class="flex flex-col items-center justify-center space-y-6">
                    <div class="relative w-32 h-32">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-full h-full border-4 border-zinc-800 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i data-lucide="briefcase" class="w-12 h-12 text-zinc-800 animate-pulse"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-semibold text-zinc-800">Analyzing Your Profile</h3>
                    <div class="flex flex-col items-center space-y-2">
                        <p class="text-gray-600 text-center max-w-md">
                            We're crafting personalized career recommendations based on your unique profile
                        </p>
                        <div class="flex space-x-2 text-2xl text-zinc-800">
                            <span class="animate-bounce delay-0">.</span>
                            <span class="animate-bounce delay-150">.</span>
                            <span class="animate-bounce delay-300">.</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.querySelector('.max-w-4xl').insertAdjacentHTML('beforeend', loadingHTML);
        lucide.createIcons();

        const goals = {
            workLifeBalance: document.getElementById('balanceSlider').value,
            stability: document.getElementById('stabilitySlider').value,
            workStyle: document.getElementById('workStyleSlider').value
        };

        const prompt = `Based on the following profile:
            Skills: ${Array.from(this.selectedSkills).join(', ')}
            Personality Type: ${this.selectedPersonality}
            Preferences:
            - Work-Life Balance vs Career Growth: ${goals.workLifeBalance}/5
            - Stability vs Innovation: ${goals.stability}/5
            - Individual vs Team Work: ${goals.workStyle}/5

            Provide a detailed career analysis with:
            1. Top 3 recommended career paths that match this profile (List each with a brief description)
            2. Required skills and qualifications for each path (List as bullet points)
            3. Growth opportunities and potential challenges (Separate into two sections)
            4. Industry outlook and future trends (List as bullet points)

            Format the response in clear sections with bullet points and keep it concise.
            Do not use JSON format. Use plain text with clear section headers and bullet points.`;

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer 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`
                    },
                    body: JSON.stringify({
                    model: "gpt-4",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });

                const data = await response.json();
            const analysis = data.choices[0].message.content;

            // Remove loading section
            document.getElementById('loadingSection').remove();

            // Create and show results page
            const resultsHTML = `
                <div id="resultsSection" class="space-y-6 fade-in">
                    <!-- Profile Summary Card -->
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h2 class="text-3xl font-bold text-zinc-900">Career Analysis</h2>
                                <p class="text-gray-600 mt-2">Based on your unique profile and preferences</p>
                            </div>
                            <button id="startOverBtn" class="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                                <i data-lucide="refresh-ccw" class="w-4 h-4"></i>
                                Start Over
                            </button>
                        </div>

                        <!-- Profile Summary -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center gap-2 text-zinc-800 font-semibold mb-2">
                                    <i data-lucide="award" class="w-5 h-5"></i>
                                    Selected Skills
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${Array.from(this.selectedSkills).map(skill => 
                                        `<span class="px-2 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200">${skill}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center gap-2 text-zinc-800 font-semibold mb-2">
                                    <i data-lucide="user" class="w-5 h-5"></i>
                                    Personality Type
                                </div>
                                <span class="text-gray-600">${this.selectedPersonality}</span>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center gap-2 text-zinc-800 font-semibold mb-2">
                                    <i data-lucide="target" class="w-5 h-5"></i>
                                    Key Preferences
                                </div>
                                <div class="space-y-1 text-sm text-gray-600">
                                    <div>Work-Life Balance: ${goals.workLifeBalance}/5</div>
                                    <div>Innovation Level: ${goals.stability}/5</div>
                                    <div>Team Orientation: ${goals.workStyle}/5</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Career Paths Analysis -->
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        <div class="prose prose-zinc max-w-none">
                            ${this.formatAnalysis(analysis)}
                        </div>
                    </div>

                    <!-- Download Section -->
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                        <button onclick="window.print()" class="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2 mx-auto">
                            <i data-lucide="download" class="w-5 h-5"></i>
                            Save Analysis
                        </button>
                    </div>
                </div>
            `;

            document.querySelector('.max-w-4xl').insertAdjacentHTML('beforeend', resultsHTML);
            
            // Initialize new Lucide icons
            lucide.createIcons();

            // Add start over functionality
            document.getElementById('startOverBtn').addEventListener('click', () => {
                window.location.reload();
            });

            // Animate results
                anime({
                targets: '#resultsSection > div',
                    opacity: [0, 1],
                    translateY: [20, 0],
                delay: anime.stagger(200),
                    duration: 800,
                    easing: 'easeOutElastic(1, .8)'
                });

            } catch (error) {
                console.error('Error:', error);
            // Remove loading section and show error
            document.getElementById('loadingSection').remove();
            document.querySelector('.slide-in').classList.remove('hidden');
            alert('Sorry, there was an error generating your career analysis. Please try again.');
        }
    }

    formatAnalysis(analysis) {
        const sections = analysis.split('\n\n');
        let formattedHTML = '';

        sections.forEach(section => {
            if (section.includes('1. Top 3')) {
                formattedHTML += `
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                            <i data-lucide="map" class="w-6 h-6"></i>
                            Recommended Career Paths
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${this.formatCareerPaths(section)}
                        </div>
                    </div>`;
            } else if (section.includes('2. Required skills')) {
                formattedHTML += `
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                            <i data-lucide="tool" class="w-6 h-6"></i>
                            Skills & Qualifications
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-6">
                            ${this.formatBulletPoints(section)}
                        </div>
                    </div>`;
            } else if (section.includes('3. Growth opportunities')) {
                formattedHTML += `
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-6 h-6"></i>
                            Growth & Challenges
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${this.formatOpportunities(section)}
                        </div>
                    </div>`;
            } else if (section.includes('4. Industry outlook')) {
                formattedHTML += `
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                            <i data-lucide="bar-chart" class="w-6 h-6"></i>
                            Industry Outlook
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-6">
                            ${this.formatBulletPoints(section)}
                        </div>
                    </div>`;
            }
        });

        return formattedHTML;
    }

    formatCareerPaths(section) {
        const paths = section.split('\n').filter(line => line.trim() && !line.includes('1. Top 3'));
        return paths.map(path => `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 class="font-semibold text-zinc-800 mb-2">${path.split(':')[0]}</h4>
                <p class="text-gray-600 text-sm">${path.split(':')[1] || ''}</p>
            </div>
        `).join('');
    }

    formatBulletPoints(section) {
        return section
            .split('\n')
            .filter(line => line.trim() && !line.includes('2. Required') && !line.includes('4. Industry'))
            .map(line => `<div class="flex items-start gap-2 mb-2">
                <i data-lucide="check" class="w-5 h-5 text-zinc-600 mt-1"></i>
                <span class="text-gray-600">${line.trim()}</span>
            </div>`)
            .join('');
    }

    formatOpportunities(section) {
        const [opportunities, challenges] = section.split('Challenges:');
        return `
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 class="font-semibold text-green-800 mb-2">Opportunities</h4>
                ${opportunities.split('\n')
                    .filter(line => line.trim() && !line.includes('3. Growth'))
                    .map(line => `<div class="flex items-start gap-2 mb-2">
                        <i data-lucide="plus" class="w-4 h-4 text-green-600 mt-1"></i>
                        <span class="text-green-700 text-sm">${line.trim()}</span>
                    </div>`)
                    .join('')}
            </div>
            <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 class="font-semibold text-amber-800 mb-2">Challenges</h4>
                ${(challenges || '').split('\n')
                    .filter(line => line.trim())
                    .map(line => `<div class="flex items-start gap-2 mb-2">
                        <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 mt-1"></i>
                        <span class="text-amber-700 text-sm">${line.trim()}</span>
                    </div>`)
                    .join('')}
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CareerCompass();
        });