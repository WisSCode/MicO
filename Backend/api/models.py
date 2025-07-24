from django.db import models
from users.models import User, Empresa, Repartidor 
from django.contrib.auth import get_user_model



User = get_user_model()

class DireccionUsuario(models.Model):
    """Modelo para guardar las direcciones de los usuarios"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direcciones')
    nombre = models.CharField(max_length=100, help_text="Ej: Casa, Trabajo, Universidad")
    direccion = models.TextField(help_text="Dirección completa")
    referencia = models.TextField(blank=True, null=True, help_text="Referencia o punto de referencia")
    latitud = models.DecimalField(max_digits=10, decimal_places=7, help_text="Latitud GPS")
    longitud = models.DecimalField(max_digits=10, decimal_places=7, help_text="Longitud GPS")
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-actualizada_en']
        verbose_name = "Dirección de Usuario"
        verbose_name_plural = "Direcciones de Usuarios"
    
    def __str__(self):
        return f"{self.nombre} - {self.usuario.email}"

class Pedido(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('En proceso', 'En proceso'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pedidos', db_index=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='pedidos', db_index=True)
    repartidor = models.ForeignKey(Repartidor, on_delete=models.SET_NULL, related_name='pedidos', null=True, blank=True)

    METODOS_PAGO = [
        ('Efectivo', 'Efectivo'),
        ('Tarjeta', 'Tarjeta'),
        ('Yappy', 'Yappy'),
    ]

    fecha_pedido = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO, default='Efectivo')
    
    # Campos de dirección de entrega
    direccion_nombre = models.CharField(max_length=100, blank=True, null=True)
    direccion_completa = models.TextField(blank=True, null=True)
    direccion_referencia = models.TextField(blank=True, null=True)
    direccion_latitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    direccion_longitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Información del cliente para el pedido
    cliente_nombre = models.CharField(max_length=100, blank=True, null=True)
    cliente_email = models.EmailField(blank=True, null=True)
    cliente_telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f'Pedido {self.id} - {self.cliente.email}'

    def calcular_total(self):
        total = sum(item.get_total() for item in self.items.all())
        self.total = total
        self.save(update_fields=['total'])
        return total

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey('Producto', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

class Producto(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)

    def __str__(self):
        return self.nombre
    
class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='items_pedido')
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.cantidad} x {self.producto.nombre}'

    def get_total(self):
        return self.cantidad * self.precio_unitario
    
class UbicacionRepartidor(models.Model):
    repartidor = models.ForeignKey(User, on_delete=models.CASCADE)
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now=True)