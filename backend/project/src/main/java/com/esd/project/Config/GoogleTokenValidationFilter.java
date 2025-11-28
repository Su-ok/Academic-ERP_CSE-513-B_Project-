package com.esd.project.Config;

import com.esd.project.Service.GoogleTokenValidationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class GoogleTokenValidationFilter extends OncePerRequestFilter {

    private final GoogleTokenValidationService tokenValidationService;

    public GoogleTokenValidationFilter(GoogleTokenValidationService tokenValidationService) {
        this.tokenValidationService = tokenValidationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Skip token validation for OAuth2 endpoints and public endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/oauth2/") || 
            path.startsWith("/login/") || 
            path.equals("/error") ||
            path.equals("/auth/user")) { // Allow /auth/user to use session-based auth as fallback
            filterChain.doFilter(request, response);
            return;
        }

        // Get token from Authorization header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Check if it's our custom token format (starts with "oauth_")
            if (token.startsWith("oauth_")) {
                // This is our custom token format, skip Google validation
                // Allow session-based authentication to handle it
                // You can add custom token validation here if needed
                System.out.println("Custom token format detected, skipping Google validation");
                filterChain.doFilter(request, response);
                return;
            }
            
            // Check if it looks like a Google access token (starts with "ya29." or "1//")
            // Google access tokens typically start with "ya29." for OAuth2
            boolean isGoogleToken = token.startsWith("ya29.") || 
                                   token.startsWith("1//") || 
                                   token.length() > 100; // Google tokens are usually long
            
            if (isGoogleToken) {
                // Validate Google token
                System.out.println("Validating Google access token...");
                GoogleTokenValidationService.TokenInfo tokenInfo = tokenValidationService.validateToken(token);
                
                if (tokenInfo.isValid()) {
                    // Token is valid, set authentication
                    String email = tokenInfo.getEmail();
                    
                    if (email != null) {
                        // Create authentication object
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                email, null, new ArrayList<>()
                            );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Set authentication in security context
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        System.out.println("Google token validated successfully for: " + email);
                    }
                } else {
                    // Token is invalid or expired
                    System.out.println("Google token validation failed: " + tokenInfo.getMessage());
                    
                    // Return 401 Unauthorized
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\":\"Invalid or expired token\",\"message\":\"" + 
                        tokenInfo.getMessage() + "\"}"
                    );
                    return;
                }
            } else {
                // Unknown token format, allow through (might be handled by session auth)
                System.out.println("Unknown token format, allowing through for session-based auth");
            }
        }
        // If no Authorization header, continue (session-based auth might handle it)
        
        filterChain.doFilter(request, response);
    }
}

