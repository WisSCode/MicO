# Generated by Django 5.2.3 on 2025-07-23 00:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UbicacionRepartidor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitud', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitud', models.DecimalField(decimal_places=6, max_digits=9)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('repartidor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
