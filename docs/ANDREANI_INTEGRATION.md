# Integración con Andreani - Cálculo de Envíos

Este sistema integra la API de Andreani para calcular costos de envío de forma segura desde el backend.

## Configuración

### Variables de Entorno (Backend)

Agregar al archivo `.env` del backend:

```env
# Andreani Shipping API Configuration
ANDREANI_BASE_URL=https://apisqa.andreani.com  # QA environment
# ANDREANI_BASE_URL=https://apis.andreani.com  # Production environment
ANDREANI_CONTRATO=300006708                    # Tu número de contrato con Andreani
ANDREANI_CLIENTE=CL0000001                     # Tu código de cliente
ANDREANI_API_KEY=your_andreani_api_key         # API Key (opcional, pero recomendado)
ANDREANI_CP_ORIGEN=1425                        # Código postal de origen (tu ubicación)
```

### Obtener Credenciales

1. **Registro en Andreani**: Contactar a Andreani para obtener un contrato comercial
2. **Ambiente de Testing**: Usar `https://apisqa.andreani.com` para pruebas
3. **Ambiente de Producción**: Usar `https://apis.andreani.com` para producción
4. **API Key**: Solicitar API key para mayor seguridad y límites más altos

## Endpoints Disponibles

### POST /api/shipping/calculate

Calcula el costo de envío para una dirección y productos específicos.

**Request Body:**

```json
{
  "postalCode": "1425",
  "items": [
    {
      "id": "product_id",
      "name": "Producto",
      "price": 50.0,
      "quantity": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cost": 1250.5,
    "estimatedDays": "2-4",
    "postalCode": "1425",
    "packageInfo": {
      "weight": 0.66,
      "dimensions": {
        "largoCm": 20,
        "anchoCm": 15,
        "altoCm": 10
      },
      "volume": 3000,
      "declaredValue": 100.0
    }
  }
}
```

### GET /api/shipping/zones

Obtiene las zonas de envío disponibles.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "code": "CABA",
      "name": "Ciudad Autónoma de Buenos Aires",
      "estimatedDays": "1-2"
    }
  ]
}
```

## Cálculos Automáticos

El sistema calcula automáticamente:

### Peso del Paquete

- **Base**: 300g por perfume
- **Packaging**: +10% del peso total
- **Mínimo**: 0.5kg para paquetes vacíos

### Dimensiones del Paquete

- **1 producto**: 15x10x8 cm
- **2-3 productos**: 20x15x10 cm
- **4-6 productos**: 30x20x15 cm
- **7+ productos**: 40x25x20 cm

### Valor Declarado

- Suma total del precio de todos los productos en el carrito

## Manejo de Errores

### Códigos de Error

- `INVALID_POSTAL_CODE`: Código postal requerido
- `INVALID_POSTAL_CODE_FORMAT`: Formato de código postal inválido
- `INVALID_ITEMS`: Productos requeridos para el cálculo
- `AUTHENTICATION_ERROR`: Error de autenticación con Andreani
- `SERVICE_NOT_AVAILABLE`: Servicio no disponible para la ubicación
- `TIMEOUT_ERROR`: Tiempo de espera agotado
- `CONNECTION_ERROR`: Error de conexión
- `RATE_LIMIT_EXCEEDED`: Demasiadas consultas
- `SERVICE_UNAVAILABLE`: Servicio temporalmente no disponible

### Respuesta de Error

```json
{
  "success": false,
  "error": "INVALID_POSTAL_CODE",
  "message": "Código postal es requerido y debe ser válido"
}
```

## Uso en Frontend

### En el Componente de Checkout

```jsx
import ShippingCostCard from "@/components/checkout/ShippingCostCard";

// En tu componente
<ShippingCostCard
  cartItems={cart}
  onShippingCalculated={(cost) => {
    // Actualizar el costo total del pedido
    setShippingCost(cost);
  }}
/>;
```

### En los Servicios

```javascript
import { calculateShipping } from "@/services/public";

// Calcular envío
const response = await callEndpoint(calculateShipping("1425", cartItems));
```

## Seguridad

### ✅ Implementado Correctamente

- **Backend Only**: Todas las credenciales de Andreani están en el backend
- **Rate Limiting**: Límites de consultas por IP
- **Validation**: Validación de datos antes de enviar a Andreani
- **Error Handling**: Manejo seguro de errores sin exponer información sensible

### ❌ NO Hacer

- No colocar credenciales de Andreani en el frontend
- No hacer llamadas directas a Andreani desde el navegador
- No exponer API keys en variables `NEXT_PUBLIC_*`

## Testing

### Códigos Postales de Prueba

- **1425**: CABA - Envío rápido
- **1606**: GBA - Envío estándar
- **2000**: Rosario - Envío a interior
- **5000**: Córdoba - Envío a interior

### Ambiente de QA

Usar `ANDREANI_BASE_URL=https://apisqa.andreani.com` para testing.

## Monitoreo

### Logs

El sistema registra:

- Consultas realizadas a Andreani (sin exponer credenciales)
- Errores de conexión
- Respuestas exitosas con datos del paquete

### Métricas Recomendadas

- Tiempo de respuesta de Andreani
- Tasa de errores por tipo
- Códigos postales más consultados
- Costos promedio de envío

## Troubleshooting

### Error 401 - Authentication Error

- Verificar `ANDREANI_API_KEY`
- Verificar `ANDREANI_CONTRATO` y `ANDREANI_CLIENTE`

### Error 400 - Invalid Request

- Verificar formato del código postal
- Verificar que los productos tengan precio > 0

### Error 404 - Service Not Available

- El código postal no está en la cobertura de Andreani
- Verificar que el CP tenga al menos 4 dígitos

### Timeout Errors

- Andreani puede tener latencia alta
- Configurar timeout apropiado (actualmente 10 segundos)

## Próximas Mejoras

1. **Cache**: Implementar cache de consultas frecuentes
2. **Batch Requests**: Calcular múltiples destinos simultáneamente
3. **Webhooks**: Notificaciones de cambios en tarifas
4. **Analytics**: Dashboard de costos y tendencias de envío
