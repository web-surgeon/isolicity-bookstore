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
}

interface BookListProps {
    books?: Book[];
}

export default function BookList({ books = [] }: BookListProps) {
    return (
        <div className="flex flex-col gap-4 p-6">
            <h2 className="text-2xl font-bold">All Books</h2>

            {books.length === 0 ? (
                <p className="text-gray-500">No books available</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Title
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Author
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Owner
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    ISBN
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Tags
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr
                                    key={book.id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {book.title}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {book.author.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {book.user.name}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                        {book.isbn13}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-wrap gap-1">
                                            {book.tags &&
                                            book.tags.length > 0 ? (
                                                book.tags.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">
                                                    No tags
                                                </span>
                                            )}
                                        </div>
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
