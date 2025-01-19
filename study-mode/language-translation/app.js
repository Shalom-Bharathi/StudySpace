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
    


const languages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'es', name: 'Spanish', voice: 'es-ES' },
    { code: 'fr', name: 'French', voice: 'fr-FR' },
    { code: 'de', name: 'German', voice: 'de-DE' },
    { code: 'it', name: 'Italian', voice: 'it-IT' },
    { code: 'pt', name: 'Portuguese', voice: 'pt-PT' },
    { code: 'nl', name: 'Dutch', voice: 'nl-NL' },
    { code: 'ru', name: 'Russian', voice: 'ru-RU' },
    { code: 'ja', name: 'Japanese', voice: 'ja-JP' },
    { code: 'ko', name: 'Korean', voice: 'ko-KR' },
    { code: 'zh', name: 'Chinese', voice: 'zh-CN' },
    { code: 'ar', name: 'Arabic', voice: 'ar-SA' }
];

class Translator {
    constructor() {
        this.sourceLanguageSelect = document.getElementById('sourceLanguage');
        this.targetLanguageSelect = document.getElementById('targetLanguage');
        this.sourceText = document.getElementById('sourceText');
        this.translateBtn = document.getElementById('translateBtn');
        this.translationResult = document.getElementById('translationResult');
        this.translatedText = document.getElementById('translatedText');
        this.loadingState = document.getElementById('loadingState');
        this.micButton = document.getElementById('micButton');
        
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = window.speechSynthesis.getVoices();
        };
        
