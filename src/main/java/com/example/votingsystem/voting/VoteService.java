package com.example.votingsystem.voting;


import com.example.votingsystem.auth.User;
import com.example.votingsystem.auth.UserRepository;
import com.example.votingsystem.category.Category;
import com.example.votingsystem.category.CategoryRepository;
import com.example.votingsystem.common.CustomException;
import com.example.votingsystem.nominee.Nominee;
import com.example.votingsystem.nominee.NomineeRepository;
import com.example.votingsystem.votingSettings.VotingSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoteService {
    @Autowired
    private VoteRepository voteRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NomineeRepository nomineeRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private VotingSettingsService votingSettingsService;

    public VoteDTO castVote(VoteRequest voteRequest, String username) {
        // Validate voting period
        if (!votingSettingsService.isVotingPeriodActive()) {
            throw new CustomException("Voting is not allowed outside the voting period");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found: " + username));
        if (!user.isEnabled() || !user.getRole().equals("STUDENT")) {
            throw new CustomException("Only verified students can vote");
        }

        Nominee nominee = nomineeRepository.findById(voteRequest.nomineeId())
                .orElseThrow(() -> new CustomException("Nominee not found: " + voteRequest.nomineeId()));
        Category category = categoryRepository.findById(voteRequest.categoryId())
                .orElseThrow(() -> new CustomException("Category not found: " + voteRequest.categoryId()));

        // Ensure nominee belongs to the category
        if (!nominee.getCategory().getId().equals(category.getId())) {
            throw new CustomException("Nominee does not belong to the specified category");
        }

        // Check for duplicate vote
        if (voteRepository.existsByUserIdAndCategoryIdAndIsFinalizedFalse(user.getId(), category.getId())) {
            throw new CustomException("User already voted in this category");
        }

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setNominee(nominee);
        vote.setCategory(category);
        vote.setVoteTimestamp(LocalDateTime.now());
        vote.setFinalized(false); // Temporary vote
        Vote savedVote = voteRepository.save(vote);

        return new VoteDTO(savedVote.getId(), nominee.getId(), category.getId(), username, savedVote.getVoteTimestamp(), false);
    }

    public List<VoteDTO> getTemporaryVotes(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found: " + username));
        return voteRepository.findByUserIdAndIsFinalizedFalse(user.getId()).stream()
                .map(v -> new VoteDTO(
                        v.getId(),
                        v.getNominee().getId(),
                        v.getCategory().getId(),
                        username,
                        v.getVoteTimestamp(),
                        v.isFinalized()
                ))
                .collect(Collectors.toList());
    }

    public VoteDTO updateVote(Long voteId, VoteRequest voteRequest, String username) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException("Vote not found: " + voteId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found: " + username));

        if (!vote.getUser().getId().equals(user.getId())) {
            throw new CustomException("Unauthorized to update this vote");
        }
        if (vote.isFinalized()) {
            throw new CustomException("Cannot update finalized vote");
        }

        Nominee nominee = nomineeRepository.findById(voteRequest.nomineeId())
                .orElseThrow(() -> new CustomException("Nominee not found: " + voteRequest.nomineeId()));
        Category category = categoryRepository.findById(voteRequest.categoryId())
                .orElseThrow(() -> new CustomException("Category not found: " + voteRequest.categoryId()));

        if (!nominee.getCategory().getId().equals(category.getId())) {
            throw new CustomException("Nominee does not belong to the specified category");
        }

        vote.setNominee(nominee);
        vote.setCategory(category);
        vote.setVoteTimestamp(LocalDateTime.now());
        Vote updatedVote = voteRepository.save(vote);

        return new VoteDTO(updatedVote.getId(), nominee.getId(), category.getId(), username, updatedVote.getVoteTimestamp(), false);
    }

    public void deleteVote(Long voteId, String username) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException("Vote not found: " + voteId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found: " + username));

        if (!vote.getUser().getId().equals(user.getId())) {
            throw new CustomException("Unauthorized to delete this vote");
        }
        if (vote.isFinalized()) {
            throw new CustomException("Cannot delete finalized vote");
        }

        voteRepository.deleteById(voteId);
    }

    public void submitFinalVotes(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found: " + username));
        if (!votingSettingsService.isVotingPeriodActive()) {
            throw new CustomException("Voting period has ended");
        }

        List<Vote> votes = voteRepository.findByUserIdAndIsFinalizedFalse(user.getId());
        for (Vote vote : votes) {
            vote.setFinalized(true);
            voteRepository.save(vote);
        }
    }
}