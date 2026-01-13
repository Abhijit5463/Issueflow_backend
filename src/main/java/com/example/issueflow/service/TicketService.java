package com.example.issueflow.service;

import com.example.issueflow.model.Ticket;
import com.example.issueflow.model.Status;
import com.example.issueflow.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private com.example.issueflow.repository.UserRepository userRepository;

    public void createTicket(Ticket ticket) {
        System.out.println("Creating ticket: " + ticket.getTitle()
                + (ticket.getTeam() != null ? " for team: " + ticket.getTeam().getName() : " (Public)"));
        ticketRepository.save(ticket);
    }

    public org.springframework.data.domain.Page<Ticket> getAllTickets(int page, int size, String query,
            Boolean onlyMyTeam) {
        Pageable pageable = PageRequest.of(page, size);

        // Get Current User
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        java.util.Set<com.example.issueflow.model.Team> teams = null;

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication
                    .getPrincipal();
            com.example.issueflow.model.User user = userRepository
                    .findByEmailIgnoreCase(userDetails.getUsername().toLowerCase())
                    .orElse(null);
            if (user != null) {
                teams = user.getTeams();
                System.out.println("User: " + user.getEmail() + ", Teams: " + (teams != null ? teams.size() : 0));
            }
        }

        // Extract team IDs for query
        java.util.Set<Long> teamIds = new java.util.HashSet<>();
        if (teams != null && !teams.isEmpty()) {
            teamIds = teams.stream()
                    .map(com.example.issueflow.model.Team::getId)
                    .collect(java.util.stream.Collectors.toSet());
        }

        System.out.println("Fetching tickets: query=[" + query + "], teamIds=" + (teamIds != null ? teamIds : "null")
                + ", onlyMyTeam=" + onlyMyTeam);
        org.springframework.data.domain.Page<Ticket> result = ticketRepository.searchByQueryAndTeamIdsAndSortByPriority(
                query,
                teamIds, onlyMyTeam, pageable);
        System.out.println("Found tickets: " + result.getTotalElements());
        return result;
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Restrict editing if ticket is CLOSED, unless reopening to IN_PROGRESS
        if (existingTicket.getStatus() == Status.CLOSED && updatedTicket.getStatus() != Status.IN_PROGRESS) {
            throw new RuntimeException("Ticket is CLOSED. Change status to IN_PROGRESS to edit.");
        }

        // Validate mandatory fields when Closing
        if (updatedTicket.getStatus() == Status.CLOSED) {
            if (updatedTicket.getTitle() == null || updatedTicket.getTitle().trim().isEmpty())
                throw new RuntimeException("Title is mandatory to close ticket.");
            if (updatedTicket.getDescription() == null || updatedTicket.getDescription().trim().isEmpty())
                throw new RuntimeException("Description is mandatory to close ticket.");
            if (updatedTicket.getPriority() == null)
                throw new RuntimeException("Priority is mandatory to close ticket.");
            if (updatedTicket.getReporter() == null || updatedTicket.getReporter().trim().isEmpty())
                throw new RuntimeException("Reporter is mandatory to close ticket.");
            if (updatedTicket.getResolution() == null || updatedTicket.getResolution().trim().isEmpty())
                throw new RuntimeException("Resolution is mandatory to close ticket.");
            if (updatedTicket.getAssignee() == null || updatedTicket.getAssignee().trim().isEmpty())
                throw new RuntimeException("Assignee is mandatory to close ticket.");
        }

        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());

        // Handle closing logic
        if (existingTicket.getStatus() != Status.CLOSED && updatedTicket.getStatus() == Status.CLOSED) {
            existingTicket.setClosedAt(java.time.LocalDateTime.now());
        } else if (updatedTicket.getStatus() != Status.CLOSED) {
            existingTicket.setClosedAt(null); // Re-open
        }

        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setPriority(updatedTicket.getPriority());
        existingTicket.setReporter(updatedTicket.getReporter());
        existingTicket.setResolution(updatedTicket.getResolution());
        existingTicket.setAssignee(updatedTicket.getAssignee());
        existingTicket.setTimeWorked(updatedTicket.getTimeWorked());
        existingTicket.setReferencedKb(updatedTicket.getReferencedKb());
        existingTicket.setElapsedTime(updatedTicket.getElapsedTime());
        existingTicket.setRecurringIssue(updatedTicket.getRecurringIssue());

        return ticketRepository.save(existingTicket);

    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found with ID: " + id);
        }
        ticketRepository.deleteById(id);
    }

    public String addAttachment(Long ticketId, MultipartFile file) throws IOException {
        Ticket ticket = getTicketById(ticketId);

        // Ensure uploads directory exists
        Path uploadPath = Paths.get("uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Update ticket
        ticket.getAttachments().add(filename);
        ticketRepository.save(ticket);

        return filename;
    }

}
