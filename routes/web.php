<?php

use App\Http\Controllers\EvidenciaReporteController;
use App\Http\Controllers\ReporteController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('camaras', [ReporteController::class, 'index'])->name('camaras.index');
    Route::post('reportes', [ReporteController::class, 'store'])->name('reportes.store');
    Route::post('reportes/{reporte}/evidencias', [EvidenciaReporteController::class, 'store'])->name('reportes.evidencias.store');
});

require __DIR__.'/settings.php';
