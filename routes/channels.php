<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat', function ($user) {
    if ($user && isset($user->name)) {
        return true;
    }
    return false;
});

Broadcast::channel('chat-presence', function ($user) {
    if ($user && isset($user->name)) {
        return ['name' => $user->name];
    }
    return null;
});
