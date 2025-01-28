
    $(document).ready(function () {
        let questions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        const timePerQuestion = 10; // Tempo por pergunta em segundos
        const progressInterval = 100; // Intervalo de atualização da barra de progresso em ms
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
            alert('Erro ao carregar as perguntas. Tente novamente mais tarde.');
        });

        // Exibir a questão atual
        function displayQuestion() {
            if (currentQuestionIndex < questions.length) {
                const question = questions[currentQuestionIndex];

                // Misturar respostas (correta + incorretas)
                const options = [...question.wrong_answers, question.correct_answer];
                options.sort(() => Math.random() - 0.5);

                // Renderizar pergunta e opções como cards
                $('#question-container').html(`
                    <h4>${question.text}</h4>
                    <div class="row mt-3">
                        ${options.map((option) => `
                            <div class="col-6">
                                <div class="card option-card mb-3" data-answer="${option}">
                                    <div class="card-body text-center">
                                        ${option}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `);

                // Adicionar evento de clique nos cards
                $('.option-card').on('click', function () {
                    const selectedOption = $(this).data('answer'); // Obter a opção selecionada
                    handleAnswer(selectedOption, $(this)); // Verificar a resposta
                });

                // Atualizar progresso
                $('#question-progress').text(`Pergunta ${currentQuestionIndex + 1} de ${questions.length}`);

                // Reiniciar barra de progresso
                clearInterval(timer);
                startTimer();
            }
        }

        // Verificar resposta e avançar
        function handleAnswer(selectedOption, cardElement) {
            $('.option-card').off('click'); // Desativar cliques nos outros cards

            if (selectedOption === questions[currentQuestionIndex].correct_answer) {
                score++;
                correctCount++;
                cardElement.addClass('correct');
            } else {
                wrongCount++;
                cardElement.addClass('wrong');
            }

            // Atualizar contadores
            $('#correct-count').text(`Acertos: ${correctCount}`);
            $('#wrong-count').text(`Erros: ${wrongCount}`);

            // Aguarde 1 segundo antes de avançar para a próxima pergunta
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    displayQuestion();
                } else {
                    clearInterval(timer);
                    saveScore(score); // Salvar a pontuação
                    localStorage.setItem('playerScore', score); // Salvar no localStorage
                    window.location.href = "quiz/results/"; // Redirecionar para os resultados
                }
            }, 1000);
        }

        // Timer com barra de progresso
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
                    handleAnswer(null, null); // Avança automaticamente sem resposta
                }
            }, progressInterval);
        }

        // Salvar pontuação
        function saveScore(finalScore) {
            const playerName = localStorage.getItem('playerName') || "Jogador Anônimo";
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            $.post('/api/score/save/', {
                player_name: playerName,
                points: finalScore,
                csrfmiddlewaretoken: csrfToken,
            }).done(function (response) {
                console.log('Pontuação salva com sucesso!');
            }).fail(function () {
                console.log('Erro ao salvar a pontuação.');
            });
        }
    });
