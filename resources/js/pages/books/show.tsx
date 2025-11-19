import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface Tag {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
    tags?: Tag[];
}

interface User {
    id: number;
    name: string;
}

interface ActiveCheckout {
    id: number;
    user_id: number;
    due_at: string;
}

interface Book {
    id: number;
    title: string;
    isbn13: string;
    page_count: number | null;
    author: Author;
    user: User;
    tags?: Tag[];
    active_checkout?: ActiveCheckout | null;
}

interface BookShowProps {
    book: Book;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function BookShow({ book }: BookShowProps) {
    const { auth, errors, flash } = usePage<{
        auth: { user: { id: number } };
        errors: any;
        flash?: { success?: string };
    }>().props;

    const isOverdue =
        book.active_checkout &&
        new Date(book.active_checkout.due_at) < new Date();
    const isCheckedOut = !!book.active_checkout;
    const isAvailable = !isCheckedOut;
    const isOwner = book.user.id === auth.user.id;
    const isCurrentBorrower = book.active_checkout?.user_id === auth.user.id;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: book.title,
            href: `/books/${book.id}`,
        },
    ];

    const getStatus = () => {
        if (!book.active_checkout) {
            return (
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Available
                </span>
            );
        }
        if (isOverdue) {
            return (
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                    Overdue
                </span>
            );
        }
        return (
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                Checked Out
            </span>
        );
    };

    const handleCheckout = () => {
        router.post(`/books/${book.id}/checkout`);
    };

    const handleReturn = () => {
        if (book.active_checkout) {
            router.post(`/checkouts/${book.active_checkout.id}/return`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={book.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {flash?.success && (
                    <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {errors.checkout && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {errors.checkout}
                    </div>
                )}

                {errors.return && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {errors.return}
                    </div>
                )}

                <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {book.title}
                            </h1>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                                by {book.author.name}
                            </p>
                        </div>
                        <div>{getStatus()}</div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Book Details
                            </h2>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        ISBN-13
                                    </dt>
                                    <dd className="font-mono text-sm text-gray-900 dark:text-white">
                                        {book.isbn13}
                                    </dd>
                                </div>
                                {book.page_count && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Page Count
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-white">
                                            {book.page_count} pages
                                        </dd>
                                    </div>
                                )}
                                {/* <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Owner
                                    </dt>
                                    <dd className="text-sm text-gray-900 dark:text-white">
                                        {book.user.name}
                                    </dd>
                                </div> */}
                                {book.active_checkout && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Due Date
                                        </dt>
                                        <dd
                                            className={`text-sm ${isOverdue ? 'font-semibold text-red-600' : 'text-gray-900 dark:text-white'}`}
                                        >
                                            {formatDate(
                                                book.active_checkout.due_at,
                                            )}
                                            {isOverdue && ' (Overdue)'}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {book.tags && book.tags.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Book Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {book.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Author Information
                            </h2>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Name
                                    </dt>
                                    <dd className="text-sm text-gray-900 dark:text-white">
                                        {book.author.name}
                                    </dd>
                                </div>
                            </dl>

                            {book.author.tags &&
                                book.author.tags.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Author Tags
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {book.author.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                        <div className="flex gap-3">
                            {isAvailable && (
                                <button
                                    onClick={handleCheckout}
                                    className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    Check Out for 2 Weeks
                                </button>
                            )}

                            {isCurrentBorrower && (
                                <button
                                    onClick={handleReturn}
                                    className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Return Book
                                </button>
                            )}

                            {/* {isOwner && (
                            <p className="text-sm text-gray-500">
                                You own this book
                            </p>
                        )} */}
                        </div>

                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
