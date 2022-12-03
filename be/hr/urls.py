
from django.urls import path, include
from .views import (
    EvalutationRubricView
)

urlpatterns = [
    path('rubric/', EvalutationRubricView.as_view({
        'post': 'create',
    })),
]