package com.mediconnect.service;

import com.mediconnect.model.Doctor;
import com.mediconnect.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByAvailableTrue();
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyIgnoreCase(specialty);
    }

    public List<Doctor> searchDoctors(String name) {
        return doctorRepository.findByFullNameContainingIgnoreCase(name);
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctorRepository.existsByEmail(doctor.getEmail())) {
            throw new RuntimeException("Doctor with this email already exists");
        }
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setFullName(updatedDoctor.getFullName());
            doctor.setPhone(updatedDoctor.getPhone());
            doctor.setSpecialty(updatedDoctor.getSpecialty());
            doctor.setQualification(updatedDoctor.getQualification());
            doctor.setExperienceYears(updatedDoctor.getExperienceYears());
            doctor.setBio(updatedDoctor.getBio());
            doctor.setAvailable(updatedDoctor.getAvailable());
            doctor.setConsultationFee(updatedDoctor.getConsultationFee());
            return doctorRepository.save(doctor);
        }).orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }
}