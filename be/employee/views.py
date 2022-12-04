
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet

from .serializers import (
    AttendanceSerializer,
    CustomerRatingSerializer,
    Attendance,
    CustomerRatingAnswers,
)
from users.serializers import (
    UserSerializer,
    User,
)
from users.permissions import EmployeeOnly



class AttendanceView(GenericViewSet):   
    # permission_classes = (EmployeeOnly,)
    serializer_class = AttendanceSerializer
    queryset = Attendance.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        attendance_serializer = self.serializer_class(
            self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date'), many=True)
        
        user_serializer = UserSerializer(
            User.objects.get(id=kwargs['pk'])
            ,many=False)

        return Response({
            'attendance_list': attendance_serializer.data,
            'user': user_serializer.data
        },status=status.HTTP_200_OK)


class CustomerRatingView(GenericViewSet):   
    # permission_classes = (EmployeeOnly,)
    serializer_class =  CustomerRatingSerializer 
    queryset = CustomerRatingAnswers.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        customer_rating_serializer = self.serializer_class(
            self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date'), many=True)

        user_serializer = UserSerializer(
            User.objects.get(id=kwargs['pk'])
            ,many=False)

        return Response({
            'customer_rating': customer_rating_serializer.data,
            'user': user_serializer.data
        },status=status.HTTP_200_OK)


