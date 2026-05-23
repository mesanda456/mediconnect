package com.mediconnect.service;

import com.mediconnect.model.Patient;
import com.mediconnect.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    public List<Patient> searchPatients(String name) {
        return patientRepository.findByFullNameContainingIgnoreCase(name);
    }

    public Patient createPatient(Patient patient) {
        if (patientRepository.existsByEmail(patient.getEmail())) {
            throw new RuntimeException("Patient with this email already exists");
        }
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setFullName(updatedPatient.getFullName());
            patient.setPhone(updatedPatient.getPhone());
            patient.setAddress(updatedPatient.getAddress());
            patient.setBloodGroup(updatedPatient.getBloodGroup());
            patient.setEmergencyContact(updatedPatient.getEmergencyContact());
            patient.setGender(updatedPatient.getGender());
            patient.setDateOfBirth(updatedPatient.getDateOfBirth());
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
}