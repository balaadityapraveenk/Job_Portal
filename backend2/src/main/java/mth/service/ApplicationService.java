package mth.service;

import mth.model.Application;
import mth.model.Job;
import mth.model.User;
import mth.repository.ApplicationRepository;
import mth.repository.JobRepository;
import mth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public List<Application> getAllApplications() {
        List<Application> apps = applicationRepository.findAll();
        for (Application app : apps) {
            populateReferences(app);
        }
        return apps;
    }

    public List<Application> getApplicationsByUserId(String userId) {
        List<Application> apps = applicationRepository.findByUserId(userId);
        for (Application app : apps) {
            populateReferences(app);
        }
        return apps;
    }

    private void populateReferences(Application app) {
        if (app.getUserId() != null) {
            userRepository.findById(app.getUserId()).ifPresent(app::setUser);
        }
        if (app.getJobId() != null) {
            jobRepository.findById(app.getJobId()).ifPresent(app::setJob);
        }
    }

    public Application applyForJob(Application application) {
        final String finalUserId;
        if (application.getUser() != null && application.getUser().getId() != null) {
            finalUserId = application.getUser().getId();
        } else if (application.getUserId() != null) {
            finalUserId = application.getUserId();
        } else {
            finalUserId = null;
        }

        if (finalUserId == null) {
            throw new IllegalArgumentException("User ID must be specified");
        }
        if (application.getJob() == null) {
            throw new IllegalArgumentException("Job must be specified");
        }

        User user = userRepository.findById(finalUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + finalUserId));

        Job job = null;
        if (application.getJob().getId() != null) {
            Optional<Job> existingJob = jobRepository.findById(application.getJob().getId());
            if (existingJob.isPresent()) {
                job = existingJob.get();
            }
        }

        if (job == null) {
            // Prevent duplicates by checking if a job with the same company and title already exists
            final String targetCompany = application.getJob().getCompany();
            final String targetTitle = application.getJob().getTitle();
            if (targetCompany != null && targetTitle != null) {
                List<Job> matchedJobs = jobRepository.findAll().stream()
                        .filter(j -> targetCompany.equalsIgnoreCase(j.getCompany())
                                && targetTitle.equalsIgnoreCase(j.getTitle()))
                        .toList();
                if (!matchedJobs.isEmpty()) {
                    job = matchedJobs.get(0);
                }
            }
        }

        if (job == null) {
            Job newJob = application.getJob();
            newJob.setId(null); // Clear ID so database generates it
            job = jobRepository.save(newJob);
        }

        if (applicationRepository.existsByUserIdAndJobId(finalUserId, job.getId())) {
            throw new IllegalArgumentException("You have already applied for this job");
        }

        application.setUserId(finalUserId);
        application.setUser(user);
        application.setJobId(job.getId());
        application.setJob(job);
        application.setAppliedAt(java.time.LocalDateTime.now());
        if (application.getStatus() == null) {
            application.setStatus("Under Review");
        }
        return applicationRepository.save(application);
    }

    public Optional<Application> updateStatus(String id, String status) {
        return applicationRepository.findById(id).map(existing -> {
            existing.setStatus(status);
            Application saved = applicationRepository.save(existing);
            populateReferences(saved);
            return saved;
        });
    }

    public boolean withdrawApplication(String id) {
        if (applicationRepository.existsById(id)) {
            applicationRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
