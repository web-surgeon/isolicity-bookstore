# Implementation Notes

## Technology Stack

- **Backend:** Laravel 12 (built from [Laravel React Starter Kit](https://laravel.com/docs/12.x/starter-kits#react))
- **Frontend:** React 19 with Inertia.js v2
- **Database:** SQLite (easily switchable to MySQL/PostgreSQL via `.env`)
- **Styling:** Tailwind CSS v4
- **Authentication:** Laravel Fortify
- **Testing:** Pest PHP
- **Code Quality:** Laravel Pint (PHP), Prettier (JS/TS), pre-commit hooks

## Database Schema

### Tables

**users** - Standard Laravel users table

**authors**
- `id`
- `name` (used for global deduplication)
- `timestamps`

**books**
- `id`
- `user_id` (foreign key to users)
- `author_id` (foreign key to authors)
- `title`
- `isbn13`
- `page_count` (nullable)
- `timestamps`

**tags**
- `id`
- `name` (unique)
- `timestamps`

**taggables** (polymorphic pivot)
- `tag_id`
- `taggable_id`
- `taggable_type` (Book or Author)
- `timestamps`

**checkouts**
- `id`
- `book_id` (foreign key to books)
- `user_id` (foreign key to users)
- `checked_out_at`
- `due_at`
- `returned_at` (nullable - null means still checked out)
- `timestamps`

### Key Relationships

**Book model:**
```php
belongsTo(User::class)           // owner
belongsTo(Author::class)         // book author
morphToMany(Tag::class)          // tags
hasMany(Checkout::class)         // all checkouts
hasOne(Checkout::class)          // active checkout (whereNull('returned_at'))
```

**Author model:**
```php
hasMany(Book::class)
morphToMany(Tag::class)          // tags
```

**Checkout model:**
```php
belongsTo(Book::class)
belongsTo(User::class)           // who checked it out
```

## Key Design Decisions

### 1. Deduplication Strategy

**Authors - Global:**
```php
Author::firstOrCreate(['name' => $authorName]);
```
Authors deduplicated globally across all users by exact name match.

**Books - Per Owner:**
```php
$user->books()->firstOrCreate(
    ['author_id' => $author->id, 'isbn13' => $bookData['isbn13']],
    ['title' => $bookData['title'], 'page_count' => $bookData['page_count']]
);
```

Books deduplicated per owner using **ISBN-13 + Author ID** as the unique key.

**Why not include title/page_count in the unique key?**
- Allows fixing typos in title or page count on re-import
- ISBN-13 identifies the specific book edition
- Different page counts likely represent data corrections, not different books

### 2. Polymorphic Tagging

Used `morphToMany` relationship so both Books and Authors can share the same tags table.

**Why polymorphic instead of separate tables?**
- Single tags table is simpler to maintain
- Tags can be reused across both books and authors
- Standard Laravel pattern

### 3. Checkout Status (Soft State)

No `status` column on books table. Status calculated from active checkout:
```php
$isAvailable = !$book->active_checkout;
$isOverdue = $book->active_checkout && new Date($book->active_checkout->due_at) < new Date();
```

**Benefits:**
- Single source of truth (checkouts table)
- No risk of status field becoming stale
- Simpler to maintain

### 4. CSV Import Service

Extracted import logic into `app/Services/BookImportService.php`:
- Uses database transactions for data integrity
- Returns statistics (created, skipped, failed counts)
- Validates CSV structure and data
- Centralized error handling

**Used by both:**
- Web upload via `BookController::import()`
- Console command: `php artisan import-books --filename=sample-books.csv --userid=1`

The console command is useful for large CSV files (avoids HTTP timeouts) or scheduled imports.

## Test Data

**Sample CSV Files:**
- `database/imports/sample-books.csv` - 25 books from the requirements (includes 1 duplicate and 1 with missing author)
- `database/imports/wrong-format.csv` - Invalid CSV with wrong column names for testing error handling

Both files are used in the test suite to verify import functionality and error handling.

## Trade-offs

**SQLite vs MySQL:** Using SQLite for simplicity and portability. Easy to switch via `.env` if needed.

**Synchronous imports:** CSV imports happen immediately. For production with large files, should use queued jobs.

**No pagination:** Showing all books in single list. Works for demo, but would need pagination for production.

**Dynamic overdue calculation:** Calculated on-demand rather than using scheduled jobs. Simpler for demo, but production would benefit from scheduled overdue notifications.
