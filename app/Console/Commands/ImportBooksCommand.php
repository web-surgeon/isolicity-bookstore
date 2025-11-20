<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\BookImportService;
use Illuminate\Console\Command;

class ImportBooksCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import-books {--filename=} {--userid=}';

    protected $importFolder = 'imports/';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import books from a CSV file';

    /**
     * Execute the console command.
     */
    public function handle(BookImportService $bookImportService): int
    {
        if (!$filename = $this->option('filename')) {
            $this->error('Filename is required.');

            return 1;
        }

        if (!$userid = $this->option('userid')) {
            $this->error('User ID is required.');

            return 1;
        }

        if (!$user = User::find((int) $userid)) {
            $this->error("User not found: $userid");

            return 1;
        }

        $filepath = database_path($this->importFolder.$filename);

        if (!file_exists($filepath)) {
            $this->error("File not found: $filepath");

            return 1;
        }

        $this->info("Importing books from $filepath for {$user->name} [$userid]");

        if ($this->confirm('Do you wish to continue?')) {
            $results = $bookImportService->importFromCsv($filepath, $user);

            $this->info("Import completed: {$results['created']} created, {$results['skipped']} skipped, {$results['failed']} failed");

            return 0;
        } else {
            $this->warn('Import cancelled.');

            return 1;
        }
    }
}
