from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, re_path, include
from django.views.generic.base import TemplateView

admin.site.site_header = "HR@timbangan"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('users/', include('users.urls')),
        path('hr/', include('hr.urls')),
        path('employee/', include('employee.urls')),
        path('schedule/', include('schedule.urls')),
    ]))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

'''
urlpatterns += [
    re_path('(.*)', TemplateView.as_view(template_name='base.html')),
]
'''
