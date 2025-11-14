<?php

namespace App\Providers;

use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Collection::macro('fromCsv', function (string $path) {
            $file = fopen($path, 'r');
            $header = fgetcsv($file);
            $data = [];

            while (($row = fgetcsv($file)) !== false) {
                $data[] = array_combine($header, $row);
            }

            fclose($file);

            return collect($data);
        });
    }
}
