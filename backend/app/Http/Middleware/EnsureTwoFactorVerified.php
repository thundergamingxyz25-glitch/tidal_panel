<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $abilities = $request->user()?->currentAccessToken()?->abilities ?? [];
        abort_if(in_array('2fa:setup', $abilities, true), 403, 'Complete two-factor setup before continuing.');

        return $next($request);
    }
}
