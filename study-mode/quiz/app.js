// Initialize Lucide icons
lucide.createIcons();

class QuizGenerator {
    constructor() {
        this.form = document.getElementById('generatorForm');
        this.quizForm = document.getElementById('quizForm');
        this.loadingState = document.getElementById('loadingState');
        this.quizDisplay = document.getElementById('quizDisplay');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.showLoading();

        try {
            const quiz = await this.generateQuiz({
                grade: formData.get('grade'),
                subject: formData.get('subject'),
                topic: formData.get('topic'),
                numQuestions: formData.get('numQuestions')
            });

            this.displayQuiz(quiz);
        } catch (error) {
            alert('Error generating quiz: ' + error.message);
            this.hideLoading();
        }
    }

    showLoading() {
        this.quizForm.classList.add('hidden');
        this.loadingState.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingState.classList.add('hidden');
    }

    displayQuiz(questions) {
        this.currentQuestions = questions;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.displayCurrentQuestion();
    }

    displayCurrentQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const html = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-zinc-200 opacity-0 translate-x-full">
                <div class="flex items-center justify-between mb-8">
                    <span class="text-zinc-600">Question ${this.currentQuestionIndex + 1}/${this.currentQuestions.length}</span>
                    <span class="px-4 py-2 bg-zinc-100 rounded-full text-sm text-zinc-700">Score: ${this.score}</span>
                </div>
                
                <div class="space-y-6">
                    <h3 class="text-2xl font-semibold text-zinc-900">${question.question}</h3>
                    
                    <div class="space-y-4">
                        ${question.options.map((option, oIndex) => `
                            <label class="flex items-center p-4 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100 border border-zinc-200 opacity-0 translate-y-4">
                                <input type="radio" name="q${this.currentQuestionIndex}" value="${oIndex}"
                                       class="w-5 h-5 text-zinc-900">
                                <span class="ml-3 text-zinc-800">${option}</span>
                            </label>
                        `).join('')}
                    </div>

                    <button onclick="quizGenerator.checkAnswer()"
                            class="w-full bg-zinc-900 text-white py-4 px-6 rounded-lg hover:bg-zinc-800 opacity-0 translate-y-4">
                        Check Answer
                    </button>
                </div>
            </div>
        `;

        this.quizDisplay.innerHTML = html;
        this.hideLoading();
        this.quizDisplay.classList.remove('hidden');

        // Animate question entrance
        gsap.to(this.quizDisplay.querySelector('div'), {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out"
        });

        // Animate options entrance
        gsap.to(this.quizDisplay.querySelectorAll('label'), {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.3
        });

        // Animate button entrance
        gsap.to(this.quizDisplay.querySelector('button'), {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.7
        });
    }

    async generateQuiz(params) {
        const prompt = `Generate a multiple choice quiz with ${params.numQuestions} questions about ${params.topic} suitable for ${params.grade}th grade ${params.subject}.

        CRITICAL INSTRUCTIONS FOR ACCURACY:
        1. Each question must have exactly one clearly correct answer
        2. The correct answer must be unambiguous and factually accurate
        3. Double-check that the correctAnswer index matches the position of the actual correct answer
        4. Provide a detailed explanation for why the answer is correct
        5. Make all wrong options plausible but clearly incorrect

        Return a JSON array where each question follows this EXACT format:
        {
            "question": "clear, specific question text",
            "options": ["correct answer", "wrong option", "wrong option", "wrong option"],
            "correctAnswer": 0,
            "explanation": "detailed explanation of why the correct answer is right and others are wrong"
        }

