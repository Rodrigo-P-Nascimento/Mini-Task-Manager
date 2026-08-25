package com.miniTaskManager.task_service.dto;

import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskRequestDTO {
    @NotBlank(message = "O título é obrigatório")
    private String titulo;
    
    private String descricao;
    
    @NotNull(message = "O status é obrigatório")
    private StatusTask status;
    
    @NotNull(message = "A prioridade é obrigatória")
    private PriorityTask prioridade;
    
    private Long responsavel;
    
    @NotNull(message = "O ID do time é obrigatório")
    private Long timeId;
    
    private LocalDateTime dataTermino;
}