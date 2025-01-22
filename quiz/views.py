import json
import os

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render

from .models import Score


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
            with open(json_path, 'r') as file:
                questions = json.load(file)
                # Cache por 1 hora
                cache.set('questions', questions, timeout=3600)
        except FileNotFoundError:
            return JsonResponse({"error": "File not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    return JsonResponse({"questions": questions})


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
        points = request.POST.get('points')

        # Salvar a pontuação no banco de dados
        score = Score(player_name=player_name, points=points)
        score.save()

        return JsonResponse({'message': 'Pontuação salva com sucesso!'})
    return JsonResponse({'message': 'Método inválido'}, status=405)
