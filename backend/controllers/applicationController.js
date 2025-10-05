import Application from "../models/Application.js";

// CREATE
export const createApplication = async (req, res) => {
  try {
    const { company, role, status, date, notes, candidateId: candidateIdFromBody } = req.body;

    // Determine candidateId based on user role
    let candidateId = req.user._id;
    if (req.user.role === "recruiter") {
      if (!candidateIdFromBody) {
        return res.status(400).json({ message: "candidateId is required when creating as a recruiter." });
      }
      candidateId = candidateIdFromBody;
    }

    if (!company || !role) {
      return res.status(400).json({ message: "Company and role are required." });
    }

    const application = new Application({
      company,
      role,
      status,
      date,
      notes,
      candidateId,
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating application:", error.message);
    res.status(500).json({ message: "Server error while creating application." });
  }
};


// READ (All or by candidateId)
export const getApplications = async (req, res) => {
  try {
    const { candidateId } = req.query;
    let filter = {};

    if (req.user.role === "candidate") {
      // Candidates can only view their own applications
      filter = { candidateId: req.user._id };
    } else if (req.user.role === "recruiter") {
      // Recruiters can filter by candidateId or view all
      filter = candidateId ? { candidateId } : {};
    }

    const applications = await Application.find(filter).populate("candidateId", "name email role");
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    res.status(500).json({ message: "Server error while fetching applications." });
  }
};

// UPDATE
export const updateApplication = async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Application not found." });
    res.json(updated);
  } catch (error) {
    console.error("Error updating application:", error.message);
    res.status(500).json({ message: "Server error while updating application." });
  }
};

// DELETE
export const deleteApplication = async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Application not found." });
    res.json({ message: "Application deleted successfully." });
  } catch (error) {
    console.error("Error deleting application:", error.message);
    res.status(500).json({ message: "Server error while deleting application." });
  }
};
