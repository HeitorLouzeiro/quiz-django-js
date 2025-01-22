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


def save_score(request):
    if request.method == "POST":
        player_name = request.POST.get("player_name")
        points = request.POST.get("points")
        if not player_name or not points:
            return JsonResponse({"error": "Invalid data"}, status=400)
        try:
            points = int(points)
            score = Score.objects.create(
                player_name=player_name, points=points)
            return JsonResponse({"message": "Score saved successfully!", "score_id": score.id})
        except ValueError:
            return JsonResponse({"error": "Points must be an integer"}, status=400)
