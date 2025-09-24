package com.example.votingsystem.voting;

import com.example.votingsystem.auth.User;
import com.example.votingsystem.nominee.Nominee;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "VOTES", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category_id"}))
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private com.example.votingsystem.category.Category category;

    @Column(name = "vote_timestamp")
    private LocalDateTime voteTimestamp;

    @Column(name = "is_finalized")
    private boolean isFinalized;
}
