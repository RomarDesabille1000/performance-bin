from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
import pytz
from datetime import timedelta, datetime
from django.db.models import Sum, Count, Func, F
from django.db.models.functions import ExtractMonth, TruncMonth, Cast
import numpy as np
import pandas as pd
from django.utils.dateparse import parse_datetime, parse_date
from dateutil import parser


from users.permissions import HROnly
from .serializers import (
    EvaluationRubricSerializer,
    EmployeeEvaluationSerializer,
    EvaluationRubric,
    EmployeeEvaluation,
    Sales,
    SalesSerializer,
    BackJobsSerializer,
    BackJobs,
    EmployeePositions,
    EmployeePositionsSerializer,
    RubricTemplate,
    RubricTemplateSerializer,
    RubricCriteria,
    RubricCriteriaSerializer,
    EvaluationRubricCriteriaSerializer,
    EvaluationRubricTemplateSerializer,
    EvaluationRubricTemplate,
)
from users.serializers import (
    UserSerializer,
    User,
    Employee,
)
from employee.serializers import (
    Attendance,
    CustomerRatingAnswers,
    Absences,
)
from utils.query import (
    convert_datetz,
    search_and_filter,
    paginated_data,
    convertTime24,
    extractTimeLate24hrFormat,
    search_,
    month_vals_array,
    get_object_or_none,
)


