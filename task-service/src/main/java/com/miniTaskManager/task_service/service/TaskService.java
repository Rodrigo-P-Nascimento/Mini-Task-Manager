package com.miniTaskManager.task_service.service;

import com.miniTaskManager.task_service.dto.TaskRequestDTO;
import com.miniTaskManager.task_service.dto.TaskResponseDTO;
import com.miniTaskManager.task_service.entity.Task;
import com.miniTaskManager.task_service.entity.Team;
import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import com.miniTaskManager.task_service.exception.BusinessException;
import com.miniTaskManager.task_service.exception.ResourceNotFoundException;
import com.miniTaskManager.task_service.repository.TaskRepository;
import com.miniTaskManager.task_service.repository.TeamRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;

    @Transactional
    public TaskResponseDTO criarTarefa(TaskRequestDTO dto) {
        validarRegraConclusao(dto.getStatus(), dto.getResponsavel());

        Team time = teamRepository.findById(dto.getTimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Time não encontrado com o ID: " + dto.getTimeId()));

        Task task = Task.builder()
                .titulo(dto.getTitulo())
                .descricao(dto.getDescricao())
                .status(dto.getStatus())
                .prioridade(dto.getPrioridade())
                .responsavel(dto.getResponsavel())
                .time(time)
                .dataTermino(dto.getDataTermino())
                .build();

        Task saved = taskRepository.save(task);
        return mapToDTO(saved);
    }

    @Transactional
    public TaskResponseDTO atualizarTarefa(Long id, TaskRequestDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com o ID: " + id));

        validarRegraConclusao(dto.getStatus(), dto.getResponsavel());

        Team time = teamRepository.findById(dto.getTimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Time não encontrado com o ID: " + dto.getTimeId()));

        task.setTitulo(dto.getTitulo());
        task.setDescricao(dto.getDescricao());
        task.setStatus(dto.getStatus());
        task.setPrioridade(dto.getPrioridade());
        task.setResponsavel(dto.getResponsavel());
        task.setTime(time);
        task.setDataTermino(dto.getDataTermino());

        Task updated = taskRepository.save(task);
        return mapToDTO(updated);
    }

    @Transactional(readOnly = true)
    public TaskResponseDTO buscarPorId(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com o ID: " + id));
        return mapToDTO(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> listarComFiltros(StatusTask status, PriorityTask prioridade, Long responsavel, Pageable pageable) {
        // Uso de JPA Specification para queries dinâmicas.
        // Isso evita múltiplas queries ou concatenação insegura de SQL, 
        // filtrando apenas pelos campos que foram passados como parâmetro de forma eficiente.
        Specification<Task> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (prioridade != null) {
                predicates.add(criteriaBuilder.equal(root.get("prioridade"), prioridade));
            }
            if (responsavel != null) {
                predicates.add(criteriaBuilder.equal(root.get("responsavel"), responsavel));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return taskRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    @Transactional
    public void deletarTarefa(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com o ID: " + id);
        }
        taskRepository.deleteById(id);
    }

    private void validarRegraConclusao(StatusTask status, Long responsavel) {
        // Regra de Negócio Obrigatória (Desafio Técnico):
        // Uma tarefa só pode ser marcada como "Concluída" se tiver um responsável atribuído.
        if (status == StatusTask.CONCLUIDA && responsavel == null) {
            throw new BusinessException("Uma tarefa só pode ser marcada como 'Concluída' se tiver um responsável atribuído.");
        }
    }

    private TaskResponseDTO mapToDTO(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .titulo(task.getTitulo())
                .descricao(task.getDescricao())
                .status(task.getStatus())
                .prioridade(task.getPrioridade())
                .responsavel(task.getResponsavel())
                .timeId(task.getTime().getId())
                .timeNome(task.getTime().getNome())
                .dataCriacao(task.getDataCriacao())
                .dataTermino(task.getDataTermino())
                .build();
    }
}