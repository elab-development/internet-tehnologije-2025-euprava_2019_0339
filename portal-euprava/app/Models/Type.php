<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Type extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description'
    ];

    // 1 Type -> N Services.
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'type_id');
    }
}
