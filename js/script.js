// Quiz Functionality
document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let score = 0;

            // Question 1
            const q1 = document.querySelector('input[name="q1"]:checked');
            if (q1 && q1.value === 'b') score++;

            // Question 2
            const q2 = document.querySelector('input[name="q2"]:checked');
            if (q2 && q2.value === 'a') score++;

            // Question 3
            const q3 = document.querySelector('input[name="q3"]:checked');
            if (q3 && q3.value === 'c') score++;

            // Question 4
            const q4 = document.querySelector('input[name="q4"]:checked');
            if (q4 && q4.value === 'b') score++;

            // Question 5
            const q5 = document.querySelector('input[name="q5"]:checked');
            if (q5 && q5.value === 'a') score++;

            const result = document.getElementById('result');
            result.innerHTML = `You scored ${score} out of 5! ${score >= 3 ? 'Great job!' : 'Try again to learn more.'}`;
        });
    }
});