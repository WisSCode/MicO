from django.contrib import admin
from .models import Empresa, Producto, Pedido, ItemPedido

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'user', 'telefono', 'creado_en')
    search_fields = ('nombre', 'user__email')
    list_filter = ('creado_en',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'empresa', 'precio')
    search_fields = ('nombre', 'empresa__nombre')
    list_filter = ('empresa',)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'empresa', 'fecha_pedido', 'estado', 'total')
    list_filter = ('estado', 'empresa', 'fecha_pedido')
    search_fields = ('cliente__email', 'empresa__nombre')

@admin.register(ItemPedido)
class ItemPedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'producto', 'cantidad', 'precio_unitario')