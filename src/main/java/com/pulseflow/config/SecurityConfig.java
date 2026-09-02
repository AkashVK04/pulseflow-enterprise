package com.pulseflow.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public Auth Endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/google").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                // Documentation & System Telemetry
                .requestMatchers(
                    "/v3/api-docs",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/api-docs",
                    "/api-docs/**",
                    "/actuator/**"
                ).permitAll()
                
                // Admin Feature Flags & Background Jobs
                .requestMatchers(HttpMethod.GET, "/api/admin/feature-flags").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/feature-flags/**").hasAuthority("ROLE_SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/background-jobs").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/admin/background-jobs/**").hasAuthority("ROLE_SUPER_ADMIN")
                
                // User Administration
                .requestMatchers("/api/admin/users/**").hasAuthority("ROLE_SUPER_ADMIN")
                
                // Audit Logs & Reports
                .requestMatchers("/api/audit-logs/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN")
                .requestMatchers("/api/reports/audit/csv").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN")
                .requestMatchers("/api/reports/tasks/csv").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM")

                // Project Management
                .requestMatchers(HttpMethod.POST, "/api/projects/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM")
                .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM")

                // Sprint Management
                .requestMatchers(HttpMethod.POST, "/api/sprints/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_PM")

                // Task Operations
                .requestMatchers(HttpMethod.POST, "/api/tasks/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG", "ROLE_STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/tasks/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG", "ROLE_STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_PM")

                // Time Entry Operations (Excludes ROLE_GUEST)
                .requestMatchers(HttpMethod.POST, "/api/time-entries/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG", "ROLE_STAFF")

                // AI Features (Excludes ROLE_GUEST)
                .requestMatchers(HttpMethod.POST, "/api/ai/decompose").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG")
                .requestMatchers(HttpMethod.POST, "/api/ai/risk-audit").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM")
                .requestMatchers(HttpMethod.POST, "/api/ai/standup").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG", "ROLE_STAFF")
                .requestMatchers(HttpMethod.POST, "/api/ai/chat").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_WORKSPACE_ADMIN", "ROLE_PM", "ROLE_SENIOR_ENG", "ROLE_STAFF")

                // All other /api/** endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
