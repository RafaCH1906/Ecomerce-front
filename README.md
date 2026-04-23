# 🌌 E-commerce Frontend - Premium Edition

Este es el frontend unificado para el ecosistema de microservicios. Está diseñado con una estética **Midnight Blue** minimalista, utilizando efectos de **Glassmorphism** y animaciones fluidas para una experiencia de usuario de alto nivel.

## 🛠️ Tecnologías Core
* **React + Vite**: Framework ultra-rápido para el desarrollo.
* **Tailwind CSS**: Para el diseño basado en utilidades con tema oscuro personalizado.
* **Framer Motion**: Orquestación de animaciones y transiciones de página.
* **Recharts**: Visualización de datos analíticos en tiempo real.
* **Axios + Interceptors**: Gestión centralizada de peticiones con inyección automática de JWT.

---

## 🔗 Integración de Microservicios

El frontend consume un total de **10+ endpoints** distribuidos en los 5 servicios:

### 1. `users-service` (Puerto 8000)
Gestiona el acceso y la identidad del sistema.
* **POST `/api/users/login`**: Autenticación y obtención del JWT.
* **GET `/api/users`**: Listado de usuarios para el panel administrativo.

### 2. `products-service` (Puerto 8080)
Motor de catálogo y gestión de inventario.
* **GET `/api/products`**: Listado completo de productos con imágenes desde S3.
* **POST `/api/products`**: Creación de nuevos productos (Admin).
* **POST `/api/products/{id}/upload-image`**: Subida de archivos binarios a S3 (Multipart).

### 3. `orders-service` (Puerto 3000)
Registro histórico de transacciones.
* **GET `/api/orders`**: Obtención de todas las órdenes del sistema.
* **GET `/api/orders/{id}`**: Detalle específico de una orden.

### 4. `aggregator-service` (Puerto 8005)
Orquestador de información compleja.
* **GET `/api/aggregator/user/{id}/full-profile`**: Combina datos del usuario con su historial de compras y detalles de productos en una sola llamada.

### 5. `analytics-service` (Puerto 8006)
Inteligencia de negocio vía AWS Athena.
* **GET `/api/analytics/total-sales`**: KPI de ventas globales.
* **GET `/api/analytics/sales-by-date`**: Datos para el gráfico de líneas temporal.
* **GET `/api/analytics/top-products`**: Datos para el gráfico de barras de productos estrella.

---

## 🔐 Seguridad y Auth
La aplicación implementa un flujo de seguridad industrial:
1. **JWT Storage**: El token se almacena en `localStorage` tras un login exitoso.
2. **Auto-Injection**: Los interceptores de Axios añaden el header `Authorization: Bearer <token>` a cada petición saliente.
3. **Role-Based Access (RBAC)**: 
    - Las rutas `/dashboard` y `/admin` están protegidas y solo son accesibles si el payload del JWT contiene `role: admin`.
    - Si el token expira (Error 401), el sistema redirige automáticamente al usuario a `/login`.

---

## 🎨 Guía de Estilo (Midnight Blue)
* **Background Principal**: `#020617` (Slate 950) con gradiente radial hacia `#0f172a`.
* **Paneles (Glass)**: Fondo blanco con opacidad al 3% y desenfoque (blur) de 10px.
* **Acento**: Índigo vibrante (`#6366f1`) para botones y elementos activos.

## 🚀 Ejecución Local
1. Asegúrate de que los 5 microservicios estén corriendo.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm run dev
   ```
