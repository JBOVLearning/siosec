import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, ImagePlus, MapPin } from 'lucide-react';
import ReporteController from '@/actions/App/Http/Controllers/ReporteController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Camara } from '@/types';

type FormData = {
    fecha: string;
    hora: string;
    turno: 'dia' | 'noche';
    camara_id: string;
    tipo_ocurrencia: string;
    origen: string;
    descripcion: string;
    direccion: string;
    referencia: string;
    nivel: number;
    unidad_operativa: string;
    estado: string;
    evidencias: File[];
};

type Props = {
    open: boolean;
    onClose: () => void;
    camaras: Camara[];
};

const ORIGENES = [
    { value: 'camaras', label: 'Cámaras' },
    { value: 'radio', label: 'Radio' },
    { value: 'llamada_telefonica', label: 'Llamada telefónica' },
    { value: 'otro', label: 'Otro' },
];

const ESTADOS = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'atendido', label: 'Atendido' },
    { value: 'cerrado', label: 'Cerrado' },
];

const TURNOS = [
    { value: 'dia', label: 'Turno Día' },
    { value: 'noche', label: 'Turno Noche' },
];

const NIVELES = [
    { valor: 1, label: 'Baja', color: 'text-neutral-700' },
    { valor: 2, label: 'Media', color: 'text-amber-500' },
    { valor: 3, label: 'Alta', color: 'text-red-600' },
];

function hoyFormateado(): string {
    return new Date().toISOString().split('T')[0];
}

