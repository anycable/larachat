<?php

use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ChatController::class, 'index'])->name('chat');
Route::post('/set-username', [ChatController::class, 'setUsername'])->name('chat.set-username');
Route::post('/messages', [ChatController::class, 'store'])->name('messages.store');

Route::get('/welcome', function () {
    return Inertia::render('welcome');
})->name('welcome');


