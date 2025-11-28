package com.esd.project.Mapper;

import com.esd.project.DTO.Response.UserResponse;
import com.esd.project.Entity.Employee;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public class UserMapper {
    
    public static UserResponse toResponse(OAuth2User oauth2User) {
        if (oauth2User == null) {
            return null;
        }
        
        return new UserResponse(
                oauth2User.getAttribute("name") != null ? oauth2User.getAttribute("name").toString() : "",
                oauth2User.getAttribute("email") != null ? oauth2User.getAttribute("email").toString() : "",
                oauth2User.getAttribute("picture") != null ? oauth2User.getAttribute("picture").toString() : ""
        );
    }
    
    public static UserResponse toResponse(String name, String email, String picture) {
        return new UserResponse(
                name != null ? name : "",
                email != null ? email : "",
                picture != null ? picture : ""
        );
    }
    
    public static UserResponse toResponse(Employee employee) {
        if (employee == null) {
            return null;
        }
        
        String fullName = employee.getFirstName() + " " + employee.getLastName();
        return new UserResponse(
                fullName,
                employee.getEmail(),
                employee.getPhotoPath()
        );
    }
    
    public static void mapGoogleUserToEmployee(Map<String, Object> googleUser, Employee emp) {
        if (googleUser == null || emp == null) {
            return;
        }
        
        emp.setEmail((String) googleUser.get("email"));
        emp.setFirstName((String) googleUser.get("given_name"));
        emp.setLastName((String) googleUser.get("family_name"));
        emp.setPhotoPath((String) googleUser.get("picture"));
    }
}

