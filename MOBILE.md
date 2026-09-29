# Adaptación Móvil y Capacitor (CUIDA+)

Este documento describe la arquitectura y los pasos para compilar, sincronizar y probar la aplicación web CUIDA+ como una aplicación nativa mediante **Capacitor**.

## 1. Construcción y Sincronización (Build & Sync)

Para garantizar que el `base` sea compatible con la plataforma de destino, se han configurado scripts específicos en el `package.json`.

### Construir para la Web (GitHub Pages)
```bash
npm run build:web
```
Esto utilizará la configuración por defecto de Vite (`vite.config.ts`), que incluye `base: '/CUIDA-/'`.

### Construir y Sincronizar para Móvil (Capacitor)
```bash
npm run build:mobile
```
Este comando ejecuta la construcción de Vite sobrescribiendo la ruta base a `./` (`vite build --base=./`) y, si termina de manera exitosa, ejecuta automáticamente `npx cap sync`.

Esto asegura que el código HTML y JavaScript apunte a la raíz local del dispositivo, sin romper la versión destinada a GitHub Pages.

### Ejecutar Nativo (Android / iOS)
Una vez sincronizado, puedes abrir los IDEs nativos:
```bash
npx cap open android
# o
npx cap open ios
```
*(Para iOS, asegúrate de tener una Mac con Xcode instalado).*

---

## 2. Límites del Entorno

Al utilizar una arquitectura "Local-First" basada en `Zustand` (con almacenamiento persistente simulado), se deben considerar los siguientes límites:

1. **Persistencia y Aislamiento de Datos:**
   Los datos generados en la app (Android/iOS) viven únicamente en el almacenamiento local de ese dispositivo (IndexedDB/localStorage del WebView nativo). No se sincronizarán con la web ni con otros dispositivos sin un backend externo.
2. **Sistema de Archivos y Descargas:**
   Las funciones de "Descargar PDF" y "Descargar CSV" se han adaptado para Capacitor. En un navegador web regular descargarán un archivo, pero en un entorno móvil se utilizarán `@capacitor/filesystem` y `@capacitor/share` para guardar el archivo en la caché del dispositivo y mostrar el diálogo nativo de "Compartir/Guardar".
3. **Manejo del Botón "Atrás" en Android:**
   El botón físico o por gestos en Android ha sido configurado para cerrar diálogos (modales flotantes) antes de realizar una navegación hacia atrás en el router.

---

## 3. Evidencia de Pruebas y Matriz de Resultados

El desarrollo se realiza en un entorno Node sin SDK de Android ni macOS/Xcode. Por lo tanto, los resultados indicados como "Pasó" corresponden **única y exclusivamente** a pruebas ejecutadas en navegador (Desktop/Mobile Web) y compilación, **no** en dispositivos nativos.

### Ejecución de Comandos (Compilación / Sync)
| Comando | Entorno | Resultado | Observación |
| :--- | :--- | :--- | :--- |
| `npm run build:web` | Node (Windows) | **Pasó** | El proyecto compila sin errores TypeScript y genera el bundle para web. |
| `npm run build:mobile` | Node (Windows) | **Pasó** | Vite compila con `--base=./` y `cap sync` inyecta los plugins con éxito. (Sólo prueba de build). |

### Matriz de Flujos de Interfaz
| Flujo / Funcionalidad | Entorno | Resultado | Observaciones |
| :--- | :--- | :--- | :--- |
| Eliminación de alertas nativas (`alert`, `confirm`) | Web Browser | **Pasó** | Sustituidas por modales en React. Inspeccionado en navegador. |
| Exportación PDF con word-wrap / CSV (RFC-4180) | Web Browser | **Pasó** | Archivos descargados vía Blob y testados localmente, muestran escape correcto y word wrap. |
| Navegación y UI (Wizard, Tarjetas) | Web Browser | **Pasó** | La interfaz responde a clicks, cambios de estado y flujos. |
| Gestor unificado `useHardwareBack` (Back Button) | Android (Nativo) | **No probado** | Lógica de `e.preventDefault()` implementada mediante hook en todos los modales, pero no se validó en dispositivo real. |
| Exportación nativa (Filesystem + Share) | iOS/Android Nativos | **No probado** | El código llama a los plugins de Capacitor, pero la ausencia de emulador impide probar el diálogo nativo. |
| Evitar salida accidental en la raíz | Android (Nativo) | **No probado** | Existe la lógica en `App.tsx` pero no se validó la UX física. |

*Conclusión del Testeo:* El código es seguro de usar en la web y la teoría técnica detrás de la adaptación móvil es robusta, pero **se requiere prueba física en Android/iOS** para dar el aval final a los flujos nativos.
