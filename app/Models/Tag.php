<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tag extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
    ];

    public function authors(): MorphToMany
    {
        return $this->morphedByMany(Author::class, 'taggable');
    }

    public function books(): MorphToMany
    {
        return $this->morphedByMany(Book::class, 'taggable');
    }
}
