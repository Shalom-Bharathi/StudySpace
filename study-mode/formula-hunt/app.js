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
    


// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#3b82f6' },
        opacity: { value: 0.1 },
        size: { value: 3 },
        line_linked: { enable: true, distance: 150, color: '#3b82f6', opacity: 0.1, width: 1 }
    }
});

// Initialize lucide icons
lucide.createIcons();

// Animation for page load
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach((el, index) => {
        anime({
            targets: el,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: index * 100,
            duration: 800,
            easing: 'easeOutExpo'
        });
    });

    // Initialize subject tags
    const subjectTags = document.getElementById('subjectTags');
    let selectedSubject = null;

    subjectTags.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const subject = button.dataset.subject;
        
        // Remove active state from all buttons
        subjectTags.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-zinc-800', 'text-white');
            btn.classList.add('text-zinc-600', 'border-gray-200');
        });

        if (selectedSubject === subject) {
            // Deselect if clicking the same subject
            selectedSubject = null;
        } else {
            // Select new subject
            button.classList.remove('text-zinc-600', 'border-gray-200');
            button.classList.add('bg-zinc-800', 'text-white');
            selectedSubject = subject;
        }

        // Update search placeholder based on selected subject
        const searchInput = document.getElementById('formulaSearch');
        if (selectedSubject) {
            searchInput.placeholder = `Search ${selectedSubject} formulas (e.g., ${getSubjectExample(selectedSubject)})`;
        } else {
            searchInput.placeholder = "e.g., 'quadratic equation', 'kinetic energy', 'area of circle'...";
        }
    });
});

// Helper function to get subject-specific examples
function getSubjectExample(subject) {
    const examples = {
        math: "'quadratic equation', 'pythagoras theorem'",
        physics: "'kinetic energy', 'newton's laws'",
        chemistry: "'molarity', 'pH calculation'"
    };
    return examples[subject] || '';
}

// Sample formulas for demonstration
const sampleFormulas = {
    math: [{
        id: '1',
        name: 'Heron\'s Formula',
        formula: 'A = \\sqrt{s(s-a)(s-b)(s-c)}',
        description: 'Calculates the area of a triangle given its sides a, b, and c.',
        derivation: `
            1. Calculate the semi-perimeter: 
            \\[
            s = \\frac{a + b + c}{2}
            \\]
            2. Use Heron\'s formula to find the area:
            \\[
            A = \\sqrt{s(s-a)(s-b)(s-c)}
            \\]
        `,
        example: `
            For a triangle with sides 3, 4, and 5:
            1. Calculate the semi-perimeter:
            \\[
            s = \\frac{3 + 4 + 5}{2} = 6
            \\]
            2. Calculate the area:
            \\[
            A = \\sqrt{6(6-3)(6-4)(6-5)} = \\sqrt{6 \\cdot 3 \\cdot 2 \\cdot 1} = \\sqrt{12} = 2\\sqrt{3} \\approx 3.46 \\text{ square units}
            \\]
        `,
        components: {
            A: 'Area of the triangle',
            s: 'Semi-perimeter of the triangle',
            a: 'Length of side a',
            b: 'Length of side b',
            c: 'Length of side c'
        }
    }],
    physics: [{
        id: '2',
        name: 'Kinetic Energy',
        formula: 'KE = \\frac{1}{2}mv^2',
        description: 'Calculates the energy of an object due to its motion',
        derivation: `
            1. Kinetic energy is derived from the work-energy theorem.
            2. The formula is given by:
            \\[
            KE = \\frac{1}{2}mv^2
            \\]
        `,
        example: `
            Calculate the kinetic energy of a 2kg ball moving at 5m/s:
            1. Substitute the values into the formula:
            \\[
            KE = \\frac{1}{2} \\cdot 2 \\cdot (5)^2
            \\]
            2. Calculate:
            \\[
            KE = 1 \\cdot 25 = 25 \\text{ Joules}
            \\]
        `,
        components: {
            m: 'Mass of the object',
            v: 'Velocity of the object'
        }
    }],
    chemistry: [{
        id: '3',
        name: 'Molarity',
        formula: 'M = \\frac{n}{V}',
        description: 'Concentration of a solution in moles per liter',
        derivation: `
            1. Molarity is defined as the number of moles of solute per liter of solution.
            2. The formula is given by:
            \\[
            M = \\frac{n}{V}
            \\]
        `,
        example: `
            Calculate the molarity of 2 moles of NaCl in 500mL of solution:
            1. Convert volume from mL to L:
            \\[
            V = 500 \\text{ mL} = 0.5 \\text{ L}
            \\]
            2. Substitute the values into the formula:
            \\[
            M = \\frac{2}{0.5} = 4 \\text{ mol/L}
            \\]
        `,
        components: {
            M: 'Molarity (mol/L)',
            n: 'Number of moles',
            V: 'Volume in liters'
        }
    }]
};

