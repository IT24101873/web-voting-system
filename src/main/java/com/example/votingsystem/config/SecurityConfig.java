//package com.example.votingsystem.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.provisioning.InMemoryUserDetailsManager;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless REST APIs
//                .authorizeHttpRequests(authorize -> authorize
//                        .requestMatchers("/api/auth/**").permitAll() // Allow public access to auth endpoints
//                        .requestMatchers("/api/categories/**", "/api/nominees/**").hasRole("ADMIN")
//                        .requestMatchers("/api/voting/**").hasRole("STUDENT")
//                        .requestMatchers("/api/voting-settings/**").hasRole("ADMIN")
//                        .anyRequest().authenticated()
//                )
//                .formLogin(AbstractHttpConfigurer::disable) // Disable default form login
//                .httpBasic(AbstractHttpConfigurer::disable) // Disable HTTP Basic for now (optional, enable if needed)
//                .httpBasic(httpBasic -> httpBasic.authenticationEntryPoint((request, response, authException) ->
//                        response.sendError(401, "Unauthorized")));
//        return http.build();
//    }
//
//    @Bean
//    public UserDetailsService userDetailsService() {
//        // In-memory users for testing (replace with database users via AuthService later)
//        UserDetails student = User.withUsername("student1")
//                .password(passwordEncoder().encode("password"))
//                .roles("STUDENT")
//                .build();
//        UserDetails admin = User.withUsername("admin1")
//                .password(passwordEncoder().encode("adminpass"))
//                .roles("ADMIN")
//                .build();
//        return new InMemoryUserDetailsManager(student, admin);
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//}

package com.example.votingsystem.config;

import com.example.votingsystem.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // NEW IMPORT
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // NEW: Enables @PreAuthorize
public class SecurityConfig {

    private final UserRepository userRepository; // Inject UserRepository

    @Autowired
    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/categories/**", "/api/nominees/**").hasRole("ADMIN")
                        .requestMatchers("/api/voting/settings/**").hasRole("ADMIN") // MOVED UP: Specific before general
                        .requestMatchers("/api/voting/**").hasRole("STUDENT") // Now after settings
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(httpBasic -> httpBasic.authenticationEntryPoint((request, response, authException) ->
                        response.sendError(401, "Unauthorized")))
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(403, "Access Denied")));
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            System.out.println("Loading user: " + username);
            com.example.votingsystem.auth.User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            System.out.println("User: " + user.getUsername() + ", Role: " + user.getRole() + ", Authorities: " + user.getAuthorities() + ", Enabled: " + user.isEnabled());
            return user;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}