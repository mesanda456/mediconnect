package com.mediconnect.service;

import com.mediconnect.model.Appointment;
import com.mediconnect.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    public Appointment createAppointment(Appointment appointment) {
        boolean slotTaken = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                        appointment.getDoctor().getId(),
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime()
                );
        if (slotTaken) {
            throw new RuntimeException("This time slot is already booked");
        }
        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long id, Appointment.Status status) {
        return appointmentRepository.findById(id).map(appt -> {
            appt.setStatus(status);
            return appointmentRepository.save(appt);
        }).orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public void cancelAppointment(Long id) {
        updateStatus(id, Appointment.Status.CANCELLED);
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
}