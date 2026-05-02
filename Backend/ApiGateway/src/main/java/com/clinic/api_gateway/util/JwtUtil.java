package com.clinic.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            Date expiration = claims.getExpiration();
            if (expiration.before(new Date())) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<String> getRoles(String token) {
        Claims claims = getAllClaimsFromToken(token);
        // Extracting roles based on .NET Identity format.
        // It's often "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        // or just "role" or "roles"
        Object rolesObj = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        if (rolesObj == null) {
            rolesObj = claims.get("role");
        }
        if (rolesObj == null) {
            rolesObj = claims.get("roles");
        }

        if (rolesObj instanceof List) {
            return (List<String>) rolesObj;
        } else if (rolesObj instanceof String) {
            return List.of((String) rolesObj);
        }
        return List.of();
    }
}
