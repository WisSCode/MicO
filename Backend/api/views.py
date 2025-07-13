from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Empresa, Producto, Pedido
from .serializers import EmpresaSerializer, ProductoSerializer, PedidoSerializer

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]

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

    def get_queryset(self):
        user = self.request.user
        if user.role == 'empresa':
            empresas = user.empresas.all()
            return Producto.objects.filter(empresa__in=empresas)
        return Producto.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'empresa':
            raise PermissionDenied("Solo usuarios con rol 'empresa' pueden crear productos.")

        empresas = user.empresas.all()
        if not empresas.exists():
            raise PermissionDenied("Usuario no tiene ninguna empresa asociada.")
        
        # Aquí se debería especificar la empresa a la que se le ,
        # Por simplicidad, asignamos a la primera empresa:
        empresa = empresas.first()
        serializer.save(empresa=empresa)

class PedidoViewSet(viewsets.ModelViewSet):
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
            return Pedido.objects.filter(repartidor__user=user)
        else:
            return Pedido.objects.none()

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
