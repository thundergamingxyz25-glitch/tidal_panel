<?php

use App\Models\Server;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('server.console.{uuid}', function ($user, string $uuid) {
    $server = Server::where('uuid', $uuid)->first();

    if (! $server || $server->owner_id !== $user->id) {
        return false;
    }

    return ['id' => $user->id, 'name' => $user->name];
});
