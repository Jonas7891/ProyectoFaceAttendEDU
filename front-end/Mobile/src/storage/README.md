# Carpeta `src/storage`

Propósito:
- Guardar en el dispositivo la sesión del usuario, con la misma forma que usa la app Web: `{ token, savedAt, expiresAt, email }`.

Archivo:
- `TokenStorage.js`: `saveToken(token, email)`, `getToken()`, `getSession()`, `removeToken()` y `hasValidToken()`.

Dónde se guarda:
- Android e iOS: en el almacén seguro del sistema (Keystore/Keychain) mediante `expo-secure-store`. Las sesiones antiguas que estaban en `AsyncStorage` se migran al leerlas y se borran de allí.
- Web: `expo-secure-store` no existe en el navegador, así que se usa `AsyncStorage` con la misma clave (`auth_token`).

Reglas:
- El backend emite identificadores de sesión opacos (UUID). Solo se decodifica el token cuando tiene forma de JWT, para leer `exp`.
- Nunca registrar el token en los logs.
- Al cerrar sesión, llamar a `removeToken()`, que limpia los dos almacenes.
