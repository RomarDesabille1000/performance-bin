from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    EmployeeSerializer,
    User,
)
from .permissions import HROnly, EmployeeOnly


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
        serializer = self.serializer_class(self.queryset, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)