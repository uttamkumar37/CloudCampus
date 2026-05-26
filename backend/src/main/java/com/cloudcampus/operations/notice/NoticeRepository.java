package com.cloudcampus.operations.notice;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, String> {

    List<Notice> findBySchoolIdOrderByCreatedAtDesc(String schoolId);

    List<Notice> findBySchoolIdInAndStatusAndAudienceInOrderByPublishedAtDescCreatedAtDesc(
            Collection<String> schoolIds,
            NoticeStatus status,
            Collection<NoticeAudience> audiences
    );

    @Query("""
            select notice from Notice notice
            where notice.school.id = :schoolId
              and notice.status = com.cloudcampus.operations.notice.NoticeStatus.PUBLISHED
              and notice.audience in :audiences
              and (notice.classLevel is null or (:classLevelId is not null and notice.classLevel.id = :classLevelId))
              and (notice.section is null or (:sectionId is not null and notice.section.id = :sectionId))
            order by notice.publishedAt desc, notice.createdAt desc
            """)
    List<Notice> findVisibleForStudent(
            @Param("schoolId") String schoolId,
            @Param("classLevelId") String classLevelId,
            @Param("sectionId") String sectionId,
            @Param("audiences") Collection<NoticeAudience> audiences
    );
}
