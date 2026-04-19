document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch all endpoints concurrently
        const [leadsRes, projectsRes, servicesRes] = await Promise.all([
            api.get('/api/leads'),
            api.get('/api/projects'),
            api.get('/api/services')
        ]);
        
        const totalLeads = leadsRes?.success ? leadsRes.data : [];
        const totalProjects = projectsRes?.success ? projectsRes.data : [];
        const totalServices = servicesRes?.success ? servicesRes.data : [];

        // Sort leads by latest
        totalLeads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recentLeads = totalLeads.slice(0, 5);

        renderStats({
            totalLeads: totalLeads.length,
            totalProjects: totalProjects.length,
            totalServices: totalServices.length
        });
        
        renderRecentLeads(recentLeads);

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
});

function renderStats(data) {
    const grid = document.getElementById('statsGrid');
    
    grid.innerHTML = `
        <a href="leads.html" class="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card cursor-pointer group">
            <div class="flex flex-row justify-between items-start">
                <div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Total Enquiries</p>
                    <h4 class="text-3xl font-bold text-gray-800 mb-1">${data.totalLeads || 0}</h4>
                    <p class="text-xs text-gray-400">Total enquiries received</p>
                </div>
                <div class="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition duration-200">
                    <i class="fas fa-users text-xl"></i>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-50"><span class="text-xs text-blue-600 font-medium group-hover:underline">View all leads →</span></div>
        </a>

        <a href="projects.html" class="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card cursor-pointer group">
            <div class="flex flex-row justify-between items-start">
                <div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                    <h4 class="text-3xl font-bold text-gray-800 mb-1">${data.totalProjects || 0}</h4>
                    <p class="text-xs text-gray-400">Total portfolio items</p>
                </div>
                <div class="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition duration-200">
                    <i class="fas fa-building text-xl"></i>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-50"><span class="text-xs text-indigo-600 font-medium group-hover:underline">View all projects →</span></div>
        </a>

        <a href="services.html" class="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card cursor-pointer group">
            <div class="flex flex-row justify-between items-start">
                <div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Total Services</p>
                    <h4 class="text-3xl font-bold text-gray-800 mb-1">${data.totalServices || 0}</h4>
                    <p class="text-xs text-gray-400">Active services</p>
                </div>
                <div class="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition duration-200">
                    <i class="fas fa-tools text-xl"></i>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-50"><span class="text-xs text-purple-600 font-medium group-hover:underline">View all services →</span></div>
        </a>
    `;
}

function renderRecentLeads(leads) {
    const tbody = document.getElementById('recentLeadsTableBody');
    
    if (!leads || leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No leads found.</td></tr>`;
        return;
    }

    tbody.innerHTML = leads.map(lead => {
        const date = new Date(lead.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${lead.name}</div>
                    <div class="text-xs text-gray-500">${lead.source || 'Website'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-gray-900">${lead.email}</div>
                    <div class="text-gray-500">${lead.phone || '-'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-gray-900 truncate max-w-xs" title="${lead.requirement}">${lead.requirement || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                    ${date}
                </td>
            </tr>
        `;
    }).join('');
}