// Handle formula search
const searchButton = document.getElementById('searchButton');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');

searchButton.addEventListener('click', async () => {
    const searchQuery = document.getElementById('formulaSearch').value.trim();
    const selectedSubject = document.querySelector('#subjectTags button.bg-zinc-800')?.dataset.subject;
    if (!searchQuery) return;

    showLoading();
    try {
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are a helpful assistant that provides mathematical and scientific formulas. Provide formulas in LaTeX format when possible."
                }, {
                    role: "user",
                    content: `Find ${selectedSubject ? selectedSubject + ' related' : ''} formulas related to: ${searchQuery}. 
                             Include the formula name, the formula itself in LaTeX, a brief description, step-by-step derivation, 
                             and an example. Format the response as a JSON array with objects containing: 
                             id, name, formula, description, derivation, example, and components (explanation of each variable).`
                }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // Log the response for debugging

        let formulas = [];
        
        try {
            // Check if the response contains valid JSON
            if (data.choices && data.choices.length > 0) {
                // Log the raw content before parsing
                console.log('Raw content:', data.choices[0].message.content);
                
                // Remove any code block formatting (```) from the response
                const rawContent = data.choices[0].message.content.replace(/```json|```/g, '').trim();
                formulas = JSON.parse(rawContent);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (parseError) {
            console.error('Error parsing ChatGPT response:', parseError);
            showSampleResult(selectedSubject);
            return;
        }

        renderResults(formulas);
    } catch (error) {
        console.error('Error:', error);
        showSampleResult(selectedSubject);
    } finally {
        hideLoading();
    }
});

function showLoading() {
    loadingState.classList.remove('hidden');
    loadingState.classList.add('flex');
    resultsSection.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
    loadingState.classList.remove('flex');
    resultsSection.classList.remove('hidden');
}

function renderResults(formulas) {
    hideLoading();
    resultsSection.innerHTML = '';

    formulas.forEach((formula, index) => {
        const card = createFormulaCard(formula, index);
        resultsSection.appendChild(card);
    });

    // Animate cards
    anime({
        targets: '.formula-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutExpo'
    });
}

function createFormulaCard(formula) {
    const div = document.createElement('div');
    div.className = 'formula-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100';
    div.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-purple-50 rounded-xl">
                <i data-lucide="function" class="w-6 h-6 text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-zinc-800">${formula.name}</h3>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl mb-4 formula-latex">${formula.formula}</div>
        <p class="text-zinc-600 mb-4">${formula.description}</p>
        <div class="flex flex-wrap gap-2">
            <button onclick="showDerivation('${formula.id}')" 
                    class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                <i data-lucide="book-open" class="w-4 h-4 inline mr-2"></i>Derivation
            </button>
            <button onclick="showExample('${formula.id}')"
                    class="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                <i data-lucide="flask" class="w-4 h-4 inline mr-2"></i>Example
            </button>
            <button onclick="showComponents('${formula.id}')"
                    class="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all">
                <i data-lucide="list" class="w-4 h-4 inline mr-2"></i>Components
            </button>
        </div>
    `;
    return div;
}

function showModal(title, content) {
    const modal = document.getElementById('formulaModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    anime({
        targets: '#formulaModal > div',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo'
    });
}

function closeModal() {
    const modal = document.getElementById('formulaModal');
    
    anime({
        targets: '#formulaModal > div',
        scale: [1, 0.9],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInExpo',
        complete: () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
}

// Sample result for demonstration
function showSampleResult(subject) {
    const sampleFormulas = {
        math: [{
            id: '1',
            name: 'Quadratic Formula',
            formula: 'x = (-b ± √(b² - 4ac)) / 2a',
            description: 'Solves quadratic equations in the form ax² + bx + c = 0',
            derivation: 'Step-by-step derivation...',
            example: 'Solve x² + 5x + 6 = 0',
            components: {
                a: 'Coefficient of x²',
                b: 'Coefficient of x',
                c: 'Constant term'
            }
        }],
        physics: [{
            id: '2',
            name: 'Kinetic Energy',
            formula: 'KE = ½mv²',
            description: 'Calculates the energy of an object due to its motion',
            derivation: 'Derived from work-energy theorem...',
            example: 'Calculate KE of a 2kg ball moving at 5m/s',
            components: {
                m: 'Mass of the object',
                v: 'Velocity of the object'
            }
        }],
        chemistry: [{
            id: '3',
            name: 'Molarity',
            formula: 'M = n/V',
            description: 'Concentration of a solution in moles per liter',
            derivation: 'Based on solution concentration definition...',
            example: 'Calculate molarity of 2 moles NaCl in 500mL solution',
            components: {
                M: 'Molarity (mol/L)',
                n: 'Number of moles',
                V: 'Volume in liters'
            }
        }]
    };

    renderResults(subject ? [sampleFormulas[subject][0]] : [sampleFormulas.math[0]]);
}

// Initialize KaTeX for formula rendering
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.formula-latex').forEach(el => {
        katex.render(el.textContent, el, {
            throwOnError: false,
            displayMode: true
        });
    });
});

// Add functions to show derivation, example, and components
function showDerivation(formulaId) {
    const formula = getCurrentFormula(formulaId);
    if (!formula) return;

    showModal('Formula Derivation', `
        <div class="space-y-4">
            <h4 class="font-semibold text-lg text-zinc-800">${formula.name}</h4>
            <div class="bg-gray-50 p-4 rounded-xl formula-latex">${formula.formula}</div>
            <div class="prose prose-zinc max-w-none">
                ${formula.derivation}
            </div>
        </div>
    `);
}

function showExample(formulaId) {
    const formula = getCurrentFormula(formulaId);
    if (!formula) return;

    showModal('Example Usage', `
        <div class="space-y-4">
            <h4 class="font-semibold text-lg text-zinc-800">${formula.name}</h4>
            <div class="bg-gray-50 p-4 rounded-xl mb-4">
                <p class="font-medium">Problem:</p>
                <p>${formula.example}</p>
            </div>
            <div class="prose prose-zinc max-w-none">
                ${formula.solution || 'Solution steps will be shown here...'}
            </div>
        </div>
    `);
}

function showComponents(formulaId) {
    const formula = getCurrentFormula(formulaId);
    if (!formula) return;

    const componentsList = Object.entries(formula.components)
        .map(([symbol, explanation]) => `
            <div class="flex gap-4 items-start py-2">
                <div class="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl">
                    <span class="formula-latex">${symbol}</span>
                </div>
                <div class="flex-1">
                    <p class="text-zinc-800">${explanation}</p>
                </div>
            </div>
        `).join('');

    showModal('Formula Components', `
        <div class="space-y-4">
            <h4 class="font-semibold text-lg text-zinc-800">${formula.name}</h4>
            <div class="bg-gray-50 p-4 rounded-xl formula-latex">${formula.formula}</div>
            <div class="divide-y divide-gray-100">
                ${componentsList}
            </div>
        </div>
    `);
}

function getCurrentFormula(formulaId) {
    const allFormulas = [
        ...sampleFormulas.math,
        ...sampleFormulas.physics,
        ...sampleFormulas.chemistry
    ];
    return allFormulas.find(f => f.id === formulaId);
}
