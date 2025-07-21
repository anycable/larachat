<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

class User extends Model implements Authenticatable
{
    protected $fillable = [
        'id',
        'name',
    ];

    public $timestamps = false;

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'id' => 'integer',
    ];

    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName(): string
    {
        return 'id';
    }

    /**
     * Get the unique identifier for the user.
     */
    public function getAuthIdentifier(): mixed
    {
        return $this->getAttribute('id');
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword(): string
    {
        return '';
    }

    /**
     * Get the token value for the "remember me" session.
     */
    public function getRememberToken(): ?string
    {
        return null;
    }

    /**
     * Set the token value for the "remember me" session.
     */
    public function setRememberToken($value): void
    {
        // Not implemented for this simple chat app
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName(): ?string
    {
        return null;
    }

    /**
     * Get the name of the password field.
     */
    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    /**
     * Create a new user instance without persisting to database.
     * 
     * @param array $attributes The attributes to fill
     */
    public static function make(array $attributes = []): static
    {
        $user = new static();
        $user->fill($attributes);
        $user->exists = false;
        
        return $user;
    }
}