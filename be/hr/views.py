from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet


from users.permissions import HROnly
from .serializers import (
    EvaluationRubricSerializer
)


class EvalutationRubricView(GenericViewSet):   
    permission_classes = (HROnly,)
    serializer_class = EvaluationRubricSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)\
            .is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

