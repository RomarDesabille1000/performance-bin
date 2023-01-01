from django.db import models
from django_base64field.fields import Base64Field
from django.utils.timezone import now
from datetime import datetime, date
from django.db.models import Sum

ONSITE = "ONSITE"
OFFSITE = "OFFSITE"
TYPES = (
    (ONSITE, "Onsite"),
    (OFFSITE, "Offsite"),
)
class Attendance(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_attendance')
    type = models.CharField(max_length=20, choices=TYPES, default=OFFSITE)
    customer_name = models.CharField(max_length=100, null=True)
    signature = models.TextField(null=True)
    location = models.CharField(max_length=255, null=True)
    date = models.DateTimeField(default=now, null=True)
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    reason = models.TextField(null=True)
    contact_no = models.CharField(max_length=255, null=True)
    completed = models.BooleanField(default=False)
    minutes_late = models.IntegerField(default=0, null=True)
    is_sunday = models.BooleanField(default=False)

    class Meta: 
        verbose_name_plural = 'Attendance'

    def save(self, *args, **kwargs):
        weekname = self.date.date().strftime("%A")
        if weekname == 'Sunday':
            self.is_sunday = True
        else:
            self.is_sunday = False
        super(Attendance, self).save(*args, **kwargs)

    def __str__(self):
            return self.user.user_employee.firstname + ' ' + self.user.user_employee.mi + ' ' + self.user.user_employee.lastname


class CustomerRatingAnswers(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='customer_employeeratings')
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
    q1_score = models.IntegerField(default=1, help_text="Index of question 1")

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
    q2_score = models.IntegerField(default=1, help_text="Index of question 2")

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
    q3_score = models.IntegerField(default=1, help_text="Index of question 3")

    q4 = models.IntegerField(
        help_text="How likely is it that you would recommend our company/product/services to a friend or colleagues? Rate us between 1 to 5, wherein 5 is the Highest and 1 is the Lowest: ")
    q5 = models.TextField(max_length=500, blank=True, null=True,
        help_text="Do you have any other comments, question or concerns")
    q6 = models.CharField(max_length=255, blank=True, null=True,
        help_text="Do you know the name of the person who assisted you")
    date = models.DateTimeField(default=now)
    signature = models.TextField(null=True)

    def customer_rating_percentage(pk, year=datetime.now().year):
        ratings = CustomerRatingAnswers.objects.filter(
            date__year=year,
            user_id=pk
        )
        data = dict()
        data['customer_rating'] = ratings.aggregate(result=Sum('q1_score')+Sum('q2_score')+Sum('q3_score'))
        data['total'] = ratings.count() * 3 * 5
        return data
    class Meta: 
        verbose_name_plural = 'Customer Satisfaction Ratings'

    def __str__(self):
            return self.user.user_employee.firstname + ' ' + self.user.user_employee.mi + ' ' + self.user.user_employee.lastname

class Absences(models.Model):
    user = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_absences')
    reason = models.CharField(max_length=255)
    date = models.DateTimeField(default=now)

    class Meta: 
        verbose_name_plural = 'Absences'

    def __str__(self):
            return self.user.user_employee.firstname + ' ' + self.user.user_employee.mi + ' ' + self.user.user_employee.lastname
