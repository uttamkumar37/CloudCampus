package com.cloudcampus.intelligence.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AutomationRuleRepository extends JpaRepository<AutomationRule, String>, JpaSpecificationExecutor<AutomationRule> {
}
