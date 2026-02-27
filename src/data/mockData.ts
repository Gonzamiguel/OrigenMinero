import type { Perfil, ProyectoRSE, Licitacion, PerfilAuditoria } from '../types';

export const LOCALIDADES = ['Rodeo', 'Tudcum', 'Jáchal', 'Calingasta', 'Iglesia', 'Ciudad de San Juan'];

export const RUBROS_B2B = ['Movimiento de Suelos', 'Catering de Campamento', 'Transporte'];

/** Rubros extendidos para perfil B2B de proveedor */
export const RUBROS_B2B_EXTENDIDOS = [
  'Movimiento de Suelos',
  'Transporte y Logística',
  'Catering',
  'Obra Civil',
  'Limpieza/Mantenimiento',
  'Servicios Profesionales',
] as const;

export const TIPO_ENTIDAD = [
  { value: 'sa', label: 'S.A.' },
  { value: 'srl', label: 'S.R.L.' },
  { value: 'sas', label: 'S.A.S.' },
  { value: 'monotributista', label: 'Monotributista' },
] as const;

export const TAMANO_EMPRESA = [
  { value: '1_10', label: '1-10 Empleados' },
  { value: '11_50', label: '11-50 Empleados' },
  { value: '51_200', label: '51-200 Empleados' },
  { value: 'mas_200', label: '+200 Empleados' },
] as const;

export const NORMAS_ISO = [
  { id: 'iso9001', label: 'ISO 9001' },
  { id: 'iso14001', label: 'ISO 14001' },
  { id: 'iso45001', label: 'ISO 45001' },
] as const;

/** Documentos de compliance para proveedores */
export const DOCUMENTOS_PROVEEDOR = [
  { id: 'afip', label: 'Constancia AFIP' },
  { id: 'mipyme', label: 'Certificado MiPyME' },
  { id: 'art', label: 'Certificado de Cobertura ART (Con nómina)' },
  { id: 'seguro', label: 'Pólizas de Seguro (RC / Flota)' },
  { id: 'libre_deuda', label: 'Certificado de Libre Deuda' },
] as const;

export const OFICIOS_B2C = ['Soldador Calificado', 'Chofer de Alta Montaña'];

