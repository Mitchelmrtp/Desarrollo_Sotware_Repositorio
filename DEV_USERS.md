# 🧪 DATOS DE PRUEBA - SOLO DESARROLLO

## ⚠️ IMPORTANTE: Solo funciona en modo desarrollo

### 👤 Usuarios de Prueba Disponibles:

#### 1. **Administrador**
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Rol:** Administrador
- **Permisos:** Acceso completo al sistema

#### 2. **Usuario Regular**
- **Email:** `user@test.com`
- **Password:** `user123`
- **Rol:** Usuario
- **Permisos:** Lectura y escritura básica

#### 3. **Profesor**
- **Email:** `teacher@test.com`
- **Password:** `teacher123`
- **Rol:** Profesor
- **Permisos:** Lectura, escritura y moderación

---

## 🔧 Para eliminar estos datos de prueba:

1. Buscar el comentario `// 🧪 DEVELOPMENT ONLY` en el archivo `src/hooks/useAuth.js`
2. Eliminar la constante `DEV_USERS` y la función `mockLogin`
3. Remover la llamada a `mockLogin` en la función `login`
4. Eliminar este archivo `DEV_USERS.md`

## 📝 Nota:
Estos usuarios solo funcionan cuando `VITE_NODE_ENV=development` en el archivo `.env`