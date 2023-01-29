from django.shortcuts import render
from rest_framework.response import Response
from .serializers import (
    ScheduleSerializer,
    Schedules,
)
from rest_framework.viewsets import GenericViewSet
from rest_framework import status, generics
from utils.query import (
    search_and_filter,
    paginated_data
)
from users.models import User
import datetime

class ScheduleView(GenericViewSet, generics.ListAPIView):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        return search_and_filter(
            self, 
            Schedules, 
            customer_name__contains=self.request.query_params.get('search'),
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by('-id')
        data = paginated_data(self, queryset)
        return Response(data,status=status.HTTP_200_OK)

    def retrieve(self, request, **kwargs):
        data = self.get_queryset().get(id=kwargs['id'])
        return Response(ScheduleSerializer(data).data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=user)
        return Response(status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        schedule = Schedules.objects.get(id=kwargs['id'])
        user = User.objects.get(id=kwargs['userId'])
        serializer = self.get_serializer(schedule, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=user)
        return Response(status=status.HTTP_200_OK)
    
    def get_today_schedule(self, request, *args, **kwargs):
        schedule = Schedules.objects.filter(employee_id=kwargs['id'], done=False, date__date=datetime.date.today())
        return Response(self.get_serializer(schedule, many=True).data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        Schedules.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)
    