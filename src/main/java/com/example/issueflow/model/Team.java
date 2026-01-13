package com.example.issueflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_user_id")
    private com.example.issueflow.model.User adminUser;

    @NotBlank
    @Column(unique = true)
    private String name;

    private String description;

    public Team() {
    }

    public Team(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
