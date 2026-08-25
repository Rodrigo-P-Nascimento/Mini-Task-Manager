package com.miniTaskManager.task_service.controller;

import com.miniTaskManager.task_service.dto.TaskRequestDTO;
import com.miniTaskManager.task_service.dto.TaskResponseDTO;
import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import com.miniTaskManager.task_service.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponseDTO> criar(@Valid @RequestBody TaskRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.criarTarefa(dto));
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponseDTO>> listar(
            @RequestParam(required = false) StatusTask status,
            @RequestParam(required = false) PriorityTask prioridade,
            @RequestParam(required = false) Long responsavel,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(taskService.listarComFiltros(status, prioridade, responsavel, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TaskRequestDTO dto) {
        return ResponseEntity.ok(taskService.atualizarTarefa(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        taskService.deletarTarefa(id);
        return ResponseEntity.noContent().build();
    }
}