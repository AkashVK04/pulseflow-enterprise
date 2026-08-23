package com.pulseflow.repository;

import com.pulseflow.model.RefreshToken;
import com.pulseflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUser(User user);
}
