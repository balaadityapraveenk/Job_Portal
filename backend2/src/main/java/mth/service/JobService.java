package mth.service;

import mth.model.Job;
import mth.repository.JobRepository;
import mth.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public JobService(JobRepository jobRepository, ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Optional<Job> updateJob(Long id, Job updatedJob) {
        return jobRepository.findById(id).map(existing -> {
            existing.setTitle(updatedJob.getTitle());
            existing.setCompany(updatedJob.getCompany());
            existing.setLocation(updatedJob.getLocation());
            existing.setSalary(updatedJob.getSalary());
            existing.setCategory(updatedJob.getCategory());
            existing.setType(updatedJob.getType());
            existing.setRemote(updatedJob.isRemote());
            existing.setExperience(updatedJob.getExperience());
            existing.setPostedDate(updatedJob.getPostedDate());
            existing.setDeadline(updatedJob.getDeadline());
            existing.setSkills(updatedJob.getSkills());
            existing.setDescription(updatedJob.getDescription());
            existing.setResponsibilities(updatedJob.getResponsibilities());
            existing.setRequirements(updatedJob.getRequirements());
            return jobRepository.save(existing);
        });
    }

    @Transactional
    public boolean deleteJob(Long id) {
        if (jobRepository.existsById(id)) {
            applicationRepository.deleteByJobId(id);
            jobRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
