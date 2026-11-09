package com.faceattend_edu.scheduling_service.domain.model;

/** Optional criteria for listing schedule blocks; a null field does not filter. */
public record ScheduleBlockFilter(Long cohortId, Integer environmentId, Long instructorActorId, Integer courseId) {

    public static final ScheduleBlockFilter NONE = new ScheduleBlockFilter(null, null, null, null);

    public static ScheduleBlockFilter byCohort(Long cohortId) {
        return new ScheduleBlockFilter(cohortId, null, null, null);
    }

    public static ScheduleBlockFilter byEnvironment(Integer environmentId) {
        return new ScheduleBlockFilter(null, environmentId, null, null);
    }

    public static ScheduleBlockFilter byInstructor(Long instructorActorId) {
        return new ScheduleBlockFilter(null, null, instructorActorId, null);
    }
}
