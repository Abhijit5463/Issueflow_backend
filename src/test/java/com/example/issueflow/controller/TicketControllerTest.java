package com.example.issueflow.controller;

import com.example.issueflow.model.Ticket;
import com.example.issueflow.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TicketControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private TicketController ticketController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(ticketController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testCreateTicket() throws Exception {
        Ticket ticket = new Ticket();
        ticket.setTitle("Test Ticket");
        ticket.setDescription("Test Description");
        ticket.setStatus(com.example.issueflow.model.Status.OPEN);
        ticket.setPriority(com.example.issueflow.model.Priority.HIGH);

        doNothing().when(ticketService).createTicket(any(Ticket.class));

        mockMvc.perform(post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ticket)))
                .andExpect(status().isOk())
                .andExpect(content().string("Ticket created successfully"));

        verify(ticketService, times(1)).createTicket(any(Ticket.class));
    }

    @Test
    void testGetAllTickets() throws Exception {
        Ticket ticket = new Ticket();
        ticket.setTitle("Test Ticket");
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(0, 10);
        Page<Ticket> page = new PageImpl<>(java.util.Collections.singletonList(ticket), pageRequest, 1);

        when(ticketService.getAllTickets(0, 10, null, false)).thenReturn(page);

        mockMvc.perform(get("/api/tickets")
                .param("page", "0")
                .param("size", "10")
                .param("onlyMyTeam", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Ticket"));

        verify(ticketService, times(1)).getAllTickets(0, 10, null, false);
    }

    @Test
    void testGetTicketById() throws Exception {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setTitle("Test Ticket");

        when(ticketService.getTicketById(1L)).thenReturn(ticket);

        mockMvc.perform(get("/api/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Ticket"));

        verify(ticketService, times(1)).getTicketById(1L);
    }

    @Test
    void testUpdateTicket() throws Exception {
        Ticket ticket = new Ticket();
        ticket.setTitle("Updated Ticket");

        when(ticketService.updateTicket(eq(1L), any(Ticket.class))).thenReturn(ticket);

        mockMvc.perform(put("/api/tickets/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ticket)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Ticket"));

        verify(ticketService, times(1)).updateTicket(eq(1L), any(Ticket.class));
    }

    @Test
    void testDeleteTicket() throws Exception {
        doNothing().when(ticketService).deleteTicket(1L);

        mockMvc.perform(delete("/api/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Ticket deleted successfully"));

        verify(ticketService, times(1)).deleteTicket(1L);
    }
}
