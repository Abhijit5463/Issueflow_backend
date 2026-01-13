package com.example.issueflow.config;

import com.example.issueflow.model.Team;
import com.example.issueflow.repository.TeamRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(TeamRepository teamRepository) {
        return args -> {
            if (teamRepository.count() == 0) {
                teamRepository.save(new Team("Frontend Team", "Deals with UI/UX"));
                teamRepository.save(new Team("Backend Team", "Deals with API and Database"));
                teamRepository.save(new Team("QA Team", "Quality Assurance"));
                System.out.println("Seeded Teams.");
            }
        };
    }
}
