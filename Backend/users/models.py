from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.db import models
from django.utils import timezone

class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Debe colocar un e-mail válido.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('usuarionormal','Usuario Normal'),
        ('repartidor', 'Repartidor'),
        ('admin', 'Administrador'),
        ('empresa','Empresa'),
    ]
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, default='')
    direccion = models.CharField(max_length=500, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='usuarionormal')
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name or self.email.split('@')[0]

    @property
    def role_display(self):
        return self.get_role_display()
    
class Empresa(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='empresas')
    nombre = models.CharField(max_length=255)
    direccion = models.CharField(max_length=500, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    logo = models.ImageField(upload_to='logos_empresas/', blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    def telefono(self):
        return self.user.telefono
    telefono.short_description = 'Teléfono'

class Repartidor(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('inactivo', 'Inactivo'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='repartidor')
    estado = models.CharField(max_length=50, choices=ESTADOS, default='disponible') 
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Repartidor: {self.user.email}'