package com.Upeksha.Voting_System.controller;

import com.Upeksha.Voting_System.model.Role;
import com.Upeksha.Voting_System.model.UserRegistration;
import com.Upeksha.Voting_System.repo.Rolerepo;
import com.Upeksha.Voting_System.service.RegService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registration")
public class RegController {

    @Autowired
    private RegService regService;

    @GetMapping("/check")
    public String check()
    {
        return "OK";
    }
    @GetMapping("/get/{id}")
            public UserRegistration get(@PathVariable String id)
    {
        return regService.getuserById(id);
    }

    @PostMapping("/adduser")
    public UserRegistration addUser(@RequestBody UserRegistration user) {

        System.out.println(user);
        return regService.addUser(user);

    }
}
