package com.example.issueflow.repository;

import com.example.issueflow.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository <Ticket, Long> {



}
