const db = require('../config/db');

class Project {
  static async create(data) {
    const query = `
      INSERT INTO projects (
        title, subtitle, description, category, location, timeline, budget, status, 
        year, area, architect, is_case_study, video_link, site_progress, materials, 
        image_url, before_image, after_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.title, data.subtitle || null, data.description, data.category, 
      data.location || null, data.timeline || null, data.budget || null, data.status || 'ongoing',
      data.year || null, data.area || null, data.architect || null, 
      (data.is_case_study === 'true' || data.is_case_study === 1 || data.is_case_study === true) ? 1 : 0, 
      data.video_link || null,
      data.site_progress ? JSON.stringify(data.site_progress) : null,
      data.materials ? JSON.stringify(data.materials) : null,
      data.image_url || null, data.before_image || null, data.after_image || null
    ];
    
    const [result] = await db.query(query, params);
    return result.insertId;
  }

  static async addImage(projectId, imageUrl, type) {
    await db.query(
      `INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)`,
      [projectId, imageUrl, type]
    );
  }

  static async findAll(categoryFilter = null, isCaseStudy = null) {
    let query = 'SELECT * FROM projects';
    let params = [];
    let conditions = [];
    
    if (categoryFilter && categoryFilter !== 'all') {
      conditions.push('category = ?');
      params.push(categoryFilter);
    }
    if (isCaseStudy) {
      conditions.push('is_case_study = 1');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    
    // Parse JSON fields
    return rows.map(r => {
      if (typeof r.site_progress === 'string') {
        try { r.site_progress = JSON.parse(r.site_progress); } catch(e) {}
      }
      if (typeof r.materials === 'string') {
        try { r.materials = JSON.parse(r.materials); } catch(e) {}
      }
      return r;
    });
  }

  static async findById(id) {
    const [projectRows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projectRows.length === 0) return null;
    
    const project = projectRows[0];
    
    // Parse JSON
    if (typeof project.site_progress === 'string') {
      try { project.site_progress = JSON.parse(project.site_progress); } catch(e) {}
    }
    if (typeof project.materials === 'string') {
      try { project.materials = JSON.parse(project.materials); } catch(e) {}
    }

    const [imageRows] = await db.query('SELECT * FROM project_images WHERE project_id = ?', [id]);
    project.images = imageRows;
    return project;
  }

  static async update(id, data) {
    const query = `
      UPDATE projects SET 
        title=?, subtitle=?, description=?, category=?, location=?, timeline=?, budget=?, status=?, 
        year=?, area=?, architect=?, is_case_study=?, video_link=?, site_progress=?, materials=?
        ${data.image_url ? ', image_url=?' : ''}
        ${data.before_image ? ', before_image=?' : ''}
        ${data.after_image ? ', after_image=?' : ''}
      WHERE id=?
    `;
    
    let params = [
      data.title, data.subtitle || null, data.description, data.category, 
      data.location || null, data.timeline || null, data.budget || null, data.status || 'ongoing',
      data.year || null, data.area || null, data.architect || null, 
      (data.is_case_study === 'true' || data.is_case_study === 1 || data.is_case_study === true) ? 1 : 0, 
      data.video_link || null,
      data.site_progress ? JSON.stringify(data.site_progress) : null,
      data.materials ? JSON.stringify(data.materials) : null
    ];

    if (data.image_url) params.push(data.image_url);
    if (data.before_image) params.push(data.before_image);
    if (data.after_image) params.push(data.after_image);
    
    params.push(id);

    await db.query(query, params);
  }

  static async delete(id) {
    await db.query('DELETE FROM projects WHERE id = ?', [id]);
  }
}

module.exports = Project;
