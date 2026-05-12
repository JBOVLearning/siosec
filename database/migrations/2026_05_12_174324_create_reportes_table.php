<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('camara_id')->nullable()->constrained('camaras')->nullOnDelete();
            $table->date('fecha');
            $table->time('hora');
            $table->enum('turno', ['dia', 'noche']);
            $table->string('tipo_ocurrencia');
            $table->string('origen');
            $table->text('descripcion');
            $table->string('direccion')->nullable();
            $table->string('referencia')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->tinyInteger('nivel');
            $table->string('unidad_operativa')->nullable();
            $table->enum('estado', ['pendiente', 'en_proceso', 'atendido', 'cerrado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
