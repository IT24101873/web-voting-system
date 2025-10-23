package com.example.votingsystem.notification.model;

import jakarta.persistence.*;
import java.time.Instant;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String recipient;

    @Column(nullable=false)
    private String subject;

    @Column(nullable=false, columnDefinition="TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Status status = Status.PENDING;

    @Column(nullable=false, updatable=false)
    private Instant createdAt = Instant.now();

    private Instant sentAt;

    // Error message if sending failed
    @Column(columnDefinition = "TEXT")
    private String error;

    // NEW: when to send (null means "send immediately")
    private Instant scheduledFor;

    // NEW: retry attempts count
    @Column(nullable=false)
    private int attempts = 0;

    @Column(name = "batch_id", length = 36) // UUID string
    private String batchId;

    private boolean archived = false;

    public enum Status { PENDING, SENT, FAILED }

}
