from django.urls import path

from . import views

urlpatterns = [
    path('', views.name_input, name='name-input'),
    path('quiz', views.index, name='quiz-home'),
    path('quiz/scores/', views.get_scores, name='get_scores'),
    path('api/questions/', views.get_questions, name='get_questions'),
    path('api/score/save/', views.save_score, name='save_score'),
    path('quiz/results/', views.results, name='results'),

]
