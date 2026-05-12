<?php

namespace Database\Seeders;

use App\Auth\Models\User;
use App\Camara;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'dni' => '12345678',
            'email' => 'test@example.com',
        ]);

        $camaras = [
            ['codigo' => 'C-101', 'nombre' => 'Óvalo Puente Piedra - Norte'],
            ['codigo' => 'C-102', 'nombre' => 'Óvalo Puente Piedra - Sur'],
            ['codigo' => 'C-103', 'nombre' => 'Av. Camino Real - Cdra. 5'],
            ['codigo' => 'C-104', 'nombre' => 'By Pass Puente Piedra'],
            ['codigo' => 'C-105', 'nombre' => 'Mercado Unicachi - Ingreso'],
            ['codigo' => 'C-106', 'nombre' => 'Av. Los Sauces - Cdra. 3'],
            ['codigo' => 'C-107', 'nombre' => 'Jr. Los Jardines - Cdra. 1'],
            ['codigo' => 'C-108', 'nombre' => 'Parque Central Puente Piedra'],
            ['codigo' => 'C-109', 'nombre' => 'Av. Márquez - Cdra. 8'],
            ['codigo' => 'C-110', 'nombre' => 'Urb. Santa Rosa - Ingreso'],
        ];

        foreach ($camaras as $camara) {
            Camara::create(array_merge($camara, ['activa' => true]));
        }
    }
}
