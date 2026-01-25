<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        Type::query()->firstOrCreate(
            ['name' => 'Izvodi i uverenja'],
            ['description' => 'Usluge izdavanja izvoda i uverenja putem eUprave.']
        );

        Type::query()->firstOrCreate(
            ['name' => 'Zakazivanje termina'],
            ['description' => 'Usluge zakazivanja termina i poseta institucijama.']
        );
    }
}
