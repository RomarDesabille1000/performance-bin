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
from django.utils.dateparse import parse_datetime
from dateutil import parser


from users.permissions import HROnly
from .serializers import (
    EvaluationRubricSerializer,
    EmployeeEvaluationSerializer,
    EvaluationRubric,
    EmployeeEvaluation,
    EmployeeEvaluationDetail,
    Sales,
    SalesSerializer,
    BackJobsSerializer,
    BackJobs,
    EmployeeEvaluationDetailSerializer,
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
            evaluation_detail = EmployeeEvaluationDetailSerializer(
                EmployeeEvaluationDetail.objects.filter(employee_evaluation=evaluation),
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

        today = datetime.now()
        id = kwargs['id']
        attendance = Attendance.objects.filter(user_id=id, date__year=year)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .annotate(c=Count('id'))\
                .order_by('date__date')

        lates = Attendance.objects.filter(user_id=id, date__year=year, late=True)\
            .annotate(month=ExtractMonth('date')) \
            .values('month').annotate(c=Count('id'))\
                .order_by('date__date')
        

        #key represents month
        months_count = {
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
            months_count[str(a['month'])] += 1  

        lates_count = {
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
        for l in lates:
            lates_count[str(l['month'])] += 1  

        now = datetime.now()
        current = datetime(int(year)+1, 1, 1)

        start = current.replace(day=1)

        workdays = {
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

        for x in range(1, 13):
            end   = start - timedelta(days=1)
            start = end.replace(day=1)
            key = str(start.date()).split('-')[1]
            workdays[key] = np.busday_count(str(start.date()), str(end.date()), weekmask='1111110') + 1

        workdays_ = []
        months_count_ = []
        lates_count_ = []
        for key, value in workdays.items():
            workdays_.append(value)
        for key, value in months_count.items():
            months_count_.append(value)
        for key, value in lates_count.items():
            lates_count_.append(value)

        #sales
        total_sales = Sales.objects.filter(user_id=id, date__year=year).\
            aggregate(total_sales=Sum('amount'))
        #backjobs
        total_backjobs = BackJobs.objects.filter(user_id=id, date__year=year).count()
        #ratings
        ratings = CustomerRatingAnswers.objects.filter(user_id=id, date__year=year)
        customer_rating = ratings.aggregate(result=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'))
        total_rating = ratings.count() * 3 * 5

        return Response({
            'lates': lates_count_,
            'attendance': months_count_,
            'workdays': workdays_,
            'sales': total_sales,
            'backjobs': total_backjobs,
            'ratings': customer_rating,
            'total_ratings': total_rating,
        },status=status.HTTP_200_OK)



class CSV(GenericViewSet):

    @transaction.atomic
    def import_file(self, request, *args, **kwargs):
        not_exist_ids = []
        if 'csv' in request.FILES:
            file = request.FILES['csv']
            csv = pd.read_csv(file)
            for i, row in csv.iterrows():
                try:
                    date = parser.parse(row['Date']).isoformat().split('T')[0]
                    time = '06:00:00'
                    datetime = date+'T'+time
                    
                    time_in = row['Login Time']
                    time_out = row['Logout Time']
                    minutes_late = extractTimeLate24hrFormat(time_in)

                    employee = Employee.objects.get(emp_id=row['IDNo'])
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
                                date=datetime,
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
                                    date=datetime,
                                )
                except (Exception,):
                    if row['IDNo'] not in not_exist_ids:
                        not_exist_ids.append(row['IDNo']) 

        return Response({ 
            'not_exist_ids': not_exist_ids
        }, status=status.HTTP_200_OK)