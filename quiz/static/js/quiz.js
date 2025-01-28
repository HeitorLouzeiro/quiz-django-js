$(document).ready(function () {
    // Verificar se a página foi recarregada
    if (performance.navigation.type === 1) {
        localStorage.setItem('feedbackMessage', 'Você recarregou a página. Por favor, tente novamente.');
        window.location.href = "/";
    }

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const timePerQuestion = 10; // Tempo em segundos
    const progressInterval = 100; // Intervalo para atualizar a barra de progresso (ms)
    let timer;

    // Carregar perguntas via AJAX
    $.getJSON('/api/questions/', function (data) {
        if (data.questions && data.questions.length > 0) {
            questions = data.questions;
            displayQuestion();
        } else {
            $('#question-container').html('<p class="text-danger">Nenhuma pergunta encontrada.</p>');
        }
    }).fail(function () {
        localStorage.setItem('feedbackMessage', 'Erro de conexão. Por favor, tente novamente.');
        window.location.href = "/";
    });

    // Função para exibir a questão atual
    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];

            // Misturar as respostas (correta + incorretas)
            const options = [...question.wrong_answers, question.correct_answer];
            options.sort(() => Math.random() - 0.5);

            $('#question-container').html(`
                <h4>${question.text}</h4>
                <ul class="list-group mt-3">
                    ${options.map((option, index) => `
                        <li class="list-group-item">
                            <input type="radio" name="answer" id="option-${index}" value="${option}">
                            <label for="option-${index}">${option}</label>
                        </li>
                    `).join('')}
                </ul>
            `);

            // Atualizar o progresso da questão
            $('#question-progress').text(`${currentQuestionIndex + 1}/${questions.length}`);

            // Reiniciar a barra de carregamento
            clearInterval(timer);
            startTimer();
        }
    }

    // Navegar para a próxima questão
    function nextQuestion() {
        const selectedOption = $('input[name="answer"]:checked').val();

        // Verificar se a resposta está correta
        if (selectedOption && selectedOption === questions[currentQuestionIndex].correct_answer) {
            score++;
            correctCount++;
        } else {
            wrongCount++;
        }

        // Atualizar contadores de acertos e erros
        $('#correct-count').text(`Acertos: ${correctCount}`);
        $('#wrong-count').text(`Erros: ${wrongCount}`);

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            clearInterval(timer);
            saveScore(score); // Salvar a pontuação
            localStorage.setItem('playerScore', score); // Armazenar a pontuação no localStorage
            window.location.href = "quiz/results/"; // Redirecionar para a página de resultados
        }
    }

    // Timer com barra de carregamento
    function startTimer() {
        const totalTicks = timePerQuestion * 1000 / progressInterval; // Total de atualizações
        let ticks = 0;

        $('#progress-bar').css('width', '0%').attr('aria-valuenow', 0);

        timer = setInterval(function () {
            ticks++;
            const progress = (ticks / totalTicks) * 100;
            $('#progress-bar').css('width', `${progress}%`).attr('aria-valuenow', progress.toFixed(0));

            if (ticks >= totalTicks) {
                clearInterval(timer);
                nextQuestion(); // Avança automaticamente
            }
        }, progressInterval);
    }

    // Função para salvar o score
    function saveScore(finalScore) {
        // Salvar a pontuação automaticamente ao final
        const playerName = localStorage.getItem('playerName');
        if (playerName) {
            $.post('api/score/save/', {
                player_name: playerName,
                points: score,
                csrfmiddlewaretoken: '{{ csrf_token }}'
            }).done(function (response) {
                alert(response.message);
            }).fail(function () {
                alert('Erro ao salvar a pontuação.');
            });
        }
    }

    // Botão de próxima pergunta
    $('#next-btn').click(nextQuestion);
});