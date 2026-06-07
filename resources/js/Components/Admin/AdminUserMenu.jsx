import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, LogOut, Store, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function AdminUserMenu() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const user = auth?.user;
    if (!user) return null;

    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const roleLabel = (user.roles?.[0] ?? 'admin').replace(/_/g, ' ');

    useEffect(() => {
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    return (
        <div className="relative ml-1" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={clsx(
                    'flex items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition-premium',
                    open
                        ? 'border-indigo-300 bg-indigo-50/80 dark:border-indigo-700 dark:bg-indigo-950/40'
                        : 'border-slate-200/80 bg-white/60 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800',
                )}
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-sm">
                        {initials || 'A'}
                    </span>
                )}
                <span className="hidden sm:block text-left min-w-0 max-w-[7rem]">
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {user.name?.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-slate-400 capitalize truncate">{roleLabel}</span>
                </span>
                <ChevronDown size={16} className={clsx('text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800"
                    role="menu"
                >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            href="/admin/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                            onClick={() => setOpen(false)}
                            role="menuitem"
                        >
                            <User size={16} className="text-slate-400" />
                            My profile
                        </Link>
                        <Link
                            href="/admin/settings/general"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                            onClick={() => setOpen(false)}
                            role="menuitem"
                        >
                            <Settings size={16} className="text-slate-400" />
                            Settings
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                            onClick={() => setOpen(false)}
                            role="menuitem"
                        >
                            <Store size={16} className="text-slate-400" />
                            View storefront
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1 dark:border-slate-700">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => setOpen(false)}
                            role="menuitem"
                        >
                            <LogOut size={16} />
                            Sign out
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
