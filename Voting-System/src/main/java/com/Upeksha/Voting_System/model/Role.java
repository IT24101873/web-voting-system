package com.Upeksha.Voting_System.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Role {

    @Id
    private String id;
    private String name;
    private String roleStatus;
    @Column(nullable = true)
    private Integer yearOfStudying;

    public String getId() {
        return id;
    }

    public Integer getYearOfStudying() {
        return yearOfStudying;
    }

    public String getRoleStatus() {
        return roleStatus;
    }

    public String getName() {
        return name;
    }
}
