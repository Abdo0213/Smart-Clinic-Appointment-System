package com.clinic.api_gateway.filter;

import com.clinic.api_gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        super(Config.class);
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (validator.isSecured.test(exchange.getRequest())) {
                // header contains token or not
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authorization header");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                } else {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization header format");
                }

                try {
                    // Validating the token
                    if (!jwtUtil.isTokenValid(authHeader)) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to application");
                    }

                    // Check roles if required
                    if (config.getRoles() != null && !config.getRoles().isEmpty()) {
                        List<String> userRoles = jwtUtil.getRoles(authHeader);
                        boolean hasRole = config.getRoles().stream()
                                .anyMatch(role -> userRoles.contains(role) || userRoles.contains("Admin")); // Admin can access everything
                        if (!hasRole) {
                            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Insufficient permissions");
                        }
                    }

                    // Inject X-User-Id to the downstream services
                    String userId = jwtUtil.getUserId(authHeader);
                    if (userId != null) {
                        exchange = exchange.mutate()
                                .request(exchange.getRequest().mutate()
                                        .header("X-User-Id", userId)
                                        .build())
                                .build();
                    }

                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to application");
                }
            }
            return chain.filter(exchange);
        };
    }

    public static class Config {
        private List<String> roles;

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }
}