export const GENEROS = [
  { value: '', label: 'Todos' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
] as const;

/** Opciones para perfil estructurado del profesional */
export const SITUACION_LABORAL = [
  { value: 'buscando', label: 'Buscando trabajo activamente' },
  { value: 'escucho', label: 'Trabajando pero escucho ofertas' },
  { value: 'no_disponible', label: 'No disponible' },
] as const;

export const DIAGRAMA_ROSTER = [
  { value: '14x14', label: '14x14' },
  { value: '8x6', label: '8x6' },
  { value: 'lunes_viernes', label: 'Lunes a Viernes' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
] as const;

export const EXPERIENCIA_MINERIA = [
  { value: 'sin', label: 'Sin experiencia' },
  { value: '1_3', label: '1 a 3 años' },
  { value: '3_5', label: '3 a 5 años' },
  { value: 'mas_5', label: 'Más de 5 años' },
] as const;

export const OFICIOS_EXTENDIDOS = [
  'Soldador Calificado',
  'Chofer de Alta Montaña',
  'Operador de Maquinaria',
  'Electricista',
  'Mecánico',
  'Operador de Planta',
  'Geólogo',
  'Topógrafo',
  'Otro',
] as const;

export const LICENCIAS_CONDUCIR = [
  { value: 'no', label: 'No tiene' },
  { value: 'B1', label: 'B1' },
  { value: 'C', label: 'C' },
  { value: 'E1', label: 'E1' },
  { value: 'E2', label: 'E2' },
  { value: 'LINTI', label: 'LINTI' },
] as const;

export const CERTIFICACIONES_SEGURIDAD = [
  { id: 'altura', label: 'Trabajo en Altura' },
  { id: 'confinados', label: 'Espacios Confinados' },
  { id: 'defensivo', label: 'Manejo Defensivo' },
  { id: 'primeros_auxilios', label: 'Primeros Auxilios' },
] as const;

export const NIVEL_EDUCACION = [
  { value: 'primario', label: 'Primario' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'terciario', label: 'Terciario/Técnico' },
  { value: 'universitario', label: 'Universitario' },
] as const;

export const PERFILES: Perfil[] = [
  {
    id: '1',
    tipo: 'proveedor',
    nombre: 'Carlos Mendoza',
    empresa: 'Mendoza Construcciones S.A.',
    rubro: 'Movimiento de Suelos',
    localidad: 'Jáchal',
    descripcion: 'Empresa con 15 años de experiencia en movimiento de tierras para minería.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', mipyme: 'ok', libre_deuda: 'ok' },
    telefono: '+54 264 4567890',
    email: 'carlos@mendozaconstrucciones.com',
  },
  {
    id: '2',
    tipo: 'proveedor',
    nombre: 'María González',
    empresa: 'Viandas del Valle',
    rubro: 'Catering de Campamento',
    localidad: 'Iglesia',
    descripcion: 'Catering especializado para campamentos mineros. Menú variado y nutricional.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'vencido', mipyme: 'ok', libre_deuda: 'en_revision' },
    telefono: '+54 264 5678901',
    email: 'maria@viandasdelvalle.com',
  },
  {
    id: '3',
    tipo: 'profesional',
    nombre: 'Roberto Sánchez',
    oficio: 'Soldador Calificado',
    genero: 'masculino',
    localidad: 'Calingasta',
    descripcion: 'Soldador certificado con experiencia en estructuras mineras.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 6789012',
    email: 'roberto.sanchez@email.com',
  },
  {
    id: '4',
    tipo: 'profesional',
    nombre: 'Ana Lucía Torres',
    oficio: 'Chofer de Alta Montaña',
    genero: 'femenino',
    localidad: 'Rodeo',
    descripcion: 'Chofer con licencia profesional para operaciones en altura.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 7890123',
    email: 'ana.torres@email.com',
  },
  {
    id: '5',
    tipo: 'proveedor',
    nombre: 'Pablo Rodríguez',
    empresa: 'Transportes Cuyo',
    rubro: 'Transporte',
    localidad: 'Jáchal',
    descripcion: 'Flota de camiones para logística minera en toda la provincia.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 8901234',
    email: 'pablo@transportescuyo.com',
  },
  {
    id: '6',
    tipo: 'profesional',
    nombre: 'Lucía Fernández',
    oficio: 'Soldador Calificado',
    genero: 'femenino',
    localidad: 'Tudcum',
    descripcion: 'Especialista en soldadura TIG para equipos mineros.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 9012345',
    email: 'lucia.fernandez@email.com',
  },
  {
    id: '7',
    tipo: 'proveedor',
    nombre: 'Diego Martínez',
    empresa: 'Campamento San Juan',
    rubro: 'Catering de Campamento',
    localidad: 'Calingasta',
    descripcion: 'Servicios integrales de alimentación para operaciones mineras.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 0123456',
    email: 'diego@campamentosanjuan.com',
  },
  {
    id: '8',
    tipo: 'proveedor',
    nombre: 'Silvia Vega',
    empresa: 'Maquinarias del Valle',
    rubro: 'Movimiento de Suelos',
    localidad: 'Iglesia',
    descripcion: 'Alquiler de maquinaria pesada para excavación y nivelación.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 1234567',
    email: 'silvia@maquinariasdelvalle.com',
  },
  {
    id: '11',
    tipo: 'profesional',
    nombre: 'Miguel Ángel Ruiz',
    oficio: 'Chofer de Alta Montaña',
    genero: 'masculino',
    localidad: 'Jáchal',
    descripcion: 'Experiencia en rutas mineras de alta montaña.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 2345678',
    email: 'miguel.ruiz@email.com',
  },
  {
    id: '12',
    tipo: 'profesional',
    nombre: 'Fernando López',
    oficio: 'Soldador Calificado',
    genero: 'masculino',
    localidad: 'Rodeo',
    descripcion: 'Certificación en soldadura MIG/MAG para minería.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 3456789',
    email: 'fernando.lopez@email.com',
  },
  {
    id: '13',
    tipo: 'profesional',
    nombre: 'Claudia Morales',
    oficio: 'Chofer de Alta Montaña',
    genero: 'femenino',
    localidad: 'Calingasta',
    descripcion: 'Licencia profesional para transporte de personal minero.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 4567890',
    email: 'claudia.morales@email.com',
  },
  {
    id: '14',
    tipo: 'profesional',
    nombre: 'Jorge Ramírez',
    oficio: 'Soldador Calificado',
    genero: 'masculino',
    localidad: 'Iglesia',
    descripcion: 'Especialista en reparación de equipos pesados.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 5678901',
    email: 'jorge.ramirez@email.com',
  },
  {
    id: '15',
    tipo: 'profesional',
    nombre: 'Patricia Gómez',
    oficio: 'Chofer de Alta Montaña',
    genero: 'femenino',
    localidad: 'Tudcum',
    descripcion: 'Transporte seguro en zonas de difícil acceso.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 6789012',
    email: 'patricia.gomez@email.com',
  },
  {
    id: '16',
    tipo: 'profesional',
    nombre: 'Ricardo Díaz',
    oficio: 'Soldador Calificado',
    genero: 'masculino',
    localidad: 'Ciudad de San Juan',
    descripcion: 'Más de 20 años en estructuras mineras.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok', residencia: 'ok' },
    telefono: '+54 264 7890123',
    email: 'ricardo.diaz@email.com',
  },
  {
    id: '17',
    tipo: 'proveedor',
    nombre: 'Andrés Castro',
    empresa: 'Logística Minera S.A.',
    rubro: 'Transporte',
    localidad: 'Rodeo',
    descripcion: 'Servicios de carga y descarga para operaciones mineras.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 8901234',
    email: 'andres@logisticaminera.com',
  },
  {
    id: '18',
    tipo: 'proveedor',
    nombre: 'Natalia Herrera',
    empresa: 'Construcciones Andinas',
    rubro: 'Movimiento de Suelos',
    localidad: 'Tudcum',
    descripcion: 'Obras civiles y movimiento de tierras para minería.',
    selloValidado: true,
    selloSustentable: true,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 9012345',
    email: 'natalia@construccionesandinas.com',
  },
  {
    id: '19',
    tipo: 'proveedor',
    nombre: 'Martín Soto',
    empresa: 'Alimentación Minera',
    rubro: 'Catering de Campamento',
    localidad: 'Jáchal',
    descripcion: 'Catering industrial con menú adaptado a turnos mineros.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 0123456',
    email: 'martin@alimentacionminera.com',
  },
  {
    id: '20',
    tipo: 'proveedor',
    nombre: 'Valeria Ríos',
    empresa: 'Excavaciones San Juan',
    rubro: 'Movimiento de Suelos',
    localidad: 'Calingasta',
    descripcion: 'Maquinaria y operarios para excavación minera.',
    selloValidado: true,
    selloSustentable: false,
    semaforo: { afip: 'ok', art: 'ok', seguro: 'ok' },
    telefono: '+54 264 1112223',
    email: 'valeria@excavacionessanjuan.com',
  },
];

