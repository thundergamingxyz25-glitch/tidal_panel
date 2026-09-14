<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('container_name')->nullable()->unique();
            $table->string('docker_image')->default('itzg/minecraft-server:java21');
            $table->string('status')->default('offline');
            $table->unsignedInteger('memory')->default(8192);
            $table->unsignedInteger('disk')->default(102400);
            $table->unsignedInteger('cpu')->default(400);
            $table->text('start_command')->nullable();
            $table->unsignedSmallInteger('port')->nullable();
            $table->json('environment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
