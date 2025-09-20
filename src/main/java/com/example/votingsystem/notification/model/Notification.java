package com.example.votingsystem.notification.model;

import jakarta.persistence.*;
import java.time.Instant;
import jakarta.persistence.Column;

@Entity
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



    // --- getters & setters ---
    public Long getId() { return id; }
    public String getRecipient() { return recipient; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public Status getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSentAt() { return sentAt; }
    public String getError() { return error; }
    public Instant getScheduledFor() { return scheduledFor; }
    public int getAttempts() { return attempts; }
    public boolean isArchived() { return archived; }
    public String getBatchId() { return batchId; }


    public void setId(Long id) { this.id = id; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setBody(String body) { this.body = body; }
    public void setStatus(Status status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public void setError(String error) { this.error = error; }
    public void setScheduledFor(Instant scheduledFor) { this.scheduledFor = scheduledFor; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

}
