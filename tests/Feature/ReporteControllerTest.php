<?php

use App\Auth\Models\User;
use App\Camara;
use App\Reporte;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
    $this->user = User::factory()->create();
    $this->camara = Camara::factory()->create();
});

describe('GET /camaras', function () {
    test('redirige a login si no está autenticado', function () {
        $this->get('/camaras')->assertRedirect('/login');
    });

    test('renderiza la página de cámaras con datos', function () {
        Reporte::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'camara_id' => $this->camara->id,
        ]);

        $this->actingAs($this->user)
            ->get('/camaras')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('camaras/index')
                    ->has('reportes', 3)
                    ->has('camaras')
            );
    });

    test('devuelve estado vacío cuando no hay reportes', function () {
        $this->actingAs($this->user)
            ->get('/camaras')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('camaras/index')
                    ->has('reportes', 0)
            );
    });
});

describe('POST /reportes', function () {
    test('redirige a login si no está autenticado', function () {
        $this->post('/reportes', [])->assertRedirect('/login');
    });

    test('crea un reporte correctamente', function () {
        $datos = [
            'fecha' => '2026-05-12',
            'hora' => '14:30',
            'turno' => 'dia',
            'camara_id' => $this->camara->id,
            'tipo_ocurrencia' => 'ACCIDENTE DE TRANSITO',
            'origen' => 'camaras',
            'descripcion' => 'SE VISUALIZA ACCIDENTE ENTRE DOS VEHICULOS',
            'direccion' => 'Av. Camino Real Cdra. 5',
            'referencia' => 'Frente al mercado',
            'nivel' => 2,
            'unidad_operativa' => 'ALFA 32',
            'estado' => 'pendiente',
        ];

        $this->actingAs($this->user)
            ->post('/reportes', $datos)
            ->assertRedirect('/camaras');

        $this->assertDatabaseHas('reportes', [
            'user_id' => $this->user->id,
            'tipo_ocurrencia' => 'ACCIDENTE DE TRANSITO',
            'nivel' => 2,
            'estado' => 'pendiente',
        ]);
    });

    test('falla si faltan campos requeridos', function () {
        $this->actingAs($this->user)
            ->post('/reportes', [])
            ->assertSessionHasErrors(['fecha', 'hora', 'turno', 'tipo_ocurrencia', 'origen', 'descripcion', 'nivel', 'estado']);
    });

    test('falla con nivel inválido', function () {
        $this->actingAs($this->user)
            ->post('/reportes', [
                'fecha' => '2026-05-12',
                'hora' => '14:30',
                'turno' => 'dia',
                'tipo_ocurrencia' => 'ROBO',
                'origen' => 'camaras',
                'descripcion' => 'Descripción',
                'nivel' => 5,
                'estado' => 'pendiente',
            ])
            ->assertSessionHasErrors(['nivel']);
    });

    test('guarda evidencias al crear un reporte', function () {
        Storage::fake('public');

        $datos = [
            'fecha' => '2026-05-12',
            'hora' => '14:30',
            'turno' => 'dia',
            'tipo_ocurrencia' => 'ROBO AL PASO',
            'origen' => 'camaras',
            'descripcion' => 'SE VISUALIZA ROBO',
            'nivel' => 1,
            'estado' => 'pendiente',
            'evidencias' => [
                UploadedFile::fake()->image('foto1.jpg'),
                UploadedFile::fake()->image('foto2.jpg'),
            ],
        ];

        $this->actingAs($this->user)
            ->post('/reportes', $datos)
            ->assertRedirect('/camaras');

        $reporte = Reporte::latest()->first();
        expect($reporte->evidencias)->toHaveCount(2);
    });
});
