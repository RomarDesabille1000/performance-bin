# Generated by Django 4.1 on 2022-12-03 13:18

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('employee', '0007_alter_customerratinganswers_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attendance',
            name='timestamp',
        ),
        migrations.AddField(
            model_name='attendance',
            name='date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
