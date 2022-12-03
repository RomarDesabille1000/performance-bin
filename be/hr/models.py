from django.db import models
from users.models import USER_TYPES, SALESEXECUTIVE


class EvaluationRubric(models.Model):
    CORE = "CORE"
    KPI = "KPI"
    TYPES = (
        (CORE, "Core"),
        (KPI, "KPI"),
    )
    type = models.CharField(max_length=20, choices=TYPES, default=CORE)
    employee_type = models.CharField(max_length=20, choices=USER_TYPES, default=SALESEXECUTIVE)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    percentage = models.IntegerField()

    def __str__(self):
            return self.name


class EmployeeEvaluation(models.Model):
    employee = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_evaluation')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
            return self.employee.name

class EmployeeEvaluationDetail(models.Model): 
    employee_evaluation = models.ForeignKey('hr.EmployeeEvaluation', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_evaluation')
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    percentage = models.IntegerField()
    score = models.IntegerField(default=0)

    