package com.example.issueflow.controller;

import com.example.issueflow.model.Invitation;
import com.example.issueflow.model.InvitationStatus;
import com.example.issueflow.model.Team;
import com.example.issueflow.model.User;
import com.example.issueflow.payload.request.InviteRequest;
import com.example.issueflow.payload.request.RespondRequest;
import com.example.issueflow.payload.response.MessageResponse;
import com.example.issueflow.repository.InvitationRepository;
import com.example.issueflow.repository.TeamRepository;
import com.example.issueflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class InvitationController {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/invitations")
    public ResponseEntity<?> getMyInvitations() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName().toLowerCase();
            System.out.println("Fetching invitations for (normalized): " + email);
            java.util.List<Invitation> invitations = invitationRepository.findByInviteeEmailIgnoreCase(email);
            System.out.println("Found " + invitations.size() + " invitations for " + email);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            System.err.println("Error fetching invitations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Error fetching invitations: " + e.getMessage()));
        }
    }

    // Invite a user to a team by email
    @PostMapping("/teams/{teamId}/invite")
    public ResponseEntity<?> inviteUser(@PathVariable Long teamId, @RequestBody InviteRequest request) {
        // Get inviter (current authenticated user)
        String inviterEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User inviter = userRepository.findByEmailIgnoreCase(inviterEmail)
                .orElseThrow(() -> new RuntimeException("Inviter not found"));

        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        // Only admin can invite
        if (!team.getAdminUser().getId().equals(inviter.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Only team admin can send invites"));
        }

        Invitation invitation = new Invitation();
        invitation.setTeam(team);
        invitation.setInviter(inviter);
        invitation.setInviteeEmail(request.getEmail().toLowerCase());
        invitation.setStatus(InvitationStatus.PENDING);
        invitationRepository.save(invitation);
        System.out.println("Invitation saved for: " + invitation.getInviteeEmail());
        return ResponseEntity.ok(new MessageResponse("Invitation sent"));
    }

    // Respond to an invitation (accept or decline)
    @PostMapping("/invitations/{invitationId}/respond")
    public ResponseEntity<?> respondInvitation(@PathVariable Long invitationId, @RequestBody RespondRequest request) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        // Ensure the logged in user matches invitee email
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!invitation.getInviteeEmail().equalsIgnoreCase(userEmail)) {
            return ResponseEntity.status(403).body(new MessageResponse("You are not the invitee"));
        }
        InvitationStatus newStatus;
        try {
            newStatus = InvitationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid status"));
        }
        invitation.setStatus(newStatus);
        invitationRepository.save(invitation);
        if (newStatus == InvitationStatus.ACCEPTED) {
            // Add user to team
            User user = userRepository.findByEmailIgnoreCase(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.getTeams().add(invitation.getTeam());
            userRepository.save(user);
        }
        return ResponseEntity.ok(new MessageResponse("Invitation " + newStatus.name().toLowerCase()));
    }

    // Remove a member from a team (admin only)
    @DeleteMapping("/teams/{teamId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        if (!team.getAdminUser().getId().equals(admin.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Only admin can remove members"));
        }
        User member = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Member not found"));
        member.getTeams().remove(team);
        userRepository.save(member);
        return ResponseEntity.ok(new MessageResponse("Member removed from team"));
    }
}
