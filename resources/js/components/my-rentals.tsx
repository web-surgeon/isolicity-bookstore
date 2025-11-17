interface Checkout {
    id: number;
    checked_out_at: string;
    due_at: string;
    returned_at: string | null;
    book: {
        id: number;
        title: string;
        author: {
            name: string;
        };
    };
}

interface MyRentalsProps {
    checkouts?: Checkout[];
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function MyRentals({ checkouts = [] }: MyRentalsProps) {
    const activeRentals = checkouts.filter((checkout) => !checkout.returned_at);
    const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

    return (
        <div className="flex flex-col gap-4 p-6">
            <h2 className="text-2xl font-bold">My Rentals</h2>

            {activeRentals.length === 0 ? (
                <p className="text-gray-500">No active rentals</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Book Title
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Author
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Checked Out
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Due Date
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeRentals.map((checkout) => (
                                <tr
                                    key={checkout.id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {checkout.book.title}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {checkout.book.author.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(checkout.checked_out_at)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(checkout.due_at)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                                isOverdue(checkout.due_at)
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {isOverdue(checkout.due_at)
                                                ? 'Overdue'
                                                : 'Active'}
                                        </span>
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
