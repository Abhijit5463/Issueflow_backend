package com.example.issueflow.controller;

import com.example.issueflow.model.Team;
import com.example.issueflow.model.User;
import com.example.issueflow.repository.TeamRepository;
import com.example.issueflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllTeams() {
        return ResponseEntity.ok(teamRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTeams() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching teams for user: " + email);
            User user = userRepository.findByEmailIgnoreCase(email.toLowerCase())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            java.util.Set<Team> teams = user.getTeams();
            System.out.println("Found " + (teams != null ? teams.size() : 0) + " teams for user " + email);
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            System.err.println("Error fetching teams: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new com.example.issueflow.payload.response.MessageResponse(
                    "Error fetching teams: " + e.getMessage()));
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createTeam(@RequestBody Team team) {
        try {
            System.out.println("Creating team: " + team.getName());
            String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Admin email from context: " + adminEmail);

            User admin = userRepository.findByEmailIgnoreCase(adminEmail.toLowerCase())
                    .orElseThrow(() -> new RuntimeException("Admin user not found: " + adminEmail));

            team.setAdminUser(admin);
            Team savedTeam = teamRepository.save(team);
            System.out.println("Team saved with ID: " + savedTeam.getId());

            // Add admin to team members
            admin.getTeams().add(savedTeam);
            userRepository.save(admin);
            System.out.println("Admin updated with new team membership.");

            return ResponseEntity.ok(savedTeam);
        } catch (Exception e) {
            System.err.println("Error creating team: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new com.example.issueflow.payload.response.MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long id) {
        // This is a bit tricky since it's ManyToMany and mapped on User side.
        // We can use a custom query in UserRepository or find all users where team set
        // contains this team.
        return ResponseEntity.ok(userRepository.findAllByTeamsId(id));
    }
}
