<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuthSession extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'authenticatable_type', 'authenticatable_id', 'token_id', 'ip_address', 'user_agent', 'last_used_at', 'revoked_at'];
    protected $casts = ['last_used_at' => 'datetime', 'revoked_at' => 'datetime'];

    public function authenticatable(): MorphTo
    {
        return $this->morphTo();
    }
}
