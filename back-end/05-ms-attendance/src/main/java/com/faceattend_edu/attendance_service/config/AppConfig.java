package com.faceattend_edu.attendance_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class AppConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/api/v1/health", "/api/health",
                                 "/actuator/**", "/v3/api-docs/**", "/swagger-ui/**",
                                 "/api/v1/**", "/attendance-records/**", "/justification-types/**", "/justifications/**", "/supporting-documents/**").permitAll()
                .anyRequest().permitAll()
            )
            .httpBasic(withDefaults());
        return http.build();
    }
}
