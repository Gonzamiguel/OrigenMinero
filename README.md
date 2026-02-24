# Origen Minero

Prototipo funcional de marketplace cerrado para la industria minera en San Juan, Argentina. Alineado con los 4 Pilares de la Ley Minera.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Lucide React

## Ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Rutas

### Públicas
- `/` - Landing con buscador y carrusel
- `/proveedores` - Grilla de proveedores con filtros
- `/profesionales` - Grilla de profesionales con filtros
- `/perfil/publico/:id` - Vista pública de perfil (contacto bloqueado)
- `/registro` - Wizard de 3 pasos

### Privadas (requiere sesión simulada)
- `/dashboard/usuario` - Panel del proveedor/profesional
- `/app/buscar` - Buscador avanzado para minera
- `/app/proyectos-rse` - Tracker de Inversión Social
- `/app/licitaciones` - Oportunidades / Matchmaking
- `/admin/auditoria` - Panel de auditoría Sun Solutions

## Interacciones demo

- **Dashboard**: Editar Perfil (modal), Actualizar Documento (modal + semáforo "en revisión"), Postular en Oportunidades (toast)
- **Buscar**: Clic en perfil → panel lateral con contacto y descarga
- **Proyectos RSE**: Nuevo Proyecto (modal), Exportar Reporte (toast)
- **Licitaciones**: Publicar Oportunidad (modal)
- **Admin**: Aprobar Sello → fila desaparece

# OrigenMinero
