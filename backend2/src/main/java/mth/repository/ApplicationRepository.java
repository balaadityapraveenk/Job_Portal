package mth.repository;

import mth.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ApplicationRepository extends MongoRepository<Application, String> {

    // Find all applications for a specific user
    List<Application> findByUserId(String userId);

    boolean existsByUserIdAndJobId(String userId, Long jobId);

    void deleteByJobId(Long jobId);
}
