import { Card, CardBody } from './Card';
import clsx from 'clsx';

export default function StatCard({ title, value, icon: Icon, trend, color = 'teal' }) {
    const colors = {
        teal: 'bg-primary/10 text-primary ring-primary/20',
        amber: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400',
        blue: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400',
        purple: 'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400',
    };

    return (
        <Card interactive className="overflow-hidden">
            <CardBody className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
                    {trend && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{trend}</p>}
                </div>
                {Icon && (
                    <div className={clsx('p-3 rounded-2xl ring-1 shrink-0', colors[color])}>
                        <Icon size={22} strokeWidth={1.75} />
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
