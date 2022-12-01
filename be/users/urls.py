from django.urls import path
from .views import Login, User

urlpatterns = [
    path('login/', Login.as_view({
        'post': 'authenticate',
    })),
    path('profile/', User.as_view({
        'get': 'info',
    })),
]