function horaActual(): string {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

export default function NuevoReporteModal({ open, onClose, camaras }: Props) {
    const inputArchivoRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const form = useForm<FormData>({
        fecha: hoyFormateado(),
        hora: horaActual(),
        turno: 'dia',
        camara_id: '',
        tipo_ocurrencia: '',
        origen: '',
        descripcion: '',
        direccion: '',
        referencia: '',
        nivel: 2,
        unidad_operativa: '',
        estado: 'pendiente',
        evidencias: [],
    });

    function handleAgregarImagenes(e: React.ChangeEvent<HTMLInputElement>) {
        const archivos = Array.from(e.target.files ?? []);
        if (archivos.length === 0) return;

        const nuevos = [...form.data.evidencias, ...archivos];
        form.setData('evidencias', nuevos);

        const nuevasPreviews = archivos.map((f) => URL.createObjectURL(f));
        setPreviewUrls((prev) => [...prev, ...nuevasPreviews]);

        if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }

    function handleEliminarImagen(idx: number) {
        const nuevos = form.data.evidencias.filter((_, i) => i !== idx);
        form.setData('evidencias', nuevos);
        URL.revokeObjectURL(previewUrls[idx]);
        setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(ReporteController.store.url(), {
            forceFormData: true,
            onSuccess: () => {
                handleCerrar();
            },
        });
    }

    function handleCerrar() {
        form.reset();
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        onClose();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 px-8 py-5">
            <div className="relative flex max-h-full w-full max-w-250 flex-col overflow-hidden rounded bg-white">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-5">
                    <h2 className="text-lg font-semibold text-black">Nuevo reporte</h2>
                    <button
                        type="button"
                        onClick={handleCerrar}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                        {/* ── Metadatos ── */}
                        <p className="text-base font-semibold text-black">Metadatos</p>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={form.data.fecha}
                                    onChange={(e) => form.setData('fecha', e.target.value)}
                                    className={cn(form.errors.fecha && 'border-red-500')}
                                />
                                {form.errors.fecha && (
                                    <p className="text-xs text-red-600">{form.errors.fecha}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="turno">Turno</Label>
                                <Select
                                    value={form.data.turno}
                                    onValueChange={(v) => form.setData('turno', v as 'dia' | 'noche')}
                                >
                                    <SelectTrigger id="turno" className={cn(form.errors.turno && 'border-red-500')}>
                                        <SelectValue placeholder="Seleccione una opción..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TURNOS.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.turno && (
                                    <p className="text-xs text-red-600">{form.errors.turno}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hora">Hora</Label>
                                <Input
                                    id="hora"
                                    type="time"
                                    value={form.data.hora}
                                    onChange={(e) => form.setData('hora', e.target.value)}
                                    className={cn(form.errors.hora && 'border-red-500')}
                                />
                                {form.errors.hora && (
                                    <p className="text-xs text-red-600">{form.errors.hora}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="camara_id">Cámara</Label>
                            <Select
                                value={form.data.camara_id}
                                onValueChange={(v) => form.setData('camara_id', v)}
                            >
                                <SelectTrigger id="camara_id" className={cn(form.errors.camara_id && 'border-red-500')}>
                                    <SelectValue placeholder="Seleccione una cámara" />
                                </SelectTrigger>
                                <SelectContent>
                                    {camaras.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.codigo} — {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.camara_id && (
                                <p className="text-xs text-red-600">{form.errors.camara_id}</p>
                            )}
                        </div>

                        {/* ── Ubicación ── */}
                        <p className="text-base font-semibold text-black">Ubicación</p>

                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 flex items-center gap-3 text-sm text-neutral-500">
                                <MapPin className="size-4 shrink-0 text-neutral-400" />
                                <Input
                                    id="direccion"
                                    placeholder="Ingrese la dirección de la incidencia"
                                    value={form.data.direccion}
                                    onChange={(e) => form.setData('direccion', e.target.value)}
                                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                            {form.errors.direccion && (
                                <p className="text-xs text-red-600">{form.errors.direccion}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="referencia">Referencia</Label>
                            <Input
                                id="referencia"
                                placeholder="ej. Junto al parque central"
                                value={form.data.referencia}
                                onChange={(e) => form.setData('referencia', e.target.value)}
                            />
                        </div>

                        {/* ── Ocurrencia ── */}
                        <p className="text-base font-semibold text-black">Ocurrencia</p>

                        <div className="space-y-2">
                            <Label htmlFor="origen">Origen</Label>
                            <Select
                                value={form.data.origen}
                                onValueChange={(v) => form.setData('origen', v)}
                            >
                                <SelectTrigger id="origen" className={cn(form.errors.origen && 'border-red-500')}>
                                    <SelectValue placeholder="Seleccione una opción..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ORIGENES.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.origen && (
                                <p className="text-xs text-red-600">{form.errors.origen}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipo_ocurrencia">Tipo de ocurrencia</Label>
                            <Input
                                id="tipo_ocurrencia"
                                placeholder="ej. ACCIDENTE DE TRÁNSITO"
                                value={form.data.tipo_ocurrencia}
                                onChange={(e) => form.setData('tipo_ocurrencia', e.target.value.toUpperCase())}
                                className={cn(form.errors.tipo_ocurrencia && 'border-red-500')}
                            />
                            {form.errors.tipo_ocurrencia && (
                                <p className="text-xs text-red-600">{form.errors.tipo_ocurrencia}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Breve descripción y resumen de la ocurrencia"
                                rows={4}
                                value={form.data.descripcion}
                                onChange={(e) => form.setData('descripcion', e.target.value)}
                                className={cn(form.errors.descripcion && 'border-red-500')}
                            />
                            {form.errors.descripcion && (
                                <p className="text-xs text-red-600">{form.errors.descripcion}</p>
                            )}
                        </div>

                        {/* Evidencias */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-black">Evidencias</p>
                            <div className="flex flex-wrap gap-3">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="group relative size-37.5 overflow-hidden rounded">
                                        <img src={url} alt={`Evidencia ${i + 1}`} className="size-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarImagen(i)}
                                            className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:flex"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => inputArchivoRef.current?.click()}
                                    className="flex size-37.5 flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    <ImagePlus className="size-6" />
                                    <span className="text-xs">Agregar imagen</span>
                                </button>
                                <input
                                    ref={inputArchivoRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleAgregarImagenes}
                                />
                            </div>
                        </div>

                        {/* ── Atención ── */}
                        <p className="text-base font-semibold text-black">Atención</p>

                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <div className="grid grid-cols-3 gap-6">
                                {NIVELES.map((n) => (
                                    <button
                                        key={n.valor}
                                        type="button"
                                        onClick={() => form.setData('nivel', n.valor)}
                                        className={cn(
                                            'flex h-25 flex-col items-center justify-center gap-2 rounded-lg border p-2.5 transition-colors',
                                            form.data.nivel === n.valor
                                                ? 'border-primary-500 bg-red-50'
                                                : 'border-neutral-300 hover:border-neutral-400',
                                            n.color,
                                        )}
                                    >
                                        <span className="text-2xl font-semibold">{n.valor}</span>
                                        <span className="text-sm font-normal text-inherit">{n.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unidad_operativa">Área / Unidad operativa designada</Label>
                            <Input
                                id="unidad_operativa"
                                placeholder="ej. GOU, ALFA 32, ALFA 49"
                                value={form.data.unidad_operativa}
                                onChange={(e) => form.setData('unidad_operativa', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                                value={form.data.estado}
                                onValueChange={(v) => form.setData('estado', v)}
                            >
                                <SelectTrigger id="estado" className={cn(form.errors.estado && 'border-red-500')}>
                                    <SelectValue placeholder="Seleccione una opción..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ESTADOS.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Footer sticky */}
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
                        <Button type="button" variant="ghost" onClick={handleCerrar} disabled={form.processing}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                            {form.processing ? 'Guardando...' : 'Guardar reporte'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
