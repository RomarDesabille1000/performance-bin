from django.urls import path, include
from .views import (
    AttendanceView,
    CustomerRatingView,
)

urlpatterns = [
    path('attendance/', include([
        path('', AttendanceView.as_view({
            'post': 'create',
        })),
        path('<int:pk>/', AttendanceView.as_view({
            'get': 'list',
        })),
    ])),
    path('customer-rating/', include([
        path('', CustomerRatingView.as_view({
            'post': 'create',
        })),
        path('<int:pk>/', CustomerRatingView.as_view({
            'get': 'list',
        })),
    ])),
]