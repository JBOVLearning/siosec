<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EvidenciaReporte extends Model
{
    protected $fillable = ['reporte_id', 'ruta', 'nombre_original'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::url($this->ruta);
    }

    public function reporte(): BelongsTo
    {
        return $this->belongsTo(Reporte::class);
    }
}
