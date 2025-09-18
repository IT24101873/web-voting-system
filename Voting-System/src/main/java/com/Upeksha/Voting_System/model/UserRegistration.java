package com.Upeksha.Voting_System.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Component
public class UserRegistration {

    @Id
    private String id;
    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private Role userRole;
    private String Email;
    private String Password;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Role getUserRole() {
        return userRole;
    }
    public void setUserRole(Role userRole) {
        this.userRole = userRole;
    }

    public String getEmail() {
        return Email;
    }

    public void setEmail(String email) {
        Email = email;
    }

    public String getPassword() {
        return Password;
    }

    public void setPassword(String password) {
        Password = password;
    }




}
