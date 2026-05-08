package com.marketplace.nft.service;

import com.marketplace.nft.dto.AuthDtos.AuthResponse;
import com.marketplace.nft.dto.AuthDtos.LoginRequest;
import com.marketplace.nft.dto.AuthDtos.RegisterRequest;
import com.marketplace.nft.dto.AuthDtos.UserResponse;
import com.marketplace.nft.exception.ApiException;
import com.marketplace.nft.model.AuthToken;
import com.marketplace.nft.model.User;
import com.marketplace.nft.repository.AuthTokenRepository;
import com.marketplace.nft.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final AuthTokenRepository tokens;
    private final PasswordService passwords;

    public AuthService(UserRepository users, AuthTokenRepository tokens, PasswordService passwords) {
        this.users = users;
        this.tokens = tokens;
        this.passwords = passwords;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (users.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username is already taken");
        }

        String salt = passwords.newSalt();
        User user = users.save(new User(request.username(), request.email(), passwords.hash(request.password(), salt), salt));
        return createSession(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwords.matches(request.password(), user.getSalt(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return createSession(user);
    }

    public User requireUser(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }

        String rawToken = authorizationHeader.substring("Bearer ".length()).trim();
        AuthToken token = tokens.findByToken(rawToken)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token expired");
        }
        return token.getUser();
    }

    @Transactional
    public void logout(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            tokens.deleteByToken(authorizationHeader.substring("Bearer ".length()).trim());
        }
    }

    private AuthResponse createSession(User user) {
        AuthToken token = tokens.save(new AuthToken(UUID.randomUUID().toString(), user, Instant.now().plus(12, ChronoUnit.HOURS)));
        return new AuthResponse(token.getToken(), toResponse(user));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
