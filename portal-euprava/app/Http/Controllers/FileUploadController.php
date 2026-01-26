<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function filebin(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:25600', // 25MB
        ]);

        $file = $request->file('file');

        try {
            $response = Http::timeout(30)
                ->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )
                ->post('https://0x0.st');

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Greška pri povezivanju sa upload servisom.',
                'error' => $e->getMessage(),
            ], 500);
        }

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Upload nije uspeo.',
                'status' => $response->status(),
                'body' => $response->body(),
            ], 422);
        }

        return response()->json([
            'link' => trim($response->body()), // SAMO URL
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mimeType' => $file->getMimeType(),
        ]);
    }
}
