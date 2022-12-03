from rest_framework import serializers

from .models import (
    EvaluationRubric,
    EmployeeEvaluation,
    EmployeeEvaluationDetail
)


class EvaluationRubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRubric
        fields = "__all__"


#class CustomerRatingSerializer(serializers.ModelSerializer):
    #class Meta:
        #model = CustomerRatingAnswers
        #fields = "__all__"

