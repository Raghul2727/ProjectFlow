import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

const stages = [
  "Requirements",
  "Business Approval",
  "Development",
  "Code Review",
  "QA Testing",
  "UAT",
  "Production Deployment",
  "Live",
];

const getLifecycleStage = (currentStage) => {
  if (
    currentStage === "Requirement Gathering" ||
    currentStage === "BRD / FRD" ||
    currentStage === "Requirements"
  ) {
    return "Requirements";
  }

  if (
    currentStage === "Internal Approval" ||
    currentStage === "Business Approval" ||
    currentStage === "Change Request"
  ) {
    return "Business Approval";
  }

  if (
    currentStage === "Development Ticket" ||
    currentStage === "Understanding Document" ||
    currentStage === "UD Approval" ||
    currentStage === "Development"
  ) {
    return "Development";
  }

  if (currentStage === "Code Review") {
    return "Code Review";
  }

  if (
    currentStage === "Internal QA" ||
    currentStage === "QA Approval" ||
    currentStage === "QA Testing"
  ) {
    return "QA Testing";
  }

  if (
    currentStage === "UAT" ||
    currentStage === "UAT Sign-off"
  ) {
    return "UAT";
  }

  if (currentStage === "Production Deployment") {
    return "Production Deployment";
  }

  if (currentStage === "Live") {
    return "Live";
  }

  return "Requirements";
};


// --------------------------------------------------
// DATE & TIME FORMAT
// --------------------------------------------------

const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return "—";
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


// --------------------------------------------------
// FORMAT PROJECT
// --------------------------------------------------

const formatProject = (project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  priority: project.priority,
  deadline: project.deadline,
  stage: project.currentStage,
  status: project.status,
  owner: project.techOwner,
  projectType: project.projectType || "New Development",

  // Date & time records
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});


