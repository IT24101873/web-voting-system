package com.Upeksha.Voting_System.controller;

import com.Upeksha.Voting_System.model.UserRegistration;
import com.Upeksha.Voting_System.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class Logincontroller {

    @Autowired
    private LoginService loginService;

    @GetMapping("/check")
    public String check()
    {
        return "Ok!!";
    }
    @GetMapping("/{id}/{password}")
    public String login(@PathVariable String id, @PathVariable String password)
    {
        return loginService.checklogin(id,password);
    }

}
