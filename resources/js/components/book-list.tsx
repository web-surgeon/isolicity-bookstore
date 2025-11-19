import { Link } from '@inertiajs/react';

interface Tag {
    id: number;
    name: string;
}

interface Book {
    id: number;
    title: string;
    isbn13: string;
    page_count: number;
    author: {
        name: string;
    };
    user: {
        name: string;
    };
    tags?: Tag[];
    active_checkout?: {
        due_at: string;
    };
}

interface BookListProps {
    books?: Book[];
}

const getStatus = (book: Book) => {
    if (!book.active_checkout) {
        return (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Available
            </span>
        );
    }

    if (new Date(book.active_checkout.due_at) < new Date()) {
        return (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                Overdue
            </span>
        );
    }

    return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Checked Out
        </span>
    );
};

const getTags = (book: Book) => {
    if (!book.tags || book.tags.length === 0) {
        return <span className="text-gray-500">No tags</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {book.tags.map((tag) => (
                <span
                    key={tag.id}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                >
                    {tag.name}
                </span>
            ))}
        </div>
    );
};

export default function BookList({ books = [] }: BookListProps) {
    return (
        <div className="flex flex-col gap-4 p-6">
            <h2 className="text-2xl font-bold">All Books</h2>

            {books.length === 0 ? (
                <p className="text-gray-500">No books available</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Title
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Author
                                </th>
                                {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Owner
                                </th> */}
                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-gray-900 md:table-cell">
                                    ISBN
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-gray-900 md:table-cell">
                                    Tags
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr
                                    key={book.id}
                                    className="border-b border-gray-200 odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        <Link
                                            href={`/books/${book.id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {book.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {book.author.name}
                                    </td>
                                    {/* <td className="px-4 py-3 text-sm text-gray-600">
                                        {book.user.name}
                                    </td> */}
                                    <td className="hidden px-4 py-3 font-mono text-sm text-gray-600 md:table-cell">
                                        {book.isbn13}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {getStatus(book)}
                                    </td>
                                    <td className="hidden px-4 py-3 text-sm md:table-cell">
                                        {getTags(book)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
