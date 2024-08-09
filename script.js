let questionCount = 1;

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
    alert("Quiz Created with " + questionCount + " questions!");
  });