        this.initializeLanguages();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.sourceText.value = transcript;
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.micButton.classList.remove('recording');
            };
            
            this.recognition.onend = () => {
                this.micButton.classList.remove('recording');
            };
        } else {
            this.micButton.style.display = 'none';
        }
    }

    initializeLanguages() {
        languages.forEach(lang => {
            this.sourceLanguageSelect.add(new Option(lang.name, lang.code));
            this.targetLanguageSelect.add(new Option(lang.name, lang.code));
        });

        // Set default languages
        this.sourceLanguageSelect.value = 'en';
        this.targetLanguageSelect.value = 'es';
    }

    initializeEventListeners() {
        this.translateBtn.addEventListener('click', () => this.translate());
    }

    showLoading() {
        this.loadingState.classList.remove('hidden');
        this.translationResult.classList.add('hidden');
    }

    hideLoading() {
        this.loadingState.classList.add('hidden');
    }

    async translate() {
        const text = this.sourceText.value.trim();
        if (!text) {
            alert('Please enter text to translate');
            return;
        }

        this.showLoading();

        try {
            const result = await this.callTranslationAPI(
                text,
                this.sourceLanguageSelect.value,
                this.targetLanguageSelect.value
            );

            this.displayTranslation(result);
        } catch (error) {
            console.error('Translation error:', error);
            alert('An error occurred during translation');
        } finally {
            this.hideLoading();
        }
    }

    async callTranslationAPI(text, sourceLang, targetLang) {
        const prompt = `Translate this text from ${sourceLang} to ${targetLang}. Return a JSON object with these fields:
1. "translation": the translated text in ${targetLang}
2. "explanations": array of English explanations for each word/phrase
3. "pronunciation": array of English phonetic pronunciation guides for each word/phrase
4. "literal": array of literal English translations for each word/phrase

Example format: {
    "translation": "hola mundo",
    "explanations": ["a greeting used to say hello", "the earth, planet, or everything around us"],
    "pronunciation": ["oh-lah", "moon-doh"],
    "literal": ["hello", "world"]
}

Text to translate: ${text}`;

        try {
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
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('Translation API error');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            try {
                return JSON.parse(content);
            } catch (e) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    displayTranslation(result) {
        try {
            const translation = result.translation || '';
            const explanations = result.explanations || [];
            const pronunciations = result.pronunciation || [];
            const literals = result.literal || [];
            
            const words = translation.split(' ');
            
            // Create the word-by-word translation with meanings
            const wordByWordHtml = words.map((word, index) => {
                const explanation = explanations[index] || '';
                const pronunciation = pronunciations[index] || '';
                const literal = literals[index] || '';
                
                return `
                    <div class="translated-word-container inline-block m-1">
                        <span class="translated-word text-lg relative group">
                            ${word}
                            <div class="word-tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                      bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50
                                      w-max max-w-xs">
                                ${explanation}
                                ${pronunciation ? `<div class="text-gray-300 text-sm mt-1">Pronunciation: ${pronunciation}</div>` : ''}
                                ${literal ? `<div class="text-gray-300 text-sm mt-1">Literal: ${literal}</div>` : ''}
                            </div>
                        </span>
                        <button onclick="translator.speakWord('${word}')" 
                                class="ml-1 p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                            <i data-lucide="volume-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
            }).join(' ');

            // Full translation section for easy copying
            const fullTranslationHtml = `
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">Full Translation</span>
                        <button onclick="translator.speakFullTranslation('${translation}')"
                                class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                            <i data-lucide="volume-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div class="relative">
                        <textarea readonly
                                  class="w-full p-3 bg-white rounded border border-gray-200 focus:outline-none"
                                  rows="3">${translation}</textarea>
                        <button onclick="navigator.clipboard.writeText('${translation}')"
                                class="absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                            <i data-lucide="copy" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            `;

            this.translatedText.innerHTML = `
                <div class="space-y-4">
                    <div class="word-by-word-translation">
                        ${wordByWordHtml}
                    </div>
                    ${fullTranslationHtml}
                </div>
            `;
            
            lucide.createIcons();
            this.translationResult.classList.remove('hidden');
        } catch (error) {
            console.error('Display error:', error);
            this.translatedText.innerHTML = `<p class="text-red-600">Error displaying translation</p>`;
            this.translationResult.classList.remove('hidden');
        }
    }

    speakWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        const targetLang = this.targetLanguageSelect.value;
        
        // Get the appropriate voice for the target language
        const langVoice = this.voices.find(voice => 
            voice.lang.toLowerCase().startsWith(targetLang.toLowerCase())
        );
        
        if (langVoice) {
            utterance.voice = langVoice;
            utterance.lang = langVoice.lang;
        } else {
            // Fallback to using language code if specific voice not found
            utterance.lang = languages.find(l => l.code === targetLang)?.voice || 'en-US';
        }
        
        this.synthesis.speak(utterance);
    }

    speakFullTranslation(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = this.targetLanguageSelect.value;
        
        // Get the appropriate voice for the target language
        const langVoice = this.voices.find(voice => 
            voice.lang.toLowerCase().startsWith(targetLang.toLowerCase())
        );
        
        if (langVoice) {
            utterance.voice = langVoice;
            utterance.lang = langVoice.lang;
        } else {
            // Fallback to using language code if specific voice not found
            utterance.lang = languages.find(l => l.code === targetLang)?.voice || 'en-US';
        }
        
        this.synthesis.speak(utterance);
    }

    toggleMic() {
        if (this.recognition) {
            if (this.micButton.classList.contains('recording')) {
                this.recognition.stop();
            } else {
                this.micButton.classList.add('recording');
                this.recognition.start();
            }
        }
    }

    // Helper method to get available voices for a language
    getVoicesForLanguage(langCode) {
        return this.voices.filter(voice => 
            voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
        );
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('translatorProgress');
        if (savedProgress) {
            this.learningProgress = JSON.parse(savedProgress);
        }
    }

    saveProgress() {
        localStorage.setItem('translatorProgress', JSON.stringify(this.learningProgress));
    }

    updateWordProgress(word, isCorrect) {
        if (!this.learningProgress[word]) {
            this.learningProgress[word] = {
                attempts: 0,
                correct: 0,
                lastSeen: new Date()
            };
        }
        
        this.learningProgress[word].attempts++;
        if (isCorrect) {
            this.learningProgress[word].correct++;
        }
        this.learningProgress[word].lastSeen = new Date();
        
        this.saveProgress();
    }

    initializeFlashcards(words, explanations, pronunciations) {
        this.flashcards = words.map((word, index) => ({
            word,
            explanation: explanations[index],
            pronunciation: pronunciations[index]
        }));
    }

    nextFlashcard() {
        if (this.currentFlashcardIndex < this.flashcards.length - 1) {
            this.currentFlashcardIndex++;
            this.updateFlashcard();
        }
    }

    previousFlashcard() {
        if (this.currentFlashcardIndex > 0) {
            this.currentFlashcardIndex--;
            this.updateFlashcard();
        }
    }

    updateFlashcard() {
        const flashcard = this.flashcards[this.currentFlashcardIndex];
        const front = document.querySelector('.flashcard-front');
        const back = document.querySelector('.flashcard-back');
        
        front.innerHTML = `<div class="text-2xl">${flashcard.word}</div>`;
        back.innerHTML = `
            <div>
                <div class="text-xl mb-2">${flashcard.explanation}</div>
                <div class="text-sm text-gray-500">${flashcard.pronunciation}</div>
            </div>
        `;
    }

    calculateOverallProgress() {
        const words = Object.keys(this.learningProgress);
        if (words.length === 0) return 0;
        
        const totalProgress = words.reduce((sum, word) => {
            const progress = this.learningProgress[word];
            return sum + (progress.correct / progress.attempts) * 100;
        }, 0);
        
        return Math.round(totalProgress / words.length);
    }

    async startPracticeSession() {
        const practiceWords = this.flashcards.slice();
        let score = 0;
        
        for (const card of practiceWords) {
            const isCorrect = await this.showPracticePrompt(card);
            if (isCorrect) score++;
            this.updateWordProgress(card.word, isCorrect);
        }
        
        alert(`Practice complete! Score: ${score}/${practiceWords.length}`);
    }

    async showPracticePrompt(card) {
        return new Promise(resolve => {
            const userAnswer = prompt(`What does "${card.word}" mean?`);
            const isCorrect = userAnswer && userAnswer.toLowerCase() === card.explanation.toLowerCase();
            alert(isCorrect ? 'Correct!' : `Incorrect. The answer was: ${card.explanation}`);
            resolve(isCorrect);
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
}

// Initialize the translator when the DOM is loaded
const translator = new Translator(); 