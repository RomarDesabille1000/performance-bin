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
            date_to = convert_datetz(date_to) + timedelta(days=1)
            obj = obj.filter(date__range=[date_from, date_to])

        # search = self.request.query_params.get('search')
        if kwargs is not None:
            obj = obj.filter(*args, **kwargs)

        return obj
    except (Exception,):
        return obj

def search_(self, o, *args, **kwargs):
    queryset = o.objects.all()
    if kwargs is not None:
        queryset = queryset.filter(*args, **kwargs)
    return queryset

def paginated_data(self, queryset):
    page = self.paginate_queryset(queryset)
    serializer = self.serializer_class(page, many=True)
    return self.get_paginated_response(serializer.data).data


def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)

def convertTime24(str1):
    # Checking if last two elements of time
    # is AM and first two elements are 12
    if str1[-2:] == "AM" and str1[:2] == "12":
        return "00" + str1[2:-2]
         
    # remove the AM    
    elif str1[-2:] == "AM":
        return str1[:-2]
     
    # Checking if last two elements of time
    # is PM and first two elements are 12
    elif str1[-2:] == "PM" and str1[:2] == "12":
        return str1[:-2]
         
    else:
        # add 12 to hours and remove PM
        return str(int(str1[:2]) + 12) + str1[2:5]

def extractTimeLate24hrFormat(time):
    try: 
        time = time.split(':')
        totalMinutesLate = 0
        hr = int(time[0])
        minutes = int(time[1])
        if hr >= 8:
            totalMinutesLate += minutes
        if hr > 8:
            totalMinutesLate += (abs(hr - 8) * 60)
        return totalMinutesLate
    except (Exception,):
        return 0


def month_vals_array(dic, value_key):
    init_month = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '10': 0,
        '11': 0,
        '12': 0,
    }
    for d in dic:
        init_month[str(d['month'])] = d[value_key]
    arr = []
    i = 1
    today = datetime.now()
    for key, value in init_month.items():

        arr.append(value * -1)
        i += 1
    return arr