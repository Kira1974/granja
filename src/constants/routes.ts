export const ROUTES = {
  LOGIN:               '/login',
  GRANJA:              '/granja',
  ZONAS:               '/granja/zonas',
  COORDINACION:        '/coordinacion',
  INVENTARIO:          '/inventario',
  INVENTARIO_DETALLE:  '/inventario/:id',
  CULTIVOS:            '/cultivos',
  TRACTOR:             '/tractor',
  COMBUSTIBLE:         '/combustible',
  REPORTES:            '/reportes',
  TRAZABILIDAD:        '/trazabilidad',
  USUARIOS:            '/usuarios',
} as const;

export const NAV_ITEMS = [
  { id: 'granja',         path: ROUTES.GRANJA,         icon: 'map',               label: 'La Granja' },
  { id: 'coordinacion',   path: ROUTES.COORDINACION,   icon: 'assignment',        label: 'Coordinación' },
  { id: 'inventario',     path: ROUTES.INVENTARIO,     icon: 'inventory_2',       label: 'Inventario' },
  { id: 'cultivos',       path: ROUTES.CULTIVOS,       icon: 'grass',             label: 'Cultivos' },
  { id: 'tractor',        path: ROUTES.TRACTOR,        icon: 'agriculture',       label: 'Tractor' },
  { id: 'combustible',    path: ROUTES.COMBUSTIBLE,    icon: 'local_gas_station', label: 'Combustibles' },
  { id: 'reportes',       path: ROUTES.REPORTES,       icon: 'bar_chart',         label: 'Reportes',     rolesRequired: ['coordinador', 'mayordomo'] as const },
  { id: 'trazabilidad',   path: ROUTES.TRAZABILIDAD,   icon: 'manage_search',     label: 'Trazabilidad', rolesRequired: ['coordinador'] as const },
  { id: 'usuarios',       path: ROUTES.USUARIOS,       icon: 'group',             label: 'Usuarios',     rolesRequired: ['coordinador'] as const },
] as const;
