# Configuración Segura de CORS - MicO

## 🔒 Resumen de Cambios de Seguridad

Este documento describe los cambios implementados para corregir las vulnerabilidades de seguridad relacionadas con CORS (Cross-Origin Resource Sharing).

## ❌ Problemas Corregidos

1. **Eliminado el uso de `Access-Control-Allow-Origin: *`**
   - Ahora se usa una lista blanca estricta de dominios autorizados
   - No se permite el uso de comodines cuando hay credenciales

2. **Prevención de reflejo automático del Origin**
   - El servidor ya no refleja automáticamente el valor del header `Origin` enviado por el cliente
   - Solo se aceptan orígenes que estén en la lista blanca

3. **Configuración correcta de credenciales**
   - `CORS_ALLOW_CREDENTIALS = True` solo funciona con orígenes específicos
   - No se puede combinar con `*` (comodín)

## ✅ Configuración Implementada

### Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```bash
# Dominios permitidos para CORS (separados por comas)
# IMPORTANTE: No usar espacios después de las comas
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Para producción, agregar los dominios reales:
# CORS_ALLOWED_ORIGINS=https://mico.com,https://www.mico.com,https://app.mico.com

# Hosts permitidos por Django
ALLOWED_HOSTS=localhost,127.0.0.1

# Para producción:
# ALLOWED_HOSTS=mico.com,www.mico.com,api.mico.com
```

### Configuración de Desarrollo

Para desarrollo local, la configuración por defecto permite:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173` (Vite dev server alternativo)

### Configuración de Producción

**⚠️ IMPORTANTE:** Antes de desplegar a producción:

1. **Actualizar `CORS_ALLOWED_ORIGINS`** con tus dominios reales:
   ```bash
   CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
   ```

2. **Actualizar `ALLOWED_HOSTS`**:
   ```bash
   ALLOWED_HOSTS=tudominio.com,www.tudominio.com,api.tudominio.com
   ```

3. **Asegurar que `DEBUG=False`** en producción

4. **Configurar HTTPS** - Los headers de seguridad requieren HTTPS en producción

## 🔐 Características de Seguridad Implementadas

### 1. Lista Blanca Estricta
- Solo los dominios explícitamente listados pueden hacer solicitudes CORS
- No se aceptan comodines (`*`)
- No se refleja automáticamente el Origin del cliente

### 2. Métodos HTTP Permitidos
Solo se permiten los métodos necesarios:
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

### 3. Headers Permitidos
Solo se permiten los headers necesarios:
- `authorization` (para JWT)
- `content-type`
- `accept`, `accept-encoding`
- `origin`, `user-agent`
- `x-csrftoken`, `x-requested-with`

### 4. Headers de Seguridad Adicionales (Producción)
Cuando `DEBUG=False`, se activan automáticamente:
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protección XSS
- `Strict-Transport-Security` - Fuerza HTTPS
- Cookies seguras (solo HTTPS)

## 🧪 Verificación

### Pruebas con ZAP (OWASP ZAP)

Después de aplicar estos cambios, ejecuta nuevamente ZAP para verificar:

1. **Verificar que no aparece `Access-Control-Allow-Origin: *`**
   - Buscar en los headers de respuesta
   - Debe aparecer solo orígenes específicos

2. **Verificar que los orígenes no autorizados son rechazados**
   - Intentar una solicitud desde un dominio no listado
   - Debe retornar error CORS

3. **Verificar que los orígenes autorizados funcionan correctamente**
   - Las solicitudes desde dominios en la lista blanca deben funcionar

### Pruebas Manuales

```bash
# Probar desde un origen autorizado (debe funcionar)
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     http://localhost:8000/api/empresas/

# Probar desde un origen no autorizado (debe fallar)
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8000/api/empresas/
```

## 📝 Notas Importantes

1. **No usar `*` nunca** cuando `CORS_ALLOW_CREDENTIALS = True`
   - Esto causaría que el navegador rechace las solicitudes
   - Es una vulnerabilidad de seguridad crítica

2. **Actualizar la lista de orígenes** cuando agregues nuevos dominios
   - Cada nuevo dominio debe agregarse explícitamente
   - No usar expresiones regulares a menos que sea absolutamente necesario

3. **Revisar regularmente** los orígenes permitidos
   - Eliminar dominios que ya no se usan
   - Mantener la lista mínima necesaria

4. **Endpoints sensibles** pueden requerir configuración adicional
   - Considerar deshabilitar CORS completamente para endpoints críticos
   - Usar autenticación adicional para endpoints sensibles

## 🚀 Despliegue

### Checklist Pre-Producción

- [ ] Actualizar `CORS_ALLOWED_ORIGINS` con dominios de producción
- [ ] Actualizar `ALLOWED_HOSTS` con dominios de producción
- [ ] Verificar que `DEBUG=False`
- [ ] Configurar HTTPS/SSL
- [ ] Ejecutar pruebas de seguridad (ZAP)
- [ ] Verificar que las solicitudes desde el frontend funcionan
- [ ] Documentar los dominios permitidos

## 📚 Referencias

- [Django CORS Headers Documentation](https://github.com/adamchainz/django-cors-headers)
- [OWASP CORS Security Guide](https://owasp.org/www-community/attacks/CORS_Misconfiguration)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

