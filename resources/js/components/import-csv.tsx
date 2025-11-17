import { FormEvent, useState } from 'react';

export default function ImportCsv() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                setError('Please select a CSV file');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/import-csv', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            setMessage('CSV imported successfully!');
            setFile(null);
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
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
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="hidden"
                        />
                    </label>
                    <span className="text-sm text-gray-500">
                        {file ? file.name : 'No file chosen'}
                    </span>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {loading ? 'Uploading...' : 'Import CSV'}
                </button>
            </form>
        </div>
    );
}
