package com.example.votingsystem.student.repo;

import com.example.votingsystem.student.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByIndexNo(String indexNo);
    boolean existsByEmail(String email);
    Optional<Student> findByIndexNo(String indexNo);
    Optional<Student> findByEmail(String email);

    // ---- NEW: lightweight read-only projection for the list view
    interface Row {
        Long getId();
        String getIndexNo();
        String getFullName();
        String getEmail();
        boolean isActive();
    }

    // ---- NEW: fetch only safe columns (no passwordHash, no dates)
    List<Row> findAllByOrderByIdDesc();

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByIndexNoIgnoreCase(String indexNo);

    Optional<Student> findByEmailIgnoreCase(String email);
    Optional<Student> findByIndexNoIgnoreCase(String indexNo);

    java.util.List<com.example.votingsystem.student.domain.Student> findByActiveFalse();

}
