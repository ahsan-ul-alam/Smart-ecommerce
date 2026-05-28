import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import clsx from 'clsx';

export default function Modules({ modules }) {
    const { t } = useTranslation();

    const toggle = (key, enabled) => {
        router.patch(`/admin/settings/modules/${key}`, { enabled: !enabled }, { preserveScroll: true });
    };

    const grouped = modules.reduce((acc, m) => {
        (acc[m.group] = acc[m.group] || []).push(m);
        return acc;
    }, {});

    return (
        <AdminLayout title={t('settings.modules')}>
            <div className="space-y-6 max-w-3xl">
                {Object.entries(grouped).map(([group, items]) => (
                    <Card key={group}>
                        <CardHeader title={group.charAt(0).toUpperCase() + group.slice(1)} />
                        <CardBody className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
                            {items.map((module) => (
                                <div key={module.key} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{module.label}</p>
                                        <p className="text-xs text-slate-400">{module.key}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggle(module.key, module.is_enabled)}
                                        className={clsx(
                                            'relative w-11 h-6 rounded-full transition-colors',
                                            module.is_enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'
                                        )}
                                    >
                                        <span className={clsx(
                                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                                            module.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
                                        )} />
                                    </button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
