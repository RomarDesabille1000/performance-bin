
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet
from .serializers import LoginSerializer, UserSerializer
from .permissions import HROnly, EmployeeOnly



class AttendanceView(GenericViewSet):   
    permission_classes = (EmployeeOnly,)

    def create(self, request):
        pass

