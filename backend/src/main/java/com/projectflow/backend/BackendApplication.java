package com.projectflow.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.projectflow.backend.model.Project;
import com.projectflow.backend.repository.ProjectRepository;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(ProjectRepository projectRepository) {
        return args -> {

            // Create sample projects only when database is empty
            if (projectRepository.count() == 0) {

projectRepository.save(new Project(
        "Motor Insurance Enhancement",
        "Premium calculation improvement",
        "In Progress",
        "Medium",
        "30 Aug 2026",
        "Development",
        "Arun",
        "Enhancement"
));

projectRepository.save(new Project(
        "Claims Portal Enhancement",
        "Improve claim submission",
        "In Progress",
        "High",
        "02 Sep 2026",
        "Internal QA",
        "Vijay",
        "Enhancement"
));

projectRepository.save(new Project(
        "Customer Mobile App",
        "Customer policy services",
        "Pending Approval",
        "Medium",
        "15 Sep 2026",
        "Internal Approval",
        "Raghul",
        "New Project"
));

projectRepository.save(new Project(
        "Agent Dashboard Upgrade",
        "Dashboard and reporting",
        "UAT",
        "Medium",
        "05 Sep 2026",
        "UAT",
        "Suresh",
        "Enhancement"
));

projectRepository.save(new Project(
        "Policy Renewal Automation",
        "Automated renewal notification",
        "Live",
        "High",
        "16 Jul 2026",
        "Live",
        "Praveen",
        "New Project"
));
            }

            /*
             * Update project types for existing projects.
             * This is needed because these projects may already
             * exist in the database from our earlier version.
             */
            for (Project project : projectRepository.findAll()) {

                if ("Motor Insurance Enhancement".equals(project.getName())) {
                    project.setProjectType("Enhancement");
                }

                else if ("Claims Portal Enhancement".equals(project.getName())) {
                    project.setProjectType("Enhancement");
                }

                else if ("Customer Mobile App".equals(project.getName())) {
                    project.setProjectType("New Development");
                }

                else if ("Agent Dashboard Upgrade".equals(project.getName())) {
                    project.setProjectType("Enhancement");
                }

                else if ("Policy Renewal Automation".equals(project.getName())) {
                    project.setProjectType("New Development");
                }

                projectRepository.save(project);
            }
        };
    }
}