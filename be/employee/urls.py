from django.urls import path, include
from .views import (
    AttendanceView,
    CustomerRatingView,
)

urlpatterns = [
    path('attendance/', AttendanceView.as_view({
        'post': 'create',
    })),
    path('customer-rating/', CustomerRatingView.as_view({
        'post': 'create',
    })),
]