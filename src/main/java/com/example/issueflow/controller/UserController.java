package com.example.issueflow.controller;

import com.example.issueflow.model.Status;
import com.example.issueflow.model.User;
import com.example.issueflow.payload.request.ProfileUpdateRequest;
import com.example.issueflow.payload.response.MessageResponse;
import com.example.issueflow.payload.response.UserStatsResponse;
import com.example.issueflow.repository.TicketRepository;
import com.example.issueflow.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    TicketRepository ticketRepository;

    @Autowired
    PasswordEncoder encoder;

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername().toLowerCase()).orElseThrow();

        long reported = ticketRepository.countByReporter(user.getName());
        long resolved = ticketRepository.countByAssigneeAndStatus(user.getName(), Status.CLOSED);

        return ResponseEntity.ok(new UserStatsResponse(reported, resolved));
    }

    @GetMapping("/exists")
    public ResponseEntity<?> checkUserExists(@RequestParam String email) {
        boolean exists = userRepository.existsByEmailIgnoreCase(email.toLowerCase());
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername().toLowerCase()).orElseThrow();

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(updateRequest.getEmail().toLowerCase())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            user.setEmail(updateRequest.getEmail().toLowerCase());
        }

        user.setName(updateRequest.getName());
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(updateRequest.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }
}
