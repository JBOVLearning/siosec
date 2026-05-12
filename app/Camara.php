<?php

namespace App;

use Database\Factories\CamaraFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Camara extends Model
{
    /** @use HasFactory<CamaraFactory> */
    use HasFactory;

    protected $fillable = ['codigo', 'nombre', 'descripcion', 'activa'];

    protected $casts = [
        'activa' => 'boolean',
    ];

    public function reportes(): HasMany
    {
        return $this->hasMany(Reporte::class);
    }
}
