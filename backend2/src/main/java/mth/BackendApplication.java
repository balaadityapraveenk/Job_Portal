package mth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import mth.repository.UserRepository;
import mth.repository.JobRepository;
import mth.repository.ApplicationRepository;

@SpringBootApplication
@EnableJpaRepositories(
    basePackages = "mth.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {JobRepository.class})
)
@EnableMongoRepositories(
    basePackages = "mth.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {UserRepository.class, ApplicationRepository.class})
)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
