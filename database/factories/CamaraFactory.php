<?php

namespace Database\Factories;

use App\Camara;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Camara>
 */
class CamaraFactory extends Factory
{
    public function definition(): array
    {
        static $contador = 100;
        $contador++;

        return [
            'codigo' => 'C-'.$contador,
            'nombre' => 'Cámara '.$this->faker->streetAddress(),
            'descripcion' => $this->faker->optional()->sentence(),
            'activa' => $this->faker->boolean(90),
        ];
    }
}
