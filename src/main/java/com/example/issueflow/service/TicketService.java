package com.example.issueflow.service;
import com.example.issueflow.model.Ticket;
import com.example.issueflow.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public void createTicket(Ticket ticket) {
        ticketRepository.save(ticket);

    }
    public org.springframework.data.domain.Page<Ticket> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ticketRepository.findAll(pageable);
    }


    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());
        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setPriority(updatedTicket.getPriority());

        return ticketRepository.save(existingTicket);

    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found with ID: " + id);
        }
        ticketRepository.deleteById(id);
    }



}
