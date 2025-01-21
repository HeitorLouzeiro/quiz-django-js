
from django.db import models

# Create your models here.


class Score(models.Model):
    player_name = models.CharField(max_length=100)
    points = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
