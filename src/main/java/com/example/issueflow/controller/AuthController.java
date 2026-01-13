package com.example.issueflow.controller;

import com.example.issueflow.model.User;
import com.example.issueflow.payload.request.LoginRequest;
import com.example.issueflow.payload.request.SignupRequest;
import com.example.issueflow.payload.request.TokenRefreshRequest;
import com.example.issueflow.payload.response.JwtResponse;
import com.example.issueflow.payload.response.MessageResponse;
import com.example.issueflow.payload.response.TokenRefreshResponse;
import com.example.issueflow.repository.UserRepository;
import com.example.issueflow.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.println("Processing login request for: " + loginRequest.getEmail());

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            System.out.println("Authentication successful for: " + loginRequest.getEmail());
        } catch (Exception e) {
            System.out.println("Authentication failed for: " + loginRequest.getEmail());
            e.printStackTrace();
            throw e;
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // org.springframework.security.core.userdetails.User

        // We need our User entity ID and Name. loadUserByUsername only returns security
        // User.
        // We can fetch it again or cast if we used custom UserDetailsImpl.
        // For efficiency, let's fetch by email since we have it.
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername().toLowerCase()).orElseThrow();

        String jwt = jwtUtils.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                refreshToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmailIgnoreCase(signUpRequest.getEmail().toLowerCase())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getName(),
                signUpRequest.getEmail().toLowerCase(),
                encoder.encode(signUpRequest.getPassword()));

        // Save the new user without team assignments (team joining via invitations)
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        if (jwtUtils.validateJwtToken(requestRefreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);

            // Critical check: Does the user still exist in the DB?
            if (!userRepository.existsByEmailIgnoreCase(username)) {
                return ResponseEntity.status(401).body(new MessageResponse("User account not found!"));
            }

            String token = jwtUtils.generateAccessToken(username);
            return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Refresh token is invalid!"));
        }
    }
}
