let questionCount = 1;
let currentQuestionIndex = 0;
let quizData = [];
let timerInterval;
const totalQuizTime = 60; // Total time for the quiz in seconds
let timeLeft = totalQuizTime;
let users = JSON.parse(localStorage.getItem("users")) || {}; // Store users in localStorage
let currentUser = null;

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

    // Options Container
    const optionsContainer = document.createElement("div");
    optionsContainer.id = `options${questionCount}`;
    optionsContainer.className = "options-container";

    // Append elements to the question block
    questionBlock.appendChild(typeLabel);
    questionBlock.appendChild(typeSelect);
    questionBlock.appendChild(optionsContainer);

    // Append the new question block to the container
    questionContainer.appendChild(questionBlock);

    // Create a new answer block
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

function displayNextQuestion() {
  const quizQuestionElement = document.getElementById("quiz-question");
  const quizOptionsElement = document.getElementById("quiz-options");
  const quizAnswerElement = document.getElementById("quiz-answer");

  if (currentQuestionIndex >= quizData.length) {
    showSummary();
    return;
  }

  const currentQuestion = quizData[currentQuestionIndex];
  quizQuestionElement.textContent = currentQuestion.question;

  quizOptionsElement.innerHTML = "";
  quizAnswerElement.value = "";

  if (currentQuestion.type === "multiple") {
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
  } else if (currentQuestion.type === "truefalse") {
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

function updateOptionsContainer(selectId) {
  const questionNumber = selectId.replace("type", "");
  const selectedType = document.getElementById(selectId).value;
  const optionsContainer = document.getElementById(`options${questionNumber}`);

  optionsContainer.innerHTML = "";

  if (selectedType === "multiple") {
    for (let i = 1; i <= 4; i++) {
      const optionInput = document.createElement("input");
      optionInput.type = "text";
      optionInput.name = `option${questionNumber}-${i}`;
      optionInput.placeholder = `Option ${i}`;
      optionsContainer.appendChild(optionInput);
    }
  } else if (selectedType === "truefalse") {
    const trueOption = document.createElement("input");
    trueOption.type = "radio";
    trueOption.name = `option${questionNumber}`;
    trueOption.value = "True";
    optionsContainer.appendChild(trueOption);
    optionsContainer.appendChild(document.createTextNode(" True "));

    const falseOption = document.createElement("input");
    falseOption.type = "radio";
    falseOption.name = `option${questionNumber}`;
    falseOption.value = "False";
    optionsContainer.appendChild(falseOption);
    optionsContainer.appendChild(document.createTextNode(" False "));
  }
}
