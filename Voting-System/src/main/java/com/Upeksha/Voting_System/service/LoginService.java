package com.Upeksha.Voting_System.service;

import com.Upeksha.Voting_System.model.Role;
import com.Upeksha.Voting_System.model.UserRegistration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    @Autowired
    private RegService regService;

    public String checklogin(String id, String password) {

        UserRegistration user = regService.getuserById(id);
        if (user.getPassword().equals(password))
        {
            if(user.getUserRole().getRoleStatus().equals("Admin")) {
                return "Successfully Logged in as Admin";
            } else if (user.getUserRole().getRoleStatus().equals("IT Coordinator")) {
                return "Successfully Logged in as IT Coordinator";
            }
            else if (user.getUserRole().getRoleStatus().equals("Event Organizer")) {
                return "Successfully Logged in as Event Organizer";
            }
            else if (user.getUserRole().getRoleStatus().equals("Student")&&user.getUserRole().getYearOfStudying().equals(4)) {
                return "Successfully Logged in as Final year Student You're eligible for vote";
            } else if (user.getUserRole().getRoleStatus().equals("Student")&&user.getUserRole().getYearOfStudying()!=4) {
                return "Successfully Logged in as Not a Final year Student";

            }
            return "Log in Success";
        }
        else return "Login Failed";
    }
}
