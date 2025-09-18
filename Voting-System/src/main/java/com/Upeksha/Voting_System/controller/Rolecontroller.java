package com.Upeksha.Voting_System.controller;


import com.Upeksha.Voting_System.model.Role;
import com.Upeksha.Voting_System.repo.Rolerepo;
import com.Upeksha.Voting_System.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class Rolecontroller {
    
    @Autowired
    private RoleService service;
    
    @RequestMapping("/blank")
    public String greet() {
        return "Hello Voting System";
    }

    @GetMapping("/get")
    public List<Role> getRoles() {
        return service.getAllroles();
    }

    @GetMapping("/get/{id}")
    public Role getRoleById(@PathVariable String id) {
        return service.getRoleById(id);
    }

    @PostMapping("/post")
    public Role addRole(@RequestBody Role role) {
        System.out.println(role);
        return service.addRole(role);
    }


}
