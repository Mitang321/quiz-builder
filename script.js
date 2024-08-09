let questionCount = 1;
let currentQuestionIndex = 0;
let quizData = [];
let timerInterval;
const totalQuizTime = 60; // Total time for the quiz in seconds
let timeLeft = totalQuizTime;

document
  .getElementById("addQuestionBtn")
  .addEventListener("click", function () {
    questionCount++;

    const questionContainer = document.getElementById("questions-container");

    const questionBlock = document.createElement("div");
    questionBlock.className = "question-block";

    const questionLabel = document.createElement("label");
    questionLabel.setAttribute("for", `question${questionCount}`);
    questionLabel.textContent = `Question ${questionCount}:`;

    const questionInput = document.createElement("input");
    questionInput.type = "text";
    questionInput.id = `question${questionCount}`;
    questionInput.name = `question${questionCount}`;
    questionInput.required = true;

    questionBlock.appendChild(questionLabel);
    questionBlock.appendChild(questionInput);

    const answerBlock = document.createElement("div");
    answerBlock.className = "answer-block";

    const answerLabel = document.createElement("label");
    answerLabel.setAttribute("for", `answer${questionCount}`);
    answerLabel.textContent = `Answer ${questionCount}:`;

    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.id = `answer${questionCount}`;
    answerInput.name = `answer${questionCount}`;
    answerInput.required = true;

    answerBlock.appendChild(answerLabel);
    answerBlock.appendChild(answerInput);

    questionContainer.appendChild(questionBlock);
    questionContainer.appendChild(answerBlock);
  });

document
  .getElementById("quizForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    quizData = [];

    for (let i = 1; i <= questionCount; i++) {
      const question = document.getElementById(`question${i}`).value;
      const answer = document.getElementById(`answer${i}`).value;
      quizData.push({ question, answer, userAnswer: "" });
    }

    document.getElementById("quizForm").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";

    startTimer();
    displayNextQuestion();
  });

document
  .getElementById("nextQuestionBtn")
  .addEventListener("click", function () {
    const userAnswer = document.getElementById("quiz-answer").value;
    quizData[currentQuestionIndex].userAnswer = userAnswer; // Store user's answer
    document.getElementById("quiz-answer").value = ""; // Clear the input field

    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {
      displayNextQuestion();
    } else {
      clearInterval(timerInterval);
      showSummary();
    }
  });

document.getElementById("retakeQuizBtn").addEventListener("click", function () {
  currentQuestionIndex = 0;
  timeLeft = totalQuizTime;
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";
  startTimer();
  displayNextQuestion();
});

function displayNextQuestion() {
  document.getElementById("quiz-question").textContent =
    quizData[currentQuestionIndex].question;
}

function startTimer() {
  document.getElementById("timeLeft").textContent = timeLeft;
  timerInterval = setInterval(function () {
    timeLeft--;
    document.getElementById("timeLeft").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showSummary();
    }
  }, 1000);
}

function showSummary() {
  document.getElementById("quiz-section").style.display = "none";
  const summaryContainer = document.getElementById("summary-container");
  summaryContainer.innerHTML = "";

  let correctAnswers = 0;

  quizData.forEach((item, index) => {
    const summaryItem = document.createElement("div");
    summaryItem.className = "summary-item";
    summaryItem.innerHTML = `
            <p><span>Question ${index + 1}:</span> ${item.question}</p>
            <p><span>Your Answer:</span> ${item.userAnswer}</p>
            <p><span>Correct Answer:</span> ${item.answer}</p>
        `;
    summaryContainer.appendChild(summaryItem);

    if (item.userAnswer.toLowerCase() === item.answer.toLowerCase()) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / quizData.length) * 100;
  const scoreElement = document.getElementById("quiz-score");
  scoreElement.textContent = `Your Score: ${score}%`;

  if (score < 50) {
    scoreElement.classList.add("wrong");
    scoreElement.textContent += ` - Better luck next time!`;
  } else {
    scoreElement.classList.remove("wrong");
  }

  document.getElementById("summary-section").style.display = "block";
}
