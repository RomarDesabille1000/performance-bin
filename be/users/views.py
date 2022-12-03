from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet
from django.db import transaction

from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    EmployeeSerializer,
    User,
)
from hr.serializers import (
    EvaluationRubricSerializer,
    EvaluationRubric,
)
from employee.serializers import (
    CustomerRatingAnswers,
)
from .permissions import HROnly, EmployeeOnly
from .models import USER_TYPES


class LoginView(GenericViewSet):
    authentication_class = ()
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def authenticate(self, request):
        serializer = self.serializer_class(
            data=request.data, request=request)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data, status=200)


class UserView(GenericViewSet):
    serializer_class = UserSerializer

    def info(self, request):
        serializer = self.serializer_class(request.user, many=False)
        return Response(serializer.data , status=status.HTTP_200_OK)
    


class EmployeesView(GenericViewSet):
    # permission_classes = (HROnly,)
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def list(self, request):
        serializer = self.serializer_class(self.get_queryset().
            filter(user_employee__isnull=False), many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)

    def retrieve(self, request, **kwargs):
        user = self.get_queryset().get(id=kwargs['pk'])
        user_serializer = self.serializer_class(user, many=False)


        rubric_serializer = EvaluationRubricSerializer(
            EvaluationRubric.objects.filter(employee_type=user.user_employee.type), 
            many=True)

        return Response({
            'user': user_serializer.data,
            'rubric': rubric_serializer.data,
            'customer_service_rating': CustomerRatingAnswers.customer_rating_percentage(pk=kwargs['pk'])
        }, status=status.HTTP_200_OK)

    @transaction.atomic
    def evaluation(self, request, **kwargs):
        d = request.data
        print(kwargs['pk'])

        return Response(status=status.HTTP_200_OK)

    