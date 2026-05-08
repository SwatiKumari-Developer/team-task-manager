package com.marketplace.nft.repository;

import com.marketplace.nft.model.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);

    void deleteByToken(String token);
}
