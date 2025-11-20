# MySharedLibrary - Shared Book Library Application

A web application built with Laravel 12 and React (Inertia.js) that allows users to share and manage a community library. Users can upload books via CSV, tag books and authors, and check out each other's books for two weeks.

Built using the [Laravel React Starter Kit](https://laravel.com/docs/12.x/starter-kits#react).

## Features

- **User Authentication** - Laravel Fortify with registration and login
- **Book Browsing** - View all books from all users in a single list
- **Book Details** - Detailed view showing metadata, tags, and author information
- **Checkout System** - Exclusive 2-week checkout period
- **CSV Import** - Bulk import books with automatic deduplication
- **Tagging System** - Custom polymorphic tagging for books and authors
- **Overdue Tracking** - Automatic visual indication of overdue books
- **My Rentals** - Dashboard showing your active checkouts with due dates

## Tech Stack

- **Backend:** Laravel 12
- **Frontend:** React 19 with Inertia.js v2
- **Database:** SQLite (default)
- **CSS:** Tailwind CSS v4
- **Testing:** Pest PHP
- **Code Quality:** Laravel Pint (PHP), Prettier (JS/TS)

## Setup Instructions

### Prerequisites

- PHP 8.4 or higher
- Composer
- Node.js and npm
- SQLite (or MySQL if preferred)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/web-surgeon/isolicity-bookstore.git
   cd isolicity-bookstore
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install Node dependencies:**
   ```bash
   npm install
   ```

4. **Environment setup:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup:**
   The project uses SQLite by default. The database file is automatically created.
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build frontend assets:**
   ```bash
   npm run build
   ```

### Running the Application

#### Option 1: Using Laravel's built-in server

1. **Start the development server:**
   ```bash
   php artisan serve
   ```

2. **In a separate terminal, start Vite (for development):**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser to `http://localhost:8000`

#### Option 2: Using composer dev command

```bash
composer run dev
```

This starts both the Laravel server and Vite concurrently.

### Default Credentials

A default test user is seeded into the database:

- **Email:** test@example.com
- **Password:** password

Alternatively, you can register a new account:
1. Navigate to the application homepage
2. Click "Register"
3. Fill in your details (name, email, password)
4. After registration, you'll be automatically logged in

## Usage

### Importing Books via CSV

1. After logging in, you'll see the dashboard with an "Import Books from CSV" section at the top
2. Click "Choose File" and select a CSV file. A sample file is included at `database/imports/sample-books.csv` with 25 books.

   CSV format:
   ```csv
   title,author,isbn13,page_count,book_tags,author_tags
   Kafka on the Shore,Haruki Murakami,9781400079278,467,magical-realism;surreal,japanese
   Norwegian Wood,Haruki Murakami,9780375704024,296,romance;coming-of-age,japanese
   ```

3. Click "Import CSV" to upload and process the file

#### Alternative: Console Command for Large Imports

For larger CSV files or batch processing, you can use the Artisan command:

```bash
php artisan import-books --filename=sample-books.csv --userid=1
```

This uses the same import service but avoids HTTP timeout issues with large files.

#### CSV Format Notes

- **Required columns:** `title`, `author`, `isbn13`, `page_count`, `book_tags`, `author_tags`
- **Tags:** Separated by semicolons (`;`) - e.g., `sci-fi;classic`
- **Deduplication:**
  - Authors are deduplicated **globally** across all users by exact name match
  - Books are deduplicated **per owner** by ISBN-13 + Author combination
- **Missing data:**
  - Missing author defaults to ISBN-13 value as author name
  - Missing or invalid data is handled gracefully with error messages
- **Re-importing:** Uploading the same CSV multiple times won't create duplicates

### Browsing Books

- The dashboard shows two sections:
  - **My Rentals:** Books you currently have checked out with due dates
  - **All Books:** Complete list of books from all users

- Books display:
  - Title (clickable to view details)
  - Author name
  - ISBN-13 (on wider screens)
  - Availability status: Available (green), Checked Out (yellow), Overdue (red)
  - Tags (on wider screens)

- Click any book title to view full details

### Checking Out Books

1. Navigate to a book's detail page by clicking its title
2. If the book shows "Available" status, click "Check Out for 2 Weeks"
3. The book is now checked out to you for 14 days
4. You'll see it appear in your "My Rentals" section on the dashboard

### Returning Books

1. Navigate to a book you've checked out (from My Rentals or All Books)
2. On the book detail page, click "Return Book"
3. The book becomes available for others to check out
4. It will be removed from your "My Rentals" section

### Overdue Books

- Books not returned after 14 days are automatically marked as **OVERDUE**
- Overdue books show a red "Overdue" badge in book lists
- The due date appears in red with "(Overdue)" text on the book detail page

## Testing

Run the test suite:

```bash
php artisan test
```

### Test Coverage

The application includes comprehensive test coverage:

**CSV Import Tests** (`tests/Feature/BookImportTest.php`):
- Basic CSV import functionality
- Global author deduplication across all users
- Per-owner book deduplication by ISBN + Author
- Tag application to books and authors
- Handling invalid CSV format (`database/imports/wrong-format.csv`)
- Full sample CSV import test (`database/imports/sample-books.csv`)
- Missing author field validation

**Checkout System Tests** (`tests/Feature/CheckoutTest.php`):
- Checking out available books
- Exclusive checkout enforcement (cannot checkout already checked-out books)
- Returning checked-out books
- Authorization (only borrower can return their checkout)
- Two-week checkout duration verification
- Overdue detection for past due dates

**Authentication & Settings Tests**:
- User registration, login, logout
- Password reset functionality
- Email verification
- Two-factor authentication
- Profile updates

Run specific test suites:
```bash
php artisan test --filter=BookImportTest
php artisan test --filter=CheckoutTest
```

## Code Quality

The project uses automated code formatting:

- **PHP:** Laravel Pint
  ```bash
  vendor/bin/pint
  ```

- **JavaScript/TypeScript:** Prettier
  ```bash
  npx prettier --write resources/js
  ```

- **Pre-commit Hook:** Automatically formats staged files before each commit

## CI/CD

GitHub Actions workflow runs on every push:
- Code formatting checks (Pint, Prettier)
- Test suite execution
- Build verification

## Database Schema

### Main Tables

- **users** - Standard Laravel users table
- **authors** - `id`, `name`, `timestamps`
- **books** - `id`, `user_id`, `author_id`, `title`, `isbn13`, `page_count`, `timestamps`
- **tags** - `id`, `name` (unique), `timestamps`
- **taggables** - Polymorphic pivot (`tag_id`, `taggable_id`, `taggable_type`)
- **checkouts** - `id`, `book_id`, `user_id`, `checked_out_at`, `due_at`, `returned_at`, `timestamps`

## Project Structure

```
app/
├── Console/Commands/
│   └── ImportBooksCommand.php       # CLI import command
├── Http/Controllers/
│   ├── BookController.php           # Book details, checkout, return, CSV import
│   └── DashboardBoardController.php # Dashboard with books and rentals
├── Models/
│   ├── Author.php                   # Author model with tags
│   ├── Book.php                     # Book model with checkouts
│   ├── Checkout.php                 # Checkout record
│   └── Tag.php                      # Polymorphic tag model
└── Services/
    └── BookImportService.php        # CSV import logic

resources/js/
├── pages/
│   ├── books/show.tsx               # Book detail page
│   └── dashboard.tsx                # Main dashboard
└── components/
    ├── book-list.tsx                # All books table
    ├── my-rentals.tsx               # User's checkouts table
    └── import-csv.tsx               # CSV upload form

tests/Feature/
├── Auth/                            # Authentication tests
├── Settings/                        # Profile management tests
├── BookImportTest.php               # CSV import tests
└── CheckoutTest.php                 # Checkout system tests
```

## Implementation Notes

See [NOTES.md](NOTES.md) for detailed information about:
- Architecture decisions
- Deduplication strategy
- Tagging system design
- Checkout system implementation
- Trade-offs and considerations
