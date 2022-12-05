
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status, generics
from rest_framework.viewsets import GenericViewSet
from django.db import transaction

from .serializers import (
    AttendanceSerializer,
    CustomerRatingSerializer,
    Attendance,
    CustomerRatingAnswers,
    AbsencesSerializer,
    Absences
)
from users.serializers import (
    UserSerializer,
    User,
)
from utils.query import (
    convert_datetz
)
from users.permissions import EmployeeOnly,HROnly



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

class AbsencesView(GenericViewSet, generics.ListAPIView):   
    permission_classes = (HROnly,)
    serializer_class = AbsencesSerializer

    def get_queryset(self):
        queryset = Absences.objects.all()
        try:
            date_from = self.request.query_params.get('from')
            date_to = self.request.query_params.get('to')
            if date_from is not None and date_to is not None:
                date_from = convert_datetz(date_from)
                date_to = convert_datetz(date_to)
                queryset = queryset.filter(date__range=[date_from, date_to])

            filter = self.request.query_params.get('filter')
            if filter is not None:
                queryset = queryset.filter(reason__contains=filter)
            return queryset
        except (Exception,):
            return queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['pk'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)

        return Response(status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        data = self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date')
        absences_serializer = AbsencesSerializer(data, many=True)
        
        user_serializer = UserSerializer(
            User.objects.get(id=kwargs['pk'])
            ,many=False)

        return Response({
            'absences_list': absences_serializer.data,
            'user': user_serializer.data
        },status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        Absences.objects.get(user_id=kwargs['pk'],id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        absence = self.get_queryset().get(id=kwargs['id'])
        serializer = self.serializer_class(absence, many=False)
        
        user = User.objects.get(id=absence.user.id)
        user_serializer = UserSerializer(user, many=False)
        return Response({
            'user': user_serializer.data,
            'absence': serializer.data,
        } ,status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        absence = Absences.objects.get(id=kwargs['pk'])
        serializer = self.serializer_class(absence, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        return Response(status=status.HTTP_200_OK)




