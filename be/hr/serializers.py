from rest_framework import serializers

from .models import (
    EvaluationRubric,
    EmployeeEvaluation,
    EvaluationRubricTemplate,
    EvaluationRubricCriteria,
    Sales,
    BackJobs,
    EmployeePositions,
    RubricTemplate,
    RubricCriteria
)

class EvaluationRubricCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRubricCriteria
        fields = "__all__"
class EvaluationRubricTemplateSerializer(serializers.ModelSerializer):
    evaluation_criteria = EvaluationRubricCriteriaSerializer(many=True)
    class Meta:
        model = EvaluationRubricTemplate
        fields = "__all__"


class EvaluationRubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRubric
        fields = "__all__"



class EmployeeEvaluationSerializer(serializers.ModelSerializer): 
    evaluated_by = serializers.SerializerMethodField()
    class Meta:
        model = EmployeeEvaluation
        fields = "__all__"

    def get_evaluated_by(self, obj):
        name = ''
        try:
            if obj.evaluated_by.type == 'EMPLOYEE':
                name = obj.evaluated_by.user_employee.firstname + ' ' + obj.evaluated_by.user_employee.mi + '. ' + obj.evaluated_by.user_employee.lastname
            else:
                name = obj.evaluated_by.name
        except (Exception,):
            pass
            
        return name


class SalesSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Sales
        fields = "__all__"

class BackJobsSerializer(serializers.ModelSerializer): 
    class Meta:
        model = BackJobs
        fields = "__all__"

class EmployeePositionsSerializer(serializers.ModelSerializer): 
    class Meta:
        model = EmployeePositions
        fields = "__all__"

class RubricTemplateSerializer(serializers.ModelSerializer): 
    class Meta:
        model = RubricTemplate
        fields = "__all__"

class RubricCriteriaSerializer(serializers.ModelSerializer): 
    class Meta:
        model = RubricCriteria
        fields = "__all__"


class RubricTemplateCriteriaSerializer(serializers.ModelSerializer): 
    rubric_criteria = RubricCriteriaSerializer(many=True)
    class Meta:
        model = RubricTemplate
        fields = "__all__"