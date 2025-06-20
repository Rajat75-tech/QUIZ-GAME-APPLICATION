// Variables for timer countdown
// Quiz data
const quizData = [
  {
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    points: 10,
  },
  {
    type: "multi-select",
    question:
      "Which of these are JavaScript frameworks? (Select all that apply)",
    options: ["React", "Laravel", "Angular", "Django", "Vue"],
    correctAnswer: ["React", "Angular", "Vue"],
    points: 15,
  },
  {
    type: "fill-blank",
    question:
      "The process of finding and fixing errors in code is called ______.",
    correctAnswer: "debugging",
    points: 10,
  },
  {
    type: "multiple-choice",
    question: "Which HTML tag is used to link a JavaScript file?",
    options: ["<script>", "<js>", "<javascript>", "<link>"],
    correctAnswer: "<script>",
    points: 10,
  },
  {
    type: "multi-select",
    question: "Which of these are CSS preprocessors? (Select all that apply)",
    options: ["Sass", "Less", "Stylus", "PostCSS", "Bootstrap"],
    correctAnswer: ["Sass", "Less", "Stylus"],
    points: 15,
  },
];

// DOM Elements
const timerEl = document.getElementById("timer");
const questionContainer = document.getElementById("question-container");
const feedback = document.getElementById("feedback");
const currentQuestionEl = document.getElementById("current-question");
const totalQuestionsEl = document.getElementById("total-questions");
const currentScoreEl = document.getElementById("current-score");
const progressBar = document.getElementById("progress-bar");
const progressDots = document.getElementById("progress-dots");
const resultsDots = document.getElementById("results-dots");
const finalScoreEl = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");
const resultDetails = document.getElementById("result-details");

const welcomeScreen = document.getElementById("welcome-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

// State Variables
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timerInterval;
let totalTime = 300; // 5 minutes in seconds

function initQuiz() {
  progressDots.innerHTML = "";
  quizData.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (index === 0) dot.classList.add("active");
    progressDots.appendChild(dot);
  });
  totalQuestionsEl.textContent = quizData.length;
  showScreen("welcome-screen");
}

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function updateTimer() {
  const minutes = Math.floor(totalTime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalTime % 60).toString().padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;

  if (totalTime <= 0) {
    clearInterval(timerInterval);
    showResults();
  } else {
    totalTime--;
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  currentScoreEl.textContent = "0";
  showScreen("quiz-screen");
  loadQuestion();
  totalTime = 300;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function loadQuestion() {
  const q = quizData[currentQuestionIndex];
  currentQuestionEl.textContent = currentQuestionIndex + 1;
  questionContainer.innerHTML = `<div class="question">${q.question}</div>`;
  feedback.style.display = "none";

  const options = document.createElement("div");
  options.className = "options-container";

  if (q.type === "multiple-choice") {
    q.options.forEach((opt) => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = opt;
      div.onclick = () => {
        document
          .querySelectorAll(".option")
          .forEach((o) => o.classList.remove("selected"));
        div.classList.add("selected");
        userAnswers[currentQuestionIndex] = [opt];
        nextBtn.disabled = false;
      };
      options.appendChild(div);
    });
  } else if (q.type === "multi-select") {
    q.options.forEach((opt) => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = opt;
      div.onclick = () => {
        div.classList.toggle("selected");
        const selected = [...document.querySelectorAll(".option.selected")].map(
          (o) => o.textContent
        );
        userAnswers[currentQuestionIndex] = selected;
        nextBtn.disabled = selected.length === 0;
      };
      options.appendChild(div);
    });
  } else if (q.type === "fill-blank") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "fill-blank";
    input.placeholder = "Type your answer";
    input.oninput = () => {
      userAnswers[currentQuestionIndex] = [input.value.trim()];
      nextBtn.disabled = input.value.trim() === "";
    };
    options.appendChild(input);
  }

  questionContainer.appendChild(options);
  nextBtn.disabled = true;
  progressBar.style.width = `${
    (currentQuestionIndex / quizData.length) * 100
  }%`;
}

function loadMultipleChoice(q) {
  const container = document.createElement("div");
  container.className = "options-container";
  q.options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "option";
    label.innerHTML = `<input type="radio" name="answer" value="${option}"> ${option}`;
    label.addEventListener("click", () => {
      document
        .querySelectorAll(".option")
        .forEach((o) => o.classList.remove("selected"));
      label.classList.add("selected");
      userAnswers[currentQuestionIndex] = [option];
      nextBtn.disabled = false;
    });
    container.appendChild(label);
  });
  questionContainer.appendChild(container);
}