export const PARTNERS = [
  { id: '1', nombre: 'Sun Solutions', src: '/logos/sun-solutions.png', alt: 'Sun Solutions' },
  { id: '2', nombre: 'CADEMI', src: '/logos/cademi.png', alt: 'CADEMI' },
  { id: '3', nombre: 'Gobierno de San Juan', src: '/logos/gobierno-sanjuan.png', alt: 'Gobierno de San Juan' },
  { id: '4', nombre: 'Mujer en la Minería', src: '/logos/mujer-mineria.png', alt: 'Mujer en la Minería' },
];

export const PROYECTOS_RSE: ProyectoRSE[] = [
  {
    id: '1',
    nombre: 'Ampliación Escuela Jáchal',
    localidad: 'Jáchal',
    descripcion: 'Construcción de 2 aulas nuevas para la escuela primaria local.',
    fechaInicio: '2024-01-15',
    estado: 'activo',
  },
  {
    id: '2',
    nombre: 'Conectividad Tudcum',
    localidad: 'Tudcum',
    descripcion: 'Instalación de antenas para internet satelital en la comunidad.',
    fechaInicio: '2024-03-01',
    estado: 'activo',
  },
];

export const LICITACIONES: Licitacion[] = [
  {
    id: '1',
    titulo: 'Provisión de Viandas (Iglesia)',
    descripcion: 'Se requieren 500 viandas semanales para campamento minero en Iglesia.',
    localidad: 'Iglesia',
    fechaCierre: '2025-03-15',
    postulantes: ['2', '1', '4'],
  },
  {
    id: '2',
    titulo: '5 Camionetas en Iglesia',
    descripcion: 'Alquiler de 5 camionetas 4x4 para operaciones en zona minera.',
    localidad: 'Iglesia',
    fechaCierre: '2025-03-20',
    postulantes: ['4'],
  },
  {
    id: '3',
    titulo: 'Soldadores para obra Calingasta',
    descripcion: 'Se buscan 3 soldadores calificados para obra de estructuras. Contrato 6 meses.',
    localidad: 'Calingasta',
    fechaCierre: '2025-03-25',
    postulantes: [],
  },
  {
    id: '4',
    titulo: 'Movimiento de Suelos - Jáchal',
    descripcion: 'Excavación y nivelación para nuevo campamento. Maquinaria pesada requerida.',
    localidad: 'Jáchal',
    fechaCierre: '2025-04-01',
    postulantes: [],
  },
  {
    id: '5',
    titulo: 'Choferes de Alta Montaña - Rodeo',
    descripcion: '2 choferes con licencia profesional para transporte de personal en ruta minera.',
    localidad: 'Rodeo',
    fechaCierre: '2025-04-05',
    postulantes: [],
  },
  {
    id: '6',
    titulo: 'Catering Campamento Tudcum',
    descripcion: 'Servicio de alimentación para 80 personas. Desayuno, almuerzo y cena.',
    localidad: 'Tudcum',
    fechaCierre: '2025-04-10',
    postulantes: [],
  },
];

export const PERFILES_AUDITORIA: PerfilAuditoria[] = [
  {
    id: '9',
    nombre: 'Transportes Andinos',
    empresa: 'Transportes Andinos S.R.L.',
    localidad: 'Calingasta',
    estado: 'pendiente',
    tipoSello: 'local',
  },
  {
    id: '10',
    nombre: 'Juan Pérez',
    localidad: 'Jáchal',
    estado: 'pendiente',
    tipoSello: 'sustentable',
  },
];
