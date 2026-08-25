package com.miniTaskManager.task_service.repository;

import com.miniTaskManager.task_service.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    boolean existsByNome(String nome);
}