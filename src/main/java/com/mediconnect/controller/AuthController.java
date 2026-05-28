package com.mediconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Simple demo auth — replace with real DB auth later
        if ("admin@mediconnect.com".equals(email) && "admin123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            Map<String, String> user = new HashMap<>();
            user.put("email", email);
            user.put("role", "ADMIN");
            user.put("name", "Admin User");
            response.put("user", user);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
}