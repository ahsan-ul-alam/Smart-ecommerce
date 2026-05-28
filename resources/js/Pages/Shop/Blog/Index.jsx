import { Link } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';

export default function BlogIndex({ posts }) {
    const items = posts.data ?? posts;

    return (
        <ShopLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Blog</h1>
                <div className="space-y-6">
                    {items.map((post) => (
                        <article key={post.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <Link href={`/shop/blog/${post.slug}`} className="text-xl font-semibold text-slate-900 dark:text-white hover:text-teal-700">
                                {post.title}
                            </Link>
                            {post.excerpt && <p className="text-slate-600 dark:text-slate-300 mt-2">{post.excerpt}</p>}
                            {post.published_at && (
                                <p className="text-xs text-slate-400 mt-3">{new Date(post.published_at).toLocaleDateString()}</p>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </ShopLayout>
    );
}
