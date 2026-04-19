const Project = require('../models/Project');

// Helper to extract file URLs
const getFileUrl = (files, fieldName) => {
  if (files && files[fieldName] && files[fieldName][0]) {
    return `/uploads/${files[fieldName][0].filename}`;
  }
  return null;
};

const createProject = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Check if site_progress or materials are sent as JSON strings
    if (typeof data.site_progress === 'string') {
      try { data.site_progress = JSON.parse(data.site_progress); } catch(e) {}
    }
    if (typeof data.materials === 'string') {
      try { data.materials = JSON.parse(data.materials); } catch(e) {}
    }

    // Attach file URLs
    if (req.files) {
      data.image_url = getFileUrl(req.files, 'image_url');
      data.before_image = getFileUrl(req.files, 'before_image');
      data.after_image = getFileUrl(req.files, 'after_image');
      
      if (data.site_progress && Array.isArray(data.site_progress)) {
        for (let i = 0; i < 4; i++) {
          const fileUrl = getFileUrl(req.files, `site_image_${i+1}`);
          if (fileUrl) data.site_progress[i].image_url = fileUrl;
        }
      }
    }

    const projectId = await Project.create(data);

    // Save gallery images in related table
    if (req.files && req.files.gallery) {
      for (const file of req.files.gallery) {
        await Project.addImage(projectId, `/uploads/${file.filename}`, 'general');
      }
    }

    res.status(201).json({ success: true, message: 'Project created successfully', projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { category, is_case_study } = req.query;
    const isCaseStudyFilter = is_case_study === 'true' ? true : null;
    const projects = await Project.findAll(category, isCaseStudyFilter);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (typeof data.site_progress === 'string') {
      try { data.site_progress = JSON.parse(data.site_progress); } catch(e) {}
    }
    if (typeof data.materials === 'string') {
      try { data.materials = JSON.parse(data.materials); } catch(e) {}
    }

    // Attach file URLs if updated
    if (req.files) {
      const mainImg = getFileUrl(req.files, 'image_url');
      const beforeImg = getFileUrl(req.files, 'before_image');
      const afterImg = getFileUrl(req.files, 'after_image');
      
      if (mainImg) data.image_url = mainImg;
      if (beforeImg) data.before_image = beforeImg;
      if (afterImg) data.after_image = afterImg;

      if (data.site_progress && Array.isArray(data.site_progress)) {
        for (let i = 0; i < 4; i++) {
          const fileUrl = getFileUrl(req.files, `site_image_${i+1}`);
          if (fileUrl) data.site_progress[i].image_url = fileUrl;
        }
      }

      // If gallery images uploaded, append them
      if (req.files.gallery) {
        for (const file of req.files.gallery) {
          await Project.addImage(req.params.id, `/uploads/${file.filename}`, 'general');
        }
      }
    }

    await Project.update(req.params.id, data);
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    await Project.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
