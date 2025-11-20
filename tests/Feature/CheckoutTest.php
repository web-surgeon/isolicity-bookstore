<?php

use App\Models\Author;
use App\Models\Book;
use App\Models\Checkout;
use App\Models\User;

test('user can checkout available book', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $response = $this->actingAs($user)->post("/books/{$book->id}/checkout");

    $response->assertRedirect();
    $this->assertDatabaseHas('checkouts', [
        'book_id' => $book->id,
        'user_id' => $user->id,
        'returned_at' => null,
    ]);
});

test('cannot checkout already checked out book', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user1->id,
        'checked_out_at' => now(),
        'due_at' => now()->addWeeks(2),
    ]);

    $response = $this->actingAs($user2)->post("/books/{$book->id}/checkout");

    $response->assertSessionHasErrors('checkout');
    expect(Checkout::where('book_id', $book->id)
        ->whereNull('returned_at')
        ->count())->toBe(1);
});

test('user can return checked out book', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $checkout = Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user->id,
        'checked_out_at' => now(),
        'due_at' => now()->addWeeks(2),
    ]);

    $response = $this->actingAs($user)->post("/checkouts/{$checkout->id}/return");

    $response->assertRedirect();
    $checkout->refresh();
    expect($checkout->returned_at)->not->toBeNull();
});

test('user cannot return book checked out by another user', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $checkout = Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user1->id,
        'checked_out_at' => now(),
        'due_at' => now()->addWeeks(2),
    ]);

    $response = $this->actingAs($user2)->post("/checkouts/{$checkout->id}/return");

    $response->assertSessionHasErrors('return');
    $checkout->refresh();
    expect($checkout->returned_at)->toBeNull();
});

test('checkout duration is two weeks', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $this->actingAs($user)->post("/books/{$book->id}/checkout");

    $checkout = Checkout::where('book_id', $book->id)->first();
    $expectedDueDate = $checkout->checked_out_at->addWeeks(2);

    expect($checkout->due_at->toDateString())->toBe($expectedDueDate->toDateString());
});

test('checkout with past due date is marked as overdue', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $checkout = Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user->id,
        'checked_out_at' => now()->subWeeks(3),
        'due_at' => now()->subDays(1),
    ]);

    $book->refresh();
    $book->load('activeCheckout');

    expect($checkout->due_at < now())->toBeTrue();
    expect($book->activeCheckout)->not->toBeNull();
    expect($book->activeCheckout->due_at < now())->toBeTrue();
});

test('checkout within due date is not overdue', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $checkout = Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user->id,
        'checked_out_at' => now(),
        'due_at' => now()->addWeeks(2),
    ]);

    $book->refresh();
    $book->load('activeCheckout');

    expect($checkout->due_at > now())->toBeTrue();
    expect($book->activeCheckout)->not->toBeNull();
    expect($book->activeCheckout->due_at > now())->toBeTrue();
});

test('returned checkout is not active', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $author = Author::create(['name' => 'Test Author']);
    $book = Book::create([
        'user_id' => $owner->id,
        'author_id' => $author->id,
        'title' => 'Test Book',
        'isbn13' => '9781234567890',
        'page_count' => 100,
    ]);

    $checkout = Checkout::create([
        'book_id' => $book->id,
        'user_id' => $user->id,
        'checked_out_at' => now(),
        'due_at' => now()->addWeeks(2),
        'returned_at' => now(),
    ]);

    $book->refresh();
    $book->load('activeCheckout');

    expect($book->activeCheckout)->toBeNull();
});
