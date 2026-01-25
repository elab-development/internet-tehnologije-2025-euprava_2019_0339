<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\Service;
use App\Models\Type;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $opstina = Institution::where('name', 'Opština Stari Grad')->firstOrFail();
        $mup = Institution::where('name', 'Ministarstvo unutrašnjih poslova')->firstOrFail();
        $maticna = Institution::where('name', 'Matična služba Grada Beograda')->firstOrFail();

        $izvodi = Type::where('name', 'Izvodi i uverenja')->firstOrFail();
        $zakazivanje = Type::where('name', 'Zakazivanje termina')->firstOrFail();

        // Postojeći servis 1.
        Service::factory()->create([
            'institution_id' => $maticna->id,
            'type_id' => $izvodi->id,
            'name' => 'eIzvod iz matične knjige rođenih',
            'description' => 'Elektronsko podnošenje zahteva za izvod iz matične knjige rođenih.',
            'fee' => 350,
            'requires_attachment' => true,
            'status' => 'ACTIVE',
        ]);

        // Postojeći servis 2.
        Service::factory()->create([
            'institution_id' => $mup->id,
            'type_id' => $izvodi->id,
            'name' => 'eUverenje o državljanstvu',
            'description' => 'Elektronsko podnošenje zahteva za uverenje o državljanstvu.',
            'fee' => 500,
            'requires_attachment' => false,
            'status' => 'ACTIVE',
        ]);

        // Novi servis (osmišljen).
        Service::factory()->create([
            'institution_id' => $opstina->id,
            'type_id' => $zakazivanje->id,
            'name' => 'eZakazivanje termina u opštini',
            'description' => 'Građanin bira uslugu i zakazuje termin za dolazak u opštinu.',
            'fee' => 0,
            'requires_attachment' => false,
            'status' => 'ACTIVE',
        ]);
    }
}
