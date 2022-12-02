from django.contrib import admin
from .models import Attendance, CustomerRatingAnswers

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'customer_name', 'location', 'timestamp')


@admin.register(CustomerRatingAnswers)
class CustomerRatingAnswersAdmin(admin.ModelAdmin):
    list_display = ('user', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6')
