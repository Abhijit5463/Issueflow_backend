package com.example.issueflow.repository;

import com.example.issueflow.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

        @org.springframework.data.jpa.repository.Query("SELECT t FROM Ticket t LEFT JOIN t.team tm WHERE " +
                        "( " +
                        "  (:onlyMyTeam = TRUE AND (tm.id IN :teamIds)) " +
                        "  OR " +
                        "  (:onlyMyTeam = FALSE AND (tm IS NULL OR tm.id IN :teamIds)) " +
                        ") AND " +
                        "( :query IS NULL OR :query = '' OR " +
                        "  LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "  LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        ") " +
                        "ORDER BY CASE t.priority " +
                        "WHEN 'HIGH' THEN 1 " +
                        "WHEN 'MEDIUM' THEN 2 " +
                        "WHEN 'LOW' THEN 3 " +
                        "ELSE 4 END ASC, t.createdAt DESC")
        org.springframework.data.domain.Page<Ticket> searchByQueryAndTeamIdsAndSortByPriority(
                        @Param("query") String query,
                        @Param("teamIds") java.util.Collection<Long> teamIds,
                        @Param("onlyMyTeam") Boolean onlyMyTeam,
                        org.springframework.data.domain.Pageable pageable);

        long countByReporter(String reporter);

        long countByAssigneeAndStatus(String assignee, com.example.issueflow.model.Status status);

}
