from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from utils.query import get_object_or_none
from rest_framework.serializers import Serializer, ModelSerializer

from .models import (
    User,
    Employee
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
        resp.update({
            'type': self.user.type,
            'token': self.user.get_token().key
        })

        return resp

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    user_employee = EmployeeSerializer(many=False)
    class Meta:
        model = User
        fields = ('id','email', 'name', 'type', 'user_employee',)
        