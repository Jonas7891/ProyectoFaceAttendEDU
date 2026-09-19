package com.faceattend_edu.scheduling_service.domain.model;
import java.time.LocalTime;
public class ScheduleBlock {
    private Long scheduleBlockId; private Long cohortId; private Integer courseId;
    private Integer environmentId; private Long instructorActorId;
    private Short dayOfWeek; private LocalTime startsAt; private LocalTime endsAt;
}
