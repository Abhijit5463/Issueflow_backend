package com.example.issueflow.payload.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class InviteRequest {
    @NotBlank
    @Email
    private String email;
}
