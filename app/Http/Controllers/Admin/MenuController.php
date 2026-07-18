<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Menus', [
            'items' => MenuItem::query()
                ->orderBy('location')
                ->orderBy('sort_order')
                ->get(),
            'locations' => [
                ['value' => 'header', 'label' => 'Header navigation'],
                ['value' => 'footer_shop', 'label' => 'Footer — Shop column'],
                ['value' => 'footer_support', 'label' => 'Footer — Support column'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        MenuItem::query()->create($this->validated($request));

        return back()->with('success', 'Menu item added.');
    }

    public function update(Request $request, MenuItem $menu): RedirectResponse
    {
        $menu->update($this->validated($request));

        return back()->with('success', 'Menu item updated.');
    }

    public function destroy(MenuItem $menu): RedirectResponse
    {
        $menu->delete();

        return back()->with('success', 'Menu item removed.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:menu_items,id'],
        ]);

        foreach ($data['order'] as $index => $id) {
            MenuItem::query()->where('id', $id)->update(['sort_order' => $index]);
        }

        return back()->with('success', 'Menu order updated.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'location' => ['required', Rule::in(MenuItem::LOCATIONS)],
            'label' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'open_in_new_tab' => ['boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['open_in_new_tab'] = $request->boolean('open_in_new_tab');
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        return $data;
    }
}
