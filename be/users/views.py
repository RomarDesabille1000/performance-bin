from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
import numpy as np
from datetime import datetime, date, timedelta
from django.db.models.functions import TruncMonth, ExtractMonth
from django.db.models import Count
from rest_framework import filters
from django.utils.dateparse import parse_date
from utils.query import get_object_or_none

from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    EmployeeSerializer,
    User,
)
from hr.serializers import (
    EvaluationRubric,
    EmployeeEvaluation,
    EvaluationRubricTemplate,
    EvaluationRubricCriteria,
    RubricTemplate,
    RubricCriteria,
    RubricTemplateCriteriaSerializer,
)
from employee.serializers import (
    CustomerRatingAnswers,
    Attendance
)

from utils.query import (
    search_,
    paginated_data,
    daterange,
    get_object_or_none
)
from .permissions import HROnly, EmployeeOnly
from .models import USER_TYPES, Employee


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
    queryset = User.objects.all()

    def info(self, request):
        serializer = self.serializer_class(request.user, many=False)
        return Response(serializer.data , status=status.HTTP_200_OK)
    
    def get_user_details(self, request, *args, **kwargs):
        user_serializer = self.serializer_class(
        self.get_queryset().get(id=kwargs['userId']), many=False)

        return Response(user_serializer.data, status=status.HTTP_200_OK)

    def update_user(self, request,  **kwargs):
        user = Employee.objects.get(id=kwargs['userId'])
        serializer = EmployeeSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        return Response(status=status.HTTP_200_OK)

    def change_password(self, request,  **kwargs):
        user = User.objects.get(id=kwargs['userId'])
        password = request.data['new_password']
        user.set_password(password)
        user.save()
        serializer = self.serializer_class(user, many=False)
            # serializer = EmployeeSerializer(user, data=request.data, partial=True)
            # if serializer.is_valid():
            #     serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete_user(self, request, **kwargs):
        User.objects.get(id=kwargs['userId']).delete()
        return Response(status=status.HTTP_200_OK)
    

