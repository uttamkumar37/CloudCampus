package com.cloudcampus.operations.timetable;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, String> {

    List<TimetableEntry> findBySchoolIdOrderByWeekdayAscStartTimeAsc(String schoolId);
}
