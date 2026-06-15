package mth.controller;

import mth.model.Application;
import mth.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/applications")
    public List<Application> getApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/applications/user/{userId}")
    public List<Application> getApplicationsByUser(@PathVariable String userId) {
        return applicationService.getApplicationsByUserId(userId);
    }

    @PostMapping("/applications")
    public ResponseEntity<?> applyJob(@RequestBody Application application) {
        try {
            Application saved = applicationService.applyForJob(application);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/applications/{id}")
    public ResponseEntity<Application> updateApplicationStatus(@PathVariable String id, @RequestBody Application application) {
        return applicationService.updateStatus(id, application.getStatus())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> withdrawApplication(@PathVariable String id) {
        if (applicationService.withdrawApplication(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
