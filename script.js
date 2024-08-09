let questionCount = 1;
let currentQuestionIndex = 0;
let quizData = [];
let pastQuizData = []; // For storing a selected past quiz
let timerInterval;
const totalQuizTime = 60; // Total time for the quiz in seconds
let timeLeft = totalQuizTime;
let users = JSON.parse(localStorage.getItem("users")) || {}; // Store users in localStorage
let currentUser = null;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || []; // Store leaderboard in localStorage

document
  .getElementById("authForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (currentUser) {
      alert("You are already logged in!");
      return;
    }

    if (document.getElementById("authSubmitBtn").textContent === "Login") {
      if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("quizForm-section").style.display = "block";
        document.getElementById("authMessage").textContent = "";
      } else {
        document.getElementById("authMessage").textContent =
          "Invalid username or password!";
      }
    } else {
      if (users[username]) {
        document.getElementById("authMessage").textContent =
          "Username already exists!";
      } else {
        users[username] = { password: password, quizzes: [] };
        localStorage.setItem("users", JSON.stringify(users));
        currentUser = username;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("quizForm-section").style.display = "block";
        document.getElementById("authMessage").textContent = "";
      }
    }
  });

document
  .getElementById("toggleAuthMode")
  .addEventListener("click", function () {
    const authTitle = document.getElementById("auth-title");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const authToggle = document.getElementById("authToggle");

    if (authSubmitBtn.textContent === "Login") {
      authTitle.textContent = "Register";
      authSubmitBtn.textContent = "Register";
      authToggle.innerHTML =
        'Already have an account? <a href="#">Login here</a>';
    } else {
      authTitle.textContent = "Login";
      authSubmitBtn.textContent = "Login";
      authToggle.innerHTML =
        'Don\'t have an account? <a href="#">Register here</a>';
    }
  });

document
  .getElementById("addQuestionBtn")
  .addEventListener("click", function () {
    questionCount++;

    const questionContainer = document.getElementById("questions-container");

    // Create a new question block
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

    // Question Type Dropdown
    const typeLabel = document.createElement("label");
    typeLabel.setAttribute("for", `type${questionCount}`);
    typeLabel.textContent = "Question Type:";

    const typeSelect = document.createElement("select");
    typeSelect.id = `type${questionCount}`;
    typeSelect.name = `type${questionCount}`;
    typeSelect.className = "question-type";
    typeSelect.required = true;

    const textOption = document.createElement("option");
    textOption.value = "text";
    textOption.textContent = "Text";

    const multipleChoiceOption = document.createElement("option");
    multipleChoiceOption.value = "multiple";
    multipleChoiceOption.textContent = "Multiple Choice";

    const trueFalseOption = document.createElement("option");
    trueFalseOption.value = "truefalse";
    trueFalseOption.textContent = "True/False";

    typeSelect.appendChild(textOption);
    typeSelect.appendChild(multipleChoiceOption);
    typeSelect.appendChild(trueFalseOption);

    questionBlock.appendChild(typeLabel);
    questionBlock.appendChild(typeSelect);

    // Options Container (will be populated based on question type)
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";
    optionsContainer.id = `options${questionCount}`;

    questionBlock.appendChild(optionsContainer);

    // Append the new question block to the container
    questionContainer.appendChild(questionBlock);

    // Answer Block
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

    // Append the new answer block to the container
    questionContainer.appendChild(answerBlock);

    // Attach event listener for the newly added question type select
    typeSelect.addEventListener("change", function () {
      updateOptionsContainer(this.id);
    });
  });

document
  .getElementById("quizForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    quizData = [];

    for (let i = 1; i <= questionCount; i++) {
      const question = formData.get(`question${i}`);
      const type = formData.get(`type${i}`);
      let options = [];
      let answer = formData.get(`answer${i}`);

      if (type === "multiple") {
        for (let j = 1; j <= 4; j++) {
          const option = formData.get(`option${i}-${j}`);
          if (option) options.push(option);
        }
      } else if (type === "truefalse") {
        options = ["True", "False"];
      }

      quizData.push({ question, type, options, answer });
    }

    // Save the quiz to the user's profile
    users[currentUser].quizzes.push(quizData);
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("quizForm-section").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    displayNextQuestion();
    startTimer();
  });

document
  .getElementById("nextQuestionBtn")
  .addEventListener("click", function () {
    const currentQuestion = quizData[currentQuestionIndex];
    const userAnswer = document.querySelector('input[name="option"]:checked')
      ? document.querySelector('input[name="option"]:checked').value
      : document.getElementById("quiz-answer").value;

    quizData[currentQuestionIndex].userAnswer = userAnswer;
    currentQuestionIndex++;

    displayNextQuestion();
  });

document
  .getElementById("viewPastQuizzesBtn")
  .addEventListener("click", function () {
    document.getElementById("quizForm-section").style.display = "none";
    document.getElementById("past-quizzes-section").style.display = "block";
    displayPastQuizzes();
  });

document.getElementById("retakeQuizBtn").addEventListener("click", function () {
  currentQuestionIndex = 0;
  quizData = pastQuizData; // Load the selected past quiz
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";
  displayNextQuestion();
  startTimer();
});

document
  .getElementById("viewLeaderboardBtn")
  .addEventListener("click", function () {
    document.getElementById("summary-section").style.display = "none";
    document.getElementById("leaderboard-section").style.display = "block";
    displayLeaderboard();
  });

document
  .getElementById("backToQuizFormBtn")
  .addEventListener("click", function () {
    document.getElementById("past-quizzes-section").style.display = "none";
    document.getElementById("quizForm-section").style.display = "block";
  });

