from django.contrib import admin

from .models import Score

# Register your models here.


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'points', 'timestamp')
    list_filter = ('timestamp',)
