package com.example.votingsystem.votingSettings;


import java.time.LocalDateTime;

public record VotingSettingsDTO(Long id, LocalDateTime startDate, LocalDateTime endDate) {}