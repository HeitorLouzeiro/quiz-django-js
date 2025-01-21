from django.conf import settings
import json
import os

from django.http import JsonResponse
from django.shortcuts import render

from .models import Score


# Create your views here.
def name_input(request):
    return render(request, 'quiz/pages/name_input.html')


def index(request):
    return render(request, 'quiz/pages/index.html')


def get_questions(request):
    # Caminho para o arquivo JSON
    json_path = os.path.join(settings.BASE_DIR, 'questions', 'questions.json')
    try:
        with open(json_path, 'r') as file:
            questions = json.load(file)
        return JsonResponse({"questions": questions})
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


def save_score(request):
    if request.method == "POST":
        player_name = request.POST.get("player_name")
        points = int(request.POST.get("points"))
        Score.objects.create(player_name=player_name, points=points)
        return JsonResponse({"message": "Score saved successfully!"})
