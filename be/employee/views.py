
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status, generics
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
from django.db.models import Sum, Count

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
    convert_datetz,
    search_and_filter,
    paginated_data,
)
from users.permissions import EmployeeOnly,HROnly



class AttendanceView(GenericViewSet):   
    # permission_classes = (EmployeeOnly,)
    serializer_class = AttendanceSerializer
    queryset = Attendance.objects.all()

    def get_queryset(self):
        queryset = Attendance.objects.all()
        try:
            date_from = self.request.query_params.get('from')
            date_to = self.request.query_params.get('to')
            if date_from is not None and date_to is not None:
                date_from = convert_datetz(date_from)
                date_to = convert_datetz(date_to)
                queryset = queryset.filter(date__range=[date_from, date_to])

            filter = self.request.query_params.get('filter')
            if filter is not '':
                queryset = queryset.filter(customer_name__contains=filter).filter(type='OFFSITE')
            a_type = self.request.query_params.get('type')
            if a_type is not '':
                queryset = queryset.filter(type=a_type)
            return queryset
        except (Exception,):
            return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)
    
    @transaction.atomic
    def onsitecreate(self, request, *args, **kwargs):
        userdata = User.objects.get(id=kwargs['pk'])
        print(request.data['date'])
        if Absences.objects.filter(user=kwargs['pk']).filter(date=request.data['date']).exists():
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        if Attendance.objects.filter(user=kwargs['pk']).filter(date=request.data['date']).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        else :
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=userdata)

            return Response(status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        data = self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date')
        page = self.paginate_queryset(data)
        attendance_serializer = AttendanceSerializer(page, many=True)
        return self.get_paginated_response(attendance_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        Attendance.objects.get(user_id=kwargs['pk'],id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)


class CustomerRatingView(GenericViewSet):   
    # permission_classes = (EmployeeOnly,)
    serializer_class =  CustomerRatingSerializer 
    queryset = CustomerRatingAnswers.objects.all()

    def get_queryset(self):
        return search_and_filter(self, CustomerRatingAnswers)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user_id=kwargs['pk'])\
            .order_by('-date')

        user_serializer = UserSerializer(
            User.objects.get(id=kwargs['pk'])
            ,many=False)

        customer_rating = paginated_data(self, queryset)
        #back

        total_customer_rating = queryset.aggregate(result=Sum('q4'))
        total_rating = queryset.count() * 5

        return Response({
            'customer_rating': customer_rating,
            'user': user_serializer.data,
            'rating': {
                'total_rating': total_customer_rating,
                'over': total_rating
            }
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
        userdata = User.objects.get(id=kwargs['pk'])
        print(request.data['date'])
        if Absences.objects.filter(date=request.data['date']).filter(user=kwargs['pk']).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if Attendance.objects.filter(date=request.data['date']).filter(user=kwargs['pk']).exists():
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        else :
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=userdata)

            return Response(status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        data = self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date')
        page = self.paginate_queryset(data)
        absences_serializer = AbsencesSerializer(page, many=True)
        return self.get_paginated_response(absences_serializer.data)
        

        # return Response({
        #     'absences_list': self.get_paginated_response(absences_serializer.data),
        #     'user': user_serializer.data
        # },status=status.HTTP_200_OK)

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




