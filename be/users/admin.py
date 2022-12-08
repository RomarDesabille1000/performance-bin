from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Employee

@admin.register(get_user_model())
class UserAdmin(BaseUserAdmin):

    readonly_fields = ('date_joined', )
    ordering = ('email',)

    filter_horizontal = ('groups', 'user_permissions',)
    list_display = ('email', 'name', 'date_joined',)

    fieldsets = (
        ("Account", {
            'fields': ('email', 'password',),
        }),
        ("Basic Information", {
            'fields': ('name', 'type')
        }),
        ("Others", {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'date_joined',)
        })
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2',),
        }),
    )

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('firstname', 'lastname', 'mi', 'position', 'date_hired')
    pass


from django.contrib.auth.models import Group
admin.site.unregister(Group)