package com.example.votingsystem.admin.bootstrap;

import com.example.votingsystem.admin.domain.Role;
import com.example.votingsystem.admin.domain.User;
import com.example.votingsystem.admin.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository repo, PasswordEncoder enc) {
        // Runs at app startup; creates default users if they don't exist
        return args -> {
            if (!repo.existsByUsername("admin")) {
                repo.save(new User("admin", enc.encode("123"), Role.ADMIN));
            }
            if (!repo.existsByUsername("organizer")) {
                repo.save(new User("organizer", enc.encode("123"), Role.ORGANIZER));
            }
            if (!repo.existsByUsername("student")) {
                repo.save(new User("student", enc.encode("123"), Role.STUDENT));
            }
            if (!repo.existsByUsername("itc")) {
                repo.save(new User("itc", enc.encode("123"), Role.IT_COORDINATOR));
            }
        };
    }
}
