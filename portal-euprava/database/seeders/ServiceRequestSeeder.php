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

                $attachment = null;
                if ((bool) $service->requires_attachment) {
                    $attachment = 'uploads/demo/attachment_' . $citizen->id . '_' . now()->timestamp . '.pdf';
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
                    'attachment' => $attachment,
                    'form_data' => $formData,
                    'payment_status' => $paymentStatus,
                    'payment_date' => $paymentDate,
                ]);
            }
        }
    }
}
