import BaseModel from '../BaseModel';

export default class ScheduleBlock extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.scheduleBlockId = data.schedule_block_id || null;
    this.cohortId = data.cohort_id || null;
    this.courseId = data.course_id || null;
    this.environmentId = data.environment_id || null;
    this.instructorActorId = data.instructor_actor_id || null;
    this.dayOfWeek = data.day_of_week || null;
    this.startsAt = data.starts_at || null;
    this.endsAt = data.ends_at || null;
  }

  get dayName() {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[this.dayOfWeek] || '';
  }

  static fromApi(data) {
    if (!data) return null;
    return new ScheduleBlock(data);
  }

  toApi() {
    return {
      ...super.toApi(),
      schedule_block_id: this.scheduleBlockId,
      cohort_id: this.cohortId,
      course_id: this.courseId,
      environment_id: this.environmentId,
      instructor_actor_id: this.instructorActorId,
      day_of_week: this.dayOfWeek,
      starts_at: this.startsAt,
      ends_at: this.endsAt,
    };
  }
}
