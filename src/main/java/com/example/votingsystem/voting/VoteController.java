package com.example.votingsystem.voting;


import com.example.votingsystem.voting.VoteDTO;
import com.example.votingsystem.voting.VoteRequest;
import com.example.votingsystem.voting.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voting")
public class VoteController {
    @Autowired
    private VoteService voteService;

    @PostMapping("/cast")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VoteDTO> castVote(@RequestBody VoteRequest voteRequest,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        VoteDTO vote = voteService.castVote(voteRequest, userDetails.getUsername());
        return ResponseEntity.status(201).body(vote);
    }

    @GetMapping("/votes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<VoteDTO>> getTemporaryVotes(@AuthenticationPrincipal UserDetails userDetails) {
        List<VoteDTO> votes = voteService.getTemporaryVotes(userDetails.getUsername());
        return ResponseEntity.ok(votes);
    }

    @PutMapping("/votes/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VoteDTO> updateVote(@PathVariable Long id,
                                              @RequestBody VoteRequest voteRequest,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        VoteDTO vote = voteService.updateVote(id, voteRequest, userDetails.getUsername());
        return ResponseEntity.ok(vote);
    }

    @DeleteMapping("/votes/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteVote(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        voteService.deleteVote(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> submitFinalVotes(@AuthenticationPrincipal UserDetails userDetails) {
        voteService.submitFinalVotes(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}