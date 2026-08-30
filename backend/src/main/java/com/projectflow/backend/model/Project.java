package com.projectflow.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String status;
    private String priority;
    private String deadline;
    private String currentStage;
    private String techOwner;
    private String projectType;

    private String createdAt;
    private String updatedAt;

    public Project() {
    }

    public Project(String name,
                   String description,
                   String status,
                   String priority,
                   String deadline,
                   String currentStage,
                   String techOwner,
                   String projectType) {

        this.name = name;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.deadline = deadline;
        this.currentStage = currentStage;
        this.techOwner = techOwner;
        this.projectType = projectType;
    }

    @PrePersist
    public void onCreate() {

        String currentTime = getCurrentTime();

        this.createdAt = currentTime;
        this.updatedAt = currentTime;
    }

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = getCurrentTime();
    }

    private String getCurrentTime() {

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return LocalDateTime.now().format(formatter);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    public String getTechOwner() {
        return techOwner;
    }

    public void setTechOwner(String techOwner) {
        this.techOwner = techOwner;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}