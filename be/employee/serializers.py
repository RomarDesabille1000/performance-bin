from rest_framework import serializers

from .models import (
    Attendance,
    CustomerRatingAnswers,
    Absences
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

