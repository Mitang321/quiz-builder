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

    // Event listener for question type change
    typeSelect.addEventListener("change", function () {
      updateOptionsContainer(typeSelect.id);
    });
  });

document
  .getElementById("quizForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    quizData = [];

    for (let i = 1; i <= questionCount; i++) {
      const question = document.getElementById(`question${i}`).value;
      const answer = document.getElementById(`answer${i}`).value;
      const type = document.getElementById(`type${i}`).value;
      let options = [];

      if (type === "multiple") {
        options = Array.from(
          document.querySelectorAll(`#options${i} input`)
        ).map((option) => option.value);
      }

      quizData.push({ question, answer, type, options, userAnswer: "" });
    }

    // Hide the form and show the quiz section
    document.getElementById("quizForm").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";

    startTimer();
    displayNextQuestion();
  });

document
  .getElementById("nextQuestionBtn")
  .addEventListener("click", function () {
    let userAnswer;
    const currentType = quizData[currentQuestionIndex].type;

    if (currentType === "text") {
      userAnswer = document.getElementById("quiz-answer").value;
    } else if (currentType === "multiple" || currentType === "truefalse") {
      userAnswer = document.querySelector(
        'input[name="quiz-option"]:checked'
      ).value;
    }

    quizData[currentQuestionIndex].userAnswer = userAnswer; // Store user's answer
    document.getElementById("quiz-answer").value = ""; // Clear the input field

    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {
      displayNextQuestion();
    } else {
      clearInterval(timerInterval); // Stop the timer
      showSummary();
    }
  });

document.getElementById("retakeQuizBtn").addEventListener("click", function () {
  currentQuestionIndex = 0;
  timeLeft = totalQuizTime; // Reset timer
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";
  startTimer();
  displayNextQuestion();
});

function displayNextQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];
  const quizQuestionElement = document.getElementById("quiz-question");
  const quizOptionsElement = document.getElementById("quiz-options");
  const quizAnswerElement = document.getElementById("quiz-answer");

  quizQuestionElement.textContent = currentQuestion.question;
  quizOptionsElement.innerHTML = "";

  if (currentQuestion.type === "text") {
    quizAnswerElement.style.display = "block";
    quizOptionsElement.style.display = "none";
  } else if (
    currentQuestion.type === "multiple" ||
    currentQuestion.type === "truefalse"
  ) {
    quizAnswerElement.style.display = "none";
    quizOptionsElement.style.display = "block";

    currentQuestion.options.forEach((option) => {
      const optionWrapper = document.createElement("div");
      const optionInput = document.createElement("input");
      optionInput.type = "radio";
      optionInput.name = "quiz-option";
      optionInput.value = option;
      optionWrapper.appendChild(optionInput);

      const optionLabel = document.createElement("label");
      optionLabel.textContent = option;
      optionWrapper.appendChild(optionLabel);

      quizOptionsElement.appendChild(optionWrapper);
    });
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
