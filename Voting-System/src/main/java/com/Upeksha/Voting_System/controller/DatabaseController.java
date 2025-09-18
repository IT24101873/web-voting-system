package com.Upeksha.Voting_System.controller;

import com.Upeksha.Voting_System.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/db")
public class DatabaseController {

    @Autowired
    private final BackupService backupService;

    public DatabaseController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping("/backup")
    public String backup(@RequestParam(defaultValue = "backup.sql") String path) {
        backupService.backup(path);
        return "✅ Backup created at: " + path;
    }

    @GetMapping("/restore")
    public String restore(@RequestParam(defaultValue = "backup.sql") String path) {
        backupService.restore(path);
        return "🔄 Restore completed from: " + path;
    }
}