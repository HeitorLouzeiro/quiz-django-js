import json
import os
import random

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render

from .models import Score
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
def name_input(request):

    return render(request, 'quiz/pages/name_input.html')


def index(request):
    return render(request, 'quiz/pages/index.html')


def get_questions(request):
    questions = cache.get('questions')
    if not questions:
        json_path = os.path.join(
            settings.BASE_DIR, 'questions', 'questions.json')
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                questions = json.load(file)
                # Cache por 1 hora
                cache.set('questions', questions, timeout=3600)
        except FileNotFoundError:
            return JsonResponse({"error": "File not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Selecionar aleatoriamente 10 perguntas
    selected_questions = random.sample(questions, 10)
    request.session['questions'] = selected_questions

    return JsonResponse({"questions": selected_questions})


@csrf_exempt
def get_scores(request):
    if request.method == "GET":
        scores = Score.objects.all().order_by(
            '-points')  # Ordena por pontuação decrescente
        scores_data = [{"player_name": score.player_name,
                        "points": score.points} for score in scores]
        return JsonResponse(scores_data, safe=False)
    return JsonResponse({"error": "Invalid method"}, status=400)


def save_score(request):
    if request.method == 'POST':
        player_name = request.POST.get('player_name')
        points = int(request.POST.get('points'))  # Converter para inteiro

        # Verificar se já existe uma pontuação para esse jogador
        score = Score.objects.filter(player_name=player_name).first()

        if score:
            # Se a pontuação atual for maior que a registrada, atualizar
            if points > score.points:
                score.points = points
                score.save()
                return JsonResponse({'message': 'Pontuação atualizada com sucesso!'})
            else:
                return JsonResponse({'message': 'A pontuação não é maior do que a já registrada.'})
        else:
            # Se não existir pontuação, salvar como nova
            new_score = Score(player_name=player_name, points=points)
            new_score.save()
            return JsonResponse({'message': 'Pontuação salva com sucesso!'})

    return JsonResponse({'message': 'Método inválido'}, status=405)


def results(request):
    return render(request, 'quiz/pages/results.html')
