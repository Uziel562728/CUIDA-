# Matriz de Requisitos - CUIDA+ (Revisión Final)

| Módulo / Requisito | Estado | Pruebas / Archivos involucrados |
|---|---|---|
| **1. Inicialización y Bloqueos** |
| Evitar importación circular (ReferenceError) | **Implementado y probado** | `date.ts` creado. Verificado arranque exitoso en navegador (`npm run build`). |
| **2. Roles y Permisos (Política estricta)** |
| Familiar no debe poder modificar | **Implementado y probado** | Bloqueadas rutas de compras, pero habilitada la consulta `/pedidos` (`permissions.ts`). |
| Médico no debe gestionar documentos/recordatorios | **Implementado y probado** | Corregida excepción en `Documentos.tsx`. |
| Proveedor aislado a su propio catálogo y envíos | **Implementado y probado** | `useStore.ts` valida ID de proveedor (`updateProviderProduct`, `updateOrderStatus`). |
| Store blindado | **Implementado y probado** | Funciones como `addDocument`, `resetDemoData`, `updateProductStock`, etc., arrojan error ("Permisos insuficientes"). |
| Enfermería ("write_care") gestiona recordatorios | **Implementado y probado** | `Recordatorios.tsx` y el store reconocen su rol. |
| **3. Historial de Recordatorios (Recurrencia)** |
| Historial real en lugar de sobreescritura única | **Implementado y probado** | Se utiliza una matriz `history[]`. Las confirmaciones se apilan sin clonar todo el objeto. |
| Ocultamiento temporal al completarse hoy | **Implementado y probado** | `Recordatorios.tsx` filtra validando la fecha contra la última entrada de `history[]`. |
| **4. Estimación de Stock Semanal** |
| Promedio basado en frecuencia semanal | **Implementado y probado** | `calculateEstimatedConsumption()` prorratea `(doses * days) / 7`. |
| Coincidencia entre Dashboard y Stock (minStock) | **Implementado y probado** | Ambos aplican la misma alerta si `estDays <= 5` o `qty <= minStock`. |
| **5. Informes, Demo y Persistencia** |
| Migración segura (v1 a v2) | **Implementado y probado** | `migrate()` fusiona estado en lugar de sobreescribir. El reset manual está protegido. |

| **6. Etapa Final de Ajustes** |
| Mostrar "Pedidos" en navegación a Familiar y ocultar Config | **Implementado y probado** | Modificados `Sidebar.tsx` y `Mas.tsx` para depender dinámicamente de `canAccessRoute`. |
| Cierre hermético de Zustand | **Implementado y probado** | Protegidas todas las acciones en `useStore.ts` (`updatePatient`, `addVitalSign`, `startShift`, etc.). |
| Confirmaciones idempotentes y cancelaciones | **Implementado y probado** | `completeReminder` bloquea la escritura si hoy ya está en su `history` y la aborta si es `cancelled`. |
