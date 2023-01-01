from rest_framework import serializers
from datetime import datetime

from .models import (
    Attendance,
    CustomerRatingAnswers,
    Absences
)
from hr.models import (
    EmployeePositions,
    EmployeeEvaluation,
)
from users.models import (
    Employee,
    User
)


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"


class CustomerRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRatingAnswers
        fields = "__all__"

class AbsencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Absences
        fields = "__all__"



class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeePositions
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    position = PositionSerializer(read_only=True ,many=False)
    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeListSerializer(serializers.ModelSerializer):
    user_employee = EmployeeSerializer(many=False)
    is_evaluated = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id','email', 'name', 'type', 'user_employee', 'is_evaluated', )
    
    def get_is_evaluated(self, obj):
        count = EmployeeEvaluation.objects.filter(
                employee=obj.id,
                year=self.context['year']
            )
        print(count.count())

        return count.count() > 0
