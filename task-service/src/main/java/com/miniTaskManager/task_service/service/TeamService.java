package com.miniTaskManager.task_service.service;

import com.miniTaskManager.task_service.dto.TeamRequestDTO;
import com.miniTaskManager.task_service.entity.Team;
import com.miniTaskManager.task_service.exception.BusinessException;
import com.miniTaskManager.task_service.exception.ResourceNotFoundException;
import com.miniTaskManager.task_service.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    @Transactional
    public Team criarTime(TeamRequestDTO dto) {
        if (teamRepository.existsByNome(dto.getNome())) {
            throw new BusinessException("Já existe um time cadastrado com este nome.");
        }

        Team team = Team.builder()
                .nome(dto.getNome())
                .membros(dto.getMembros())
                .build();

        return teamRepository.save(team);
    }

    @Transactional(readOnly = true)
    public List<Team> listarTodos() {
        return teamRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Team buscarPorId(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time não encontrado com o ID: " + id));
    }
}