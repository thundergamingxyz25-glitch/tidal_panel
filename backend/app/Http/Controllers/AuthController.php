<?php

namespace App\Http\Controllers;

use App\Models\AuthSession;
use App\Models\User;
use App\Notifications\AccountLockedNotification;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request, RateLimiter $limiter): JsonResponse
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $email = strtolower($credentials['email']);
        $key = "login:{$email}|{$request->ip()}";
        $user = User::where('email', $email)->first();

        abort_if($limiter->tooManyAttempts($key, 5) || ($user?->locked_until && $user->locked_until->isFuture()), 429, 'Too many attempts. Try again later.');
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            $attempts = $limiter->hit($key, 900);
            if ($user) {
                $user->increment('failed_login_attempts');
                if ($attempts >= 5) {
                    $user->forceFill(['locked_until' => now()->addMinutes(15)])->save();
                    Notification::route('mail', $user->email)->notify(new AccountLockedNotification());
                }
            }
            abort(422, 'Invalid credentials.');
        }

        $limiter->clear($key);
        $user->forceFill(['failed_login_attempts' => 0, 'locked_until' => null])->save();
        return response()->json($this->issueToken($user));
    }

    public function me(Request $request): JsonResponse
    {
        $abilities = $request->user()->currentAccessToken()?->abilities ?? [];
        return response()->json(['user' => $request->user(), 'is_impersonating' => in_array('impersonation', $abilities, true)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        AuthSession::where('token_id', $token?->id)->update(['revoked_at' => now()]);
        $token?->delete();
        return response()->json(['revoked' => true]);
    }

    public function sessions(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->authSessions()->whereNull('revoked_at')->latest('last_used_at')->get()]);
    }

    public function revokeSession(Request $request, AuthSession $session): JsonResponse
    {
        abort_unless($session->authenticatable_type === User::class && $session->authenticatable_id === $request->user()->id, 404);
        $session->update(['revoked_at' => now()]);
        if ($session->token_id) $request->user()->tokens()->whereKey($session->token_id)->delete();
        return response()->json(['revoked' => true]);
    }

    private function issueToken(User $user, array $abilities = ['*']): array
    {
        $accessToken = $user->createToken('tidepanel-client', $abilities);
        AuthSession::create(['id' => (string) Str::uuid(), 'authenticatable_type' => User::class, 'authenticatable_id' => $user->id, 'token_id' => $accessToken->accessToken->id, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent(), 'last_used_at' => now()]);
        $user->forceFill(['last_login_at' => now()])->save();
        return ['token' => $accessToken->plainTextToken, 'user' => $user->fresh()];
    }
}
