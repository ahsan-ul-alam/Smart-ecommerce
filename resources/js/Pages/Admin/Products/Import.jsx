import { useForm, Link } from '@inertiajs/react';
import { Upload, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function ProductImport({ sampleHeaders }) {
    const { data, setData, post, processing, errors } = useForm({ file: null });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/products/import', { forceFormData: true });
    };

    return (
        <AdminLayout title="Import Products">
            <FlashMessage />

            <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-teal-700 mb-4">
                <ArrowLeft size={16} /> Back to products
            </Link>

            <Card className="max-w-2xl">
                <CardHeader title="CSV import" subtitle="Create or update products by SKU. Existing SKUs are updated." />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">CSV file</label>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800"
                            />
                            {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}
                        </div>

                        <Button type="submit" loading={processing}>
                            <Upload size={16} /> Import CSV
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expected columns</p>
                        <p className="text-xs font-mono text-slate-500 break-all">{sampleHeaders.join(', ')}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            Category and brand can be names (auto-created) or IDs. Status: draft, published, archived.
                        </p>
                    </div>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
