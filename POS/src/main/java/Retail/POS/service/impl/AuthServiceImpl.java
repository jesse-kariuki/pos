package Retail.POS.service.impl;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import Retail.POS.config.JwtProvider;
import Retail.POS.exceptions.UserException;
import Retail.POS.mapper.UserMapper;
import Retail.POS.models.User;
import Retail.POS.payload.dto.UserDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.repository.UserRepository;
import Retail.POS.service.AuthService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserImplementation customUserImplementation;

    @Override
    public ApiResponse signup(UserDto userDto) throws UserException {
        User user = userRepository.findByEmail(userDto.getEmail());
        if (user != null) {
            throw new UserException("User with email " + userDto.getEmail() + " already exists");
        }
        // if(userDto.getRole().equals(UserRole.ROLE_ADMIN)){
        // throw new UserException("Cannot register with ADMIN role");
        // }
        User newUser = new User();
        newUser.setEmail(userDto.getEmail());
        newUser.setFullName(userDto.getFullName());
        newUser.setPhone(userDto.getPhone());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setRole(userDto.getRole());
        newUser.setLastLogin(LocalDateTime.now());
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(newUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDto.getEmail(),
                userDto.getPassword());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtProvider.generateToken(authentication);
        ApiResponse apiResponse = new ApiResponse(true, "Successfully registered", UserMapper.toDto(savedUser));
        apiResponse.setData(Map.of("jwt", jwt));
        return apiResponse;
    }

    @Override
    public ApiResponse login(UserDto userDto) throws UserException {
        String email = userDto.getEmail();
        String password = userDto.getPassword();

        Authentication authentication = authenticate(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String jwt = jwtProvider.generateToken(authentication);
        User user = userRepository.findByEmail(email);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        ApiResponse apiResponse = new ApiResponse(true, "Login Successful", UserMapper.toDto(user));
        apiResponse.setData(Map.of("jwt", jwt));
        return apiResponse;
    }

    private Authentication authenticate(String email, String password) throws UserException {

        UserDetails userDetails = customUserImplementation.loadUserByUsername(email);
        if (userDetails == null) {
            throw new UserException("User with email " + email + " not found");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new UserException("Invalid password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

    }
}
