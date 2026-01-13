package com.example.issueflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter

public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    @Size(min = 3, max = 100, message = "Title must be 3 to 100 characters long")

    private String title;
    @NotBlank(message = "Description cannot be empty")
    private String description;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    private Status status;

    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private String reporter;

    private String assignee;

    private String resolution;

    private String timeWorked;

    private String referencedKb;

    private String elapsedTime;

    private Boolean recurringIssue;

    @ElementCollection
    private java.util.List<String> attachments = new java.util.ArrayList<>();

    private LocalDateTime closedAt;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

}
