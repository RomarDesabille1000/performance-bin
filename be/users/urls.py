from django.urls import path, include
from .views import LoginView, UserView, EmployeesView

urlpatterns = [
    path('login/', LoginView.as_view({
        'post': 'authenticate',
    })),
    path('profile/', UserView.as_view({
        'get': 'info',
    })),
    path('details/<int:userId>/', UserView.as_view({
        'get': 'get_user_details',
    })),
    path('profile/', include([
    ])),
    path('employees/', include([
        path('', EmployeesView.as_view({
            'get': 'list',
            'post': 'create',
        })),
        path('selection/', EmployeesView.as_view({
            'get': 'evaluation_user_selection',
        })),
        path('<int:pk>/', EmployeesView.as_view({
            'get': 'retrieve',
            'post': 'evaluation'
        })),
    ])),
]
