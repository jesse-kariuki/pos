package Retail.POS.config;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtValidator extends OncePerRequestFilter {



    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String jwt = request.getHeader(JwtConstant.JWT_HEADER);

        // 1. Check if the header exists and starts with Bearer
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.JWT_SECRET.getBytes());
                Claims claims = Jwts.parserBuilder() // Use parserBuilder for modern JJWT versions
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));

                List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
                Authentication auth = new UsernamePasswordAuthenticationToken(email, null, auths);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                // Instead of throwing, you can also send a 401 directly
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid Token...");
                return;
            }
        }

        // 2. Always continue the chain for requests without tokens (like login)
        filterChain.doFilter(request, response);
    }

    // 3. Skip this filter entirely for login/register endpoints
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        // Skip JWT validation for:
        // 1. Auth endpoints (public)
        // 2. Orders endpoints (public - handled by Spring Security, not JWT)
        // 3. Scan endpoints (public)
        // 4. Purchases endpoints (public)
        // 5. Reports endpoints (public)
        // 6. Product search GET endpoints (public)
        // 7. ALL OPTIONS requests (CORS Preflight)
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/orders") ||
               path.startsWith("/api/scan") ||
               path.startsWith("/api/purchases") ||
               path.startsWith("/api/reports") ||
               (path.startsWith("/api/products/search") && request.getMethod().equals("GET")) ||
               request.getMethod().equals("OPTIONS");
    }
}