package com.Upeksha.Voting_System.repo;

import com.Upeksha.Voting_System.model.UserRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegRepo extends JpaRepository<UserRegistration, String> {
}
