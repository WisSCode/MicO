from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            role=validated_data.get('role', 'usuarionormal')
        )
        return user