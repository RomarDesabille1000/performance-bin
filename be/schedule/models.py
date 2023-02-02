from django.db import models
from django.utils.timezone import now

class Schedules(models.Model):
    employee = models.ForeignKey('users.User', 
        on_delete=models.CASCADE, blank=True, null=True, related_name='employee_schedules')
    customer_name = models.CharField(max_length=255)
    contact_no = models.CharField(max_length=255)
    date = models.DateTimeField(default=now)
    location = models.CharField(max_length=255, null=True)
    done = models.BooleanField(default=False)

    def __str__(self):
            return self.customer_name
    class Meta: 
        verbose_name_plural = 'Schedules'
    
class Settings(models.Model):
    name = models.CharField(max_length=255)
