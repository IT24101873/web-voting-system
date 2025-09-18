package com.Upeksha.Voting_System.repo;

import com.Upeksha.Voting_System.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Rolerepo extends JpaRepository<Role, String> {
}
