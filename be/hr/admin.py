from django.contrib import admin
from .models import (
    EvaluationRubric,
    EmployeeEvaluation, 
    EmployeeEvaluationDetail,
    Sales,
    BackJobs,
)


@admin.register(BackJobs)
class BackJobsAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'description', 'date',)


@admin.register(Sales)
class SalesAdmin(admin.ModelAdmin):
    list_display = ('date', 'item_deal', 'date',)


@admin.register(EvaluationRubric)
class EvaluationRubricAdmin(admin.ModelAdmin):
    list_display = ('type', 'employee_type', 'name', 'description', 'percentage',)

class EmployeeEvaluationDetailInline(admin.TabularInline):
    model = EmployeeEvaluationDetail

@admin.register(EmployeeEvaluation)
class EmployeeEvaluationAdmin(admin.ModelAdmin):
    list_display = ('date_created',)

    inlines = [
        EmployeeEvaluationDetailInline
    ]

