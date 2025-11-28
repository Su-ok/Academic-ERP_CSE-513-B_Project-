package com.esd.project.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleTokenValidationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    public GoogleTokenValidationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Validates a Google OAuth2 access token by calling Google's tokeninfo endpoint
     * 
     * @param accessToken The Google access token to validate
     * @return TokenInfo containing user email and validation status
     */
    public TokenInfo validateToken(String accessToken) {
        try {
            // Google's tokeninfo endpoint
            String url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken;
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // Check if token is valid
            if (jsonNode.has("error")) {
                return new TokenInfo(false, null, jsonNode.get("error").asText());
            }
            
            // Verify the token was issued to our client
            String audience = jsonNode.has("audience") ? jsonNode.get("audience").asText() : null;
            if (audience != null && !audience.equals(clientId)) {
                return new TokenInfo(false, null, "Token was not issued to this application");
            }
            
            // Extract user email
            String email = jsonNode.has("email") ? jsonNode.get("email").asText() : null;
            
            // Check expiration
            long expiresIn = jsonNode.has("expires_in") ? jsonNode.get("expires_in").asLong() : 0;
            if (expiresIn <= 0) {
                return new TokenInfo(false, email, "Token has expired");
            }
            
            return new TokenInfo(true, email, "Token is valid");
            
        } catch (Exception e) {
            // Token validation failed
            return new TokenInfo(false, null, "Token validation failed: " + e.getMessage());
        }
    }

    /**
     * Alternative: Validate token using userinfo endpoint
     * This also returns user information
     */
    public UserInfo getUserInfoFromToken(String accessToken) {
        try {
            String url = "https://www.googleapis.com/oauth2/v2/userinfo";
            
            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + accessToken);
            
            // Using RestTemplate with headers
            org.springframework.http.HttpHeaders httpHeaders = new org.springframework.http.HttpHeaders();
            httpHeaders.set("Authorization", "Bearer " + accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(httpHeaders);
            
            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(
                url, 
                org.springframework.http.HttpMethod.GET, 
                entity, 
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                
                String email = jsonNode.has("email") ? jsonNode.get("email").asText() : null;
                String name = jsonNode.has("name") ? jsonNode.get("name").asText() : null;
                String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : null;
                
                return new UserInfo(true, email, name, picture, "Token is valid");
            } else {
                return new UserInfo(false, null, null, null, "Failed to get user info");
            }
            
        } catch (Exception e) {
            return new UserInfo(false, null, null, null, "Token validation failed: " + e.getMessage());
        }
    }

    /**
     * Inner class to hold token validation result
     */
    public static class TokenInfo {
        private final boolean valid;
        private final String email;
        private final String message;

        public TokenInfo(boolean valid, String email, String message) {
            this.valid = valid;
            this.email = email;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getEmail() {
            return email;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Inner class to hold user info from token
     */
    public static class UserInfo {
        private final boolean valid;
        private final String email;
        private final String name;
        private final String picture;
        private final String message;

        public UserInfo(boolean valid, String email, String name, String picture, String message) {
            this.valid = valid;
            this.email = email;
            this.name = name;
            this.picture = picture;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public String getPicture() {
            return picture;
        }

        public String getMessage() {
            return message;
        }
    }
}

