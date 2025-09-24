package com.example.votingsystem.voting;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByUserIdAndCategoryIdAndIsFinalizedFalse(Long userId, Long categoryId);
    List<Vote> findByUserIdAndIsFinalizedFalse(Long userId);
}