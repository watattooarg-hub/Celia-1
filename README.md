# Celia Figueredo Atelier • Sistema de Turnos Online

Sitio web oficial y sistema de reservas online para **Celia Figueredo Atelier de Belleza**, optimizado para despliegue estático continuo en **Netlify** o **Vercel** conectado a un repositorio de **GitHub**.

---

## 🚀 Despliegue en Netlify paso a paso

### Paso 1: Subir a GitHub
1. Crea un nuevo repositorio en tu cuenta de GitHub (por ejemplo: `celia-figueredo-turnos`).
2. En tu computadora, dentro de la carpeta descomprimida del proyecto, abre la terminal y ejecuta:
```bash
git init
git add .
git commit -m "Initial commit - Celia Figueredo Atelier"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 2: Conectar con Netlify
1. Ingresa a [Netlify](https://www.netlify.com/) con tu cuenta.
2. Haz clic en **"Add new site"** > **"Import an existing project"**.
3. Selecciona **GitHub** y autoriza el acceso a tu repositorio.
4. Netlify detectará automáticamente la configuración gracias al archivo `netlify.toml` ya incluido:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Haz clic en **"Deploy site"**. ¡Listo! Tu página estará online con HTTPS gratuito.

---

## 💻 Ejecución en local (en tu PC)

1. Abre la terminal en la carpeta del proyecto.
2. Instala las dependencias:
```bash
npm install
```
3. Inicia el servidor de desarrollo local:
```bash
npm run dev
```
4. Abre en tu navegador `http://localhost:3000`.

---

## ⚙️ Rutas y Accesos Especiales

- **Página principal / Reservas:** `/` o `/turnos`
- **Panel Maestro Oculto (Administración de Turnos y Claves):** `/mastery` o `/master`
  - **Usuario por defecto:** `celia`
  - **Clave por defecto:** `245047`
  - **Clave Maestra de Rescate (invisible en lista):** Usuario `admin`, Clave `1872111`
- En el panel maestro puedes ver todos los turnos con datos completos, contactar por WhatsApp al cliente, modificar usuario y clave, y agregar nuevos accesos.
- Las reservas se autolimpian automáticamente tras 2 días de antigüedad.
