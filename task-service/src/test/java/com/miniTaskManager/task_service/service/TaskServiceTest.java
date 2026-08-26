package com.miniTaskManager.task_service.service;

import com.miniTaskManager.task_service.dto.TaskRequestDTO;
import com.miniTaskManager.task_service.dto.TaskResponseDTO;
import com.miniTaskManager.task_service.entity.Task;
import com.miniTaskManager.task_service.entity.Team;
import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import com.miniTaskManager.task_service.exception.BusinessException;
import com.miniTaskManager.task_service.repository.TaskRepository;
import com.miniTaskManager.task_service.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private TaskService taskService;

    private Team team;

    @BeforeEach
    void setUp() {
        team = new Team();
        team.setId(1L);
        team.setNome("Time de Desenvolvimento");
    }

    @Test
    void testCriarTarefaComSucesso() {
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setTitulo("Implementar testes");
        dto.setStatus(StatusTask.PENDENTE);
        dto.setPrioridade(PriorityTask.ALTA);
        dto.setTimeId(1L);

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        
        Task savedTask = new Task();
        savedTask.setId(1L);
        savedTask.setTitulo("Implementar testes");
        savedTask.setStatus(StatusTask.PENDENTE);
        savedTask.setPrioridade(PriorityTask.ALTA);
        savedTask.setTime(team);
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskResponseDTO response = taskService.criarTarefa(dto);

        assertNotNull(response);
        assertEquals("Implementar testes", response.getTitulo());
        assertEquals(StatusTask.PENDENTE, response.getStatus());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void testErroAoConcluirTarefaSemResponsavel() {
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setTitulo("Finalizar API");
        dto.setStatus(StatusTask.CONCLUIDA);
        dto.setPrioridade(PriorityTask.ALTA);
        dto.setTimeId(1L);
        dto.setResponsavel(null); // Sem responsável

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.criarTarefa(dto);
        });

        assertEquals("Uma tarefa só pode ser marcada como 'Concluída' se tiver um responsável atribuído.", exception.getMessage());
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void testBuscarPorIdComSucesso() {
        Task task = new Task();
        task.setId(1L);
        task.setTitulo("Tarefa Existente");
        task.setStatus(StatusTask.EM_ANDAMENTO);
        task.setPrioridade(PriorityTask.MEDIA);
        task.setTime(team);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        TaskResponseDTO response = taskService.buscarPorId(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Tarefa Existente", response.getTitulo());
    }

    @Test
    void testBuscarPorIdNaoEncontrado() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        com.miniTaskManager.task_service.exception.ResourceNotFoundException exception = assertThrows(
                com.miniTaskManager.task_service.exception.ResourceNotFoundException.class, 
                () -> taskService.buscarPorId(99L)
        );

        assertEquals("Tarefa não encontrada com o ID: 99", exception.getMessage());
    }

    @Test
    void testDeletarTarefaComSucesso() {
        when(taskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(taskRepository).deleteById(1L);

        assertDoesNotThrow(() -> taskService.deletarTarefa(1L));
        verify(taskRepository, times(1)).deleteById(1L);
    }
}
