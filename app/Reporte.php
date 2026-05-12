<?php

namespace App;

use App\Auth\Models\User;
use Database\Factories\ReporteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reporte extends Model
{
    /** @use HasFactory<ReporteFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'camara_id',
        'fecha',
        'hora',
        'turno',
        'tipo_ocurrencia',
        'origen',
        'descripcion',
        'direccion',
        'referencia',
        'latitud',
        'longitud',
        'nivel',
        'unidad_operativa',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'nivel' => 'integer',
        'latitud' => 'float',
        'longitud' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function camara(): BelongsTo
    {
        return $this->belongsTo(Camara::class);
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(EvidenciaReporte::class);
    }
}
