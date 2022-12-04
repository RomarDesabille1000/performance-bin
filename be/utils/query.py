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

