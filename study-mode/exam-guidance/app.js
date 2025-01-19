let examCompanion;

// Initialize Lucide icons
lucide.createIcons();

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
    

// Add docx library to the HTML file
// <script src="https://unpkg.com/docx@8.2.3/build/index.js"></script>

class ExamCompanion {
    constructor() {
        this.initializeAnimations();
        this.initializeEventListeners();
    }

    initializeAnimations() {
        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            easing: 'easeOutQuad',
            duration: 800
        });
    }

    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateStrategy());
    }

    async generateStrategy() {
        const examName = document.getElementById('examName').value;
        const timeframe = document.getElementById('timeframe').value;
        const level = document.getElementById('level').value;
        const syllabusLink = document.getElementById('syllabusLink').value;
        const feelings = document.getElementById('feelings').value;

        if (!examName || !timeframe) {
            alert('Please tell us about your exam and timeframe');
            return;
        }

        // Hide the form
        const formSection = document.querySelector('.fade-in');
        formSection.style.display = 'none';

        // Show loading animation
        const loadingHTML = `
            <div id="loadingSection" class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-12 fade-in">
                <div class="flex flex-col items-center justify-center space-y-6">
                    <div class="relative w-32 h-32">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-full h-full border-4 border-zinc-800 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i data-lucide="book-open" class="w-12 h-12 text-zinc-800 animate-pulse"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-semibold text-zinc-800">Creating Your Study Plan</h3>
                    <div class="flex flex-col items-center space-y-2">
                        <p class="text-gray-600 text-center max-w-md">
                            Analyzing your requirements and crafting a personalized strategy...
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

        document.querySelector('.container').insertAdjacentHTML('beforeend', loadingHTML);
        lucide.createIcons();

        try {
            const response = await this.callOpenAI(examName, timeframe, level, syllabusLink, feelings);
            document.getElementById('loadingSection').remove();
            this.displayResults(response, examName, timeframe);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('loadingSection').remove();
            formSection.style.display = 'block';
            alert('Error generating strategy. Please try again.');
        }
    }

    async callOpenAI(examName, timeframe, level, syllabusLink, feelings) {
        const prompt = `Create a detailed study plan for a student preparing for ${examName} with ${timeframe} preparation time. Current level: ${level}. Student's feelings: "${feelings}".

Provide the following sections clearly marked with headers:

1. ENCOURAGEMENT:
A brief, supportive message addressing their feelings and boosting confidence.

2. HIGH PRIORITY TOPICS:
List 3-4 most crucial topics with:
- Topic name
- Why it's important
- Key concepts
- Common mistakes
- Study strategy
- Time needed

3. MEDIUM PRIORITY TOPICS:
List 3-4 topics with:
- Topic name
- Brief overview
- Quick study tips
- Time needed

4. QUICK REVIEW TOPICS:
List 2-3 topics that need only brief review.

5. WEEKLY SCHEDULE:
A clear week-by-week breakdown of what to study.

6. WELLNESS TIPS:
5 specific mental health and study-life balance tips.

Keep each section clearly separated and marked with headers. Use bullet points for lists.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    displayResults(analysis, examName, timeframe) {
        const sections = analysis.split(/\d+\.\s+/);
        
        const resultsHTML = `
            <div id="resultsSection" class="max-w-4xl mx-auto space-y-6">
                <!-- Download Section -->
                <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
                    <button id="saveBtn" 
                            class="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2 mx-auto">
                        <i data-lucide="download" class="w-5 h-5"></i>
                        <span>Save as PNG</span>
                    </button>
                </div>

                <!-- Downloadable Content Wrapper -->
                <div id="downloadContent" class="space-y-6 bg-zinc-50 p-8 rounded-2xl">
                    <!-- Header -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h2 class="text-3xl font-bold text-zinc-900">Study Plan</h2>
                                <p class="text-gray-600 mt-2">${examName} • ${timeframe} preparation time</p>
                            </div>
                        </div>
                        <div class="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <div class="flex items-start gap-3">
                                <i data-lucide="message-circle" class="w-6 h-6 text-blue-600 mt-1"></i>
                                <div class="text-lg text-blue-800 italic">
                                    ${sections[1]?.replace('ENCOURAGEMENT:', '').trim() || 'You can do this!'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- High Priority Topics -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2 text-red-800">
                            <i data-lucide="alert-circle" class="w-6 h-6"></i>
                            High Priority Topics
                        </h3>
                        <div class="space-y-4">
                            ${this.formatPrioritySection(sections[2], 'red')}
                        </div>
                    </div>

                    <!-- Medium Priority Topics -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2 text-yellow-800">
                            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                            Medium Priority Topics
                        </h3>
                        <div class="space-y-4">
                            ${this.formatPrioritySection(sections[3], 'yellow')}
                        </div>
                    </div>

                    <!-- Quick Review Topics -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2 text-green-800">
                            <i data-lucide="check-circle" class="w-6 h-6"></i>
                            Quick Review Topics
                        </h3>
                        <div class="space-y-4">
                            ${this.formatPrioritySection(sections[4], 'green')}
                        </div>
                    </div>

                    <!-- Weekly Schedule -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2">
                            <i data-lucide="calendar" class="w-6 h-6"></i>
                            Weekly Schedule
                        </h3>
                        <div class="space-y-4">
                            ${this.formatSchedule(sections[5])}
                        </div>
                    </div>

                    <!-- Wellness Tips -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2">
                            <i data-lucide="heart" class="w-6 h-6"></i>
                            Wellness Tips
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${this.formatWellnessTips(sections[6])}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.querySelector('.container').insertAdjacentHTML('beforeend', resultsHTML);
        lucide.createIcons();

        // Add event listener for the save button
        document.getElementById('saveBtn').addEventListener('click', async () => {
            const downloadContent = document.getElementById('downloadContent');
            const saveBtn = document.getElementById('saveBtn');
            
            try {
                // Show loading state
                const originalBtnContent = saveBtn.innerHTML;
                saveBtn.innerHTML = `
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span class="ml-2">Generating PNG...</span>
                `;
                saveBtn.disabled = true;

                // Wait for all images to load
                await Promise.all(Array.from(downloadContent.getElementsByTagName('img'))
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
                );

                // Create canvas with better settings
                const canvas = await html2canvas(downloadContent, {
                    backgroundColor: '#fafafa',
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    width: downloadContent.offsetWidth,
                    height: downloadContent.offsetHeight,
                    onclone: (clonedDoc) => {
                        const clonedContent = clonedDoc.getElementById('downloadContent');
                        clonedContent.style.transform = 'none';
                        clonedContent.style.width = `${downloadContent.offsetWidth}px`;
                        clonedContent.style.height = `${downloadContent.offsetHeight}px`;
                        clonedContent.style.position = 'relative';
                        clonedContent.style.display = 'block';
                    }
                });

                // Convert to image and download
                const image = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = image;
                link.download = `Study-Plan-${examName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Reset button state
                saveBtn.innerHTML = originalBtnContent;
                saveBtn.disabled = false;

            } catch (error) {
                console.error('Error generating image:', error);
                alert('Error saving as PNG. Please try again.');
                saveBtn.innerHTML = originalBtnContent;
                saveBtn.disabled = false;
            }
        });

        // Rest of the animation code...
        anime({
            targets: '#resultsSection > div',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutElastic(1, .8)'
        });

        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    formatPrioritySection(section, color) {
        if (!section) return '';
        const lines = section.split('\n').filter(line => line.trim());
        let html = '';
        let currentTopic = '';

        lines.forEach(line => {
            if (line.includes('Topic') || line.includes('TOPICS:')) {
                if (currentTopic) {
                    html += '</div></div>';
                }
                currentTopic = line.replace('Topic:', '').trim();
                html += `
                    <div class="bg-${color}-50 rounded-xl p-6 border border-${color}-100">
                        <h4 class="text-lg font-semibold text-${color}-800 mb-4">${currentTopic}</h4>
                        <div class="space-y-3">
                `;
            } else if (line.trim()) {
                html += `
                    <div class="flex items-start gap-2">
                        <i data-lucide="check" class="w-5 h-5 text-${color}-600 mt-1"></i>
                        <span class="text-${color}-700">${line.trim()}</span>
                    </div>
                `;
            }
        });

        if (currentTopic) {
            html += '</div></div>';
        }

        return html;
    }

    formatSchedule(section) {
        if (!section) return '';
        const lines = section.split('\n').filter(line => line.trim());
        return lines.map(line => `
            <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <i data-lucide="calendar" class="w-5 h-5 text-zinc-600 mt-1"></i>
                <span class="text-zinc-700">${line.trim()}</span>
            </div>
        `).join('');
    }

    formatWellnessTips(section) {
        if (!section) return '';
        const tips = section.split('\n').filter(line => line.trim() && !line.includes('WELLNESS TIPS:'));
        return tips.map(tip => `
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div class="flex items-start gap-2">
                    <i data-lucide="heart" class="w-5 h-5 text-purple-600 mt-1"></i>
                    <span class="text-purple-700">${tip.trim()}</span>
                </div>
            </div>
        `).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.examCompanion = new ExamCompanion(); // Make it globally accessible
}); 