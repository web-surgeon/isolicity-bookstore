<?php

namespace App\Models\Traits;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait Taggable
{
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')
            ->withTimestamps();
    }

    public function addTag(Tag $tag): void
    {
        if (!$this->tags->contains($tag->id)) {
            $this->tags()->attach($tag->id);
        }
    }

    public function removeTag(Tag $tag): void
    {
        if ($this->tags->contains($tag->id)) {
            $this->tags()->detach($tag->id);
        }
    }

    public function clearTags(): void
    {
        $this->tags()->detach();
    }

    public function hasTag(Tag $tag): bool
    {
        return $this->tags->contains($tag->id);
    }

    public function syncTags(array $tags): void
    {
        $tagIds = collect($tags)->map(function ($tag) {
            if (is_numeric($tag)) {
                return $tag;
            }

            return Tag::firstOrCreate(['name' => $tag])->id;
        });

        $this->tags()->sync($tagIds->toArray());
    }
}
