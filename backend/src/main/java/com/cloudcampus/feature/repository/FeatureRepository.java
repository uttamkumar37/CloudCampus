package com.cloudcampus.feature.repository;

import com.cloudcampus.feature.entity.Feature;
import com.cloudcampus.feature.entity.FeatureType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeatureRepository extends JpaRepository<Feature, String> {

    List<Feature> findAllByType(FeatureType type);
}
