package com.miniTaskManager.task_service.entity;

import com.miniTaskManager.task_service.enums.PriorityTask;
import com.miniTaskManager.task_service.enums.StatusTask;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTask status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityTask prioridade;

    @Column(name = "responsavel_id")
    private Long responsavel;

    @ManyToOne
    @JoinColumn(name = "time_id", nullable = false)
    private Team time;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    private LocalDate dataTermino;
}