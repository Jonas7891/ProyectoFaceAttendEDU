package com.faceattend_edu.scheduling_service.infrastructure.persistence.entity;
import jakarta.persistence.*;
@Entity @Table(name="schedule_block", schema="scheduling",
  uniqueConstraints={@UniqueConstraint(name="uq_block_environment_slot", columnNames={"environment_id","day_of_week","starts_at"}),
                    @UniqueConstraint(name="uq_block_instructor_slot", columnNames={"instructor_actor_id","day_of_week","starts_at"})})
public class ScheduleBlockJpaEntity { @Id private Long scheduleBlockId; }
