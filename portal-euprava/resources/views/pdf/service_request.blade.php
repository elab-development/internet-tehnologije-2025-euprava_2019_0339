<!doctype html>
<html lang="sr">
<head>
  <meta charset="utf-8">
  <title>Zahtev #{{ $sr->id }}</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
    h1 { font-size: 16px; margin: 0 0 6px; }
    .meta { color: #555; margin-bottom: 12px; }
    .line { margin: 4px 0; }
    .label { font-weight: bold; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 10px 0; }
    .muted { color: #666; }
    ul { margin: 6px 0 0 16px; padding: 0; }
    li { margin: 3px 0; }
  </style>
</head>
<body>
  <h1>Zahtev #{{ $sr->id }}</h1>

  <div class="meta">
    Kreirano: {{ optional($sr->created_at)->format('d.m.Y H:i') }} |
    Izmenjeno: {{ optional($sr->updated_at)->format('d.m.Y H:i') }}.
  </div>

  <div class="line"><span class="label">Status:</span> {{ $sr->status ?? '-' }}.</div>
  <div class="line"><span class="label">Payment status:</span> {{ $sr->payment_status ?? '-' }}.</div>
  <div class="line"><span class="label">Payment date:</span> {{ $sr->payment_date ? $sr->payment_date->format('d.m.Y H:i') : '-' }}.</div>
  <div class="line"><span class="label">Attachment:</span> {{ $sr->attachment ?? '-' }}.</div>

  <hr>

  <div class="line"><span class="label">Podnosilac:</span> {{ $sr->citizen?->name ?? '-' }}.</div>
  <div class="line"><span class="label">Email:</span> {{ $sr->citizen?->email ?? '-' }}.</div>
  <div class="line"><span class="label">Datum rođenja:</span> {{ $sr->citizen?->date_of_birth ? $sr->citizen->date_of_birth->format('d.m.Y') : '-' }}.</div>
  <div class="line"><span class="label">JMBG:</span> {{ $sr->citizen?->jmbg ?? '-' }}.</div>
  <div class="line"><span class="label">Uloga korisnika:</span> {{ $sr->citizen?->role ?? '-' }}.</div>

  <hr>

  <div class="line"><span class="label">Servis:</span> {{ $sr->service?->name ?? '-' }}.</div>
  <div class="line"><span class="label">Opis servisa:</span> {{ $sr->service?->description ?? '-' }}.</div>
  <div class="line"><span class="label">Taksa:</span> {{ $sr->service?->fee !== null ? number_format((float)$sr->service->fee, 2) . ' RSD' : '-' }}.</div>
  <div class="line"><span class="label">Requires attachment:</span>
    {{ $sr->service?->requires_attachment ? 'DA' : 'NE' }}.
  </div>
  <div class="line"><span class="label">Status servisa:</span> {{ $sr->service?->status ?? '-' }}.</div>

  <div class="line"><span class="label">Tip servisa:</span> {{ $sr->service?->type?->name ?? '-' }}.</div>
  <div class="line"><span class="label">Opis tipa:</span> {{ $sr->service?->type?->description ?? '-' }}.</div>

  <hr>

  <div class="line"><span class="label">Institucija:</span> {{ $sr->service?->institution?->name ?? '-' }}.</div>
  <div class="line"><span class="label">Grad:</span> {{ $sr->service?->institution?->city ?? '-' }}.</div>
  <div class="line"><span class="label">Adresa:</span> {{ $sr->service?->institution?->address ?? '-' }}.</div>
  <div class="line"><span class="label">Email institucije:</span> {{ $sr->service?->institution?->email ?? '-' }}.</div>

  <hr>

  <div class="line"><span class="label">Napomena građanina:</span> {{ $sr->citizen_note ?? '-' }}.</div>
  <div class="line"><span class="label">Napomena službenika:</span> {{ $sr->officer_note ?? '-' }}.</div>
  <div class="line"><span class="label">Službenik:</span> {{ $sr->officer?->name ?? '-' }}.</div>
  <div class="line"><span class="label">Email službenika:</span> {{ $sr->officer?->email ?? '-' }}.</div>

  <hr>

  <div class="line"><span class="label">Podaci iz forme:</span></div>

  @php
    $fd = $sr->form_data ?? [];
    // Ako je form_data null ili nije array, normalizujemo.
    if (!is_array($fd)) { $fd = []; }
  @endphp

  @if(count($fd))
    <ul>
      @foreach($fd as $k => $v)
        <li>
          <span class="label">{{ is_string($k) ? $k : 'Polje' }}:</span>
          @if(is_array($v))
            {{ json_encode($v, JSON_UNESCAPED_UNICODE) }}.
          @else
            {{ ($v === null || $v === '') ? '-' : $v }}.
          @endif
        </li>
      @endforeach
    </ul>
  @else
    <div class="muted">Nema unetih form podataka.</div>
  @endif
</body>
</html>
