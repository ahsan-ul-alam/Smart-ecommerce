import { Card, CardBody } from './Card';
import clsx from 'clsx';

export default function StatCard({ title, value, icon: Icon, trend, color = 'teal' }) {
    const colors = {
        teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <Card>
            <CardBody className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
                    {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
                </div>
                {Icon && (
                    <div className={clsx('p-3 rounded-xl', colors[color])}>
                        <Icon size={22} />
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
