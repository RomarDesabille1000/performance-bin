from django.urls import path, include
from .views import Login, User, HRViewOnly, EmployeeViewOnly

urlpatterns = [
    path('login/', Login.as_view({
        'post': 'authenticate',
    })),
    path('profile/', User.as_view({
        'get': 'info',
    })),
    #test only
    path('view/', include([
        path('hr/', HRViewOnly.as_view({
            'get': 'view',
        })),
        path('employee/', EmployeeViewOnly.as_view({
            'get': 'view',
        })),
    ]))
]