function loadMultiSelect(q) {
  const container = document.createElement("div");
  container.className = "options-container";
  q.options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "option";
    label.innerHTML = `<input type="checkbox" value="${option}"> ${option}`;
    label.addEventListener("click", () => {
      label.classList.toggle("selected");
      const selected = [
        ...document.querySelectorAll(".option.selected input"),
      ].map((i) => i.value);
      userAnswers[currentQuestionIndex] = selected;
      nextBtn.disabled = selected.length === 0;
    });
    container.appendChild(label);
  });
  questionContainer.appendChild(container);
}

function loadFillBlank(q) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "fill-blank";
  input.placeholder = "Type your answer here...";
  input.addEventListener("input", () => {
    userAnswers[currentQuestionIndex] = [input.value.trim()];
    nextBtn.disabled = input.value.trim() === "";
  });
  questionContainer.appendChild(input);
}

function checkAnswer() {
  const q = quizData[currentQuestionIndex];
  const answer = userAnswers[currentQuestionIndex];
  let correct = false;

  if (!answer) return false;

  if (q.type === "multiple-choice") {
    correct = answer[0] === q.correctAnswer;
  } else if (q.type === "multi-select") {
    correct =
      JSON.stringify([...answer].sort()) ===
      JSON.stringify([...q.correctAnswer].sort());
  } else if (q.type === "fill-blank") {
    correct = answer[0].toLowerCase() === q.correctAnswer.toLowerCase();
  }

  if (correct) {
    score += q.points;
    currentScoreEl.textContent = score;
    feedback.className = "feedback correct";
    feedback.textContent = "Correct!";
  } else {
    feedback.className = "feedback incorrect";
    feedback.textContent = `Incorrect! Correct Answer: ${
      Array.isArray(q.correctAnswer)
        ? q.correctAnswer.join(", ")
        : q.correctAnswer
    }`;
  }

  feedback.style.display = "block";

  const dot = progressDots.children[currentQuestionIndex];
  dot.classList.add(correct ? "correct" : "incorrect");

  return correct;
}

function showResults() {
  clearInterval(timerInterval);
  let correctCount = 0;
  finalScoreEl.textContent = score;
  questionContainer.innerHTML = "<h2>Review:</h2>";

  quizData.forEach((q, i) => {
    const ua = userAnswers[i] || [];
    let isCorrect = false;

    if (q.type === "multiple-choice") {
      isCorrect = ua[0] === q.correctAnswer;
    } else if (q.type === "multi-select") {
      isCorrect =
        JSON.stringify([...ua].sort()) ===
        JSON.stringify([...q.correctAnswer].sort());
    } else if (q.type === "fill-blank") {
      isCorrect = ua[0]?.toLowerCase() === q.correctAnswer.toLowerCase();
    }

    if (isCorrect) correctCount++;

    const div = document.createElement("div");
    div.innerHTML = `
            <p><strong>Q${i + 1}: ${q.question}</strong></p>
            <p>Your answer: ${ua.join(", ") || "No Answer"}</p>
            <p>Correct answer: ${
              Array.isArray(q.correctAnswer)
                ? q.correctAnswer.join(", ")
                : q.correctAnswer
            }</p>
            <p style="color: ${isCorrect ? "green" : "red"}">${
      isCorrect ? "Correct!" : "Incorrect!"
    }</p>
            <hr>
        `;
    questionContainer.appendChild(div);

    const dot = document.createElement("div");
    dot.className = "progress-dot " + (isCorrect ? "correct" : "incorrect");
    resultsDots.appendChild(dot);
  });

  resultDetails.textContent = `You answered ${correctCount} out of ${quizData.length} questions correctly.`;
  const percent = (correctCount / quizData.length) * 100;
  if (percent >= 80)
    resultMessage.textContent = "Excellent! You're a quiz master!";
  else if (percent >= 60)
    resultMessage.textContent = "Great job! You know your stuff!";
  else if (percent >= 40) resultMessage.textContent = "Not bad! Keep learning!";
  else resultMessage.textContent = "Good try! Review and try again!";

  showScreen("results-screen");
}

// Event Listeners
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  checkAnswer();
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    showResults();
  }
});
restartBtn.addEventListener("click", initQuiz);

// Start
initQuiz();

// Add all previous unchanged logic for initQuiz, loadQuestion, etc...