        The correctAnswer MUST be 0 and the correct answer MUST be the first option in the array.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer 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`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: "You are a highly accurate quiz generator. Always ensure the correct answer matches its index and provide detailed explanations."
                    }, {
                        role: "user",
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 2000,
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('API Error:', error);
                throw new Error(error.error?.message || 'Failed to generate quiz');
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('Invalid API response structure');
            }

            const content = data.choices[0].message.content;
            console.log('Content:', content);

            let quizData;
            try {
                // Extract JSON from the content
                const jsonMatch = content.match(/```json\n?(.*)\n?```/s) || content.match(/```\n?(.*)\n?```/s);
                const jsonString = jsonMatch ? jsonMatch[1] : content;
                
                quizData = JSON.parse(jsonString);

                if (quizData.questions) {
                    quizData = quizData.questions;
                }

                if (!Array.isArray(quizData)) {
                    quizData = [quizData];
                }

                // Validate and randomize options for each question
                const validatedQuestions = quizData.map(q => {
                    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
                        throw new Error('Invalid question format');
                    }

                    // Store the correct answer
                    const correctAnswer = q.options[0];
                    
                    // Shuffle the options
                    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
                    
                    // Find the new index of the correct answer
                    const newCorrectAnswerIndex = shuffledOptions.indexOf(correctAnswer);

                    return {
                        question: q.question,
                        options: shuffledOptions,
                        correctAnswer: newCorrectAnswerIndex,
                        explanation: q.explanation || 'No explanation provided'
                    };
                });

                return validatedQuestions;

            } catch (parseError) {
                console.error('Parse Error:', parseError);
                console.error('Content that failed to parse:', content);
                throw new Error('Failed to parse quiz data: ' + parseError.message);
            }

        } catch (error) {
            console.error('Quiz Generation Error:', error);
            return [{
                question: "Quiz Generation Error",
                options: [
                    "Please check your input and try again",
                    "Make sure all fields are filled correctly",
                    "Try a different topic or subject",
                    "Contact support if the issue persists"
                ],
                correctAnswer: 0,
                explanation: `Error details: ${error.message}`
            }];
        }
    }

    async checkAnswer() {
        const selectedAnswer = document.querySelector(`input[name="q${this.currentQuestionIndex}"]:checked`);
        if (!selectedAnswer) {
            alert("Please select an answer");
            return;
        }

        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = parseInt(selectedAnswer.value) === question.correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }

        const resultHtml = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-zinc-200 opacity-0 translate-x-full">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 rounded-full ${isCorrect ? 'bg-green-100' : 'bg-red-100'} mb-4">
                        <i data-lucide="${isCorrect ? 'check-circle' : 'x-circle'}" 
                           class="w-12 h-12 ${isCorrect ? 'text-green-600' : 'text-red-600'}"></i>
                    </div>
                    <h3 class="text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                        ${isCorrect ? 'Correct!' : 'Incorrect'}
                    </h3>
                </div>
                
                <div class="bg-zinc-50 rounded-lg p-6 mb-6">
                    <p class="text-zinc-700">${question.explanation}</p>
                </div>

                <button onclick="quizGenerator.nextQuestion()"
                        class="w-full bg-zinc-900 text-white py-4 px-6 rounded-lg hover:bg-zinc-800">
                    ${this.currentQuestionIndex < this.currentQuestions.length - 1 ? 'Next Question' : 'See Final Results'}
                </button>
            </div>
        `;

        // Animate out current question
        gsap.to(this.quizDisplay.querySelector('div'), {
            opacity: 0,
            x: -100,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.quizDisplay.innerHTML = resultHtml;
                lucide.createIcons();
                
                // Animate in result
                gsap.to(this.quizDisplay.querySelector('div'), {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.currentQuestions.length) {
            this.displayCurrentQuestion();
        } else {
            this.displayFinalResults();
        }
    }

    displayFinalResults() {
        const percentage = (this.score / this.currentQuestions.length) * 100;
        const resultHtml = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-zinc-200 opacity-0 scale-95">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 rounded-full bg-blue-100 mb-4">
                        <i data-lucide="award" class="w-12 h-12 text-blue-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-zinc-900">Quiz Complete!</h3>
                    
                    <div class="mt-6 relative pt-1">
                        <div class="flex mb-2 items-center justify-between">
                            <div>
                                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                    Your Score
                                </span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-semibold inline-block text-blue-600">
                                    ${percentage}%
                                </span>
                            </div>
                        </div>
                        <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                            <div style="width:0%" 
                                 class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                 id="progressBar">
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-xl mt-4">Final Score: ${this.score}/${this.currentQuestions.length}</p>
                </div>
                
                <div class="space-y-6">
                    <button onclick="location.reload()"
                            class="w-full bg-zinc-900 text-white py-4 px-6 rounded-lg hover:bg-zinc-800 opacity-0 translate-y-4">
                        Try Another Quiz
                    </button>
                </div>
            </div>
        `;

        // Animate out current content
        gsap.to(this.quizDisplay.querySelector('div'), {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.quizDisplay.innerHTML = resultHtml;
                lucide.createIcons();
                
                // Animate in final results
                const timeline = gsap.timeline();
                
                timeline.to(this.quizDisplay.querySelector('div'), {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out"
                })
                .to('#progressBar', {
                    width: `${percentage}%`,
                    duration: 1.5,
                    ease: "power2.out"
                })
                .to(this.quizDisplay.querySelector('button'), {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });

                // Add number counting animation
                let count = 0;
                const scoreElement = this.quizDisplay.querySelector('.text-blue-600');
                const countInterval = setInterval(() => {
                    count += 2;
                    if (count > percentage) {
                        count = percentage;
                        clearInterval(countInterval);
                    }
                    scoreElement.textContent = `${Math.round(count)}%`;
                }, 20);
            }
        });
    }
}

// Initialize the quiz generator when the DOM is loaded
const quizGenerator = new QuizGenerator(); 