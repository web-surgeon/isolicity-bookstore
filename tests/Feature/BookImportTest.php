<?php

use App\Models\Author;
use App\Models\Book;
use App\Models\Tag;
use App\Models\User;
use App\Services\BookImportService;

test('imports books from csv', function () {
    $user = User::factory()->create();
    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Test Book,Test Author,9781234567890,100,fiction;drama,american';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $stats = $service->importFromCsv($filePath, $user);

    expect($stats['total'])->toBe(1);
    expect($stats['created'])->toBe(1);
    expect($stats['skipped'])->toBe(0);

    $this->assertDatabaseHas('books', [
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('authors', [
        'name' => 'Test Author',
    ]);

    unlink($filePath);
});

test('deduplicates authors globally across all users', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        "Book 1,Haruki Murakami,9781111111111,100,fiction,japanese\n".
        'Book 2,Haruki Murakami,9782222222222,200,fiction,japanese';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $service->importFromCsv($filePath, $user1);

    expect(Author::where('name', 'Haruki Murakami')->count())->toBe(1);

    $csvContent2 = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Book 3,Haruki Murakami,9783333333333,300,fiction,japanese';

    file_put_contents($filePath, $csvContent2);
    $service->importFromCsv($filePath, $user2);

    expect(Author::where('name', 'Haruki Murakami')->count())->toBe(1);

    unlink($filePath);
});

test('deduplicates books per owner by isbn and author', function () {
    $user = User::factory()->create();

    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        "Test Book,Test Author,9781234567890,100,fiction,american\n".
        'Test Book,Test Author,9781234567890,100,fiction,american';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $stats = $service->importFromCsv($filePath, $user);

    expect($stats['total'])->toBe(2);
    expect($stats['created'])->toBe(1);
    expect($stats['skipped'])->toBe(1);

    expect(Book::where('user_id', $user->id)
        ->where('isbn13', '9781234567890')
        ->count())->toBe(1);

    unlink($filePath);
});

test('allows title and page count updates on reimport', function () {
    $user = User::factory()->create();

    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Test Book,Test Author,9781234567890,100,fiction,american';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $service->importFromCsv($filePath, $user);

    $csvContent2 = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Test Book Fixed Title,Test Author,9781234567890,105,fiction,american';

    file_put_contents($filePath, $csvContent2);
    $stats = $service->importFromCsv($filePath, $user);

    expect($stats['skipped'])->toBe(1);

    $book = Book::where('isbn13', '9781234567890')->first();
    expect($book->title)->toBe('Test Book');
    expect($book->page_count)->toBe(100);

    unlink($filePath);
});

test('applies tags to books and authors', function () {
    $user = User::factory()->create();

    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Test Book,Test Author,9781234567890,100,fiction;drama,american;contemporary';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $service->importFromCsv($filePath, $user);

    $book = Book::first();
    $author = Author::first();

    expect($book->tags()->count())->toBe(2);
    expect($book->tags()->where('name', 'fiction')->exists())->toBeTrue();
    expect($book->tags()->where('name', 'drama')->exists())->toBeTrue();

    expect($author->tags()->count())->toBe(2);
    expect($author->tags()->where('name', 'american')->exists())->toBeTrue();
    expect($author->tags()->where('name', 'contemporary')->exists())->toBeTrue();

    unlink($filePath);
});

test('rejects csv with wrong format', function () {
    $user = User::factory()->create();
    $csvPath = database_path('imports/wrong-format.csv');

    $service = new BookImportService;

    expect(fn () => $service->importFromCsv($csvPath, $user))
        ->toThrow(\InvalidArgumentException::class, 'Missing required column: title');
});

test('imports sample books csv successfully', function () {
    $user = User::factory()->create();
    $csvPath = database_path('imports/sample-books.csv');

    $service = new BookImportService;
    $stats = $service->importFromCsv($csvPath, $user);

    expect($stats['total'])->toBe(25);
    expect($stats['created'])->toBe(23);
    expect($stats['skipped'])->toBe(1);
    expect($stats['failed'])->toBe(1);

    expect(Book::count())->toBe(23);

    expect(Author::where('name', 'Haruki Murakami')->count())->toBe(1);
    expect(Author::where('name', 'Margaret Atwood')->count())->toBe(1);

    $murakamiBooks = Book::whereHas('author', fn ($q) => $q->where('name', 'Haruki Murakami'))->count();
    expect($murakamiBooks)->toBe(3);

    expect(Tag::where('name', 'japanese')->exists())->toBeTrue();
    expect(Tag::where('name', 'sci-fi')->exists())->toBeTrue();
});

test('handles missing author field gracefully', function () {
    $user = User::factory()->create();

    $csvContent = "title,author,isbn13,page_count,book_tags,author_tags\n".
        'Test Book,,9781234567890,100,fiction,';

    $filePath = tempnam(sys_get_temp_dir(), 'test').'.csv';
    file_put_contents($filePath, $csvContent);

    $service = new BookImportService;
    $stats = $service->importFromCsv($filePath, $user);

    expect($stats['failed'])->toBe(1);
    expect($stats['created'])->toBe(0);

    unlink($filePath);
});
