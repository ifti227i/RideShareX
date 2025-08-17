package com.ridesharex.model;

import javax.persistence.*;
import lombok.Data;

@Entity
@Data
public class SavedLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String name;
    private Double latitude;
    private Double longitude;
    private String address;
    private String type; // home, work, other
}
