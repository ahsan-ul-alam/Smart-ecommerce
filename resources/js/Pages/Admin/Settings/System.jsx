import { router } from '@inertiajs/react';
import { Database, FileCode, Route, Eye, Sparkles } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const tools = [
    { type: 'cache', label: 'Clear application cache', desc: 'Flushes cached data (settings, modules, etc.).', icon: Database },
    { type: 'config', label: 'Clear config cache', desc: 'Use after changing .env or config files.', icon: FileCode },
    { type: 'route', label: 'Clear route cache', desc: 'Rebuilds route list on next request.', icon: Route },
    { type: 'view', label: 'Clear compiled views', desc: 'Removes cached Blade templates.', icon: Eye },
    { type: 'optimize', label: 'Clear all optimization', desc: 'Runs optimize:clear (config, routes, views, events).', icon: Sparkles },
];

export default function SystemSettings({ queue = {} }) {
    const run = (type) => {
        if (!confirm('Run this maintenance action now?')) {
            return;
        }
        router.post('/admin/settings/system/clear', { type }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="System Tools">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-6">
                Maintenance utilities for production deployments. Actions are logged in audit and activity logs.
            </p>

            <Card className="max-w-2xl mb-6">
                <CardHeader title="Queue monitor" subtitle={`Driver: ${queue.driver ?? '—'} · Connection: ${queue.connection ?? '—'}`} />
                <CardBody className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Pending jobs</p>
                        <p className="text-2xl font-bold">{queue.pending_jobs ?? 0}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Failed jobs</p>
                        <p className="text-2xl font-bold text-amber-600">{queue.failed_jobs ?? 0}</p>
                    </div>
                    <p className="sm:col-span-2 text-xs text-slate-500">
                        {queue.horizon_available
                            ? 'Laravel Horizon can be installed on Linux/production (requires pcntl). Use Redis + php artisan queue:work locally on Windows.'
                            : 'Horizon requires pcntl (Linux/WSL). Use database or Redis queue with queue:work.'}
                    </p>
                </CardBody>
            </Card>

            <div className="grid gap-4 max-w-2xl">
                {tools.map(({ type, label, desc, icon: Icon }) => (
                    <Card key={type}>
                        <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{label}</p>
                                    <p className="text-sm text-slate-500">{desc}</p>
                                </div>
                            </div>
                            <Button variant="secondary" type="button" onClick={() => run(type)}>
                                Run
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="max-w-2xl mt-6">
                <CardHeader title="Tips" />
                <CardBody className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <p>After deploying code changes, clear optimization cache and reload the storefront.</p>
                    <p>Site settings and theme are cached briefly — clear application cache if branding does not update.</p>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
