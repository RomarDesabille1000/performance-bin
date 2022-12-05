from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
import pytz
from datetime import timedelta, datetime
from django.db.models import Sum


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
)
from utils.query import (
    convert_datetz,
    search_and_filter,
    paginated_data,
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
    queryset = EmployeeEvaluation.objects.all()

    def list(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs['pk'])
        evaluation_serializer = ''
        
        user_serializer = UserSerializer(user, many=False)

        evaluation_detail = ''
        if 'id' in kwargs.keys():
            evaluation = self.get_queryset().get(id=kwargs['id'])
            evaluation_serializer = self.serializer_class(evaluation, many=False)
            evaluation_detail = EmployeeEvaluationDetailSerializer(
                EmployeeEvaluationDetail.objects.filter(employee_evaluation=evaluation),
                many=True
            ).data
        else:
            evaluation_serializer = self.serializer_class(
            self.get_queryset().filter(employee=user).order_by('-date_created'), many=True)

        print(evaluation_detail)
        return Response({
            'evaluation': evaluation_serializer.data,
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
        serializer = self.serializer_class(backjob, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        BackJobs.objects.get(id=kwargs['id']).delete()
        return Response(status=status.HTTP_200_OK)