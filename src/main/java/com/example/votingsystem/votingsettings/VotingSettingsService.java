package com.example.votingsystem.votingSettings;

import com.example.votingsystem.common.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VotingSettingsService {
    @Autowired
    private VotingSettingsRepository votingSettingsRepository;

    public VotingSettingsDTO setVotingPeriod(VotingSettingsDTO settingsDTO) {
        if (settingsDTO.startDate().isAfter(settingsDTO.endDate())) {
            throw new CustomException("Start date must be before end date");
        }

        VotingSettings settings = new VotingSettings();
        settings.setStartDate(settingsDTO.startDate());
        settings.setEndDate(settingsDTO.endDate());
        VotingSettings savedSettings = votingSettingsRepository.save(settings);
        return new VotingSettingsDTO(savedSettings.getId(), savedSettings.getStartDate(), savedSettings.getEndDate());
    }

    public VotingSettingsDTO getVotingPeriod() {
        VotingSettings settings = votingSettingsRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new CustomException("Voting settings not found"));
        return new VotingSettingsDTO(settings.getId(), settings.getStartDate(), settings.getEndDate());
    }

    public boolean isVotingPeriodActive() {
        VotingSettings settings = votingSettingsRepository.findAll().stream()
                .findFirst()
                .orElse(null);
        if (settings == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(settings.getStartDate()) && now.isBefore(settings.getEndDate());
    }
}