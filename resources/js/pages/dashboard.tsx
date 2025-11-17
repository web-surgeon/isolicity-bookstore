import BookList from '@/components/book-list';
import ImportCsv from '@/components/import-csv';
import MyRentals from '@/components/my-rentals';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-max gap-4 md:grid-cols-2">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gray-50 p-4 dark:border-sidebar-border">
                        <ImportCsv />
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gray-50 p-4 dark:border-sidebar-border">
                        <MyRentals />
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gray-50 p-4 dark:border-sidebar-border">
                    <BookList />
                </div>
            </div>
        </AppLayout>
    );
}
