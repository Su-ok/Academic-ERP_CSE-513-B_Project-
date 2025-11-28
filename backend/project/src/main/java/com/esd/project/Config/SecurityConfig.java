package com.esd.project.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final GoogleTokenValidationFilter googleTokenValidationFilter;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler,
                        GoogleTokenValidationFilter googleTokenValidationFilter) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.googleTokenValidationFilter = googleTokenValidationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Add Google token validation filter before other filters
                .addFilterBefore(googleTokenValidationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
                        .requestMatchers("/auth/user").authenticated()
                        .anyRequest().authenticated()
                ).oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl("http://localhost:5173/login?error=true")
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
