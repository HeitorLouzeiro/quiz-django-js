from django.urls import path

from . import views

urlpatterns = [
    path('', views.name_input, name='name-input'),
    path('quiz', views.index, name='quiz-home'),
    path('api/questions/', views.get_questions, name='get_questions'),
    path('api/score/', views.save_score, name='save_score'),
]
