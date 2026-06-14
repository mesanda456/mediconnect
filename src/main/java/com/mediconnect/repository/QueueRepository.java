package com.mediconnect.repository;

import com.mediconnect.model.Queue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QueueRepository extends JpaRepository<Queue, Long> {

    List<Queue> findByQueueDateOrderByTokenNumberAsc(LocalDate date);

    List<Queue> findByDoctorIdAndQueueDateOrderByTokenNumberAsc(Long doctorId, LocalDate date);

    Optional<Queue> findByDoctorIdAndQueueDateAndStatus(Long doctorId, LocalDate date, Queue.QueueStatus status);

    @Query("SELECT MAX(q.tokenNumber) FROM Queue q WHERE q.doctorId = :doctorId AND q.queueDate = :date")
    Optional<Integer> findMaxTokenByDoctorIdAndDate(Long doctorId, LocalDate date);

    void deleteByDoctorIdAndQueueDate(Long doctorId, LocalDate date);

    boolean existsByPatientIdAndDoctorIdAndQueueDate(Long patientId, Long doctorId, LocalDate date);
}
