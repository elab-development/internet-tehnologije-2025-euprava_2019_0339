<?php

namespace App\Http\Controllers;

use App\Http\Resources\TypeResource;
use App\Models\Type;
use Illuminate\Http\Request;

class TypeController extends Controller
{
    private function requireAdmin(Request $request): void
    {
        if (!$request->user() || $request->user()->role !== 'ADMIN') {
            abort(403, 'Nemate dozvolu za ovu akciju.');
        }
    }

    // GET /types (svi ulogovani).
    public function index(Request $request)
    {
        $types = Type::query()
            ->orderBy('name')
            ->get();

        return TypeResource::collection($types);
    }

    // GET /types/{type} (svi ulogovani).
    public function show(Request $request, Type $type)
    {
        // Po potrebi možeš da učitaš i servise:
        // $type->load(['services.institution', 'services.type']);
        return new TypeResource($type);
    }

    // POST /types (admin).
    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:types,name',
            'description' => 'nullable|string',
        ]);

        $type = Type::create($data);

        return (new TypeResource($type))
            ->response()
            ->setStatusCode(201);
    }

    // PUT /types/{type} (admin).
    public function update(Request $request, Type $type)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:types,name,' . $type->id,
            'description' => 'sometimes|nullable|string',
        ]);

        $type->update($data);

        return new TypeResource($type->fresh());
    }

    // DELETE /types/{type} (admin).
    public function destroy(Request $request, Type $type)
    {
        $this->requireAdmin($request);

        // Ako imaš FK sa cascade delete u migraciji, ovo je OK.
        // Ako NE želiš brisanje tipa kad ima servisa, dodaj validaciju ovde.
        $type->delete();

        return response()->json(['message' => 'Tip obrisan.']);
    }
}
