package com.cloudcampus.operations.homework;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HomeworkRepository extends JpaRepository<Homework, String> {

    List<Homework> findBySchoolIdOrderByDueDateAscCreatedAtAsc(String schoolId);

    List<Homework> findBySchoolIdAndClassLevelIdAndSubjectIdOrderByDueDateAscCreatedAtAsc(
            String schoolId,
            String classLevelId,
            String subjectId
    );

    @Query("""
            select homework from Homework homework
            where homework.school.id = :schoolId
              and homework.classLevel.id = :classLevelId
              and (homework.section is null or (:sectionId is not null and homework.section.id = :sectionId))
              and homework.status = com.cloudcampus.operations.homework.HomeworkStatus.PUBLISHED
            order by homework.dueDate asc, homework.createdAt asc
            """)
    List<Homework> findVisibleForStudent(
            @Param("schoolId") String schoolId,
            @Param("classLevelId") String classLevelId,
            @Param("sectionId") String sectionId
    );
}
