<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $username = $request->session()->get('username');
        
        if (!$username) {
            return Inertia::render('chat/auth');
        }

        $messages = Message::query()->orderBy('created_at', 'asc')
            ->take(100)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'username' => $message->username,
                    'body' => $message->body,
                    'created_at' => $message->created_at->toJSON(),
                ];
            });

        return Inertia::render('chat/index', [
            'username' => $username,
            'messages' => $messages,
        ]);
    }

    public function setUsername(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string|max:255',
        ]);

        $request->session()->put('username', trim($request->input('username')));

        return redirect()->route('chat');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $username = $request->session()->get('username');
        
        if (!$username) {
            return response()->json(['error' => 'No username set'], 401);
        }

        $message = Message::query()->create([
            'username' => $username,
            'body' => $request->input('body'),
        ]);

        broadcast(new MessageSent($message));

        return response()->json([
            'id' => $message->id,
            'username' => $message->username,
            'body' => $message->body,
            'created_at' => $message->created_at->toJSON(),
        ]);
    }
}
