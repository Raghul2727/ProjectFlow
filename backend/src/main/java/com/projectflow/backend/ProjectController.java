package com.projectflow.backend;

import com.projectflow.backend.model.Project;
import com.projectflow.backend.repository.ProjectRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://raghul2727.github.io"
})
public class ProjectController {

    private final ProjectRepository projectRepository;

    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // Get all projects
    @GetMapping
    public List<Project> getProjects() {
        return projectRepository.findAll();
    }

    // Create new project
    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    // Update existing project
    @PutMapping("/{id}")
    public Project updateProject(
            @PathVariable Long id,
            @RequestBody Project project) {

        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        existingProject.setName(project.getName());
        existingProject.setDescription(project.getDescription());
        existingProject.setStatus(project.getStatus());
        existingProject.setPriority(project.getPriority());
        existingProject.setDeadline(project.getDeadline());
        existingProject.setCurrentStage(project.getCurrentStage());
        existingProject.setTechOwner(project.getTechOwner());

        // Project type
        // New Development / Enhancement / Change Request
        existingProject.setProjectType(project.getProjectType());

        return projectRepository.save(existingProject);
    }

    // Delete project
    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
    }
}
