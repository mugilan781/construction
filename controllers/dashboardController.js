const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // Total enquiries
    const [leadsResult] = await db.query('SELECT COUNT(*) as total FROM leads');
    const totalLeads = leadsResult[0].total;

    // Total projects
    const [projectsResult] = await db.query('SELECT COUNT(*) as total FROM projects');
    const totalProjects = projectsResult[0].total;

    // Total services
    const [servicesResult] = await db.query('SELECT COUNT(*) as total FROM services');
    const totalServices = servicesResult[0].total;

    // Recent leads
    const [recentLeads] = await db.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        totalLeads,
        totalProjects,
        totalServices,
        recentLeads
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats
};
