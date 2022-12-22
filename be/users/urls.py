from django.urls import path, include
from .views import LoginView, UserView, EmployeesView

urlpatterns = [
    path('login/', LoginView.as_view({
        'post': 'authenticate',
    })),
    path('profile/', UserView.as_view({
        'get': 'info',
    })),
    path('profile/<int:userId>/', UserView.as_view({
        'post': 'change_password',
    })),
    path('details/<int:userId>/', UserView.as_view({
        'get': 'get_user_details',
        'put': 'update_user',
        'delete': 'delete_user'
    })),
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
        path('<int:pk>/sunday_attendance/', EmployeesView.as_view({
            'get': 'check_sunday_attendance',
            'post': 'sunday_attendance',
            'put': 'cancel_sunday_attendance',
        })),
    ])),
]
