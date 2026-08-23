package com.pulseflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PulseFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseFlowApplication.class, args);
    }
}
