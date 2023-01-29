from django.urls import path, include

from .views import (
    ScheduleView
)

urlpatterns = [
    path('schedules/', include([
        path('', ScheduleView.as_view({
            'get': 'list',
        })),
        path('<int:id>/', ScheduleView.as_view({
            'post': 'create',
            'delete': 'delete',
            'get': 'retrieve',
        })),
        path('<int:id>/<int:userId>/', ScheduleView.as_view({
            'put': 'update',
        })),
        path('<int:id>/today/', ScheduleView.as_view({
            'get': 'get_today_schedule',
        })),
    ])),
]