import { Link } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';

export default function BlogShow({ post }) {
    return (
        <ShopLayout>
            <article className="max-w-3xl mx-auto px-6 py-8">
                <Link href="/shop/blog" className="text-sm text-teal-700 hover:underline mb-4 inline-block">← Back to blog</Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{post.title}</h1>
                {post.published_at && (
                    <p className="text-sm text-slate-400 mt-2">{new Date(post.published_at).toLocaleDateString()}</p>
                )}
                <div className="prose dark:prose-invert max-w-none mt-8 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {post.content}
                </div>
            </article>
        </ShopLayout>
    );
}
