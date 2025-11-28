package com.esd.project.Config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2AuthorizedClientService authorizedClientService;

    public OAuth2SuccessHandler(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        
        // Extract Google access token from OAuth2AuthorizedClientService
        String googleAccessToken = null;
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            String clientRegistrationId = oauth2Token.getAuthorizedClientRegistrationId();
            String principalName = oauth2Token.getName();
            
            // Get the authorized client which contains the access token
            OAuth2AuthorizedClient authorizedClient = 
                authorizedClientService.loadAuthorizedClient(clientRegistrationId, principalName);
            
            if (authorizedClient != null) {
                OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
                if (accessToken != null) {
                    googleAccessToken = accessToken.getTokenValue();
                    System.out.println("Google Access Token retrieved: " + 
                        (googleAccessToken != null ? googleAccessToken.substring(0, Math.min(20, googleAccessToken.length())) + "..." : "null"));
                }
            }
        }
        
        // Option 1: Send Google access token to frontend (for token validation)
        // Option 2: Generate a custom token (current approach)
        // For Google token validation, we'll send the actual Google token
        
        String token;
        if (googleAccessToken != null) {
            // Use Google access token directly for validation
            token = googleAccessToken;
            System.out.println("Using Google access token for validation");
        } else {
            // Fallback to custom token format
            token = "oauth_" + URLEncoder.encode(email, StandardCharsets.UTF_8).replace("@", "_at_");
            System.out.println("Using custom token format (Google token not available)");
        }
        
        System.out.println("OAuth2 Success - Email: " + email + ", Name: " + name);

        // Store user info in session for /auth/user endpoint
        request.getSession().setAttribute("oauth2User", oauth2User);
        request.getSession().setAttribute("userEmail", email);
        request.getSession().setAttribute("userName", name);
        request.getSession().setAttribute("userPicture", picture);
        
        // Store Google access token in session
        if (googleAccessToken != null) {
            request.getSession().setAttribute("googleAccessToken", googleAccessToken);
        }
        
        // Redirect to frontend with token
        // Note: Google access tokens are long-lived but can expire
        // Frontend should handle token refresh or re-authentication
        String redirectUrl = "http://localhost:5173/oauth-callback?token=" + 
            URLEncoder.encode(token, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}

