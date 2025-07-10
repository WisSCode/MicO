from rest_framework import serializers
from .models import Empresa, Producto, Pedido, ItemPedido
from users.models import User

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'user', 'nombre', 'direccion', 'telefono', 'logo', 'creado_en']
        read_only_fields = ['id', 'creado_en']

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'empresa', 'nombre', 'descripcion', 'precio', 'imagen']
        read_only_fields = ['id', 'empresa']

class ItemPedidoSerializer(serializers.ModelSerializer):
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto'
    )
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = ['id', 'producto_id', 'producto_nombre', 'cantidad', 'precio_unitario', 'total']
        read_only_fields = ['id', 'producto_nombre', 'total']

    def get_total(self, obj):
        return obj.get_total()

class PedidoSerializer(serializers.ModelSerializer):
    empresa_id = serializers.PrimaryKeyRelatedField(
        queryset=Empresa.objects.all(), source='empresa'
    )
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.name', read_only=True)
    items = ItemPedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente_nombre', 'empresa_id', 'empresa_nombre', 'fecha_pedido', 'total', 'estado', 'items']
        read_only_fields = ['id', 'cliente_nombre', 'fecha_pedido', 'total', 'empresa_nombre']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        pedido = Pedido.objects.create(cliente=self.context['request'].user, **validated_data)
        total_pedido = 0

        for item_data in items_data:
            producto = item_data['producto']
            cantidad = item_data['cantidad']
            precio_unitario = producto.precio
            ItemPedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario
            )
            total_pedido += precio_unitario * cantidad

        pedido.total = total_pedido
        pedido.save()
        return pedido

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            total_pedido = 0
            for item_data in items_data:
                producto = item_data['producto']
                cantidad = item_data['cantidad']
                precio_unitario = producto.precio

                ItemPedido.objects.create(
                    pedido=instance,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=precio_unitario
                )
                total_pedido += precio_unitario * cantidad

            instance.total = total_pedido
            instance.save(update_fields=['total'])

        return instance