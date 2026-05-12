<?php

namespace Database\Factories;

use App\Auth\Models\User;
use App\Camara;
use App\Reporte;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reporte>
 */
class ReporteFactory extends Factory
{
    private array $tiposOcurrencia = [
        'ACCIDENTE DE TRANSITO',
        'DISUASION DE LIBADORES',
        'ROBO AL PASO',
        'PERSONA SOSPECHOSA',
        'RIÑA CALLEJERA',
        'DESMAYO EN VIA PUBLICA',
        'INCENDIO DE VEHICULO',
        'VIOLENCIA FAMILIAR',
        'MICROCOMERCIALIZACION DE DROGAS',
        'ACCIDENTE DE TRABAJO',
    ];

    private array $origenes = ['camaras', 'radio', 'llamada_telefonica', 'otro'];

    private array $estados = ['pendiente', 'en_proceso', 'atendido', 'cerrado'];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'camara_id' => Camara::factory(),
            'fecha' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'hora' => $this->faker->time('H:i'),
            'turno' => $this->faker->randomElement(['dia', 'noche']),
            'tipo_ocurrencia' => $this->faker->randomElement($this->tiposOcurrencia),
            'origen' => $this->faker->randomElement($this->origenes),
            'descripcion' => strtoupper($this->faker->paragraph()),
            'direccion' => $this->faker->optional()->address(),
            'referencia' => $this->faker->optional()->sentence(4),
            'latitud' => $this->faker->optional()->latitude(-12.0, -11.8),
            'longitud' => $this->faker->optional()->longitude(-77.2, -77.0),
            'nivel' => $this->faker->numberBetween(1, 3),
            'unidad_operativa' => $this->faker->optional()->randomElement(['ALFA 32', 'ALFA 49', 'GOU', 'DELTA 5', 'BRAVO 7']),
            'estado' => $this->faker->randomElement($this->estados),
        ];
    }
}
