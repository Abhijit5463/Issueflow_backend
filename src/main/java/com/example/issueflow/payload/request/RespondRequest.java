package com.example.issueflow.payload.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class RespondRequest {
    @NotBlank
    private String status; // ACCEPTED or DECLINED
}
