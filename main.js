let quizData = [];
let currentQuizIndex = 0;
let correctAnswersInRow = 0;
let lives = 3;
let score = 0;
let currentTries = 0;
let quizMode = 'editor'; // 'editor' or 'test' or 'import-test'

const options = {
    mustAnswer: true,
    threeTries: false,
    viewHint: false
};

const elements = {
    editTab: document.getElementById('edit-tab'),
    testTab: document.getElementById('test-tab'),
    shareTab: document.getElementById('share-tab'),
    quizEditorArea: document.getElementById('quiz-editor-area'),
    quizTestArea: document.getElementById('quiz-test-area'),
    jsonOutput: document.getElementById('json-output'),
    shareUrlInput: document.getElementById('share-url'),
    optionsMenu: document.querySelector('.option-group'),
    optionsMenuToggle: document.getElementById('options-menu-toggle'),
    mustAnswerOption: document.getElementById('must-answer-option'),
    threeTriesOption: document.getElementById('three-tries-option'),
    viewHintOption: document.getElementById('view-hint-option'),
    body: document.body
};

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

    if (tabId === 'test-tab') {
        quizMode = 'test';
        elements.body.classList.add('no-distractions');
        renderTestQuiz();
    } else {
        quizMode = 'editor';
        elements.body.classList.remove('no-distractions');
    }
    if (tabId === 'export-tab') {
        exportQuiz();
    }
}

elements.optionsMenuToggle.addEventListener('click', () => {
    elements.optionsMenu.classList.toggle('hidden');
    const toggleSpan = elements.optionsMenuToggle.querySelector('span');
    toggleSpan.textContent = elements.optionsMenu.classList.contains('hidden') ? '▼' : '▲';
});

elements.mustAnswerOption.addEventListener('change', (e) => options.mustAnswer = e.target.checked);
elements.threeTriesOption.addEventListener('change', (e) => options.threeTries = e.target.checked);
elements.viewHintOption.addEventListener('change', (e) => options.viewHint = e.target.checked);




/**
 * 
 * 
 * 
 * 
 * 
 * 
 */


function addQuestion(type) {
    const newQuestion = {
        id: Date.now(),
        type: type,
        question: "",
        hint: "",
        correctAnswer: null,
        choices: []
    };
    
    if (type === 'multiple_choice') {
        newQuestion.choices = ["", "", "", ""];
        newQuestion.correctAnswer = "A";
    } else if (type === 'drag_and_drop') {
        newQuestion.choices = ["", "", "", ""];
        newQuestion.correctAnswer = ["", "", "", ""];
    } else if (type === 'text_input') {
        newQuestion.correctAnswer = "";
    } else if (type === 'paragraph_prompt') {
        newQuestion.correctAnswer = []; // List of answers
    }

    quizData.push(newQuestion);
    renderEditQuiz();
}

function renderEditQuiz() {
    elements.quizEditorArea.innerHTML = '';
    quizData.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-component';
        questionDiv.innerHTML = `
            <h4>Question ${index + 1} (${q.type.replace(/_/g, ' ')})</h4>
            <label>Question Text:</label>
            <input type="text" value="${q.question}" oninput="updateQuestion(${index}, 'question', this.value)"><br>
            <label>Hint:</label>
            <input type="text" value="${q.hint}" oninput="updateQuestion(${index}, 'hint', this.value)">
        `;

        if (q.type === 'multiple_choice') {
            q.choices.forEach((choice, choiceIndex) => {
                const choiceLetter = String.fromCharCode(65 + choiceIndex);
                questionDiv.innerHTML += `
                    <div class="mc-option">
                        <label>
                            <input type="radio" name="mc-${q.id}" value="${choiceLetter}" ${q.correctAnswer === choiceLetter ? 'checked' : ''} onchange="updateCorrectAnswer(${index}, this.value)">
                            Choice ${choiceLetter}: <input type="text" value="${choice}" oninput="updateChoice(${index}, ${choiceIndex}, this.value)">
                        </label>
                    </div>
                `;
            });
        } else if (q.type === 'drag_and_drop') {
            questionDiv.innerHTML += `<p>Drag and drop items and set the correct order below.</p>`;
            q.choices.forEach((choice, choiceIndex) => {
                  questionDiv.innerHTML += `
                    <label>Item ${choiceIndex + 1}: <input type="text" value="${choice}" oninput="updateChoice(${index}, ${choiceIndex}, this.value)"></label><br>
                `;
            });
            questionDiv.innerHTML += `<p>Correct Order (comma separated):</p><input type="text" value="${q.correctAnswer.join(',')}" oninput="updateCorrectAnswerDD(${index}, this.value)">`;
        } else if (q.type === 'text_input') {
            questionDiv.innerHTML += `
                <p>Correct Answer:</p>
                <input type="text" value="${q.correctAnswer}" oninput="updateCorrectAnswer(${index}, this.value)">
            `;
        } else if (q.type === 'paragraph_prompt') {
            questionDiv.innerHTML += `
                <p>Correct Answers (comma separated):</p>
                <input type="text" value="${q.correctAnswer.join(', ')}" oninput="updateCorrectAnswerPP(${index}, this.value)">
            `;
        }

        elements.quizEditorArea.appendChild(questionDiv);
    });
}

