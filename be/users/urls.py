from django.urls import path, include
from .views import LoginView, UserView, EmployeesView

urlpatterns = [
    path('login/', LoginView.as_view({
        'post': 'authenticate',
    })),
    path('profile/', UserView.as_view({
        'get': 'info',
    })),
    path('employees/', EmployeesView.as_view({
        'get': 'list',
    })),
]
