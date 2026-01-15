package com.example.issueflow.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserStatsResponse {
    private long reportedCount;
    private long resolvedCount;
}
