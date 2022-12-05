from django.shortcuts import _get_queryset
from django.db.models.base import Model
from django.utils import timezone
from datetime import timedelta, datetime
import pytz



def get_object_or_none(klass, *args, **kwargs):
    queryset = _get_queryset(klass)
    try:
        return queryset.get(*args, **kwargs)
    except queryset.model.DoesNotExist:
        return None

def convert_datetz(date, is_date=True):
    parsed_date = datetime.strptime(date, '%Y-%m-%d')
    timezone = pytz.timezone('asia/shanghai')
    return timezone.localize(parsed_date)

    # date_from = datetime.strptime(date_from+" 00:00:00", "%y-%m-%d %h:%m:%s")
    # date_to = datetime.strptime(date_to+" 23:59:59", "%y-%m-%d %h:%m:%s")
    # asia_timezone = pytz.timezone('asia/shanghai')

def search_and_filter(self, o, *args, **kwargs):
    obj = o.objects.all()
    try:
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')
        if date_from is not None and date_to is not None:
            date_from = convert_datetz(date_from)
            date_to = convert_datetz(date_to)
            obj = obj.filter(date__range=[date_from, date_to])

        # search = self.request.query_params.get('search')
        if kwargs is not None:
            obj = obj.filter(*args, **kwargs)

        return obj
    except (Exception,):
        return obj

def paginated_data(self, queryset):
    page = self.paginate_queryset(queryset)
    serializer = self.serializer_class(page, many=True)
    return self.get_paginated_response(serializer.data).data

