from django.db import models
from users.models import USER_TYPES, SALESEXECUTIVE
from django.utils.timezone import now


CORE = "CORE"
KPI = "KPI"
TYPES = (
    (CORE, "Core"),
    (KPI, "KPI"),
)

class EmployeePositions(models.Model):
    title = models.CharField(max_length=255,)
    has_rating = models.BooleanField(default=False)
    has_backjob = models.BooleanField(default=False)
    has_sales = models.BooleanField(default=False)

    def __str__(self):
            return self.title
    class Meta: 
        verbose_name_plural = 'Employee Position'

class RubricTemplate(models.Model):
    emplyee_position = models.ForeignKey('hr.EmployeePositions', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='rubric_template')
    dimension_name = models.CharField(max_length=100,)
    percentage = models.IntegerField()

    def __str__(self):
            return self.emplyee_position.title + ' - ' + self.dimension_name

    class Meta: 
        verbose_name_plural = 'Rubric Template'

class RubricCriteria(models.Model):
    rubric_template = models.ForeignKey('hr.RubricTemplate', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='rubric_criteria')
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    percentage = models.IntegerField()
    template_name = models.CharField(max_length=100, null=True, default = 'none')
    date_created = models.DateTimeField(default=now)

    def __str__(self):
            return self.rubric_template.dimension_name
    class Meta: 
        verbose_name_plural = 'Rubric Criteria'

class EvaluationRubric(models.Model):
    type = models.CharField(max_length=20, choices=TYPES, default=CORE)
    employee_type = models.CharField(max_length=20, choices=USER_TYPES, default=SALESEXECUTIVE)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    percentage = models.IntegerField()
    editable = models.BooleanField(default=True)

    def __str__(self):
            return self.name
    class Meta: 
        verbose_name_plural = 'Rubrics'


class EmployeeEvaluation(models.Model):
    employee = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_evaluation')
    evaluated_by = models.ForeignKey('users.User', 
        on_delete=models.SET_NULL, blank=True, null=True, related_name='user_evaluation')
    date_created = models.DateTimeField(default=now)
    review_period = models.CharField(max_length=255, null=True)
    year = models.IntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)

    def __str__(self):
            return self.employee.user_employee.firstname + ' ' + self.employee.user_employee.mi + ' ' + self.employee.user_employee.lastname

    class Meta: 
        verbose_name_plural = 'Evaluation'

class EvaluationRubricTemplate(models.Model):
    employee_evaluation = models.ForeignKey('hr.EmployeeEvaluation', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='evaluation_rubric')
    name = models.CharField(max_length=255)
    percentage = models.IntegerField()
    score = models.DecimalField(default=0, max_digits=20, decimal_places=2)

class EvaluationRubricCriteria(models.Model):
    evaluation_rubric = models.ForeignKey(EvaluationRubricTemplate, 
        on_delete=models.CASCADE, blank=True, null=True, related_name='evaluation_criteria')
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    percentage = models.IntegerField()
    score = models.DecimalField(default=0, max_digits=20, decimal_places=2)

    class Meta: 
        verbose_name_plural = 'Evaluation Criterias'


class BackJobs(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_backjobs')
    customer_name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    reason = models.CharField(max_length=255, default='')
    date = models.DateTimeField(default=now)

    class Meta: 
        verbose_name_plural = 'Backjobs'

    def __str__(self):
            return self.user.user_employee.firstname + ' ' + self.user.user_employee.mi + ' ' + self.user.user_employee.lastname

class Sales(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_sales')
    date = models.DateTimeField(default=now)
    item_deal = models.CharField(max_length=255)
    amount = models.DecimalField(default=0, max_digits=20, decimal_places=2)

    class Meta: 
        verbose_name_plural = 'Sales'

    def __str__(self):
            return self.user.user_employee.firstname + ' ' + self.user.user_employee.mi + ' ' + self.user.user_employee.lastname
