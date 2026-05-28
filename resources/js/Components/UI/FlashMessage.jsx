import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const message = flash?.success || flash?.error;
    const type = flash?.success ? 'success' : 'error';

    useEffect(() => {
        if (message) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [message]);

    if (!visible || !message) return null;

    return (
        <div className={clsx(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white',
            type === 'success' ? 'bg-teal-600' : 'bg-red-600'
        )}>
            {message}
        </div>
    );
}
