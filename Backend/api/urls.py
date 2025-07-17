from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, ProductoViewSet, PedidoViewSet
from .views import GuardarUbicacionRepartidor


router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'pedidos', PedidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ubicacion/', GuardarUbicacionRepartidor.as_view(), name='guardar-ubicacion'),
]