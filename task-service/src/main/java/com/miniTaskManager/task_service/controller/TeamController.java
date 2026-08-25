package com.miniTaskManager.task_service.controller;

import com.miniTaskManager.task_service.dto.TeamRequestDTO;
import com.miniTaskManager.task_service.entity.Team;
import com.miniTaskManager.task_service.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Team> criar(@Valid @RequestBody TeamRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.criarTime(dto));
    }

    @GetMapping
    public ResponseEntity<List<Team>> listarTodos() {
        return ResponseEntity.ok(teamService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.buscarPorId(id));
    }
}