package com.financial.platform.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    private LocalDate dateOfBirth;

    @Size(max = 500)
    private String profileImageUrl;

    @Size(max = 10)
    private String currency;

    @Size(max = 50)
    private String timezone;

    @Size(max = 10)
    private String language;
}