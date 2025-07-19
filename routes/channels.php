<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat', function ($user) {
    if ($user && isset($user->name)) {
        return ['name' => $user->name];
    }
    return null;
});
