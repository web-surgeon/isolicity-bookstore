<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\DashboardBoardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardBoardController::class, 'index'])->name('dashboard');

    Route::post('import', [BookController::class, 'import'])->name('import');

    Route::get('books/{book}', [BookController::class, 'show'])->name('books.show');
    Route::post('books/{book}/checkout', [BookController::class, 'checkout'])->name('books.checkout');
    Route::post('checkouts/{checkout}/return', [BookController::class, 'return'])->name('checkouts.return');
});

require __DIR__.'/settings.php';
