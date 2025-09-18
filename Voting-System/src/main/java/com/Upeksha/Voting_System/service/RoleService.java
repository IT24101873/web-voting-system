package com.Upeksha.Voting_System.service;

import com.Upeksha.Voting_System.model.Role;
import com.Upeksha.Voting_System.repo.Rolerepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    @Autowired
    private Rolerepo repo;

    public List<Role> getAllroles() {

        return repo.findAll();
    }

    public Role getRoleById(String id) {
        return repo.findById(id).get();
    }

    public Role addRole(Role role) {
        return repo.save(role);
    }
}
