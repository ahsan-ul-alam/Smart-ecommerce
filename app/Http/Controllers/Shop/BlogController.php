<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Shop/Blog/Index', [
            'posts' => BlogPost::query()->where('is_published', true)->latest('published_at')->paginate(9),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = BlogPost::query()->where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Shop/Blog/Show', ['post' => $post]);
    }
}
