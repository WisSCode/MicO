
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Empresa, Producto, Pedido, Cart, CartItem
from .serializers import EmpresaSerializer, ProductoSerializer, PedidoSerializer, CartSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-cart')
    def my_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        producto_id = request.data.get('producto_id')
        quantity = int(request.data.get('quantity', 1))
        if not producto_id:
            return Response({'error': 'producto_id requerido'}, status=400)
        item, created = CartItem.objects.get_or_create(cart=cart, producto_id=producto_id)
        item.quantity = quantity
        item.save()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        producto_id = request.data.get('producto_id')
        if not producto_id:
            return Response({'error': 'producto_id requerido'}, status=400)
        CartItem.objects.filter(cart=cart, producto_id=producto_id).delete()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
class EmpresaViewSet(viewsets.ModelViewSet):
    # Endpoint para obtener los productos de una empresa específica
    @action(detail=True, methods=['get'], url_path='products', permission_classes=[])
    def products(self, request, pk=None):
        try:
            empresa = Empresa.objects.get(pk=pk)
        except Empresa.DoesNotExist:
            return Response({'error': 'Empresa no encontrada'}, status=404)
        productos = Producto.objects.filter(empresa=empresa)
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    # Quitar la restricción global para permitir endpoints públicos
    # permission_classes = [IsAuthenticated]

    # Endpoint público para listar todas las empresas
    @action(detail=False, methods=['get'], url_path='public', permission_classes=[])
    def public(self, request):
        empresas = Empresa.objects.all()
        serializer = self.get_serializer(empresas, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        # El usuario puede ver solo sus propias empresas
        return Empresa.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Al crear empresa, se asigna el usuario autenticado
        serializer.save(user=self.request.user)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    # Endpoint público para listar y buscar productos
    @action(detail=False, methods=['get'], url_path='public', permission_classes=[])
    def public(self, request):
        search = request.query_params.get('search', None)
        productos = Producto.objects.all()
        if search:
            productos = productos.filter(nombre__icontains=search)
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'empresa':
            empresas = user.empresas.all()
            return Producto.objects.filter(empresa__in=empresas)
        return Producto.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'role') or user.role != 'empresa':
            raise PermissionDenied("Solo usuarios con rol 'empresa' pueden crear productos.")

        empresas = user.empresas.all()
        if not empresas.exists():
            raise PermissionDenied("Usuario no tiene ninguna empresa asociada.")
        # Aquí se debería especificar la empresa a la que se le ,
        # Por simplicidad, asignamos a la primera empresa:
        empresa = empresas.first()
        serializer.save(empresa=empresa)

class PedidoViewSet(viewsets.ModelViewSet):

    @action(detail=False, methods=['get'], url_path='ventas-semanales')
    def ventas_semanales(self, request):
        user = request.user
        if user.role != 'empresa':
            return Response({'error': 'No autorizado'}, status=403)
        empresas = user.empresas.all()
        pedidos = Pedido.objects.filter(empresa__in=empresas, fecha_pedido__gte=timezone.now()-timedelta(days=7))
        # Inicializar ventas por día (Lunes=0 ... Domingo=6)
        ventas = [0 for _ in range(7)]
        for pedido in pedidos:
            dia = pedido.fecha_pedido.weekday()
            ventas[dia] += float(pedido.total)
        # Reordenar para que el lunes sea el primero
        return Response({
            'labels': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            'ventas': ventas
        })
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'empresa':
            empresas = user.empresas.all()
            return Pedido.objects.filter(empresa__in=empresas)
        elif user.role == 'usuarionormal':
            return Pedido.objects.filter(cliente=user)
        elif user.role == 'repartidor':
            from django.db.models import Q
            return Pedido.objects.filter(Q(repartidor__isnull=True) | Q(repartidor__user=user))
        else:
            return Pedido.objects.none()

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