document
  .getElementById("backToSummaryBtn")
  .addEventListener("click", function () {
    document.getElementById("leaderboard-section").style.display = "none";
    document.getElementById("summary-section").style.display = "block";
  });

function displayNextQuestion() {
  const quizQuestionElement = document.getElementById("quiz-question");
  const quizOptionsElement = document.getElementById("quiz-options");
  const quizAnswerElement = document.getElementById("quiz-answer");

  if (currentQuestionIndex >= quizData.length) {
    saveScoreToLeaderboard();
    showSummary();
    return;
  }

  const currentQuestion = quizData[currentQuestionIndex];
  quizQuestionElement.textContent = currentQuestion.question;

  quizOptionsElement.innerHTML = "";
  quizAnswerElement.value = "";

  if (
    currentQuestion.type === "multiple" ||
    currentQuestion.type === "truefalse"
  ) {
    currentQuestion.options.forEach((option) => {
      const optionWrapper = document.createElement("div");
      const optionInput = document.createElement("input");
      optionInput.type = "radio";
      optionInput.name = "option";
      optionInput.value = option;
      optionWrapper.appendChild(optionInput);

      const optionLabel = document.createElement("label");
      optionLabel.textContent = option;
      optionWrapper.appendChild(optionLabel);

      quizOptionsElement.appendChild(optionWrapper);
    });
  } else {
    const optionWrapper = document.createElement("div");
    const optionInput = document.createElement("input");
    optionInput.type = "text";
    optionInput.name = "option";
    quizOptionsElement.appendChild(optionWrapper);
    optionWrapper.appendChild(optionInput);
  }
}

function startTimer() {
  document.getElementById("timeLeft").textContent = timeLeft;
  timerInterval = setInterval(function () {
    timeLeft--;
    document.getElementById("timeLeft").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      saveScoreToLeaderboard();
      showSummary();
    }
  }, 1000);
}

function showSummary() {
  document.getElementById("quiz-section").style.display = "none";
  const summaryContainer = document.getElementById("summary-container");
  summaryContainer.innerHTML = ""; // Clear any existing content

  let correctAnswers = 0;

  quizData.forEach((item, index) => {
    const summaryItem = document.createElement("div");
    summaryItem.className = "summary-item";
    summaryItem.innerHTML = `
            <p><span>Question ${index + 1}:</span> ${item.question}</p>
            <p><span>Your Answer:</span> ${
              item.userAnswer || "No answer provided"
            }</p>
            <p><span>Correct Answer:</span> ${item.answer}</p>
        `;
    summaryContainer.appendChild(summaryItem);

    if (
      item.userAnswer &&
      item.userAnswer.toLowerCase() === item.answer.toLowerCase()
    ) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / quizData.length) * 100;
  const scoreElement = document.getElementById("quiz-score");
  scoreElement.textContent = `Your Score: ${score}%`;

  if (score < 50) {
    scoreElement.classList.add("wrong");
    scoreElement.textContent += " - Better luck next time!";
  } else {
    scoreElement.classList.remove("wrong");
  }

  document.getElementById("summary-section").style.display = "block";
}

function displayPastQuizzes() {
  const pastQuizzesContainer = document.getElementById(
    "past-quizzes-container"
  );
  pastQuizzesContainer.innerHTML = "";

  const userQuizzes = users[currentUser].quizzes;

  userQuizzes.forEach((quiz, index) => {
    const quizItem = document.createElement("div");
    quizItem.className = "past-quiz-item";
    quizItem.textContent = `Quiz ${index + 1} - ${quiz.length} Questions`;
    quizItem.addEventListener("click", function () {
      pastQuizData = quiz;
      document.getElementById("past-quizzes-section").style.display = "none";
      document.getElementById("quiz-section").style.display = "block";
      currentQuestionIndex = 0;
      displayNextQuestion();
      startTimer();
    });
    pastQuizzesContainer.appendChild(quizItem);
  });

  if (userQuizzes.length === 0) {
    pastQuizzesContainer.innerHTML =
      "<p>No quizzes found. Start by creating a new quiz!</p>";
  }
}

function saveScoreToLeaderboard() {
  const correctAnswers = quizData.filter(
    (item) =>
      item.userAnswer &&
      item.userAnswer.toLowerCase() === item.answer.toLowerCase()
  ).length;
  const score = (correctAnswers / quizData.length) * 100;

  const leaderboardEntry = {
    username: currentUser,
    score: score,
    date: new Date().toLocaleString(),
  };

  leaderboard.push(leaderboardEntry);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-container");
  leaderboardContainer.innerHTML = "";

  const sortedLeaderboard = leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  sortedLeaderboard.forEach((entry, index) => {
    const leaderboardItem = document.createElement("div");
    leaderboardItem.className = "leaderboard-item";
    leaderboardItem.innerHTML = `<strong>${index + 1}. ${
      entry.username
    }</strong> - ${entry.score}% (taken on ${entry.date})`;
    leaderboardContainer.appendChild(leaderboardItem);
  });

  if (sortedLeaderboard.length === 0) {
    leaderboardContainer.innerHTML = "<p>No scores available yet.</p>";
  }
}

function updateOptionsContainer(selectId) {
  const selectElement = document.getElementById(selectId);
  const questionNumber = selectId.replace("type", "");
  const optionsContainer = document.getElementById(`options${questionNumber}`);

  // Clear previous options
  optionsContainer.innerHTML = "";

  if (selectElement.value === "multiple") {
    for (let i = 1; i <= 4; i++) {
      const optionInput = document.createElement("input");
      optionInput.type = "text";
      optionInput.name = `option${questionNumber}-${i}`;
      optionInput.placeholder = `Option ${i}`;
      optionsContainer.appendChild(optionInput);
    }
  }
}
