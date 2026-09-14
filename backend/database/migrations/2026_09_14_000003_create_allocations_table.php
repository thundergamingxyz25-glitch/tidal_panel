<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->cascadeOnDelete();
            $table->ipAddress('ip_address');
            $table->unsignedSmallInteger('port');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->unique(['ip_address', 'port']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocations');
    }
};
