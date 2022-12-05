from django.urls import path, include
from .views import (
    AttendanceView,
    CustomerRatingView,
    AbsencesView
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
    path('absences/', include([
        path('<int:pk>/', AbsencesView.as_view({
            'get': 'list',
            'post': 'create',
            'put':'update'
        })),
        path('retrieve/<int:id>',  AbsencesView.as_view({
            'get': 'retrieve',
        })),
        path('<int:pk>/<int:id>',  AbsencesView.as_view({
            'delete': 'delete',
        })),
    ])),
]