function App() {

  // --------------------------------------------------
  // NEW PROJECT FORM
  // --------------------------------------------------

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [priority, setPriority] = useState("High");
  const [deadline, setDeadline] = useState("");
  const [stage, setStage] = useState("Development");
  const [owner, setOwner] = useState("");
  const [projectType, setProjectType] = useState("New Development");

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const [formErrors, setFormErrors] = useState({});

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const validateNewProject = () => {
    const errors = {};

    if (!projectName.trim()) {
      errors.projectName = "Project name is required.";
    }

    if (!description.trim()) {
      errors.description = "Project description is required.";
    }

    if (!deadline) {
      errors.deadline = "Please select a deadline.";
    } else if (deadline < today) {
      errors.deadline = "Deadline cannot be earlier than today.";
    }

    if (!owner.trim()) {
      errors.owner = "Tech owner is required.";
    }

    return errors;
  };

  const validateEditProject = () => {
    const errors = {};

    if (!selectedProject.name.trim()) {
      errors.projectName = "Project name is required.";
    }

    if (!selectedProject.description.trim()) {
      errors.description = "Project description is required.";
    }

    if (!selectedProject.deadline) {
      errors.deadline = "Please select a deadline.";
    } else if (selectedProject.deadline < today) {
      errors.deadline = "Deadline cannot be earlier than today.";
    }

    if (!selectedProject.owner.trim()) {
      errors.owner = "Tech owner is required.";
    }

    // Lifecycle business rule:
    // A project can move forward, but it cannot move to an earlier stage.
    const selectedLifecycleStage = getLifecycleStage(selectedProject.stage);
    const selectedIndex = stages.indexOf(selectedLifecycleStage);

    const originalProject = projects.find(
      (project) => project.id === selectedProject.id
    );

    const originalLifecycleStage = originalProject
      ? getLifecycleStage(originalProject.stage)
      : selectedLifecycleStage;

    const originalIndex = stages.indexOf(originalLifecycleStage);

    if (
      selectedIndex >= 0 &&
      originalIndex >= 0 &&
      selectedIndex < originalIndex
    ) {
      errors.stage =
        "Project stage cannot be moved backwards. Please complete the current stage first.";
    }

    return errors;
  };

  const clearFormError = (field) => {
    setFormErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };
      delete updatedErrors[field];
      return updatedErrors;
    });
  };


  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Projects");


  // --------------------------------------------------
  // FORMS
  // --------------------------------------------------

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);


  // --------------------------------------------------
  // LOAD PROJECTS
  // --------------------------------------------------

  useEffect(() => {
fetch(`${API_URL}/api/projects`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        return response.json();
      })
      .then((data) => {
        const formattedProjects = data.map(formatProject);

        setProjects(formattedProjects);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading projects:", error);
        setLoading(false);
      });
  }, []);


  // --------------------------------------------------
  // UPDATE PROJECT
  // --------------------------------------------------

  const handleUpdateProject = async () => {
    if (!selectedProject) {
      return;
    }

    const errors = validateEditProject();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${selectedProject.id}`
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: selectedProject.name,
            description: selectedProject.description,
            status: selectedProject.status,
            priority: selectedProject.priority,
            deadline: selectedProject.deadline,
            currentStage: selectedProject.stage,
            techOwner: selectedProject.owner,
            projectType: selectedProject.projectType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject = await response.json();

      const formattedProject = formatProject(updatedProject);

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === formattedProject.id
            ? formattedProject
            : project
        )
      );

      setSelectedProject(formattedProject);
      setShowEditForm(false);
      setFormErrors({});

      alert("Project updated successfully!");

    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    }
  };


  // --------------------------------------------------
  // DELETE PROJECT
  // --------------------------------------------------

  const handleDeleteProject = async () => {
    if (!selectedProject) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedProject.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${selectedProject.id}`
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project.id !== selectedProject.id
        )
      );

      setSelectedProject(null);
      setShowEditForm(false);

      alert("Project deleted successfully!");

    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };


  // --------------------------------------------------
  // SAVE NEW PROJECT
  // --------------------------------------------------

  const handleSaveProject = async () => {
    const errors = validateNewProject();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(
       `${API_URL}/api/projects`
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: projectName,
            description: description,
            status: status,
            priority: priority,
            deadline: deadline,
            currentStage: stage,
            techOwner: owner,
            projectType: projectType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const savedProject = await response.json();

      const formattedProject = formatProject(savedProject);

      setProjects((currentProjects) => [
        ...currentProjects,
        formattedProject,
      ]);

      setShowForm(false);
      setFormErrors({});

      // Reset form
      setProjectName("");
      setDescription("");
      setStatus("In Progress");
      setPriority("High");
      setDeadline("");
      setStage("Development");
      setOwner("");
      setProjectType("New Development");

      alert("Project saved successfully!");

    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project");
    }
  };


  // --------------------------------------------------
  // STATUS CLASS
  // --------------------------------------------------

  const getStatusClass = (projectStatus) => {
    if (projectStatus === "Live") {
      return "live";
    }

    if (projectStatus === "UAT") {
      return "uat";
    }

    if (projectStatus === "Pending Approval") {
      return "pending";
    }

    return "progress";
  };


  // ==================================================
  // PROJECT DETAIL PAGE
  // ==================================================

  if (selectedProject) {

    const lifecycleStage = getLifecycleStage(
      selectedProject.stage
    );

    const currentIndex = stages.indexOf(lifecycleStage);

    return (
      <div className="app">

        {/* HEADER */}
        <header className="header">

          <div>
            <h1>ProjectFlow</h1>
            <p>Project Status Management</p>
          </div>

          <div className="user-area">
            <span>BA View</span>
            <span className="user-name">Raghul</span>
          </div>

        </header>


        <main className="main-content">

          {/* ACTION BUTTONS */}
          <div className="project-actions">

            <button
              className="back-button"
              onClick={() => {
                setSelectedProject(null);
                setShowEditForm(false);
              }}
            >
              ← Back to Dashboard
            </button>


            <div className="project-action-right">

              <button
                className="edit-button"
                onClick={() => {
                setFormErrors({});
                setShowEditForm(true);
              }}
              >
                Edit Project
              </button>

              <button
                className="delete-button"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>

            </div>

          </div>


          {/* PROJECT HEADER */}
          <div className="project-detail-header">

            <div>
              <h2>{selectedProject.name}</h2>
              <p>{selectedProject.description}</p>
            </div>

            <span
              className={`status ${getStatusClass(
                selectedProject.status
              )}`}
            >
              {selectedProject.status}
            </span>

          </div>


          {/* EDIT FORM */}
          {showEditForm && (
            <section className="edit-project-section">

              <h3>Edit Project</h3>

              <div className="form-grid">

                {/* PROJECT NAME */}
                <div className="form-group">
                  <label>Project Name</label>

                  <input
                    value={selectedProject.name}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedProject({
                        ...selectedProject,
                        name: value,
                      });

                      if (value.trim()) {
                        clearFormError("projectName");
                      } else {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          projectName: "Project name is required.",
                        }));
                      }
                    }}
                  />

                  {formErrors.projectName && (
                    <span className="field-error">
                      ⚠ {formErrors.projectName}
                    </span>
                  )}
                </div>


                {/* DESCRIPTION */}
                <div className="form-group">
                  <label>Project Description</label>

                  <input
                    value={selectedProject.description}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedProject({
                        ...selectedProject,
                        description: value,
                      });

                      if (value.trim()) {
                        clearFormError("description");
                      } else {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          description: "Project description is required.",
                        }));
                      }
                    }}
                  />

                  {formErrors.description && (
                    <span className="field-error">
                      ⚠ {formErrors.description}
                    </span>
                  )}
                </div>


                {/* PROJECT TYPE */}
                <div className="form-group">
                  <label>Project Type</label>

                  <select
                    value={
                      selectedProject.projectType ||
                      "New Development"
                    }
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        projectType: e.target.value,
                      })
                    }
                  >
                    <option>New Development</option>
                    <option>Enhancement</option>
                    <option>Change Request</option>
                  </select>
                </div>


                {/* STATUS */}
                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={selectedProject.status}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        status: e.target.value,
                      })
                    }
                  >
                    <option>In Progress</option>
                    <option>Pending Approval</option>
                    <option>UAT</option>
                    <option>Live</option>
                  </select>
                </div>


                {/* PRIORITY */}
                <div className="form-group">
                  <label>Priority</label>

                  <select
                    value={selectedProject.priority}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>


                {/* DEADLINE */}
                <div className="form-group">
                  <label>Deadline</label>

                  <input
                    type="date"
                    min={today}
                    value={selectedProject.deadline}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedProject({
                        ...selectedProject,
                        deadline: value,
                      });

                      if (!value) {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          deadline: "Please select a deadline.",
                        }));
                      } else if (value < today) {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          deadline: "Deadline cannot be earlier than today.",
                        }));
                      } else {
                        clearFormError("deadline");
                      }
                    }}
                  />

                  {formErrors.deadline && (
                    <span className="field-error">
                      ⚠ {formErrors.deadline}
                    </span>
                  )}
                </div>


                {/* CURRENT STAGE */}
                <div className="form-group">
                  <label>Current Stage</label>

                  <select
                    value={lifecycleStage}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedProject({
                        ...selectedProject,
                        stage: value,
                      });

                      const originalProject = projects.find(
                        (project) => project.id === selectedProject.id
                      );

                      if (!originalProject) {
                        return;
                      }

                      const originalIndex = stages.indexOf(
                        getLifecycleStage(originalProject.stage)
                      );

                      const newIndex = stages.indexOf(
                        getLifecycleStage(value)
                      );

                      if (
                        originalIndex >= 0 &&
                        newIndex >= 0 &&
                        newIndex < originalIndex
                      ) {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          stage:
                            "Project stage cannot be moved backwards. Please complete the current stage first.",
                        }));
                      } else {
                        clearFormError("stage");
                      }
                    }}
                  >
                    {stages.map((stageName) => (
                      <option key={stageName}>
                        {stageName}
                      </option>
                    ))}
                  </select>

                  {formErrors.stage && (
                    <span className="field-error">
                      ⚠ {formErrors.stage}
                    </span>
                  )}

                  {!formErrors.stage && (
                    <small className="field-hint">
                      Project stages can move forward only.
                    </small>
                  )}
                </div>


                {/* TECH OWNER */}
                <div className="form-group">
                  <label>Tech Owner</label>

                  <input
                    value={selectedProject.owner}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedProject({
                        ...selectedProject,
                        owner: value,
                      });

                      if (value.trim()) {
                        clearFormError("owner");
                      } else {
                        setFormErrors((currentErrors) => ({
                          ...currentErrors,
                          owner: "Tech owner is required.",
                        }));
                      }
                    }}
                  />

                  {formErrors.owner && (
                    <span className="field-error">
                      ⚠ {formErrors.owner}
                    </span>
                  )}
                </div>

              </div>


              {Object.keys(formErrors).length > 0 && (
                <div className="form-warning">
                  ⚠ Please correct the highlighted fields before saving.
                </div>
              )}

              {/* EDIT ACTIONS */}
              <div className="form-actions">

                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditForm(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleUpdateProject}
                >
                  Save Changes
                </button>

              </div>

            </section>
          )}


          {/* PROJECT INFO */}
          {!showEditForm && (
            <>

              <section className="project-info">

                <div>
                  <span>Priority</span>
                  <strong>{selectedProject.priority}</strong>
                </div>

                <div>
                  <span>Deadline</span>
                  <strong>{selectedProject.deadline}</strong>
                </div>

                <div>
                  <span>Current Stage</span>
                  <strong>{selectedProject.stage}</strong>
                </div>

                <div>
                  <span>Tech Owner</span>
                  <strong>{selectedProject.owner}</strong>
                </div>

                <div>
                  <span>Project Type</span>
                  <strong>
                    {selectedProject.projectType}
                  </strong>
                </div>

              </section>


              {/* PROJECT RECORD */}
              <section className="project-record">

                <div>
                  <span>Created Date & Time</span>
                  <strong>
                    {formatDateTime(selectedProject.createdAt)}
                  </strong>
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>
                    {formatDateTime(selectedProject.updatedAt)}
                  </strong>
                </div>

              </section>

            </>
          )}


          {/* PROJECT LIFECYCLE */}
          <section className="lifecycle-section">

            <div className="section-header">

              <div>
                <h3>Project Lifecycle</h3>

                <p>
                  Track the project from requirement to production
                </p>
              </div>

            </div>


            <div className="lifecycle">

              {stages.map((stageName, index) => {

                let stageStatus = "pending";

                if (
                  currentIndex >= 0 &&
                  index < currentIndex
                ) {
                  stageStatus = "completed";
                }

                if (index === currentIndex) {
                  stageStatus = "current";
                }


                return (
                  <div
                    className={`lifecycle-item ${stageStatus}`}
                    key={stageName}
                  >

                    <div className="stage-number">
                      {stageStatus === "completed"
                        ? "✓"
                        : index + 1}
                    </div>

                    <div>
                      <strong>{stageName}</strong>

                      <p>
                        {stageStatus === "completed"
                          ? "Completed"
                          : stageStatus === "current"
                          ? "In Progress"
                          : "Pending"}
                      </p>
                    </div>

                  </div>
                );

              })}

            </div>

          </section>


          {/* DETAILS */}
          <section className="details-grid">

            {/* DOCUMENTS */}
            <div className="detail-card">

              <h3>Documents</h3>


              {/* NEW DEVELOPMENT */}
              {selectedProject.projectType === "New Development" && (
                <>

                  <div className="document-row">
                    <span>BRD / FRD</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Business Approval</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Development Ticket</span>

                    <span className="document-status created">
                      Created
                    </span>
                  </div>

                </>
              )}


              {/* ENHANCEMENT */}
              {selectedProject.projectType === "Enhancement" && (
                <>

                  <div className="document-row">
                    <span>BRD / FRD</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Change Request</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Business Approval</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Development Ticket</span>

                    <span className="document-status created">
                      Created
                    </span>
                  </div>

                </>
              )}


              {/* CHANGE REQUEST */}
              {selectedProject.projectType === "Change Request" && (
                <>

                  <div className="document-row">
                    <span>Change Request</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Business Approval</span>

                    <span className="document-status">
                      Approved
                    </span>
                  </div>


                  <div className="document-row">
                    <span>Development Ticket</span>

                    <span className="document-status created">
                      Created
                    </span>
                  </div>

                </>
              )}

            </div>


            {/* COMMENTS */}
            <div className="detail-card">

              <h3>Latest Comments</h3>

              <p className="comment">
                Tech team is currently working on the project.
              </p>

              <small>
                Updated recently
              </small>

            </div>

          </section>


          {/* PROJECT RECORD HISTORY */}
          <section className="detail-card project-history">

            <h3>Project Record</h3>

            <div className="history-row">

              <div>
                <span>Project Created</span>

                <strong>
                  {formatDateTime(selectedProject.createdAt)}
                </strong>
              </div>

            </div>


            <div className="history-row">

              <div>
                <span>Last Project Update</span>

                <strong>
                  {formatDateTime(selectedProject.updatedAt)}
                </strong>
              </div>

            </div>

          </section>


        </main>

      </div>
    );
  }


  // ==================================================
  // DASHBOARD
  // ==================================================

  const filteredProjects = projects.filter(
    (project) =>
      statusFilter === "All Projects" ||
      project.status === statusFilter
  );


  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div>
          <h1>ProjectFlow</h1>
          <p>Project Status Management</p>
        </div>

        <div className="user-area">
          <span>BA View</span>
          <span className="user-name">Raghul</span>
        </div>

      </header>


      <main className="main-content">

        {/* PAGE TITLE */}
        <div className="page-title">

          <div>
            <h2>Project Dashboard</h2>

            <p>
              Track projects from requirement to production
            </p>
          </div>


          <button
            className="new-project"
            onClick={() => setShowForm(true)}
          >
            + New Project
          </button>

        </div>


        {/* NEW PROJECT FORM */}
        {showForm && (
          <div className="project-form">

            <div className="form-header">

              <div>
                <h3>Create New Project</h3>

                <p>
                  Add project details to track progress.
                </p>
              </div>

            </div>


            <div className="form-grid">

              {/* PROJECT NAME */}
              <div className="form-group">
                <label>Project Name</label>

                <input
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProjectName(value);

                    if (value.trim()) {
                      clearFormError("projectName");
                    } else {
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        projectName: "Project name is required.",
                      }));
                    }
                  }}
                />

                {formErrors.projectName && (
                  <span className="field-error">
                    ⚠ {formErrors.projectName}
                  </span>
                )}
              </div>


              {/* DESCRIPTION */}
              <div className="form-group">
                <label>Project Description</label>

                <input
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDescription(value);

                    if (value.trim()) {
                      clearFormError("description");
                    } else {
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        description: "Project description is required.",
                      }));
                    }
                  }}
                />

                {formErrors.description && (
                  <span className="field-error">
                    ⚠ {formErrors.description}
                  </span>
                )}
              </div>


              {/* PROJECT TYPE */}
              <div className="form-group">
                <label>Project Type</label>

                <select
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(e.target.value)
                  }
                >
                  <option>New Development</option>
                  <option>Enhancement</option>
                  <option>Change Request</option>
                </select>
              </div>


              {/* STATUS */}
              <div className="form-group">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option>In Progress</option>
                  <option>Pending Approval</option>
                  <option>UAT</option>
                  <option>Live</option>
                </select>
              </div>


              {/* PRIORITY */}
              <div className="form-group">
                <label>Priority</label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>


              {/* DEADLINE */}
              <div className="form-group">
                <label>Deadline</label>

                <input
                  type="date"
                  value={deadline}
                  min={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDeadline(value);

                    if (!value) {
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        deadline: "Please select a deadline.",
                      }));
                    } else if (value < today) {
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        deadline: "Deadline cannot be earlier than today.",
                      }));
                    } else {
                      clearFormError("deadline");
                    }
                  }}
                />

                {formErrors.deadline && (
                  <span className="field-error">
                    ⚠ {formErrors.deadline}
                  </span>
                )}
              </div>


              {/* CURRENT STAGE */}
              <div className="form-group">
                <label>Current Stage</label>

                <select
                  value={stage}
                  onChange={(e) =>
                    setStage(e.target.value)
                  }
                >
                  {stages.map((stageName) => (
                    <option key={stageName}>
                      {stageName}
                    </option>
                  ))}
                </select>
              </div>


              {/* TECH OWNER */}
              <div className="form-group">
                <label>Tech Owner</label>

                <input
                  placeholder="Enter owner name"
                  value={owner}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOwner(value);

                    if (value.trim()) {
                      clearFormError("owner");
                    } else {
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        owner: "Tech owner is required.",
                      }));
                    }
                  }}
                />

                {formErrors.owner && (
                  <span className="field-error">
                    ⚠ {formErrors.owner}
                  </span>
                )}
              </div>

            </div>


            {Object.keys(formErrors).length > 0 && (
              <div className="form-warning">
                ⚠ Please correct the highlighted fields before saving.
              </div>
            )}

            {/* FORM ACTIONS */}
            <div className="form-actions">

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormErrors({});
                }}
              >
                Cancel
              </button>


              <button
                className="save-btn"
                onClick={handleSaveProject}
              >
                Save Project
              </button>

            </div>

          </div>
        )}


        {/* SUMMARY CARDS */}
        <section className="summary-cards">

          <div className="summary-card">

            <span className="card-label">
              Total Projects
            </span>

            <strong>
              {projects.length}
            </strong>

            <small>
              All active projects
            </small>

          </div>


          <div className="summary-card">

            <span className="card-label">
              In Progress
            </span>

            <strong>
              {
                projects.filter(
                  (project) =>
                    project.status === "In Progress"
                ).length
              }
            </strong>

            <small>
              Currently being worked on
            </small>

          </div>


          <div className="summary-card">

            <span className="card-label">
              Pending Approval
            </span>

            <strong>
              {
                projects.filter(
                  (project) =>
                    project.status === "Pending Approval"
                ).length
              }
            </strong>

            <small>
              Needs attention
            </small>

          </div>


          <div className="summary-card">

            <span className="card-label">
              Live Projects
            </span>

            <strong>
              {
                projects.filter(
                  (project) =>
                    project.status === "Live"
                ).length
              }
            </strong>

            <small>
              Successfully deployed
            </small>

          </div>

        </section>


        {/* PROJECT TABLE */}
        <section className="project-section">

          <div className="section-header">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option>All Projects</option>
              <option>In Progress</option>
              <option>Pending Approval</option>
              <option>UAT</option>
              <option>Live</option>
            </select>

          </div>


          <div className="table-container">

            {loading ? (

              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                Loading projects...
              </div>

            ) : filteredProjects.length === 0 ? (

              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                No projects found.
              </div>

            ) : (

              <table>

                <thead>

                  <tr>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Current Stage</th>
                    <th>Status</th>
                    <th>Owner</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredProjects.map((project) => (

                    <tr
                      key={project.id}
                      onClick={() =>
                        setSelectedProject(project)
                      }
                      className="clickable-row"
                    >

                      <td>

                        <strong>
                          {project.name}
                        </strong>

                        <small>
                          {project.description}
                        </small>

                      </td>


                      <td>
                        {project.priority}
                      </td>


                      <td>
                        {project.deadline}
                      </td>


                      <td>
                        {project.stage}
                      </td>


                      <td>

                        <span
                          className={`status ${getStatusClass(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>

                      </td>


                      <td>
                        {project.owner}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>


      </main>

    </div>
  );
}

export default App;
