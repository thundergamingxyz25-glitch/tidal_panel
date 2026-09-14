<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Server extends \Illuminate\Database\Eloquent\Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id', 'name', 'template', 'template_version', 'uuid', 'container_name', 'docker_image', 'status',
        'memory', 'disk', 'cpu', 'start_command', 'port', 'environment',
    ];

    protected $casts = ['environment' => 'array'];

    protected static function booted(): void
    {
        static::creating(function (Server $server): void {
            $server->uuid ??= (string) Str::orderedUuid();
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }
}
