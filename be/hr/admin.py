from django.contrib import admin
from .models import (
    EvaluationRubric,
    EmployeeEvaluation, 
    EmployeeEvaluationDetail
)


@admin.register(EvaluationRubric)
class EvaluationRubricAdmin(admin.ModelAdmin):
    list_display = ('type', 'employee_type', 'name', 'description', 'percentage',)

class EmployeeEvaluationDetailInline(admin.TabularInline):
    model = EmployeeEvaluationDetail

@admin.register(EmployeeEvaluation)
class EmployeeEvaluationAdmin(admin.ModelAdmin):
    inlines = [
        EmployeeEvaluationDetailInline
    ]

