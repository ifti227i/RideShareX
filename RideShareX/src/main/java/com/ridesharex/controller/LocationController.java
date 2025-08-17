package com.ridesharex.controller;

import com.ridesharex.model.SavedLocation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @GetMapping("/saved")
    public ResponseEntity<List<SavedLocation>> getSavedLocations() {
        // TODO: Implement saved locations retrieval
        return ResponseEntity.ok().build();
    }

    @PostMapping("/save")
    public ResponseEntity<SavedLocation> saveLocation(@RequestBody SavedLocation location) {
        // TODO: Implement location saving
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/saved/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id) {
        // TODO: Implement location deletion
        return ResponseEntity.ok().build();
    }
}
