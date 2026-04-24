package com.campuscloud.timetable.repository;

import com.campuscloud.timetable.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, UUID> {

    List<TimetableSlot> findByClassIdAndSectionIdOrderByDayOfWeekAscStartTimeAsc(UUID classId, UUID sectionId);
}
