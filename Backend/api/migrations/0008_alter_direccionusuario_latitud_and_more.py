# Generated by Django 5.2.3 on 2025-07-24 04:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_direccionusuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='direccionusuario',
            name='latitud',
            field=models.DecimalField(decimal_places=7, help_text='Latitud GPS', max_digits=10),
        ),
        migrations.AlterField(
            model_name='direccionusuario',
            name='longitud',
            field=models.DecimalField(decimal_places=7, help_text='Longitud GPS', max_digits=10),
        ),
    ]
