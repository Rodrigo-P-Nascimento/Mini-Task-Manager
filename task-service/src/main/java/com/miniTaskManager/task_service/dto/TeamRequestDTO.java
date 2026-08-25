package com.miniTaskManager.task_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Set;

@Data
public class TeamRequestDTO {
    @NotBlank(message = "O nome do time é obrigatório")
    private String nome;
    private Set<Long> membros;
}