<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
        
        if ($username) {
            // Create a fake user object for broadcasting auth
            $request->setUserResolver(function () use ($username) {
                return (object) [
                    'id' => crc32($username), // Generate a consistent ID from username
                    'name' => $username,
                ];
            });
        }

        return $next($request);
    }
}
