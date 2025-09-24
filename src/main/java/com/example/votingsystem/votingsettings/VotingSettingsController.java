package com.example.votingsystem.votingSettings;

import com.example.votingsystem.votingSettings.VotingSettingsDTO;
import com.example.votingsystem.votingSettings.VotingSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/voting/settings")
public class VotingSettingsController {
    @Autowired
    private VotingSettingsService votingSettingsService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VotingSettingsDTO> setVotingPeriod(@RequestBody VotingSettingsDTO settingsDTO) {
        VotingSettingsDTO savedSettings = votingSettingsService.setVotingPeriod(settingsDTO);
        return ResponseEntity.status(201).body(savedSettings);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VotingSettingsDTO> getVotingPeriod() {
        VotingSettingsDTO settings = votingSettingsService.getVotingPeriod();
        return ResponseEntity.ok(settings);
    }
}