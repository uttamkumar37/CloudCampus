package com.cloudcampus.common.health;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SystemReadinessController.class)
class SystemReadinessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void readinessReportsScaffoldStatus() throws Exception {
        mockMvc.perform(get("/v1/system/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("cloudcampus-backend"))
                .andExpect(jsonPath("$.mode").value("scaffold"))
                .andExpect(jsonPath("$.checkedAt", notNullValue()));
    }
}
