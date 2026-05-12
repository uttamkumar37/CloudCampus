package com.cloudcampus.notice.repository;

import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.entity.SchoolNotice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SchoolNoticeRepository extends JpaRepository<SchoolNotice, UUID> {

    @Query("""
           SELECT n FROM SchoolNotice n
           WHERE n.schoolId = :schoolId
             AND (:category IS NULL OR n.category = :category)
             AND (:published IS NULL OR n.published = :published)
           ORDER BY n.priority DESC, n.createdAt DESC
           """)
    Page<SchoolNotice> findFiltered(
            @Param("schoolId")  UUID schoolId,
            @Param("category")  NoticeCategory category,
            @Param("published") Boolean published,
            Pageable pageable);

    Optional<SchoolNotice> findBySchoolIdAndId(UUID schoolId, UUID id);
}
