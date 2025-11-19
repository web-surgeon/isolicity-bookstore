import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

type ImportResults = {
    total: number;
    created: number;
    skipped: number;
    failed: number;
    errors: Array<{ data: any; error: string }>;
};

export default function ImportCsv() {
    const { flash } = usePage<{
        flash?: { success?: string; importResults?: ImportResults };
    }>().props;
    const results = flash?.importResults;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm<{ file: File | null }>({
        file: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile?.type !== 'text/csv') {
            // Validation happens in backend
            return;
        }
        setData('file', selectedFile || null);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/import', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h2 className="text-2xl font-bold">Import Books from CSV</h2>

            <div className="text-sm text-gray-600">
                <p className="mb-2">
                    Upload a CSV file to import books into the system.
                </p>

                <p className="mb-2">
                    The CSV should have the following columns: title, author,
                    isbn13, page_count, book_tags, author_tags
                </p>

                <p>Tags should be separated by semicolons (;)</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">
                            Choose File
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={processing}
                            className="hidden"
                        />
                    </label>
                    <span className="text-sm text-gray-500">
                        {data.file ? data.file.name : 'No file chosen'}
                    </span>
                </div>

                {errors.file && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {errors.file}
                    </div>
                )}

                {results && (
                    <div className="rounded-lg border border-gray-300 bg-white p-4">
                        <h3 className="mb-3 font-semibold">Import Results</h3>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600">Total:</span>{' '}
                                <span className="font-medium">
                                    {results.total}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Created:</span>{' '}
                                <span className="font-medium text-green-600">
                                    {results.created}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Skipped:</span>{' '}
                                <span className="font-medium text-yellow-600">
                                    {results.skipped}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Failed:</span>{' '}
                                <span className="font-medium text-red-600">
                                    {results.failed}
                                </span>
                            </div>
                        </div>

                        {results.errors && results.errors.length > 0 && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    View {results.errors.length} Error
                                    {results.errors.length > 1 ? 's' : ''}
                                </summary>
                                <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                                    {results.errors.map((err, i) => (
                                        <div
                                            key={i}
                                            className="rounded bg-red-50 p-2 text-xs"
                                        >
                                            <div className="font-medium text-red-800">
                                                Row:{' '}
                                                {err.data.title || 'Unknown'}
                                            </div>
                                            <div className="text-red-600">
                                                {err.error}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!data.file || processing}
                    className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {processing ? 'Uploading...' : 'Import CSV'}
                </button>
            </form>
        </div>
    );
}
