package com.esd.project.Controller;

import com.esd.project.DTO.Response.UserResponse;
import com.esd.project.Mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/user")
    public UserResponse currentUser(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        
        // Try to get from principal first
        if (principal != null) {
            System.out.println("AuthController /user called - Using principal");
            return UserMapper.toResponse(principal);
        }
        
        // Fallback to session OAuth2User object
        OAuth2User oauth2User = (OAuth2User) request.getSession().getAttribute("oauth2User");
        if (oauth2User != null) {
            System.out.println("AuthController /user called - Using session OAuth2User");
            return UserMapper.toResponse(oauth2User);
        }

        // Fallback to direct session attributes
        String email = (String) request.getSession().getAttribute("userEmail");
        String name = (String) request.getSession().getAttribute("userName");
        String picture = (String) request.getSession().getAttribute("userPicture");

        if (email != null) {
            System.out.println("AuthController /user called - Using direct session attributes");
            return UserMapper.toResponse(name, email, picture);
        }
        
        System.out.println("AuthController /user called - No user data found");
        return new UserResponse("", "", "");
    }
}

