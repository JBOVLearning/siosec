<?php

namespace App\Http\Controllers;

use App\Camara;
use App\Reporte;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    public function index(): Response
    {
        $reportes = Reporte::with(['user', 'camara', 'evidencias'])
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        $camaras = Camara::where('activa', true)
            ->orderBy('codigo')
            ->get(['id', 'codigo', 'nombre']);

        return Inertia::render('camaras/index', [
            'reportes' => $reportes,
            'camaras' => $camaras,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fecha' => ['required', 'date'],
            'hora' => ['required', 'date_format:H:i'],
            'turno' => ['required', 'in:dia,noche'],
            'camara_id' => ['nullable', 'exists:camaras,id'],
            'tipo_ocurrencia' => ['required', 'string', 'max:255'],
            'origen' => ['required', 'string', 'max:100'],
            'descripcion' => ['required', 'string'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'referencia' => ['nullable', 'string', 'max:500'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'nivel' => ['required', 'integer', 'in:1,2,3'],
            'unidad_operativa' => ['nullable', 'string', 'max:255'],
            'estado' => ['required', 'in:pendiente,en_proceso,atendido,cerrado'],
            'evidencias' => ['nullable', 'array', 'max:10'],
            'evidencias.*' => ['file', 'image', 'max:10240'],
        ]);

        $reporte = $request->user()->reportes()->create($validated);

        if ($request->hasFile('evidencias')) {
            foreach ($request->file('evidencias') as $archivo) {
                $ruta = $archivo->store('evidencias', 'public');
                $reporte->evidencias()->create([
                    'ruta' => $ruta,
                    'nombre_original' => $archivo->getClientOriginalName(),
                ]);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Reporte registrado correctamente.']);

        return to_route('camaras.index');
    }
}
