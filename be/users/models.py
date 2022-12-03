from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class User(AbstractBaseUser, PermissionsMixin):
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"
    USER_TYPES = (
        (HR, "HR"),
        (EMPLOYEE, "Employee"),
    )
    email = models.EmailField(max_length=500, unique=True)
    name = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=10, choices=USER_TYPES, default=EMPLOYEE)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ("name",)

    def get_token(self):
        return Token.objects.get(user=self)


SALESEXECUTIVE = "SALESEXECUTIVE"
TECHNICIAN = "TECHNICIAN"
USER_TYPES = (
    (SALESEXECUTIVE, "Sales Executive"),
    (TECHNICIAN, "Tecnician"),
)
class Employee(models.Model):
    user = models.OneToOneField('users.User', 
        on_delete=models.SET_NULL, blank=True, null=True, related_name='user_employee')
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    mi = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=USER_TYPES, default=SALESEXECUTIVE)
    position = models.CharField(max_length=255)
    date_hired = models.DateTimeField()


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)