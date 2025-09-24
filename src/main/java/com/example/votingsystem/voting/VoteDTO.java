package com.example.votingsystem.voting;


import com.example.votingsystem.category.CategoryDTO;

import java.time.LocalDateTime;

public record VoteDTO(Long id, Long nomineeId, Long categoryId, String username, LocalDateTime voteTimestamp, boolean isFinalized) {
}