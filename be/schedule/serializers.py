from rest_framework import serializers
from schedule.models import Schedules
from users.serializers import (
    User,
    UserSerializer
)

class ScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Schedules
        fields = "__all__"
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.employee).data
        return { **data }