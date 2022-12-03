from django.db import models
from django_base64field.fields import Base64Field
from django.utils.timezone import now
from datetime import datetime
from django.db.models import Sum


class Attendance(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.SET_NULL, blank=True, null=True, related_name='employee_attendance')
    customer_name = models.CharField(max_length=100)
    signature = Base64Field(max_length=900000)
    location = models.CharField(max_length=255)
    date = models.DateTimeField(default=now)

    class Meta: 
        verbose_name_plural = 'Attendance'


class CustomerRatingAnswers(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.SET_NULL, blank=True, null=True, related_name='customer_employeeratings')
    VERYPOSITIVE = "VERYPOSITIVE"
    SOMEWHATPOSITIVE = "SOMEWHATPOSITIVE"
    NEUTRAL = "NEUTRAL"
    SOMEWHATNEGATIVE = "SOMEWHATNEGATIVE"
    VERYNEGATIVE = "VERYNEGATIVE"
    Question1Answers = (
        (VERYPOSITIVE, "Very Positive"),
        (SOMEWHATPOSITIVE, "Somewhat Positive"),
        (NEUTRAL, "Negative"),
        (SOMEWHATNEGATIVE, "Somewhat Negative"),
        (VERYNEGATIVE, "Very Negative"),
    )
    q1 = models.CharField(max_length=50, choices=Question1Answers, 
        help_text="Overall, how would you rate the quality of your customer service experience")

    EXTREMELYWELL = "EXTREMELYWELL"
    VERYWELL = "VERYWELL"
    SOMEWHATWELL = "SOMEWHATWELL"
    NOTSOWELL = "NOTSOWELL"
    NOTATALLWELL = "NOTATALLWELL"
    Question2Answers = (
        (EXTREMELYWELL, "Extremely Well"),
        (VERYWELL, "Very well"),
        (SOMEWHATWELL, "Somewhat Well"),
        (NOTSOWELL, "Not So Well"),
        (NOTATALLWELL, "Not at all well"),
    )
    q2 = models.CharField(max_length=50, choices=Question2Answers, 
        help_text="How well we understand and address your questions and concerns?")

    MUCHSHORTERTHANEXPECTED = "MUCHSHORTERTHANEXPECTED"
    ABOUTWHATIEXPECT = "ABOUTWHATIEXPECT"
    SHORTERTHANEXPECTED = "SHORTERTHANEXPECTED"
    LONGERTHANIEXPECTED = "LONGERTHANIEXPECTED"
    MUCHLONGERTHANIEXPECTED = "MUCHLONGERTHANIEXPECTED"
    Question3Answers = (
        (MUCHSHORTERTHANEXPECTED, "Much shorter than expected"),
        (ABOUTWHATIEXPECT, "About what I expected"),
        (SHORTERTHANEXPECTED, "Shorter than expected"),
        (LONGERTHANIEXPECTED, "Longer than I expected"),
        (MUCHLONGERTHANIEXPECTED, "Much longer than I expected"),
    )
    q3 = models.CharField(max_length=50, choices=Question3Answers, 
        help_text="How much time did it take us to address your questions and concerns?")
    q4 = models.IntegerField(help_text="How likely is it that you would recommend our company/product/services to a friend or colleagues? Rate us between 1 to 5, wherein 5 is the Highest and 1 is the Lowest: ")
    q5 = models.TextField(max_length=500, blank=True, null=True,
        help_text="Do you have any other comments, question or concerns")
    q6 = models.CharField(max_length=255, blank=True, null=True,
        help_text="Do you know the name of the person who assisted you")
    date = models.DateTimeField(default=now)

    def customer_rating_percentage(pk):
        ratings = CustomerRatingAnswers.objects.filter(
            date__year=datetime.now().year,
            user_id=pk
        )
        data = dict()
        data['customer_rating'] = ratings.aggregate(result=Sum('q4'))
        data['total'] = ratings.count() * 5
        return data
    class Meta: 
        verbose_name_plural = 'Customer answer ratings'
