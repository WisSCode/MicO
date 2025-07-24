from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import Empresa, Repartidor 

User = get_user_model()

class EmpresaRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ('nombre',)

class RepartidorRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repartidor
        fields = ()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    empresa = EmpresaRegistroSerializer(required=False)
    repartidor = RepartidorRegistroSerializer(required=False)
    direccion = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role', 'telefono', 'direccion', 'empresa', 'repartidor', 'profile_pic')

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("No puedes asignarte el rol 'admin'.")
        return value

    def create(self, validated_data):
        empresa_data = validated_data.pop('empresa', None)
        repartidor_data = validated_data.pop('repartidor', None)
        direccion = validated_data.get('direccion', '')
        telefono = validated_data.get('telefono', '')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            role=validated_data.get('role', 'usuarionormal'),
            direccion=direccion,
            telefono=telefono
        )

        if user.role == 'empresa' and empresa_data:
            Empresa.objects.create(user=user, **empresa_data)
        if user.role == 'repartidor':
            Repartidor.objects.create(user=user)

        return user
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data['id'] = self.user.id
        data['name'] = self.user.name
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['telefono'] = self.user.telefono
        # Si el usuario es empresa, incluir el nombre de la empresa
        if self.user.role == 'empresa':
            empresa = getattr(self.user, 'empresa', None)
            if empresa:
                data['empresaNombre'] = empresa.nombre
            else:
                empresas = getattr(self.user, 'empresas', None)
                if empresas and empresas.exists():
                    data['empresaNombre'] = empresas.first().nombre
                else:
                    data['empresaNombre'] = ''

        # Si el usuario es repartidor, incluir el id del modelo Repartidor
        if self.user.role == 'repartidor':
            repartidor_obj = getattr(self.user, 'repartidor', None)
            if repartidor_obj:
                data['repartidor_model_id'] = repartidor_obj.id
            else:
                data['repartidor_model_id'] = None

        # Si el usuario es empresa, incluir el nombre de la empresa
        if self.user.role == 'empresa':
            empresa = getattr(self.user, 'empresa', None)
            if empresa:
                data['empresaNombre'] = empresa.nombre
            else:
                # Si el usuario tiene varias empresas, toma la primera
                empresas = getattr(self.user, 'empresas', None)
                if empresas and empresas.exists():
                    data['empresaNombre'] = empresas.first().nombre
                else:
                    data['empresaNombre'] = ''

        return data