function updateQuestion(index, key, value) {
    quizData[index][key] = value;
}

function updateChoice(questionIndex, choiceIndex, value) {
    quizData[questionIndex].choices[choiceIndex] = value;
}

function updateCorrectAnswer(index, value) {
    quizData[index].correctAnswer = value;
}

function updateCorrectAnswerDD(index, value) {
    quizData[index].correctAnswer = value.split(',').map(s => s.trim());
}

function updateCorrectAnswerPP(index, value) {
    quizData[index].correctAnswer = value.split(',').map(s => s.trim().toLowerCase());
}



/**
 * 
 * 
 * 
 * 
 * 
 * 
 */


function exportQuiz() {
    elements.jsonOutput.value = JSON.stringify(quizData, null, 2);
    const quizJson = JSON.stringify(quizData);
    const base64Data = btoa(quizJson);
    const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?quiz=${base64Data}`;
    elements.shareUrlInput.value = shareUrl;
}

function importQuiz() {
    try {
        const importedData = JSON.parse(elements.jsonOutput.value);
        if (Array.isArray(importedData)) {
            quizData = importedData;
            renderEditQuiz();
            alert('Quiz imported successfully!');
        } else {
            alert('Invalid JSON format. Please import an array of questions.');
        }
    } catch (e) {
        alert('Invalid JSON. Please check the format.');
    }
}

function copyShareUrl() {
    elements.shareUrlInput.select();
    elements.shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    alert("URL copied to clipboard!");
}

function importFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizBase64 = urlParams.get('quiz');
    if (quizBase64) {
        try {
            const quizJson = atob(quizBase64);
            const importedData = JSON.parse(quizJson);
            if (Array.isArray(importedData)) {
                quizData = importedData;
                quizMode = 'import-test';
                elements.body.classList.add('no-distractions');
                renderTestQuiz();
                return true;
            }
        } catch (e) {
            console.error("Failed to load quiz from URL:", e);
        }
    }
    return false;
}



/**
 * 
 * 
 * 
 * 
 * 
 * 
 */


function renderTestQuiz() {
    currentQuizIndex = 0;
    correctAnswersInRow = 0;
    lives = 3;
    score = 0;
    currentTries = 0;
    renderTestQuestion();
}

function renderTestQuestion() {
    elements.quizTestArea.innerHTML = '';
    if (quizData.length === 0) {
        elements.quizTestArea.innerHTML = '<p>No questions to test. Please add questions in the Edit tab.</p>';
        return;
    }
    if (currentQuizIndex >= quizData.length) {
        showScoreSheet();
        return;
    }
    
    const currentQuestion = quizData[currentQuizIndex];
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-component';
    questionDiv.id = `test-question-${currentQuestion.id}`;
    currentTries = 0;

    let livesBarHTML = '';
    if (options.threeTries) {
        livesBarHTML = `<div class="heart-bar">Lives: ${'❤️'.repeat(lives)}</div>`;
    }

    questionDiv.innerHTML = `
        ${livesBarHTML}
        <h4>Question ${currentQuizIndex + 1}</h4>
        <p>${currentQuestion.question}</p>
    `;

    if (currentQuestion.type === 'multiple_choice') {
        questionDiv.innerHTML += `<div class="mc-options-container"></div>`;
        const mcContainer = questionDiv.querySelector('.mc-options-container');
        currentQuestion.choices.forEach((choice, index) => {
            const choiceLetter = String.fromCharCode(65 + index);
            mcContainer.innerHTML += `
                <label class="mc-option">
                    <input type="radio" name="test-mc-${currentQuestion.id}" value="${choiceLetter}">
                    ${choiceLetter}. ${choice}
                </label>
            `;
        });
    } else if (currentQuestion.type === 'drag_and_drop') {
        const shuffledChoices = [...currentQuestion.choices].sort(() => Math.random() - 0.5);
        questionDiv.innerHTML += `
            <p>Drag the items into the correct order.</p>
            <div class="drag-drop-container">
                <div class="drag-zone">
                    ${shuffledChoices.map(choice => `<div class="draggable" draggable="true" data-value="${choice}">${choice}</div>`).join('')}
                </div>
                <div class="drop-zone"></div>
            </div>
        `;
    } else if (currentQuestion.type === 'text_input') {
        questionDiv.innerHTML += `
            <input type="text" id="text-input-${currentQuestion.id}">
        `;
    } else if (currentQuestion.type === 'paragraph_prompt') {
          questionDiv.innerHTML += `
            <textarea id="paragraph-input-${currentQuestion.id}" rows="5" style="width: 100%;"></textarea>
          `;
    }
    
    questionDiv.innerHTML += `
        <div class="hint-area hidden">Hint: ${currentQuestion.hint}</div>
        <button id="submit-btn" onclick="checkAnswer()">Submit Answer</button>
    `;
    elements.quizTestArea.appendChild(questionDiv);

    if (currentQuestion.type === 'drag_and_drop') {
        addDragAndDropEventListeners();
    }
}

function checkAnswer() {
    const currentQuestion = quizData[currentQuizIndex];
    const questionDiv = document.getElementById(`test-question-${currentQuestion.id}`);
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice') {
        const selected = document.querySelector(`input[name="test-mc-${currentQuestion.id}"]:checked`);
        if (!selected && options.mustAnswer) { return; }
        isCorrect = selected && selected.value === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'drag_and_drop') {
        const dropZone = document.querySelector('.drop-zone');
        const droppedItems = Array.from(dropZone.children).map(el => el.dataset.value);
        isCorrect = JSON.stringify(droppedItems) === JSON.stringify(currentQuestion.correctAnswer);
    } else if (currentQuestion.type === 'text_input') {
        const userAnswer = document.getElementById(`text-input-${currentQuestion.id}`).value.trim();
        if (userAnswer === "" && options.mustAnswer) { return; }
        isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    } else if (currentQuestion.type === 'paragraph_prompt') {
        const userAnswer = document.getElementById(`paragraph-input-${currentQuestion.id}`).value.trim().toLowerCase();
        const requiredAnswers = currentQuestion.correctAnswer;
        isCorrect = requiredAnswers.every(ans => userAnswer.includes(ans));
    }

    if (isCorrect) {
        questionDiv.classList.add('correct-answer');
        const checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon';
        checkIcon.innerHTML = '✔️';
        questionDiv.appendChild(checkIcon);

        score++;
        correctAnswersInRow++;
        if (correctAnswersInRow >= 2 && options.threeTries) {
            lives++;
        }
        setTimeout(() => {
            currentQuizIndex++;
            renderTestQuestion();
        }, 1000);
    } else {
        questionDiv.classList.add('incorrect-answer');
        currentTries++;
        correctAnswersInRow = 0;
        
        if (options.threeTries) {
            lives--;
            const livesBar = questionDiv.querySelector('.heart-bar');
            if (livesBar) livesBar.innerHTML = `Lives: ${'❤️'.repeat(lives)}`;
              if (lives <= 0) {
                showScoreSheet();
                return;
              }
        }
        if (options.viewHint && currentTries >= 2) {
            questionDiv.querySelector('.hint-area').classList.remove('hidden');
        }
        
        setTimeout(() => {
            questionDiv.classList.remove('incorrect-answer');
        }, 1000);
    }
}



/**
 * 
 * 
 * 
 * 
 * 
 * 
 */


function showScoreSheet() {
    elements.quizTestArea.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>You answered ${score} out of ${quizData.length} questions correctly.</p>
        <p>Your final score is: ${Math.round((score / quizData.length) * 100)}%</p>
        <button onclick="showTab('edit-tab')">Return to Editor</button>
    `;
    if (quizMode === 'import-test') {
        elements.quizTestArea.querySelector('button').classList.add('hidden');
    }
}


