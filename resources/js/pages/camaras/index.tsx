import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, Calendar, Clock, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFlashToast } from '@/hooks/use-flash-toast';
import NuevoReporteModal from '@/components/camaras/NuevoReporteModal';
import GaleriaImagenes from '@/components/camaras/GaleriaImagenes';
import type { Camara, Reporte, EvidenciaReporte } from '@/types';

type Props = {
    reportes: Reporte[];
    camaras: Camara[];
};

// ──────────────────── Helpers ────────────────────

function agruparPorFecha(reportes: Reporte[]): { label: string; items: Reporte[] }[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const grupos = new Map<string, Reporte[]>();

    for (const r of reportes) {
        const fecha = new Date(r.fecha + 'T00:00:00');
        const diff = Math.round((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

        let label: string;
        if (diff === 0) label = 'Hoy';
        else if (diff === 1) label = 'Ayer';
        else if (diff < 7) label = `Hace ${diff} días`;
        else if (diff < 14) label = 'Hace 1 semana';
        else label = fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

        if (!grupos.has(label)) grupos.set(label, []);
        grupos.get(label)!.push(r);
    }

    return Array.from(grupos.entries()).map(([label, items]) => ({ label, items }));
}

function formatearFechaLarga(fecha: string, hora: string): string {
    const dt = new Date(`${fecha}T${hora}`);
    const dia = dt.toLocaleDateString('es-PE', { weekday: 'long' });
    const diaNum = dt.getDate();
    const mes = dt.toLocaleDateString('es-PE', { month: 'long' });
    const anio = dt.getFullYear();
    const h = String(dt.getHours()).padStart(2, '0');
    const m = String(dt.getMinutes()).padStart(2, '0');
    return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${diaNum} de ${mes} del ${anio} a las ${h}:${m}`;
}

function formatearFechaCorta(fecha: string): string {
    const [y, mo, d] = fecha.split('-');
    return `${d}/${mo}/${y}`;
}

function nivelBadgeClases(nivel: number): string {
    return {
        1: 'bg-[#fff0f0] text-[#db0004]',
        2: 'bg-[#fef3c7] text-[#b45309]',
        3: 'bg-orange-100 text-orange-700',
    }[nivel] ?? 'bg-gray-100 text-gray-700';
}

function nivelLabel(nivel: number): string {
    return `Nivel ${nivel}`;
}

function turnoLabel(turno: string): string {
    return turno === 'dia' ? 'Turno Día' : 'Turno Noche';
}

// ──────────────────── Sub-componentes ────────────────────

function Navbar({ onNuevoReporte }: { onNuevoReporte: () => void }) {
    function handleLogout() {
        router.post('/logout');
    }

    return (
        <div className="flex h-[76px] shrink-0 items-center justify-between py-[18px]">
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-1">
                    <div className="size-[23px] rounded-full bg-[#e42320]" />
                    <span className="text-[18px] font-semibold text-white">SIOSEC</span>
                </div>
                {/* Links */}
                <div className="flex items-center gap-2">
                    <button className="flex h-10 items-center justify-center rounded bg-white/25 px-3 text-sm font-medium text-white">
                        Cámaras
                    </button>
                    <button className="flex h-10 items-center justify-center rounded px-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                        Llamadas
                    </button>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="flex h-10 items-center justify-center rounded border border-neutral-300 px-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
                Cerrar sesión
            </button>
        </div>
    );
}

function EstadoVacio({ onNuevoReporte }: { onNuevoReporte: () => void }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
            <p className="text-lg font-semibold text-black">Sin reportes</p>
            <p className="text-sm text-neutral-500">Registra la primera incidencia del turno cuando ocurra.</p>
            <Button onClick={onNuevoReporte} className="bg-[#e42320] hover:bg-[#c41e1b] text-white">
                Registrar primera incidencia
            </Button>
        </div>
    );
}

type ReporteCardProps = {
    reporte: Reporte;
    seleccionado: boolean;
    onSeleccionar: () => void;
};

function ReporteCard({ reporte, seleccionado, onSeleccionar }: ReporteCardProps) {
    return (
        <button
            onClick={onSeleccionar}
            className={cn(
                'w-full rounded-lg border p-6 text-left transition-all',
                seleccionado
                    ? 'border-[#e42320] bg-white shadow-lg'
                    : 'border-neutral-300 bg-white hover:border-neutral-400',
            )}
        >
            <p className="text-sm font-semibold text-black leading-6">{reporte.tipo_ocurrencia}</p>
            <p className="mt-3 text-sm text-black line-clamp-3 leading-5">{reporte.descripcion}</p>
            <div className="mt-3">
                <span className={cn('inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold', nivelBadgeClases(reporte.nivel))}>
                    {nivelLabel(reporte.nivel)}
                </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-black">
                    <Calendar className="size-4" />
                    <span>{formatearFechaCorta(reporte.fecha)}</span>
                </div>
                <div className="flex items-center gap-3">
                    {reporte.camara && (
                        <div className="flex items-center gap-1 text-xs text-black">
                            <Camera className="size-4" />
                            <span>{reporte.camara.codigo}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-black">
                        <Clock className="size-4" />
                        <span>{reporte.hora.slice(0, 5)}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}

type DetalleReporteProps = {
    reporte: Reporte;
    onAbrirGaleria: (idx: number) => void;
};

function DetalleReporte({ reporte, onAbrirGaleria }: DetalleReporteProps) {
    const evidencias = reporte.evidencias ?? [];

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Header del detalle */}
            <div className="shrink-0 border-b border-neutral-100 bg-white p-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-black">{reporte.tipo_ocurrencia}</h2>
                    {reporte.user && (
                        <p className="text-sm font-semibold text-black">{reporte.user.name.toUpperCase()}</p>
                    )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-4 py-1.5 text-xs font-semibold', 'bg-[#fef3c7] text-[#b45309]')}>
                            {turnoLabel(reporte.turno)}
                        </span>
                        <span className={cn('rounded-full px-4 py-1.5 text-xs font-semibold', nivelBadgeClases(reporte.nivel))}>
                            {nivelLabel(reporte.nivel)}
                        </span>
                    </div>
                    <span className="text-xs text-black">
                        {formatearFechaLarga(reporte.fecha, reporte.hora)}
                    </span>
                </div>
            </div>

            {/* Cuerpo del detalle */}
            <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">
                {/* Descripción */}
                <div>
                    <p className="text-sm font-semibold text-black mb-1">Descripción</p>
                    <p className="text-sm text-black leading-5 whitespace-pre-line">{reporte.descripcion}</p>
                </div>

                {/* Metadatos adicionales */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {reporte.camara && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">Cámara</p>
                            <p className="text-black">{reporte.camara.codigo} — {reporte.camara.nombre}</p>
                        </div>
                    )}
                    {reporte.origen && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">Origen</p>
                            <p className="text-black capitalize">{reporte.origen.replace('_', ' ')}</p>
                        </div>
                    )}
                    {reporte.direccion && (
                        <div className="col-span-2">
                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">Dirección</p>
                            <p className="text-black">{reporte.direccion}</p>
                        </div>
                    )}
                    {reporte.referencia && (
                        <div className="col-span-2">
                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">Referencia</p>
                            <p className="text-black">{reporte.referencia}</p>
                        </div>
                    )}
                    {reporte.unidad_operativa && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">Unidad operativa</p>
                            <p className="text-black">{reporte.unidad_operativa}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-0.5">Estado</p>
                        <p className="text-black capitalize">{reporte.estado.replace('_', ' ')}</p>
                    </div>
                </div>

                {/* Evidencias */}
                {evidencias.length > 0 && (
                    <div>
                        <p className="text-sm font-semibold text-black mb-3">Evidencias</p>
                        <div className="flex flex-wrap gap-3">
                            {evidencias.map((ev, i) => (
                                <button
                                    key={ev.id}
                                    onClick={() => onAbrirGaleria(i)}
                                    className="relative size-[120px] overflow-hidden rounded hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src={ev.url}
                                        alt={ev.nombre_original ?? `Evidencia ${i + 1}`}
                                        className="size-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ──────────────────── Página principal ────────────────────

export default function CamarasIndex({ reportes, camaras }: Props) {
    useFlashToast();

    const [modalAbierto, setModalAbierto] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(
        reportes.length > 0 ? reportes[0] : null,
    );
    const [galeriaAbierta, setGaleriaAbierta] = useState(false);
    const [galeriaIndice, setGaleriaIndice] = useState(0);
    const [busqueda, setBusqueda] = useState('');

    const reportesFiltrados = useMemo(() => {
        if (!busqueda.trim()) return reportes;
        const q = busqueda.toLowerCase();
        return reportes.filter(
            (r) =>
                r.tipo_ocurrencia.toLowerCase().includes(q) ||
                r.descripcion.toLowerCase().includes(q) ||
                r.camara?.codigo.toLowerCase().includes(q),
        );
    }, [reportes, busqueda]);

    const grupos = useMemo(() => agruparPorFecha(reportesFiltrados), [reportesFiltrados]);

    function abrirGaleria(idx: number) {
        setGaleriaIndice(idx);
        setGaleriaAbierta(true);
    }

    const evidenciasActuales: EvidenciaReporte[] = reporteSeleccionado?.evidencias ?? [];

    return (
        <>
            <Head title="Registro de Reportes de Cámaras" />

            {/* Fondo banner */}
            <div className="absolute left-0 top-0 h-[331px] w-full bg-gradient-to-br from-[#b5130f] via-[#8a1010] to-[#2d1060] z-0" />

            <div className="relative z-10 flex min-h-screen flex-col items-center px-8">
                <div className="flex w-full max-w-[1440px] flex-1 flex-col">

                    {/* Navbar */}
                    <Navbar onNuevoReporte={() => setModalAbierto(true)} />

                    {/* Área de contenido */}
                    <div className="flex flex-1 flex-col pb-[18px]">

                        {/* Fila de título */}
                        <div className="flex items-center justify-between pb-8 pt-2">
                            <div className="flex flex-col gap-1 text-white">
                                <h1 className="text-2xl font-semibold leading-8">
                                    {reportes.length === 0
                                        ? 'Registro de Reportes de Cámaras'
                                        : 'Reporte de cámaras'}
                                </h1>
                                <p className="text-sm font-normal leading-5">
                                    Sistema intranet para el registro y seguimiento de incidencia de la Central de Monitoreo.
                                </p>
                            </div>
                            <Button
                                onClick={() => setModalAbierto(true)}
                                className="shrink-0 bg-[#e42320] hover:bg-[#c41e1b] text-white"
                            >
                                Nuevo reporte
                            </Button>
                        </div>

                        {/* Card principal */}
                        <div className="flex flex-1 overflow-hidden rounded-xl bg-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.05)]">
                            {reportes.length === 0 ? (
                                <EstadoVacio onNuevoReporte={() => setModalAbierto(true)} />
                            ) : (
                                <div className="flex flex-1 overflow-hidden">
                                    {/* Panel izquierdo — lista */}
                                    <div className="flex w-[559px] shrink-0 flex-col border-r border-neutral-300">
                                        {/* Filtros */}
                                        <div className="flex shrink-0 items-center gap-3 p-6">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                                <Input
                                                    placeholder="Buscar incidencia..."
                                                    value={busqueda}
                                                    onChange={(e) => setBusqueda(e.target.value)}
                                                    className="pl-9 h-10 border-neutral-200"
                                                />
                                            </div>
                                            <button className="flex h-10 items-center justify-center rounded border border-neutral-200 px-2 hover:bg-neutral-50 transition-colors">
                                                <SlidersHorizontal className="size-5 text-neutral-600" />
                                            </button>
                                        </div>

                                        {/* Lista scrollable */}
                                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                                            {grupos.length === 0 ? (
                                                <p className="text-sm text-neutral-500 text-center py-8">
                                                    No se encontraron resultados.
                                                </p>
                                            ) : (
                                                <div className="space-y-6">
                                                    {grupos.map((grupo) => (
                                                        <div key={grupo.label} className="space-y-3">
                                                            <p className="text-sm text-black">{grupo.label}</p>
                                                            {grupo.items.map((r) => (
                                                                <ReporteCard
                                                                    key={r.id}
                                                                    reporte={r}
                                                                    seleccionado={reporteSeleccionado?.id === r.id}
                                                                    onSeleccionar={() => setReporteSeleccionado(r)}
                                                                />
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => router.reload()}
                                                        className="w-full text-center text-sm text-neutral-700 py-2 hover:text-black transition-colors"
                                                    >
                                                        Cargar más
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panel derecho — detalle */}
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        {reporteSeleccionado ? (
                                            <DetalleReporte
                                                reporte={reporteSeleccionado}
                                                onAbrirGaleria={abrirGaleria}
                                            />
                                        ) : (
                                            <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
                                                Selecciona un reporte para ver el detalle.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal nuevo reporte */}
            <NuevoReporteModal
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                camaras={camaras}
            />

            {/* Galería de imágenes */}
            <GaleriaImagenes
                evidencias={evidenciasActuales}
                initialIndex={galeriaIndice}
                open={galeriaAbierta}
                onClose={() => setGaleriaAbierta(false)}
            />
        </>
    );
}
