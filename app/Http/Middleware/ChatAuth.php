<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ChatAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For broadcasting auth, we need to simulate a user
        // based on the session username
        $username = $request->session()->get('username');

        // Log for debugging
        Log::info('ChatAuth middleware - Path: ' . $request->path() . ', Username: ' . ($username ?? 'null'));

        // Always set a user resolver, even if no username
        $request->setUserResolver(function () use ($username) {
            if ($username) {
                $user = User::make([
                    'id' => crc32($username), // Generate a consistent ID from username
                    'name' => $username,
                ]);
                Log::info('ChatAuth middleware - Created user: ' . $user->name . ' (ID: ' . $user->getAuthIdentifier() . ')');
                return $user;
            }

            Log::info('ChatAuth middleware - No username in session, returning null');
            // Return null if no username - this will cause auth to fail gracefully
            return null;
        });

        return $next($request);
    }
}
