package com.example.votingsystem.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
// If you need AntPathRequestMatcher, uncomment next line:
// import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        // allow our API + H2 console to bypass CSRF
                        .ignoringRequestMatchers("/api/**", "/h2/**")
                )
                // H2 console needs frames
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/h2/**").permitAll()
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}
