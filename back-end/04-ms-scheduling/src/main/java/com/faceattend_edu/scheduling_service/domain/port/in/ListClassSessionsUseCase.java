package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import java.util.List;
public interface ListClassSessionsUseCase {
    /** Sessions matching the filter inside the caller's school; nothing when the caller's school is unknown. */
    List<ClassSession> list(Caller caller, ClassSessionFilter filter);

    /** Every session of one block; a block outside the caller's school answers 404. */
    List<ClassSession> listByBlock(Caller caller, Long scheduleBlockId);
}
