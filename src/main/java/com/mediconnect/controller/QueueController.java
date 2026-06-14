package com.mediconnect.controller;

import com.mediconnect.model.Appointment;
import com.mediconnect.model.Queue;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "http://localhost:5173")
public class QueueController {

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ─── Get today's full queue ───────────────────────────────
    @GetMapping("/today")
    public ResponseEntity<?> getTodayQueue() {
        List<Queue> queues = queueRepository.findByQueueDateOrderByTokenNumberAsc(LocalDate.now());
        return ResponseEntity.ok(queues);
    }

    // ─── Get today's queue for a specific doctor ──────────────
    @GetMapping("/today/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorQueue(@PathVariable Long doctorId) {
        List<Queue> queues = queueRepository.findByDoctorIdAndQueueDateOrderByTokenNumberAsc(doctorId, LocalDate.now());
        return ResponseEntity.ok(queues);
    }

    // ─── Generate queue from today's confirmed appointments ───
    @PostMapping("/generate")
    public ResponseEntity<?> generateQueue(@RequestParam Long doctorId) {
        LocalDate today = LocalDate.now();
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateOrderByAppointmentTimeAsc(doctorId, today);

        if (appointments.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No appointments found for today"));
        }

        int tokenCounter = queueRepository.findMaxTokenByDoctorIdAndDate(doctorId, today).orElse(0);

        for (Appointment appt : appointments) {
            if (appt.getStatus() == Appointment.Status.CANCELLED) continue;
            boolean exists = queueRepository.existsByPatientIdAndDoctorIdAndQueueDate(
                    appt.getPatient().getId(), doctorId, today);
            if (exists) continue;

            tokenCounter++;
            Queue q = Queue.builder()
                    .tokenNumber(tokenCounter)
                    .patientId(appt.getPatient().getId())
                    .patientName(appt.getPatient().getFullName())
                    .doctorId(doctorId)
                    .doctorName(appt.getDoctor().getFullName())
                    .specialty(appt.getDoctor().getSpecialty())
                    .appointmentTime(appt.getAppointmentTime() != null ? appt.getAppointmentTime().toString() : "")
                    .queueDate(today)
                    .status(Queue.QueueStatus.WAITING)
                    .build();
            queueRepository.save(q);
        }

        return ResponseEntity.ok(Map.of("message", "Queue generated successfully"));
    }

    // ─── Call next patient ────────────────────────────────────
    @PostMapping("/next")
    public ResponseEntity<?> callNext(@RequestParam Long doctorId) {
        LocalDate today = LocalDate.now();

        // Mark current serving as DONE
        Optional<Queue> current = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                doctorId, today, Queue.QueueStatus.SERVING);
        current.ifPresent(q -> {
            q.setStatus(Queue.QueueStatus.DONE);
            queueRepository.save(q);
        });

        // Get next WAITING
        List<Queue> waiting = queueRepository.findByDoctorIdAndQueueDateOrderByTokenNumberAsc(doctorId, today);
        Optional<Queue> next = waiting.stream()
                .filter(q -> q.getStatus() == Queue.QueueStatus.WAITING)
                .findFirst();

        if (next.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No patients waiting"));
        }

        next.get().setStatus(Queue.QueueStatus.SERVING);
        queueRepository.save(next.get());

        return ResponseEntity.ok(next.get());
    }

    // ─── Complete current patient ─────────────────────────────
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id) {
        return queueRepository.findById(id).map(q -> {
            q.setStatus(Queue.QueueStatus.DONE);
            queueRepository.save(q);
            return ResponseEntity.ok(Map.of("message", "Patient marked as done"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Skip current patient ─────────────────────────────────
    @PostMapping("/{id}/skip")
    public ResponseEntity<?> skip(@PathVariable Long id) {
        return queueRepository.findById(id).map(q -> {
            q.setStatus(Queue.QueueStatus.SKIPPED);
            queueRepository.save(q);
            return ResponseEntity.ok(Map.of("message", "Patient skipped"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Reset queue for a doctor today ──────────────────────
    @DeleteMapping("/reset")
    public ResponseEntity<?> reset(@RequestParam Long doctorId) {
        queueRepository.deleteByDoctorIdAndQueueDate(doctorId, LocalDate.now());
        return ResponseEntity.ok(Map.of("message", "Queue reset successfully"));
    }
}