/**
 * 
 * 
 * 
 * 
 * 
 * 
 */


function addDragAndDropEventListeners() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZone = document.querySelector('.drop-zone');
    
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.value);
            e.target.classList.add('dragging');
        });
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const draggableElement = document.querySelector(`.draggable[data-value="${data}"]`);
        if (draggableElement) {
            dropZone.appendChild(draggableElement);
        }
    });
}

/**
 * 
 * 
 * 
 * 
 * 
 * 
 */

function initialize() {
    const isImported = importFromUrl();
    if (!isImported) {
        addQuestion('multiple_choice');
        quizData[0].question = "What is the capital of France?";
        quizData[0].choices = ["Berlin", "Madrid", "Paris", "Rome"];
        quizData[0].correctAnswer = "C";

        addQuestion('drag_and_drop');
        quizData[1].question = "Order the planets from the sun (first four).";
        quizData[1].choices = ["Mercury", "Venus", "Earth", "Mars"];
        quizData[1].correctAnswer = ["Mercury", "Venus", "Earth", "Mars"];
        quizData[1].hint = "Think about the order from the sun.";

        addQuestion('text_input');
        quizData[2].question = "What is the largest organ in the human body?";
        quizData[2].correctAnswer = "skin";
        quizData[2].hint = "It covers your entire body.";

        addQuestion('paragraph_prompt');
        quizData[3].question = "Write a short paragraph about the planets Mars and Jupiter. You must mention both their names and one key fact about each.";
        quizData[3].correctAnswer = ["mars", "jupiter", "red planet", "gas giant"];
        quizData[3].hint = "Mars is known as the red planet and Jupiter is a gas giant.";
    
        renderEditQuiz();
    }
}

document.addEventListener('DOMContentLoaded', initialize);