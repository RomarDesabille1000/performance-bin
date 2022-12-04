
from django.urls import path, include
from .views import (
    EvalutationRubricView
)

urlpatterns = [
    path('rubric/', include([
        path('', EvalutationRubricView.as_view({
            'post': 'create',
        })),
        path('core/', EvalutationRubricView.as_view({
            'get': 'listCore'
        })),
        path('kpi/', EvalutationRubricView.as_view({
            'get': 'listKpi'
        })),
    ])),
]