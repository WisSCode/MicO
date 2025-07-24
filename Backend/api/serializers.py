from rest_framework import serializers
from .models import Empresa, Producto, Pedido, ItemPedido
from users.models import User, Repartidor
from .models import Cart, CartItem

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'user', 'nombre', 'direccion', 'telefono', 'logo', 'creado_en']
        read_only_fields = ['id', 'creado_en']

class ProductoSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)

    class Meta:
        model = Producto
        fields = ['id', 'empresa', 'nombre', 'descripcion', 'precio', 'imagen']
        read_only_fields = ['id', 'empresa']

class CartItemSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all(), source='producto', write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'producto', 'producto_id', 'quantity', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'updated_at', 'items']

class ItemPedidoSerializer(serializers.ModelSerializer):
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto', write_only=True
    )
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    precio_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = ['id', 'producto_id', 'producto_nombre', 'cantidad', 'precio_unitario', 'total']
        read_only_fields = ['id', 'producto_nombre', 'precio_unitario', 'total']

    def get_total(self, obj):
        return obj.get_total()
    
    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value
    
    def validate_producto_id(self, value):
        if not value:
            raise serializers.ValidationError("El producto es requerido")
        return value

class PedidoSerializer(serializers.ModelSerializer):
    empresa_id = serializers.PrimaryKeyRelatedField(
        queryset=Empresa.objects.all(), source='empresa'
    )
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.name', read_only=True)
    repartidor_id = serializers.PrimaryKeyRelatedField(
        queryset=Repartidor.objects.all(), source='repartidor', required=False, allow_null=True
    )
    repartidor_nombre = serializers.CharField(source='repartidor.user.name', read_only=True, default=None)
    metodo_pago = serializers.CharField(required=False)
    items = ItemPedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente_nombre', 'empresa_id', 'empresa_nombre',
            'repartidor_id', 'repartidor_nombre',
            'fecha_pedido', 'total', 'estado', 'metodo_pago', 'items'
        ]
        read_only_fields = [
            'id', 'cliente_nombre', 'fecha_pedido', 'total', 'empresa_nombre', 'repartidor_nombre'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        metodo_pago = validated_data.pop('metodo_pago', 'Efectivo')
        cliente = validated_data.pop('cliente', self.context['request'].user)
        
        pedido = Pedido.objects.create(cliente=cliente, metodo_pago=metodo_pago, **validated_data)
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
        metodo_pago = validated_data.pop('metodo_pago', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if metodo_pago:
            instance.metodo_pago = metodo_pago
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