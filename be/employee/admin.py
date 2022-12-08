from django.contrib import admin
from .models import Attendance, CustomerRatingAnswers, Absences

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'customer_name', 'location', 'date')


@admin.register(CustomerRatingAnswers)
class CustomerRatingAnswersAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'date')

@admin.register(Absences)
class Absences(admin.ModelAdmin):
    list_display = ('__str__', 'reason', 'date',)
