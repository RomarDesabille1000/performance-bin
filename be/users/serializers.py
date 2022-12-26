from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from utils.query import get_object_or_none
from rest_framework.serializers import Serializer, ModelSerializer
from django.db import transaction

from .models import (
    User,
    Employee
)
from hr.models import (
    EmployeePositions,
)


class LoginSerializer(Serializer):
    user = None
    error = "Incorrect Credentials. Please try again."

    email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        return super().__init__(*args, **kwargs)

    def validate(self, data):
        email, password = data.values()

        if not email or not password:
            raise serializers.ValidationError(self.error, code="auth")

        user = get_object_or_none(get_user_model(), email__iexact=email)
        if not user:
            raise serializers.ValidationError(self.error, code="auth")

        self.user = authenticate(request=self.request, **data)
        if not self.user:
            raise serializers.ValidationError(self.error, code="auth")

        return data

    def to_representation(self, instance):
        resp = super().to_representation(instance)
        type_ = self.user.type
        if self.user.type == 'EMPLOYEE':
            type_ = self.user.user_employee.designation
        resp.update({
            'type': type_,
            'token': self.user.get_token().key
        })

        return resp

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeePositions
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    position = PositionSerializer(read_only=True ,many=False)
    position_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = Employee
        fields = '__all__'

    
class UserSerializer(serializers.ModelSerializer):
    user_employee = EmployeeSerializer(many=False)
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('id','email', 'name', 'type', 'user_employee', 'password', 'is_active', )

    @transaction.atomic
    def create(self, validated_data):
        employee_data = validated_data.pop('user_employee')

        user = User.objects.create(**validated_data)
        password = validated_data.get('password', None)
        user.set_password(password)
        user.save()

        Employee.objects.create(
            **employee_data, 
            user=user,
        )
        return user