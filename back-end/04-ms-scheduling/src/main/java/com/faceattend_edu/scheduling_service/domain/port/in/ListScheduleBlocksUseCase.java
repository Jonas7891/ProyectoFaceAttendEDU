package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import java.util.List;
public interface ListScheduleBlocksUseCase {
    /** Blocks matching the filter inside the caller's school; nothing when the caller's school is unknown. */
    List<ScheduleBlock> list(Caller caller, ScheduleBlockFilter filter);
}
