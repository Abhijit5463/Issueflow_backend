package com.example.issueflow.model;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
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

    @NotNull(message = "Priority is requried")
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
