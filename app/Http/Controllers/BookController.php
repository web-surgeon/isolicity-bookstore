<?php

namespace App\Http\Controllers;

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
}
