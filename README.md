# Ambientes y Variables de Entorno

Este proyecto utiliza **dos ambientes** (development y production) tanto en Supabase como en las aplicaciones **web** y **api**.

## Ambientes

- **Supabase:**
  - Ambiente de desarrollo (dev)
  - Ambiente de producción (prod)
- **Web:**
  - apps/web (dev y prod)
- **API:**
  - apps/api (dev y prod)

## Variables de Entorno

Las variables de entorno necesarias para cada ambiente **deben ser solicitadas al equipo de DevOps**.

### ¿Cómo se gestionan?

- **Local:**
  - Cada proyecto (web y api) debe tener su propio archivo `.env.local`.
  - Ejemplo para `apps/web/.env.local`:
    ```env
    REACT_APP_API_URL=https://api-dev.example.com
    REACT_APP_SUPABASE_URL=https://xyzcompanydev.supabase.co
    REACT_APP_SUPABASE_KEY=... (solicitar al DevOps)
    ```
  - Ejemplo para `apps/api/.env.local`:
    ```env
    DATABASE_URL=postgres://user:pass@host:port/db
    NEXT_PUBLIC_SUPABASE_URL=https://xyzcompanydev.supabase.co
    NEXT_PUBLIC_SUPABASE_KEY=... (solicitar al DevOps)
    ```
- **Producción:**
  - Las variables de entorno deben ser configuradas en el dashboard de Vercel para cada proyecto (web y api) y ambiente.
  - No subas archivos `.env.local` con secretos al repositorio.

### Solicitud de Variables

1. Contacta al equipo de DevOps para solicitar las variables de entorno necesarias para el ambiente y proyecto que vas a trabajar.
2. El equipo de DevOps te proveerá los valores y te indicará si hay cambios entre dev y prod.
3. Crea el archivo `.env.local` correspondiente en el directorio del proyecto.

---

**Importante:** Nunca subas archivos `.env.local` ni compartas secretos por canales inseguros.

---

# Flujo de trabajo de ramas y despliegues

- Los cambios a la rama **develop** se realizan mediante Pull Request (PR) que **no requiere revisión** y, al mergear, se despliega automáticamente en el ambiente de preproducción.
- Los merges de **develop** a **main** requieren **revisión de un segundo desarrollador** y, al mergear, se despliega automáticamente en producción.
- **Para pruebas locales** se debe utilizar el archivo `.env.local` con las variables de preproducción (**nunca** las de producción).
