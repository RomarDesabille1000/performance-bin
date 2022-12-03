
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet

from .serializers import (
    AttendanceSerializer,
    CustomerRatingSerializer
)
from users.permissions import EmployeeOnly



class AttendanceView(GenericViewSet):   
    permission_classes = (EmployeeOnly,)
    serializer_class = AttendanceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)


class CustomerRatingView(GenericViewSet):   
    permission_classes = (EmployeeOnly,)
    serializer_class =  CustomerRatingSerializer 

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)


