package com.mediconnect.controller;

import com.mediconnect.model.User;
import com.mediconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ─── Login ───────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User u = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", u.getId());
            userMap.put("name", u.getName());
            userMap.put("email", u.getEmail());
            userMap.put("role", u.getRole());
            userMap.put("avatar", u.getAvatar());
            response.put("user", userMap);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    // ─── Update Profile ───────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam(required = false) String newEmail,
            @RequestParam(required = false) MultipartFile avatar) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setName(name);
        if (newEmail != null && !newEmail.isEmpty()) {
            user.setEmail(newEmail);
        }

        if (avatar != null && !avatar.isEmpty()) {
            try {
                String uploadsDir = "uploads/avatars/";
                new File(uploadsDir).mkdirs();
                String filename = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
                avatar.transferTo(new File(uploadsDir + filename));
                user.setAvatar("/avatars/" + filename);
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Avatar upload failed"));
            }
        }

        userRepository.save(user);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("avatar", user.getAvatar());
        return ResponseEntity.ok(userMap);
    }

    // ─── Change Password ──────────────────────────────────────
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }

        user.setPassword(newPassword);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}