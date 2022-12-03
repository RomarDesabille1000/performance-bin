from django.urls import path, include
from .views import LoginView, UserView, EmployeesView

urlpatterns = [
    path('login/', LoginView.as_view({
        'post': 'authenticate',
    })),
    path('profile/', UserView.as_view({
        'get': 'info',
    })),
    path('employees/', include([
        path('', EmployeesView.as_view({
            'get': 'list',
            'post': 'create',
        })),
        path('<int:pk>/', EmployeesView.as_view({
            'get': 'retrieve',
            'post': 'evaluation'
        })),
    ])),

]
