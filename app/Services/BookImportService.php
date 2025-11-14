<?php

namespace App\Services;

use App\Models\Author;
use App\Models\Book;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookImportService
{
    public function importFromCsv(string $filepath, User $user): array
    {
        $this->log('Importing books from '.$filepath.' for user '.$user->id);

        $this->validateCsvFile($filepath);

        $books = Collection::fromCsv($filepath);

        $this->validateCsvStructure($books);

        $results = [
            'total' => 0,
            'created' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        DB::transaction(function () use ($books, $user, &$results) {
            foreach ($books as $bookData) {
                $results['total']++;

                try {
                    $book = $this->importBook($bookData, $user);

                    if ($book->wasRecentlyCreated) {
                        $this->log("Created book: {$book->title} [{$book->id}] for user {$user->id}");

                        $results['created']++;
                    } else {
                        $this->log("Skipped existing book: {$book->title} [{$book->id}] for user {$user->id}");

                        $results['skipped']++;
                    }
                } catch (\Exception $e) {
                    $results['failed']++;

                    $results['errors'][] = [
                        'data' => $bookData,
                        'error' => $e->getMessage(),
                    ];

                    continue;
                }
            }
        });

        return $results;
    }

    protected function validateCsvFile(string $filepath): void
    {
        if (!file_exists($filepath)) {
            throw new \InvalidArgumentException("File not found: {$filepath}");
        }

        if (!is_readable($filepath)) {
            throw new \InvalidArgumentException("File not readable: {$filepath}");
        }
    }

    protected function validateCsvStructure(Collection $books): void
    {
        $requiredColumns = ['title', 'author', 'isbn13', 'page_count'];

        if (!$firstRow = $books->first()) {
            throw new \InvalidArgumentException('CSV file is empty');
        }

        foreach ($requiredColumns as $column) {
            if (!array_key_exists($column, $firstRow)) {
                throw new \InvalidArgumentException("Missing required column: {$column}");
            }
        }
    }

    protected function validateBookData(array $bookData): void
    {
        $validator = validator($bookData, [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn13' => 'required|string|size:13',
            'page_count' => 'nullable|integer|min:1',
            'book_tags' => 'nullable|string',
            'author_tags' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                $validator->errors()->first()
            );
        }
    }

    protected function importBook(array $bookData, User $user): Book
    {
        $this->validateBookData($bookData);

        if (!$authorName = $bookData['author']) {
            throw new \InvalidArgumentException('Author name is required in book data.');
        }

        $author = $this->getOrCreateAuthor($authorName);

        $book = $user->books()->firstOrCreate([
            'author_id' => $author->id,
            'title' => $bookData['title'],
            'isbn13' => $bookData['isbn13'],
            'page_count' => $bookData['page_count'],
        ]);

        $this->syncTags($book, $bookData['book_tags']);
        $this->syncTags($author, $bookData['author_tags']);

        return $book;
    }

    protected function getOrCreateAuthor(string $name): Author
    {
        return Author::firstOrCreate(['name' => $name]);
    }

    protected function syncTags($model, ?string $tags): void
    {
        if (!$tags) {
            return;
        }

        $tagsArray = array_map('trim', explode(';', $tags));
        $model->syncTags($tagsArray);
    }

    protected function log(string $message): void
    {
        Log::channel('book_imports')->info($message);
    }
}
