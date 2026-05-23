package com.mediconnect.repository;

import com.mediconnect.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    List<Doctor> findBySpecialtyIgnoreCase(String specialty);
    List<Doctor> findByAvailableTrue();
    List<Doctor> findByFullNameContainingIgnoreCase(String name);
    boolean existsByEmail(String email);
}