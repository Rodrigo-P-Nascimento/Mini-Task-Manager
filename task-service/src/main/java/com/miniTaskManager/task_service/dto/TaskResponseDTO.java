package com.miniTaskManager.task_service.dto;

import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Builder
public class TaskResponseDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private StatusTask status;
    private PriorityTask prioridade;
    private Long responsavel;
    private Long timeId;
    private String timeNome;
    private LocalDateTime dataCriacao;
    private LocalDate dataTermino;
}