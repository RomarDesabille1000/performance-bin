
from django.urls import path, include
from .views import (
    EvalutationRubricView,
    EmployeeEvaluationView,
    SalesView,
    BackJobsView,
    Dashboard,
    EmployeePositionView,
    RubricTemplateView,
    RubricCriteriaView,
    CSV,
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
        path('<int:pk>/update/', EvalutationRubricView.as_view({
            'patch': 'update',
        })),
        path('<int:pk>/delete/', EvalutationRubricView.as_view({
            'delete': 'destroy',
        })),
    ])),
    path('evaluation/', include([
        path('<int:pk>/', EmployeeEvaluationView.as_view({
            'get': 'list',
        })),
        path('<int:pk>/<int:id>/', EmployeeEvaluationView.as_view({
            'get': 'list',
        })),
    ])),
    path('sales/', include([
        path('<int:id>/', SalesView.as_view({
            'get': 'list',
            'post': 'create',
            'delete': 'delete',
            'put': 'update',
        })),
        path('retrieve/<int:id>/', SalesView.as_view({
            'get': 'retrieve',
        })),
    ])),
    path('backjobs/', include([
        path('<int:id>/', BackJobsView.as_view({
            'get': 'list',
            'post': 'create',
            'delete': 'delete',
            'put': 'update',
        })),
        path('retrieve/<int:id>/', BackJobsView.as_view({
            'get': 'retrieve',
        })),
    ])),
    path('dashboard/<int:id>/', Dashboard.as_view({'get': 'list'})),
    path('positions/', EmployeePositionView.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('positions/<int:id>/', EmployeePositionView.as_view({
        'delete': 'delete',
        'get': 'retrieve',
        'put': 'update'
    })),
    path('positions/all/', EmployeePositionView.as_view({
        'get': 'listAll',
    })),
    path('templates/<int:id>/', RubricTemplateView.as_view({
        'get': 'list',
        'post': 'create',
        'put': 'update'
    })),
    path('templates/delete/<int:id>/', RubricTemplateView.as_view({
        'delete': 'delete',
    })),
    path('templates/<int:id>/', RubricTemplateView.as_view({
        'get': 'list',
        'post': 'create',
        'put': 'update'
    })),
    path('templates/delete/<int:id>/', RubricTemplateView.as_view({
        'delete': 'delete',
    })),
    path('criteria/<int:id>/', RubricCriteriaView.as_view({
        'get': 'list',
        'post': 'create',
        'put': 'update'
    })),
    path('criteria/delete/<int:id>/', RubricCriteriaView.as_view({
        'delete': 'delete',
    })),
    path('import-csv/', CSV.as_view({'post': 'import_file'})),
]