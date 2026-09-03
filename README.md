# Sistema de Centro de Acopio

Sistema de registro y coordinacion de centros de acopio para gestion de emergencias.

## Caracteristicas

- Gestion de centros de acopio
- Control de inventario por movimientos
- Roles: Coordinador, Encargado, Voluntario, Institucion
- Registro de recepciones, entregas, mermas y transferencias
- Dashboards con graficas
- Exportacion CSV

## Tecnologias

- React + Vite
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- Recharts (graficas)
- Lucide React (iconos)

## Instalacion

1. Clonar el repositorio
2. Instalar dependencias:
   `ash
   npm install
   `

3. Configurar Supabase:
   - Crear cuenta en [supabase.com](https://supabase.com)
   - Crear nuevo proyecto
   - Ejecutar el script supabase-schema.sql en el SQL Editor
   - Copiar URL y Key a .env.local

4. Iniciar desarrollo:
   `ash
   npm run dev
   `

## Base de Datos

Ejecuta el script supabase-schema.sql en Supabase SQL Editor para crear:
- Tabla de usuarios
- Tabla de centros
- Tabla de campañas
- Tabla de movimientos (calcula inventario)
- Politicas RLS

## Roles

| Rol | Permisos |
|-----|----------|
| Coordinador | Ver todo, crear centros/campañas |
| Encargado | Gestionar su centro |
| Voluntario | Registrar recepciones/entregas |
| Institucion | Ver entregas asignadas |

## Formato de Inventario

El inventario se calcula automaticamente:

`
stock = recepciones + transferencias_entrada + ajustes_positivos
      - entregas - mermas - transferencia_salida - ajustes_negativos
`

## Deploy

`ash
npm run build
`

Carpeta dist/ lista para deployar en Vercel, Netlify, etc.
