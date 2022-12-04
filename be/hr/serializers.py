from rest_framework import serializers

from .models import (
    EvaluationRubric,
    EmployeeEvaluation,
    EmployeeEvaluationDetail,
    Sales,
    BackJobs
)


class EvaluationRubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRubric
        fields = "__all__"



class EmployeeEvaluationSerializer(serializers.ModelSerializer): 
    class Meta:
        model = EmployeeEvaluation
        fields = "__all__"

class EmployeeEvaluationDetailSerializer(serializers.ModelSerializer): 
    class Meta:
        model = EmployeeEvaluationDetail
        fields = "__all__"



class SalesSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Sales
        fields = "__all__"

class BackJobsSerializer(serializers.ModelSerializer): 
    class Meta:
        model = BackJobs
        fields = "__all__"