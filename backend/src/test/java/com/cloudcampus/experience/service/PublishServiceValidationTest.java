package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsitePublishSnapshot;
import com.cloudcampus.experience.entity.WebsiteRollbackAuditLog;
import com.cloudcampus.experience.entity.WebsiteTheme;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePublishSnapshotRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteRollbackAuditLogRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.cloudcampus.experience.service.WebsitePublishValidationServiceTest.navigation;
import static com.cloudcampus.experience.service.WebsitePublishValidationServiceTest.page;
import static com.cloudcampus.experience.service.WebsitePublishValidationServiceTest.theme;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublishServiceValidationTest {

    @Mock ExperienceWebsitePageRepository pageRepository;
    @Mock ExperienceWebsiteSectionRepository sectionRepository;
    @Mock ExperienceWebsiteThemeRepository themeRepository;
    @Mock ExperienceWebsiteNavigationRepository navigationRepository;
    @Mock ExperienceWebsiteSeoSettingsRepository seoSettingsRepository;
    @Mock ExperienceWebsitePublishSnapshotRepository snapshotRepository;
    @Mock ExperienceWebsiteRollbackAuditLogRepository rollbackAuditLogRepository;
    @Mock WebsiteAuditTimelineService auditTimelineService;

    private final WebsitePublishValidationService publishValidationService = new WebsitePublishValidationService();

    @Test
    void publishAll_whenPreflightFails_doesNotCreateSnapshotOrPublishEntities() {
        PublishService service = service();
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus"));
        WebsiteTheme theme = theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"));
        WebsiteNavigation navigation = navigation("Home", "/", "SAME_TAB", "primary", true);

        when(pageRepository.findByDeletedFalseOrderByUpdatedAtDesc()).thenReturn(List.of(page));
        when(sectionRepository.findAll()).thenReturn(List.of());
        when(themeRepository.findAll()).thenReturn(List.of(theme));
        when(navigationRepository.findAll()).thenReturn(List.of(navigation));
        when(seoSettingsRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> service.publishAll(UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("seoJson.description");

        verify(snapshotRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(pageRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(sectionRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(themeRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(navigationRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(seoSettingsRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rollback_whenSnapshotSelected_restoresPublishedAndDraftStatesAndWritesAudit() {
        PublishService service = service();
        UUID actorId = UUID.randomUUID();
        WebsitePage shouldPublish = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));
        WebsitePage shouldUnpublish = page("features", "features", Map.of("title", "Features", "description", "Feature list"));
        shouldUnpublish.publish();

        WebsitePublishSnapshot snapshot = WebsitePublishSnapshot.create(
                "release-previous",
                Map.of(
                        "pages", Map.of(
                                shouldPublish.getId().toString(), true,
                                shouldUnpublish.getId().toString(), false
                        ),
                        "sections", Map.of(),
                        "themes", Map.of(),
                        "navigation", Map.of(),
                        "seo", Map.of()
                ),
                UUID.randomUUID()
        );
        ReflectionTestUtils.setField(snapshot, "id", UUID.randomUUID());

        when(snapshotRepository.findById(snapshot.getId())).thenReturn(java.util.Optional.of(snapshot));
        when(pageRepository.findAll()).thenReturn(List.of(shouldPublish, shouldUnpublish));
        when(sectionRepository.findAll()).thenReturn(List.of());
        when(themeRepository.findAll()).thenReturn(List.of());
        when(navigationRepository.findAll()).thenReturn(List.of());
        when(seoSettingsRepository.findAll()).thenReturn(List.of());

        service.rollback(snapshot.getId(), actorId);

        verify(pageRepository).save(shouldPublish);
        verify(pageRepository).save(shouldUnpublish);
        org.assertj.core.api.Assertions.assertThat(shouldPublish.isPublished()).isTrue();
        org.assertj.core.api.Assertions.assertThat(shouldUnpublish.isPublished()).isFalse();

        ArgumentCaptor<WebsiteRollbackAuditLog> auditCaptor = ArgumentCaptor.forClass(WebsiteRollbackAuditLog.class);
        verify(rollbackAuditLogRepository).save(auditCaptor.capture());
        org.assertj.core.api.Assertions.assertThat(auditCaptor.getValue().getSnapshotId()).isEqualTo(snapshot.getId());
        org.assertj.core.api.Assertions.assertThat(auditCaptor.getValue().getActorId()).isEqualTo(actorId);
        org.assertj.core.api.Assertions.assertThat(auditCaptor.getValue().getRestoredCountsJson())
                .containsEntry("pagesChanged", 2);
        verify(auditTimelineService).record(
                org.mockito.ArgumentMatchers.eq("WEBSITE_ROLLED_BACK"),
                org.mockito.ArgumentMatchers.eq("ROLLBACK"),
                org.mockito.ArgumentMatchers.eq(snapshot.getId()),
                org.mockito.ArgumentMatchers.eq(snapshot.getVersionLabel()),
                org.mockito.ArgumentMatchers.eq(actorId),
                org.mockito.ArgumentMatchers.any()
        );
        verify(snapshotRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    private PublishService service() {
        return new PublishService(
                pageRepository,
                sectionRepository,
                themeRepository,
                navigationRepository,
                seoSettingsRepository,
                snapshotRepository,
                rollbackAuditLogRepository,
                publishValidationService,
                auditTimelineService
        );
    }
}
