import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EvidenciaReporte } from '@/types';

type Props = {
    evidencias: EvidenciaReporte[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
};

export default function GaleriaImagenes({ evidencias, initialIndex = 0, open, onClose }: Props) {
    const [indice, setIndice] = useState(initialIndex);

    useEffect(() => {
        setIndice(initialIndex);
    }, [initialIndex, open]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') irAnterior();
            if (e.key === 'ArrowRight') irSiguiente();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, indice]);

    if (!open || evidencias.length === 0) return null;

    function irAnterior() {
        setIndice((i) => (i - 1 + evidencias.length) % evidencias.length);
    }

    function irSiguiente() {
        setIndice((i) => (i + 1) % evidencias.length);
    }

    const actual = evidencias[indice];

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Botón cerrar */}
            <button
                onClick={onClose}
                className="absolute right-8 top-8 rounded-full bg-neutral-600 p-2 text-white hover:bg-neutral-500 transition-colors"
            >
                <X className="size-5" />
            </button>

            {/* Flecha izquierda */}
            <button
                onClick={irAnterior}
                className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-neutral-600 p-1 text-white hover:bg-neutral-500 transition-colors"
            >
                <ChevronLeft className="size-6" />
            </button>

            {/* Flecha derecha */}
            <button
                onClick={irSiguiente}
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full bg-neutral-600 p-1 text-white hover:bg-neutral-500 transition-colors"
            >
                <ChevronRight className="size-6" />
            </button>

            {/* Contenido */}
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-10 py-10">
                {/* Imagen principal */}
                <div className="flex max-h-[60vh] flex-1 items-center justify-center px-20">
                    <img
                        src={actual.url}
                        alt={actual.nombre_original ?? `Evidencia ${indice + 1}`}
                        className="max-h-full max-w-full object-contain rounded"
                    />
                </div>

                {/* Miniaturas */}
                <div className="flex shrink-0 gap-3">
                    {evidencias.map((ev, i) => (
                        <button
                            key={ev.id}
                            onClick={() => setIndice(i)}
                            className={cn(
                                'relative size-[100px] overflow-hidden rounded',
                                i !== indice && 'opacity-50',
                            )}
                        >
                            <img
                                src={ev.url}
                                alt={ev.nombre_original ?? `Miniatura ${i + 1}`}
                                className="size-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
