
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status, generics
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
from django.db.models import Sum, Count
from datetime import date
from django.db.models.functions import TruncMonth, ExtractMonth

from .serializers import (
    AttendanceSerializer,
    CustomerRatingSerializer,
    Attendance,
    CustomerRatingAnswers,
    AbsencesSerializer,
    Absences,
    EmployeeListSerializer,
)
from users.serializers import (
    UserSerializer,
    User,
)
from hr.serializers import (
    BackJobs,
    BackJobsSerializer
)
from utils.query import (
    convert_datetz,
    search_and_filter,
    paginated_data,
    search_,
)
from schedule.models import Schedules
import datetime
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
            if filter != '':
                queryset = queryset.filter(customer_name__contains=filter).filter(type='OFFSITE')
            a_type = self.request.query_params.get('type')
            if a_type != '':
                queryset = queryset.filter(type=a_type)
            return queryset
        except (Exception,):
            return queryset

    def create(self, request, *args, **kwargs):
        # if Attendance.objects.filter(user=self.request.user.id).filter(date__date=date.today()).exists():
        #     return Response(status=status.HTTP_400_BAD_REQUEST)
        sch = request.data.pop('schedule_id')
        if(int(sch) > 1):
            sch = Schedules.objects.get(id=sch)
            sch.done = True
            sch.save()


        return Response(status=status.HTTP_201_CREATED)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        
        if request.data['completed'] == False:
            data = {"customer_name": request.data['customer_name'], 
                    "description" :'Work not done yet.', 
                    "reason": request.data['reason']}
            backjob_serializer = BackJobsSerializer(data = data)
            backjob_serializer.is_valid(raise_exception=True)
            backjob_serializer.save(user=self.request.user)

        return Response(status=status.HTTP_201_CREATED)

    @transaction.atomic
    def non_working_attendance(self, request, *args, **kwargs):
        users = User.objects.filter(type="EMPLOYEE").values_list('id', flat=True)
        for id in users:
            Attendance.objects.create(user_id=id, **request.data)
        return Response(status=status.HTTP_201_CREATED)

    
    @transaction.atomic
    def hr_create_attendance(self, request, *args, **kwargs):
        userdata = User.objects.get(id=kwargs['pk'])
        date_hired = userdata.user_employee.date_hired
        date_added = datetime.datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + datetime.timedelta(days=1)

        # if Absences.objects.filter(user=kwargs['pk']).filter(date=request.data['date']).exists():
        #     return Response('Absence for this day already Recorded.', status=status.HTTP_400_BAD_REQUEST)
        # if Attendance.objects.filter(user=kwargs['pk']).filter(date=request.data['date']).exists():
        #     return Response('Attendance for this day already Recorded.', status=status.HTTP_400_BAD_REQUEST)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Attendance on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
        else :
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=userdata)

            return Response(status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user_id=kwargs['pk']).order_by('-date')
        data = paginated_data(self, queryset=queryset)
        total_minutes_late = queryset.filter(minutes_late__gt=0).aggregate(result=Sum('minutes_late'))

        current_year = str(datetime.datetime.now().year)
        total_attendance = queryset.filter(date__year=current_year)\
            .annotate(month=TruncMonth('date__date'))\
                .values('month')\
                .annotate(c=Count('id'))\
                .order_by('date__date')
        total_attendance = len(total_attendance)
        return Response({ 
            'attendance': data,
            'total_minutes_late': total_minutes_late,
            'total_attendance': total_attendance,
        },status=status.HTTP_200_OK)
    
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

        total_customer_rating = queryset.aggregate(result=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'))
        total_rating = queryset.count() * 3 * 5

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
        date_hired = userdata.user_employee.date_hired
        date_added = datetime.datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + datetime.timedelta(days=1)
        if Absences.objects.filter(date=request.data['date']).filter(user=kwargs['pk']).exists():
            return Response('Absence for this day already Recorded.', status=status.HTTP_400_BAD_REQUEST)
        if Attendance.objects.filter(date=request.data['date']).filter(user=kwargs['pk']).exists():
            return Response('Attendance for this day already Recorded.', status=status.HTTP_400_BAD_REQUEST)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Absence on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
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




class EmployeesView(GenericViewSet):
    serializer_class = EmployeeListSerializer

    def get_queryset(self):
        return search_(self, User, 
            user_employee__lastname__contains=self.request.query_params.get('lastname')
        )
        

    def list(self, request, **kwargs):
        year = kwargs['year']
        queryset = self.get_queryset().filter(
            user_employee__isnull=False,
            user_employee__date_hired__year__lte=year
        )
        page = self.paginate_queryset(queryset)
        serializer = self.serializer_class(page, many=True, context = {"year": year})
        return Response(self.get_paginated_response(serializer.data).data, status=status.HTTP_200_OK)




