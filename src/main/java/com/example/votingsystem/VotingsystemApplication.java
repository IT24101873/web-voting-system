package com.example.votingsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VotingsystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(VotingsystemApplication.class, args);
    }

}

