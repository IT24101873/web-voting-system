package com.Upeksha.Voting_System.service;

import com.Upeksha.Voting_System.model.Role;
import com.Upeksha.Voting_System.model.UserRegistration;
import com.Upeksha.Voting_System.repo.RegRepo;
import com.Upeksha.Voting_System.repo.Rolerepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegService {

    @Autowired
    private RegRepo repo;
    @Autowired
    private Rolerepo rolRepo;
    @Autowired
    private RoleService roleService;


    public UserRegistration addUser(UserRegistration user)
    {
        Role role = roleService.getRoleById(user.getId());
        if(role == null) {
            System.out.println("Role not found");
            return null;
        }
        else {
            user.setUserRole(role);
            return repo.save(user);
        }
    }

    public UserRegistration getuserById(String id) {

       return repo.findById(id).get();

    }
}
