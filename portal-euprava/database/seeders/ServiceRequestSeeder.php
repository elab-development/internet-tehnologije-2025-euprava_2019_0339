<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceRequestSeeder extends Seeder
{
    public function run(): void
    {
        $citizens = User::where('role', 'CITIZEN')->get();
        $officers = User::where('role', 'OFFICER')->get();
        $services = Service::with(['institution', 'type'])->get();

        //  Demo javni linkovi (0x0.st) – ubaci ovde svoje realne linkove.
        // Važno: u bazi čuvaš PUN URL, npr. "https://0x0.st/abcd.pdf" ili bez ekstenzije.
        $publicAttachments = [
            'https://0x0.st/EXAMPLE1.pdf',
            'https://0x0.st/EXAMPLE2.pdf',
            'https://0x0.st/EXAMPLE3.png',
            'https://0x0.st/EXAMPLE4.jpg',
            'https://0x0.st/EXAMPLE5', // može i bez ekstenzije
        ];

        foreach ($citizens as $citizen) {
            for ($i = 0; $i < 2; $i++) {
                $service = $services->random();

                $statusPool = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
                $status = $statusPool[array_rand($statusPool)];

                $officerId = null;
                $officerNote = null;

                if (in_array($status, ['IN_REVIEW', 'APPROVED', 'REJECTED'], true)) {
                    $officerId = $officers->random()->id;
                    $officerNote = $status === 'REJECTED'
                        ? 'Nedostaju podaci ili dokumentacija.'
                        : 'Zahtev je pregledan i evidentiran.';
                }

                // Generički form_data (bez ServiceField).
                $formData = [
                    'ime_prezime' => $citizen->name,
                    'kontakt_email' => $citizen->email,
                    'tip_servisa' => optional($service->type)->name,
                    'institucija' => optional($service->institution)->name,
                    'napomena' => fake()->sentence(),
                ];

                //  Ako servis zahteva prilog, izaberi jedan od javnih 0x0.st linkova.
                $attachment = null;
                if ((bool) $service->requires_attachment) {
                    $attachment = $publicAttachments[array_rand($publicAttachments)];
                }

                $paymentStatus = 'NOT_REQUIRED';
                $paymentDate = null;

                if ((float) $service->fee > 0) {
                    if ($status === 'APPROVED') {
                        $paymentStatus = 'PAID';
                        $paymentDate = now()->subDays(rand(0, 10));
                    } else {
                        $paymentStatus = 'NOT_PAID';
                    }
                }

                ServiceRequest::factory()->create([
                    'user_id' => $citizen->id,
                    'service_id' => $service->id,
                    'processed_by' => $officerId,
                    'status' => $status,
                    'citizen_note' => 'Molim obradu zahteva.',
                    'officer_note' => $officerNote,
                    'attachment' => $attachment, //  sada je ovo pun URL ka 0x0.st
                    'form_data' => $formData,
                    'payment_status' => $paymentStatus,
                    'payment_date' => $paymentDate,
                ]);
            }
        }
    }
}
