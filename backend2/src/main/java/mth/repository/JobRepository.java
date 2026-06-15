package mth.repository;

import mth.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository
extends JpaRepository<Job, Long> {
}