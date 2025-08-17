package com.ridesharex.model;

import javax.persistence.*;
import lombok.Data;

@Entity
@Data
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String type; // CARD, MOBILE_BANKING, etc.
    private String lastFourDigits;
    private String holderName;
    private boolean isDefault;
    private String provider; // bKash, Nagad, Visa, etc.

    // Encrypted payment details would be stored securely
    private String encryptedDetails;
}
