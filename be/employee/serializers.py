from rest_framework import serializers

from .models import (
    Attendance,
    CustomerRatingAnswers
)


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"


class CustomerRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRatingAnswers
        fields = "__all__"

