let userSelections = {};
let quizTimer;
let timeLeft = 120; // 2 minutes in seconds

// Access the API key from the environment variable
const openAiApiKey = process.env.OPENROUTER_API_KEY;

async function generateQuiz() {
    const topic = document.getElementById("topic").value.trim();
    const quizDiv = document.getElementById("quiz");
    const button = document.querySelector("button");

    if (!topic) {
        quizDiv.innerHTML = "<p style='color: red;'>Please enter a topic first!</p>";
        return;
    }

    // Reset any existing timer
    clearInterval(quizTimer);
    timeLeft = 120;
    const existingTimer = document.getElementById("timer");
    if (existingTimer) existingTimer.remove();

    button.style.backgroundColor = "#6c757d";
    button.textContent = "Generating...";
    button.disabled = true;
    quizDiv.innerHTML = "";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("quizInfo").style.display = "none"; // Hide quiz info

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openAiApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [{
                    role: "user",
                    content: `Generate exactly 10 multiple-choice questions about ${topic}. 
                                     Format each EXACTLY like this:
                                     <div class='question'>
                                       <h3>Q1. Question text?</h3>
                                       <p class='option'>A) Option 1</p>
                                       <p class='option'>B) Option 2</p>
                                       <p class='option'>C) Option 3</p>
                                       <p class='option'>D) Option 4</p>
                                       <p class='answer'>Answer: A) Correct answer</p>
                                     </div>`
                }],
                stop: ["</div>"]
            })
        });

        if (!response.ok) throw new Error("Failed to generate quiz. Please try again.");
        const data = await response.json();
        displayQuiz(data.choices[0].message.content);

        // Start the timer when questions appear
        startTimer();

    } catch (error) {
        quizDiv.innerHTML = `<p style='color: red;'>${error.message}</p>`;
    } finally {
        button.style.backgroundColor = "#0d6efd";
        button.textContent = "Generate Quiz";
        button.disabled = false;
    }
}

function startTimer() {
    const timerDisplay = document.createElement("div");
    timerDisplay.id = "timer";
    // Sticky timer styles
    timerDisplay.style.position = "fixed";
    timerDisplay.style.top = "0";
    timerDisplay.style.left = "0";
    timerDisplay.style.right = "0";
    timerDisplay.style.background = "#0d6efd";
    timerDisplay.style.color = "white";
    timerDisplay.style.padding = "10px";
    timerDisplay.style.textAlign = "center";
    timerDisplay.style.fontWeight = "bold";
    timerDisplay.style.zIndex = "1000";
    timerDisplay.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

    document.body.prepend(timerDisplay);

    quizTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            alert("Time's up! Your quiz will be automatically submitted.");
            submitQuiz();
        }
    }, 1000);

    document.getElementById("submitBtn").style.display = "block";
}

function displayQuiz(quizText) {
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = quizText;
    userSelections = {};

    // Show quiz info
    document.getElementById("quizInfo").style.display = "block";

    const options = quizDiv.querySelectorAll(".option");
    options.forEach(option => {
        option.onclick = function() {
            const questionDiv = this.closest(".question");
            const questionId = questionDiv.querySelector("h3").textContent.split(".")[0];

            if (!userSelections[questionId]) {
                userSelections[questionId] = this.textContent.trim().charAt(0);
                this.classList.add("selected");

                questionDiv.querySelectorAll(".option").forEach(opt => {
                    opt.style.pointerEvents = "none";
                });
            }
        };
    });
}

function submitQuiz() {
    clearInterval(quizTimer);
    const timer = document.getElementById("timer");
    if (timer) timer.remove();

    let score = 0;
    const questions = document.querySelectorAll(".question");

    questions.forEach(question => {
        const questionId = question.querySelector("h3").textContent.split(".")[0];
        const correctAnswer = question.querySelector(".answer").textContent
                                         .replace("Answer: ", "").trim().charAt(0);

        if (userSelections[questionId] === correctAnswer) {
            score++;
            question.querySelectorAll(".option").forEach(opt => {
                if (opt.textContent.trim().charAt(0) === correctAnswer) {
                    opt.classList.add("correct");
                }
            });
        } else {
            question.querySelectorAll(".option").forEach(opt => {
                if (opt.textContent.trim().charAt(0) === userSelections[questionId]) {
                    opt.classList.add("wrong");
                }
                if (opt.textContent.trim().charAt(0) === correctAnswer) {
                    opt.classList.add("correct");
                }
            });
        }
    });

    alert(`Your score: ${score}/${questions.length}\n\nClick "Restart Quiz" to try again.`);
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "block";
}

function restartQuiz() {
    clearInterval(quizTimer);
    const timer = document.getElementById("timer");
    if (timer) timer.remove();
    document.getElementById("quizInfo").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("quiz").innerHTML = "";
    generateQuiz();
}

// Event listeners
document.getElementById("submitBtn").addEventListener("click", submitQuiz);
document.getElementById("restartBtn").addEventListener("click", restartQuiz);