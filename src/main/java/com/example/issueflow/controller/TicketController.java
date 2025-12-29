package com.example.issueflow.controller;

import com.example.issueflow.model.Ticket;
import com.example.issueflow.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public String createTicket(@Valid @RequestBody Ticket ticket) {
        ticketService.createTicket(ticket);
        return "Ticket created successfully";
    }

//    @GetMapping
//    public Page<Ticket> getAllTickets(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size
//    ) {
//        return ticketService.getAllTickets(page, size);
//    }

    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket ticket){
        return ticketService.updateTicket(id, ticket);
    }

    @DeleteMapping("/{id}")
    public String deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return "Ticket deleted successfully";
    }
}
