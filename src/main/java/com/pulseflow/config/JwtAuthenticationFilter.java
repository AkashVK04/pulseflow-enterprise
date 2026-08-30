package com.pulseflow.config;

import com.pulseflow.model.User;
import com.pulseflow.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String userId = tokenProvider.getUserIdFromToken(jwt);
                Optional<User> userOpt = userRepository.findById(userId);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    String roleName = resolveRoleAuthority(user);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(roleName))
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRoleAuthority(User user) {
        if (user.getRole() == null) return "ROLE_STAFF";
        
        String roleId = user.getRole().getId();
        if (roleId != null && roleId.startsWith("ROLE_")) {
            return roleId;
        }

        String name = user.getRole().getName();
        if (name != null) {
            if (name.equalsIgnoreCase("Super Admin")) return "ROLE_SUPER_ADMIN";
            if (name.equalsIgnoreCase("Workspace Admin")) return "ROLE_WORKSPACE_ADMIN";
            if (name.equalsIgnoreCase("Project Manager") || name.equalsIgnoreCase("PM")) return "ROLE_PM";
            if (name.equalsIgnoreCase("Senior Engineer")) return "ROLE_SENIOR_ENG";
            if (name.equalsIgnoreCase("Staff Contributor")) return "ROLE_STAFF";
            if (name.equalsIgnoreCase("Guest")) return "ROLE_GUEST";
        }

        return "ROLE_" + (name != null ? name.toUpperCase().replace(" ", "_") : "STAFF");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
