export type Camara = {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    activa: boolean;
};

export type EvidenciaReporte = {
    id: number;
    reporte_id: number;
    ruta: string;
    url: string;
    nombre_original: string | null;
    created_at: string;
};

export type Reporte = {
    id: number;
    user_id: number;
    camara_id: number | null;
    camara?: Camara;
    user?: {
        id: number;
        name: string;
    };
    fecha: string;
    hora: string;
    turno: 'dia' | 'noche';
    tipo_ocurrencia: string;
    origen: string;
    descripcion: string;
    direccion: string | null;
    referencia: string | null;
    latitud: number | null;
    longitud: number | null;
    nivel: 1 | 2 | 3;
    unidad_operativa: string | null;
    estado: 'pendiente' | 'en_proceso' | 'atendido' | 'cerrado';
    evidencias?: EvidenciaReporte[];
    created_at: string;
    updated_at: string;
};
