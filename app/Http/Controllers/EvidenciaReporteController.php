<?php

namespace App\Http\Controllers;

use App\Reporte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvidenciaReporteController extends Controller
{
    public function store(Request $request, Reporte $reporte): JsonResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'image', 'max:10240'],
        ]);

        $ruta = $request->file('archivo')->store('evidencias', 'public');

        $evidencia = $reporte->evidencias()->create([
            'ruta' => $ruta,
            'nombre_original' => $request->file('archivo')->getClientOriginalName(),
        ]);

        return response()->json($evidencia);
    }
}
