<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Allocation extends Model
{
    protected $fillable = ['ip_address', 'port', 'is_primary'];

    protected $casts = ['is_primary' => 'boolean'];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
