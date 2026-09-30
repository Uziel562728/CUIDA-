# Actualizaciones de CUIDA+ en Android

La APK firmada v1.0.4 contiene el plugin de Capgo. La app `com.cuida.app` y el canal predeterminado `production` ya existen en Capgo. El repositorio usa el secreto `CAPGO_TOKEN`. Falta confirmar una entrega real en un teléfono.

## Primera activación

1. Instalar la APK firmada v1.0.4 sobre la anterior, sin desinstalar: https://github.com/Uziel562728/CUIDA-/releases/tag/v1.0.4
2. Abrirla con internet. Confirmar que conserva los datos locales.
3. En GitHub, revisar Actions > CUIDA+ live updates. El trabajo debe terminar en verde.
4. En Capgo, confirmar que el bundle figura en el canal `production`.
5. Publicar un cambio web pequeño en `main`, esperar el trabajo verde y cerrar y reabrir la app en el teléfono para comprobar que aparece.

## Qué se actualiza

El workflow compila el contenido web con `npm run build:ota` y publica `dist` en Capgo. Solo se ejecuta por cambios web en `main` o manualmente. Si el mismo commit cambia `android/`, `ios/` o `capacitor.config.ts`, omite la publicación OTA. Los cambios de código nativo, plugins y permisos requieren una nueva APK firmada.

Un push a Git no instala una APK ni sincroniza los datos entre teléfonos. Si falla la publicación, la APK conserva el contenido integrado o el último bundle válido. Nunca guardar tokens, claves de firma ni keystores en el repositorio.

Referencias: https://capgo.app/docs/live-updates/integrations/github-actions/ y https://capgo.app/docs/cli/reference/bundle/.
