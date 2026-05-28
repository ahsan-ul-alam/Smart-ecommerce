<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Blog', [
            'posts' => BlogPost::query()->latest()->paginate(15),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'slug' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['slug'] ?? $data['title']);
        $data['user_id'] = $request->user()->id;
        $data['published_at'] = $data['is_published'] ?? false ? now() : null;
        BlogPost::query()->create($data);

        return back()->with('success', 'Post created.');
    }

    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'slug' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        $wasPublished = $post->is_published;
        $data['slug'] = Str::slug($data['slug'] ?? $data['title']);
        $data['is_published'] = $data['is_published'] ?? false;

        if ($data['is_published'] && ! $wasPublished) {
            $data['published_at'] = now();
        } elseif (! $data['is_published']) {
            $data['published_at'] = null;
        }

        $post->update($data);

        return back()->with('success', 'Post updated.');
    }

    public function destroy(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Post deleted.');
    }
}
