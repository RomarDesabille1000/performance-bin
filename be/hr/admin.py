from django.contrib import admin
from .models import (
    EmployeePositions,
    RubricTemplate,
    RubricCriteria,
    EvaluationRubric,
    EmployeeEvaluation, 
    Sales,
    BackJobs,
    EvaluationRubricTemplate,
    EvaluationRubricCriteria,
)


@admin.register(BackJobs)
class BackJobsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'customer_name', 'description', 'date',)


@admin.register(Sales)
class SalesAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'date', 'item_deal', 'date',)



@admin.register(EvaluationRubricCriteria)
class EvaluationRubricCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name',)
    

class EvaluationRubricTemplateInline(admin.TabularInline):
    model = EvaluationRubricTemplate


@admin.register(EmployeeEvaluation)
class EmployeeEvaluationAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'date_created', 'review_period',)

    inlines = [
        EvaluationRubricTemplateInline,
    ]

@admin.register(EmployeePositions)
class EmployeePositionsAdmin(admin.ModelAdmin):
    list_display = ('title', 'has_rating', 'has_backjob','has_sales')

@admin.register(RubricTemplate)
class RubricTemplateAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'dimension_name', 'percentage')

@admin.register(RubricCriteria)
class RubricCriteriaAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'name', 'description', 'percentage','template_name','date_created')