class EmployeesView(GenericViewSet):
    # permission_classes = (HROnly,)
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def get_queryset(self):
        return search_(self, User, 
            user_employee__lastname__contains=self.request.query_params.get('lastname')
        )

    def list(self, request):
        queryset = self.get_queryset().filter(user_employee__isnull=False)
        data = paginated_data(self, queryset)
        return Response(data , status=status.HTTP_200_OK)

    def check_sunday_attendance(self, request, **kwargs):
        status_ = False
        date_ = ''
        employee = get_object_or_none(Employee, user_id=kwargs['pk'])
        if employee:   
            next_sunday = employee.next_sunday
            if next_sunday is not None:
                if date.today() < next_sunday or date.today() == next_sunday:
                    status_ = True
                    date_ = next_sunday
        return Response({ 
            'status': status_,
            'date': date_,
        }, status=status.HTTP_200_OK)
    
    def sunday_attendance(self, request, **kwargs):
        start_date = date.today()
        end_date = start_date + timedelta(days=7)
        for check_date in daterange(start_date, end_date):
            weekname = check_date.strftime("%A")
            if weekname == 'Sunday':
                employee = get_object_or_none(Employee, user_id=kwargs['pk'])
                if employee:
                    employee.next_sunday = check_date
                    employee.save()
                break
        return Response(status=status.HTTP_200_OK)
    
    def cancel_sunday_attendance(self, request, **kwargs):
        employee = get_object_or_none(Employee, user_id=kwargs['pk'])
        if employee:
            employee.next_sunday = None
            employee.save()
        return Response(status=status.HTTP_200_OK)

    def evaluation_user_selection(self, request):
        queryset = self.get_queryset().filter(user_employee__isnull=False)\
            .exclude(employee_evaluation__date_created__year=datetime.now().year)
        data = paginated_data(self, queryset)
        return Response(data, status=status.HTTP_200_OK)

    
    def create(self, request):
        emp_data = request.data['user_employee']
        if Employee.objects.filter(emp_id = emp_data['emp_id']).exists():
            return Response('Employee with this ID already Exists.', status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email = request.data['email']).exists():
            return Response('Employee with this Email already Exists.', status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(status=status.HTTP_201_CREATED)

    def retrieve(self, request, **kwargs):
        user = User.objects.get(id=kwargs['pk'])
        if user.id == request.user.id:
            return Response({'err': 'Cannot evaluate your self.'})
        user_serializer = self.serializer_class(user, many=False)
        position = user.user_employee.position
        rubricT_percentage = 0
        rubricT = RubricTemplate.objects.filter(emplyee_position=position)
        if rubricT.count() == 0:
            return Response({'err': 'Please set rubric for position ' + position.title})
        for rT in rubricT:
            rubricT_percentage += rT.percentage

            rubricC = RubricCriteria.objects.filter(rubric_template=rT)
            rubricC_percentage = 0
            for rC in rubricC:
                rubricC_percentage += rC.percentage

            if rubricC_percentage != 100:
                return Response({'err': position.title + ' rubric not reach 100%'})
        
        if rubricT_percentage != 100:
            return Response({'err': position.title + ' rubric not reach 100%'})


        rubric_serializer = RubricTemplateCriteriaSerializer(rubricT, many=True)

        date_hired = str(user.user_employee.date_hired.date() + timedelta(days=1)).split('-')
        date_hired_y = date_hired[0]
        date_hired_m = int(date_hired[1])
        current_year = str(datetime.now().year)
        # this means newly hired
        total_attendance = Attendance.objects.filter(
            user=user, 
            date__year=current_year, 
            minutes_late__lte=0
        )\
            .annotate(month=TruncMonth('date__date'))\
            .values('month')\
            .annotate(c=Count('id'))\
            .order_by('date__date')
        total_attendance = len(total_attendance)
        days_count = 0
        review_period = ''
        if current_year == date_hired_y:
            #hired count
            days_count = np.busday_count('-'.join(date_hired), str(datetime.now().date()), weekmask=[1,1,1,1,1,1,0]) + 1
            review_period = parse_date('-'.join(date_hired)).strftime('%B') + ' - ' + datetime.now().strftime('%B') + ' ' + current_year
        else:
            #all year count
            days_count = np.busday_count(f"{current_year}-01-01", str(datetime.now().date()), weekmask=[1,1,1,1,1,1,0]) + 1
            review_period = "January - " + datetime.now().strftime('%B') + ' ' + current_year

        sunday_count = Attendance.objects.filter(
            user=user, 
            date__year=current_year, 
            is_sunday=True
        ).count()
        days_count += sunday_count
        total_attendance += sunday_count

        if total_attendance > days_count:
            total_attendance = days_count

        is_evaluated = EmployeeEvaluation.objects.filter(
            date_created__year=datetime.now().year,
            employee=user
        )

        return Response({
            'user': user_serializer.data,
            'rubric': rubric_serializer.data,
            'customer_service_rating': CustomerRatingAnswers.customer_rating_percentage(pk=kwargs['pk']),
            'attendance': {
                'days_count': days_count,
                'total_attendance': total_attendance,
            },
            'review_period': review_period,
            'position': position.title,
            'is_evaluated': is_evaluated.count()
        }, status=status.HTTP_200_OK)

    @transaction.atomic
    def evaluation(self, request, **kwargs):
        data = request.data
        user_id = kwargs['pk']
        employee_evaluation= EmployeeEvaluation.objects.create(
            employee_id=user_id,
            evaluated_by=request.user,
            review_period=data['review_period'],
            comment=data['comment'],
        )
        for d in data['rubric']:
            evaluation_rubric = EvaluationRubricTemplate.objects.create(
                employee_evaluation=employee_evaluation,
                name=d['dimension_name'],
                percentage=d['percentage'],
                score=d['total'],
            )
            for e in d['rubric_criteria']:
                EvaluationRubricCriteria.objects.create(
                    evaluation_rubric=evaluation_rubric,
                    name=e['name'],
                    description=e['description'],
                    percentage=e['percentage'],
                    score=e['score'],
                )

        return Response(status=status.HTTP_200_OK)

    