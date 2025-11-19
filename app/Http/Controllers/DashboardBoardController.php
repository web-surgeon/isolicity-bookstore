<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class DashboardBoardController extends Controller
{
    public function index(Request $request)
    {
        return inertia('dashboard', [
            'checkouts' => $request->user()->checkouts()->with('book.author')->get(),
            'books' => Book::with(['author', 'user', 'tags', 'activeCheckout'])->get(),
        ]);
    }
}
