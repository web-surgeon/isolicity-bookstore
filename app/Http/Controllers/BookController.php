<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Checkout;
use App\Services\BookImportService;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function import(Request $request, BookImportService $bookImportService)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $user = $request->user();
        $csvFile = $request->file('file');

        // Get the actual file path
        $filePath = $csvFile->getRealPath();

        try {
            $results = $bookImportService->importFromCsv($filePath, $user);

            return back()->with([
                'importResults' => $results,
                'success' => "Imported {$results['created']} books, skipped {$results['skipped']}, failed {$results['failed']}",
            ]);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors([
                'file' => $e->getMessage(),
            ])->withInput();
        }
    }

    public function show(Book $book)
    {
        $book->load(['author.tags', 'user', 'tags', 'activeCheckout']);

        return inertia('books/show', [
            'book' => $book,
        ]);
    }

    public function checkout(Request $request, Book $book)
    {
        // if ($book->user_id === $request->user()->id) {
        //     return back()->withErrors([
        //         'checkout' => 'You cannot check out your own book.',
        //     ]);
        // }

        if ($book->activeCheckout) {
            return back()->withErrors([
                'checkout' => 'This book is already checked out.',
            ]);
        }

        Checkout::create([
            'user_id' => $request->user()->id,
            'book_id' => $book->id,
            'checked_out_at' => now(),
            'due_at' => now()->addWeeks(2),
        ]);

        return back()->with([
            'success' => "You have checked out \"{$book->title}\" for 2 weeks.",
        ]);
    }

    public function return(Request $request, Checkout $checkout)
    {
        if ($checkout->user_id !== $request->user()->id) {
            return back()->withErrors([
                'return' => 'You can only return your own checkouts.',
            ]);
        }

        if ($checkout->returned_at) {
            return back()->withErrors([
                'return' => 'This book has already been returned.',
            ]);
        }

        $checkout->update([
            'returned_at' => now(),
        ]);

        return back()->with([
            'success' => 'Book returned successfully.',
        ]);
    }
}