class EvalutationRubricView(GenericViewSet):   
    permission_classes = (HROnly,)
    serializer_class = EvaluationRubricSerializer

    def get_queryset(self):
        queryset = EvaluationRubric.objects.all()
        print(queryset)
        type = self.request.query_params.get('emptype')
        if type is not None:
            queryset = queryset.filter(employee_type=type)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)

    # def list(self, request,):
    #     data = EvaluationRubric.objects.all()
    #     serializer = EvaluationRubricSerializer(data, many=True)
    #     return Response(serializer.data , status=status.HTTP_200_OK)

    def listCore(self, request,):
        data = self.get_queryset().filter(type = 'CORE')
        serializer = EvaluationRubricSerializer(data, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)


    def listKpi(self, request, **kwargs):
        data = self.get_queryset().filter(type = 'KPI')
        serializer = EvaluationRubricSerializer(data, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        rubric = EvaluationRubric.objects.get(id=kwargs['pk'])
        data = request.data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rubric.name = data.get("name", rubric.name)
        rubric.description = data.get("description", rubric.description)
        rubric.type = data.get("type", rubric.type)
        rubric.employee_type = data.get("employee_type", rubric.employee_type)
        rubric.percentage = data.get("percentage", rubric.percentage)

        
        rubric.save()
        
        return Response(serializer.data,  status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        rubric = EvaluationRubric.objects.get(id=kwargs['pk'])
        if rubric.editable is True:
            rubric.delete()
            return Response('Rubric Deleted',  status=status.HTTP_200_OK)
        else:
            return Response('You are not allowed to delete this Rubric',  status=status.HTTP_200_OK)
        


class EmployeeEvaluationView(GenericViewSet):
    serializer_class = EmployeeEvaluationSerializer
    # queryset = EmployeeEvaluation.objects.all()

    def get_queryset(self):
        return search_and_filter(self, EmployeeEvaluation)

    def list(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['pk'])
        evaluation_serializer = ''
        
        user_serializer = UserSerializer(user, many=False)

        evaluation_detail = ''
        if 'id' in kwargs.keys():
            evaluation = self.get_queryset().get(id=kwargs['id'])
            evaluation_serializer = self.serializer_class(evaluation, many=False).data
            evaluation_detail = EvaluationRubricTemplateSerializer(
                EvaluationRubricTemplate.objects.filter(employee_evaluation=evaluation),
                many=True
            ).data
        else:
            evaluation_serializer = paginated_data(self, 
                self.get_queryset().filter(employee=user).order_by('-date_created')
            )

        return Response({
            'evaluation': evaluation_serializer,
            'user': user_serializer.data,
            'evaluation_detail': evaluation_detail
        },status=status.HTTP_200_OK)



class SalesView(GenericViewSet, generics.ListAPIView):
    serializer_class = SalesSerializer

    def get_queryset(self):
        return search_and_filter(
            self, 
            Sales, 
            item_deal__contains=self.request.query_params.get('search')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user_id=kwargs['id']).order_by('-date')

        data = paginated_data(self, queryset)
        data['employee'] = queryset.aggregate(total_sales=Sum('amount'))

        return Response(data ,status=status.HTTP_200_OK)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['id'])
        date_hired = user.user_employee.date_hired
        date_added = datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + timedelta(days=1)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Sales on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=user)

            return Response(status=status.HTTP_200_OK)
    
    def retrieve(self, request, *args, **kwargs):
        sale = self.get_queryset().get(id=kwargs['id'])
        serializer = self.serializer_class(sale, many=False)
        
        user = User.objects.get(id=sale.user.id)
        user_serializer = UserSerializer(user, many=False)
        return Response({
            'user': user_serializer.data,
            'sales': serializer.data,
        } ,status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        s = Sales.objects.get(pk=kwargs['id'])
        date_hired = s.user.user_employee.date_hired
        date_added = datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + timedelta(days=1)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Sales on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.serializer_class(s, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
            return Response(status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        Sales.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)

class BackJobsView(GenericViewSet, generics.ListAPIView):
    serializer_class = BackJobsSerializer

    def get_queryset(self):
        return search_and_filter(
            self, 
            BackJobs, 
            customer_name__contains=self.request.query_params.get('search')
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['id'])
        date_hired = user.user_employee.date_hired
        date_added = datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + timedelta(days=1)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Back Job on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=user)

            return Response(status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user_id=kwargs['id']).order_by('-date')

        data = paginated_data(self, queryset)
        data['backjob_count'] = queryset.count()

        return Response(data ,status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        backjob = self.get_queryset().get(id=kwargs['id'])
        serializer = self.serializer_class(backjob, many=False)
        
        user = User.objects.get(id=backjob.user.id)
        user_serializer = UserSerializer(user, many=False)
        return Response({
            'user': user_serializer.data,
            'backjob': serializer.data,
        } ,status=status.HTTP_200_OK)
    def update(self, request, *args, **kwargs):
        backjob = BackJobs.objects.get(pk=kwargs['id'])
        date_hired = backjob.user.user_employee.date_hired
        date_added = datetime.strptime(request.data['date'],'%Y-%m-%dT%H:%M:%S.%fZ')
        date_added = date_added + timedelta(days=1)
        if date_hired.timestamp() > date_added.timestamp():
            return Response('Unable to add Back Job on Date before Employee was Hired.', status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.serializer_class(backjob, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
            return Response(status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        BackJobs.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)
    


class Dashboard(GenericViewSet):
    def list(self, request, *args, **kwargs):
        year = self.request.query_params.get('year')
        year = int(year)
        prev_year = int(year) - 1
        today = datetime.now()
        id = kwargs['id']

        user = User.objects.get(id=id)
        date_hired = str(user.user_employee.date_hired.date() + timedelta(days=1)).split('-')
        date_hired_y = int(date_hired[0])
        date_hired_m = int(date_hired[1])

        #total current year
        total_attendance_curr = Attendance.objects.filter(
            user=user, 
            date__year=year, 
            minutes_late__lte=0
        )\
            .annotate(month=TruncMonth('date__date'))\
            .values('month')\
            .annotate(c=Count('id'))\
            .order_by('date__date')
        total_attendance_curr = len(total_attendance_curr)
        days_count_curr = 0
        # if today.year > date_hired_y and year != date_hired_y: 
        #     days_count_curr = np.busday_count(f"{year}-01-01", f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        # elif today.year > date_hired_y and year == date_hired_y:
        #     days_count_curr = np.busday_count('-'.join(date_hired), f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1

        # elif year == date_hired_y:
        #     days_count_curr = np.busday_count('-'.join(date_hired), str(datetime.now().date()), weekmask=[1,1,1,1,1,1,0]) + 1
        # else:
        #     days_count_curr = np.busday_count(f"{year}-01-01", f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1

        if year > date_hired_y and today.year == year: 
            days_count_curr = np.busday_count(f"{year}-01-01", str(datetime.now().date()), weekmask=[1,1,1,1,1,1,0]) + 1
        elif year > date_hired_y and today.year != year:
            days_count_curr = np.busday_count(f"{year}-01-01", f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        elif year == date_hired_y and today.year == year:
            days_count_curr = np.busday_count('-'.join(date_hired), str(datetime.now().date()), weekmask=[1,1,1,1,1,1,0]) + 1
        elif year == date_hired_y and today.year != year:
            days_count_curr = np.busday_count('-'.join(date_hired), f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        else:
            days_count_curr = np.busday_count(f"{year}-01-01", f"{year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1

        if total_attendance_curr > days_count_curr:
            total_attendance_curr = days_count_curr

        #total previous year
        total_attendance_prev = Attendance.objects.filter(
            user=user, 
            date__year=prev_year, 
            minutes_late__lte=0
        )\
            .annotate(month=TruncMonth('date__date'))\
            .values('month')\
            .annotate(c=Count('id'))\
            .order_by('date__date')
        total_attendance_prev = len(total_attendance_prev)
        days_count_prev = 0
        if today.year > date_hired_y and prev_year != date_hired_y: 
            days_count_prev = np.busday_count(f"{prev_year}-01-01", f"{prev_year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        elif prev_year == date_hired_y:
            days_count_prev = np.busday_count('-'.join(date_hired), f"{prev_year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        else:
            days_count_prev = np.busday_count(f"{year}-01-01", f"{prev_year}-12-31", weekmask=[1,1,1,1,1,1,0]) + 1
        if total_attendance_prev > days_count_prev:
            total_attendance_prev = days_count_prev



        attendance = Attendance.objects.filter(user_id=id, date__year=year, minutes_late__lte=0)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .annotate(c=Count('id'))\
                .order_by('date__date')

        attendance_current = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }
        for a in attendance:
            attendance_current[str(a['month'])] += 1  

        attendance_current_ = []
        for key, value in attendance_current.items():
            attendance_current_.append(value)

        attendance_prev = Attendance.objects.filter(user_id=id, date__year=prev_year, minutes_late__lte=0)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .annotate(c=Count('id'))\
                .order_by('date__date')
        
        attendance_previous = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }
        for a in attendance_prev:
            attendance_previous[str(a['month'])] += 1  

        attendance_previous_ = []
        for key, value in attendance_previous.items():
            attendance_previous_.append(value)

        # lates = Attendance.objects.filter(user_id=id, date__year=year)\
        #     .annotate(month=ExtractMonth('date')) \
        #     .values('month').annotate(c=Count('id'))\
        #         .order_by('date__date')
        

        #key represents month

        # lates_count = {
        #     '1': 0,
        #     '2': 0,
        #     '3': 0,
        #     '4': 0,
        #     '5': 0,
        #     '6': 0,
        #     '7': 0,
        #     '8': 0,
        #     '9': 0,
        #     '10': 0,
        #     '11': 0,
        #     '12': 0,
        # }
        # for l in lates:
        #     lates_count[str(l['month'])] += 1  

        sunday_attendance = Attendance.objects.filter(user_id=id, date__year=year, is_sunday=True, minutes_late__lte=0)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .annotate(c=Count('id'))\
                .order_by('date__date')

        sunday_attendance_current = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }
        for a in sunday_attendance:
            sunday_attendance_current[str(a['month'])] += 1  

        sunday_attendance_current_ = []
        for key, value in sunday_attendance_current.items():
            sunday_attendance_current_.append(value)

        sunday_attendance_prev = Attendance.objects.filter(user_id=id, date__year=prev_year, is_sunday=True, minutes_late__lte=0)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .annotate(c=Count('id'))\
                .order_by('date__date')

        sunday_attendance_previous = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }
        for a in sunday_attendance_prev:
            sunday_attendance_previous[str(a['month'])] += 1  

        sunday_attendance_prev_ = []
        for key, value in sunday_attendance_previous.items():
            sunday_attendance_prev_.append(value)

        workdays_current = {
            '01': 0,
            '02': 0,
            '03': 0,
            '04': 0,
            '05': 0,
            '06': 0,
            '07': 0,
            '08': 0,
            '09': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }
        workdays_prev = {
            '01': 0,
            '02': 0,
            '03': 0,
            '04': 0,
            '05': 0,
            '06': 0,
            '07': 0,
            '08': 0,
            '09': 0,
            '10': 0,
            '11': 0,
            '12': 0,
        }

        now = datetime.now()
        current = datetime(int(year+1), 1, 1)
        start = current.replace(day=1)

        prev = datetime(int(year), 1, 1)
        prev_start = prev.replace(day=1)

        for x in range(1, 13):
            end  = start - timedelta(days=1)
            start = end.replace(day=1)
            end = end + timedelta(days=1)
            key = str(start.date()).split('-')[1]
            if year == today.year and start.month == today.month:
                workdays_current[key] = np.busday_count(f"{year}-01-01", str((today.date() + timedelta(days=1))), weekmask='1111110')
            else:
                workdays_current[key] = np.busday_count(str(start.date()), str(end.date()), weekmask='1111110')

            end = prev_start - timedelta(days=1)
            prev_start = end.replace(day=1)
            end = end + timedelta(days=1)
            key = str(prev_start.date()).split('-')[1]
            workdays_prev[key] = np.busday_count(str(prev_start.date()), str(end.date()), weekmask='1111110')



        workdays_current_ = []
        for key, value in workdays_current.items():
            workdays_current_.append(value)

        workdays_prev_ = []
        for key, value in workdays_prev.items():
            workdays_prev_.append(value)

        total_sunday_current = 0
        for i in range(0, 12):
            workdays_current_[i] = (workdays_current_[i] + sunday_attendance_current_[i])
            total_sunday_current += sunday_attendance_current_[i]

        total_sunday_prev = 0
        for i in range(0, 12):
            workdays_prev_[i] = (workdays_prev_[i] + sunday_attendance_prev_[i])
            total_sunday_prev += sunday_attendance_prev_[i]
        
        
        attendance_current_total = total_attendance_curr
        attendance_previous_total = total_attendance_prev
        days_count_curr += total_sunday_current
        days_count_prev += total_sunday_prev

        for i in range(0, 12):
            attendance_current_[i] = (((attendance_current_[i] + sunday_attendance_current_[i]) / workdays_current_[i]) * 100)

        for i in range(0, 12):
            attendance_previous_[i] = (((attendance_previous_[i] + sunday_attendance_prev_[i]) / workdays_prev_[i]) * 100)
        


        # lates_count_ = []
        # for key, value in lates_count.items():
        #     lates_count_.append(value)

        #sales
        # total_sales = Sales.objects.filter(user_id=id, date__year=year).\
        #     aggregate(total_sales=Sum('amount'))
        #backjobs
        # total_backjobs = BackJobs.objects.filter(user_id=id, date__year=year).count()
        #ratings
        # ratings = CustomerRatingAnswers.objects.filter(user_id=id, date__year=year)
        # customer_rating = ratings.aggregate(result=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'))
        # total_rating = ratings.count() * 3 * 5

        #rating
        customer_rating_current_year = CustomerRatingAnswers.objects.filter(user_id=id, date__year=year)\
            .annotate(month=ExtractMonth('date')).values('month').\
                annotate(total=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'), count=Count('id'))
        customer_rating_previous_year = CustomerRatingAnswers.objects.filter(user_id=id, date__year=prev_year)\
            .annotate(month=ExtractMonth('date')).values('month').\
                annotate(total=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'), count=Count('id'))

        #sales
        sales_current_year = Sales.objects.filter(user_id=id, date__year=year)\
            .annotate(month=ExtractMonth('date')).values('month').annotate(total=Sum('amount'))
        sales_previous_year = Sales.objects.filter(user_id=id, date__year=prev_year)\
            .annotate(month=ExtractMonth('date')).values('month').annotate(total=Sum('amount'))
        sales_previous_year = month_vals_array(sales_previous_year, 'total')
        sales_current_year = month_vals_array(sales_current_year, 'total')

        #backjob
        backjob_current_year = BackJobs.objects.filter(user_id=id, date__year=year)\
            .annotate(month=ExtractMonth('date')).values('month').annotate(total=Count('id'))
        backjob_previous_year = BackJobs.objects.filter(user_id=id, date__year=prev_year)\
            .annotate(month=ExtractMonth('date')).values('month').annotate(total=Count('id'))
        backjob_previous_year = month_vals_array(backjob_previous_year, 'total', -1)
        backjob_current_year = month_vals_array(backjob_current_year, 'total', -1)

        return Response({
            'current_year': now.year,
            'hired_y': date_hired_y,
            'hired_m': date_hired_m,
            'attendance': {
                'current_year': attendance_current_,
                'previous_year': attendance_previous_,
                'current_total': attendance_current_total,
                'previous_total': attendance_previous_total,
                'days_count_curr': days_count_curr,
                'days_count_prev': days_count_prev,
            },
            'sales': {
                'current_year': sales_current_year,
                'previous_year': sales_previous_year,
                'current_total': sum(sales_current_year),
                'previous_total': sum(sales_previous_year),
            },
            'backjobs': {
                'current_year': backjob_current_year, 
                'previous_year': backjob_previous_year,
                'current_total': sum(backjob_current_year) * -1,
                'previous_total': sum(backjob_previous_year) * -1,
            },
            'ratings': {
                'current_year': customer_rating_current_year,
                'previous_year': customer_rating_previous_year
            },
        },status=status.HTTP_200_OK)

class EmployeePositionView(GenericViewSet, generics.ListAPIView):
    serializer_class = EmployeePositionsSerializer

    def get_queryset(self):
        return search_(self, EmployeePositions, 
            title__contains=self.request.query_params.get('position')
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = paginated_data(self, queryset)
        return Response(data , status=status.HTTP_200_OK)
    
    def listAll(self, request, *args, **kwargs):
        data = EmployeePositions.objects.all()
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)
   
    def delete(self, request, *args, **kwargs):
        EmployeePositions.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        position = EmployeePositions.objects.get(id=kwargs['id'])
        serializer = self.serializer_class(position, many=False)
        return Response(serializer.data ,status=status.HTTP_200_OK)
    def update(self, request, *args, **kwargs):
        position = EmployeePositions.objects.get(id=kwargs['id'])
        serializer = self.serializer_class(position, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)

class RubricTemplateView(GenericViewSet, generics.ListAPIView):
    serializer_class = RubricTemplateSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        position = EmployeePositions.objects.get(id=kwargs['id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(emplyee_position=position)

        return Response(status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        data = RubricTemplate.objects.all()
        data = data.filter(emplyee_position_id=kwargs['id'])
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)
   
    def delete(self, request, *args, **kwargs):
        RubricTemplate.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        template = RubricTemplate.objects.get(id=kwargs['id'])
        serializer = self.serializer_class(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)

class RubricCriteriaView(GenericViewSet, generics.ListAPIView):
    serializer_class = RubricCriteriaSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        template = RubricTemplate.objects.get(id=kwargs['id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(rubric_template=template)

        return Response(status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        data = RubricCriteria.objects.all()
        data = data.filter(rubric_template_id=kwargs['id'])
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data , status=status.HTTP_200_OK)
   
    def delete(self, request, *args, **kwargs):
        RubricCriteria.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        criteria = RubricCriteria.objects.get(id=kwargs['id'])
        serializer = self.serializer_class(criteria, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)



class CSV(GenericViewSet):

    @transaction.atomic
    def import_file(self, request, *args, **kwargs):
        not_exist_ids = []
        if 'csv' in request.FILES:
            file = request.FILES['csv']
            csv = pd.read_csv(file)
            for i, row in csv.iterrows():
                employee = None
                if row['IDNo'] == row['IDNo']:
                    try:
                        int(row['IDNo'])
                        row['IDNo'] = int(row['IDNo'])
                    except (Exception,):
                        row['IDNo'] = row['IDNo']

                    employee = get_object_or_none(Employee, emp_id=row['IDNo'])
                # try:
                if employee != None:
                    date = parser.parse(row['Date']).isoformat().split('T')[0]
                    time = '00:00:00'
                    datetime_ = date+'T'+time

                    if datetime.strptime(date, '%Y-%m-%d').date() > employee.date_hired.date():
                    
                        time_in = row['Login Time']
                        time_out = row['Logout Time']
                        minutes_late = extractTimeLate24hrFormat(time_in)
                        attendance = Attendance.objects.filter(user=employee.user)

                        if attendance.filter(date__date=date).exists():
                            attendance = attendance.filter(date__date=date)
                            attendance.update(time_in=time_in)
                            attendance.update(time_out=time_out)
                            attendance.update(minutes_late=minutes_late)
                        else:
                            if row['Punctuality'] != 'not logged in':
                                employee = Employee.objects.get(emp_id=row['IDNo'])
                                attendance = Attendance.objects.create(
                                    user=employee.user,
                                    date=datetime_,
                                    time_in=time_in,
                                    time_out=time_out,
                                    minutes_late=minutes_late,
                                    completed=True,
                                    reason="from csv",
                                )
                                if row['Punctuality'] == 'logged in late':
                                    attendance.save()
                            

                            if Absences.objects.filter(user=employee.user)\
                                .filter(date__date=date).exists():
                                pass
                            else:
                                if row['Punctuality'] == 'not logged in':
                                    Absences.objects.create(
                                        user=employee.user,
                                        reason="from csv",
                                        date=datetime_,
                                    )
                else:
                    if row['IDNo'] == row['IDNo']:
                        if row['IDNo'] not in not_exist_ids:
                            not_exist_ids.append(row['IDNo']) 

                # except (Exception,):
                #     if int(row['IDNo']) not in not_exist_ids:
                #         not_exist_ids.append(int(row['IDNo'])) 

        return Response({ 
            'not_exist_ids': not_exist_ids
        }, status=status.HTTP_200_OK)