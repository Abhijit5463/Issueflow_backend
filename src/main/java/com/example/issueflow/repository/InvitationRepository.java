package com.example.issueflow.repository;

import com.example.issueflow.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByIdAndInviteeEmail(Long id, String email);

    List<Invitation> findByInviteeEmailIgnoreCase(String email);
}
