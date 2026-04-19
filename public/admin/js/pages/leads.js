let allLeads = [];

document.addEventListener('DOMContentLoaded', () => {
    loadLeads();
});

async function onStatusChange(leadId, selectEl) {
    const newStatus = selectEl.value;
    const originalStatus = selectEl.getAttribute('data-original');
    
    // Disable temporarily
    selectEl.disabled = true;
    selectEl.classList.add('opacity-50');

    try {
        const result = await api.put(`/api/leads/${leadId}/status`, { status: newStatus });
        if (result && result.success) {
            // Update local state
            const lead = allLeads.find(l => l.id === leadId);
            if (lead) lead.status = newStatus;
            
            showToast('Lead status updated successfully', 'success');
            renderLeads();
        } else {
            showToast(result?.message || 'Failed to update status', 'error');
            selectEl.value = originalStatus;
        }
    } catch (err) {
        console.error(err);
        showToast('An error occurred', 'error');
        selectEl.value = originalStatus;
    } finally {
        selectEl.disabled = false;
        selectEl.classList.remove('opacity-50');
    }
}

async function loadLeads() {
    try {
        const result = await api.get('/api/leads');
        if (result && result.success) {
            allLeads = result.data;
            renderLeads();
            updateExportButton();
        } else {
            console.error('Failed to load leads');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderLeads() {
    const tbody = document.getElementById('leadsTableBody');
    let rawFilterValue = document.getElementById('leadFilter').value;
    
    let filterValue = 'all';
    if (rawFilterValue === 'contact_form') filterValue = 'contact';
    else if (rawFilterValue === 'quote_request') filterValue = 'quote';
    
    let leadsToRender = [...allLeads];
    
    // Sort by priority (New > Contacted > Closed)
    const priority = { 'new': 1, 'contacted': 2, 'closed': 3 };
    leadsToRender.sort((a, b) => {
        const pA = priority[a.status] || 1;
        const pB = priority[b.status] || 1;
        if (pA !== pB) return pA - pB;
        return new Date(b.created_at) - new Date(a.created_at); // Sub-sort by date
    });

    if (filterValue !== 'all') {
        leadsToRender = leadsToRender.filter(l => (l.source || '').toLowerCase() === filterValue);
    }
    
    if (leadsToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-16 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <i class="fas fa-users text-2xl text-gray-400"></i>
                </div>
                <p class="text-sm font-medium text-gray-600 mb-1">No enquiries yet</p>
                <p class="text-xs text-gray-400">Leads will appear here when users submit forms</p>
            </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = leadsToRender.map(lead => {
        const date = new Date(lead.created_at).toLocaleDateString();
        const status = (lead.status || 'new').toLowerCase();
        
        let badgeClasses = '';
        let badgeLabel = '';
        
        switch(status) {
            case 'contacted':
                badgeClasses = 'bg-green-100 text-green-700 border-green-200';
                badgeLabel = 'Contacted';
                break;
            case 'closed':
                badgeClasses = 'bg-gray-100 text-gray-700 border-gray-200';
                badgeLabel = 'Closed';
                break;
            default:
                badgeClasses = 'bg-blue-100 text-blue-700 border-blue-200';
                badgeLabel = 'New';
        }
        
        return `
            <tr class="hover:bg-gray-50 transition duration-200">
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                    ${date}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${lead.name}</div>
                    <div class="text-xs text-gray-500">${lead.email} | ${lead.phone || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${lead.budget_range || '-'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-gray-900 truncate max-w-xs" title="${lead.requirement}">${lead.requirement || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select onchange="onStatusChange(${lead.id}, this)" data-original="${status}" class="text-xs font-semibold rounded-full px-3 py-1 border outline-none cursor-pointer transition duration-200 ${badgeClasses}">
                        <option value="new" ${status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="closed" ${status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onclick="viewLead(${lead.id})" class="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded transition duration-200">View</button>
                    <button onclick="deleteLead(${lead.id})" class="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition duration-200">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterLeads() {
    renderLeads();
}

function viewLead(id) {
    const lead = allLeads.find(l => l.id === id);
    if (!lead) return;
    
    const detailsContainer = document.getElementById('leadDetailsContent');
    const date = new Date(lead.created_at).toLocaleString();
    
    detailsContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div><span class="font-semibold text-gray-600 block">Name:</span> ${lead.name}</div>
            <div><span class="font-semibold text-gray-600 block">Date Received:</span> ${date}</div>
            <div><span class="font-semibold text-gray-600 block">Email:</span> <a href="mailto:${lead.email}" class="text-blue-600 hover:underline">${lead.email}</a></div>
            <div><span class="font-semibold text-gray-600 block">Phone:</span> ${lead.phone || '-'}</div>
            <div><span class="font-semibold text-gray-600 block">Source:</span> ${lead.source || 'Website'}</div>
            <div><span class="font-semibold text-gray-600 block">Budget:</span> <span class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">${lead.budget_range || 'Not Specified'}</span></div>
            <div class="col-span-2 mt-4"><span class="font-semibold text-gray-600 block mb-1">Requirement:</span>
                <div class="bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">${lead.requirement || 'No further requirement details.'}</div>
            </div>
            <div class="col-span-2"><span class="font-semibold text-gray-600 block mb-1">Additional Message:</span>
                <div class="bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">${lead.message || 'No additional message.'}</div>
            </div>
        </div>
    `;

    document.getElementById('leadModal').classList.remove('hidden');
}

function closeLeadModal() {
    document.getElementById('leadModal').classList.add('hidden');
}

function updateExportButton() {
    const btn = document.getElementById('exportBtn');
    if (!btn) return;
    if (allLeads.length === 0) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.classList.remove('hover:bg-green-700');
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.classList.add('hover:bg-green-700');
    }
}

function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.textContent = message;

    // Reset classes
    toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 flex items-center z-50 text-white';

    if (type === 'error') {
        toast.classList.add('bg-red-500');
        toastIcon.className = 'fas fa-exclamation-circle mr-2';
    } else if (type === 'success') {
        toast.classList.add('bg-green-500');
        toastIcon.className = 'fas fa-check-circle mr-2';
    }

    // Show
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function exportLeads() {
    if (allLeads.length === 0) {
        showToast('No leads available to export', 'error');
        return;
    }

    const btn = document.getElementById('exportBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Exporting...';
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    // Small delay to show loading state visually
    setTimeout(() => {
        const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Source', 'Budget', 'Requirement', 'Message'];
        const rows = allLeads.map(lead => [
            lead.id,
            new Date(lead.created_at).toLocaleDateString(),
            `"${lead.name || ''}"`,
            `"${lead.email || ''}"`,
            `"${lead.phone || ''}"`,
            `"${lead.source || ''}"`,
            `"${lead.budget_range || ''}"`,
            `"${(lead.requirement || '').replace(/"/g, '""')}"`,
            `"${(lead.message || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + "\n"
            + rows.map(e => e.join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Restore button
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');

        showToast('Leads exported successfully!', 'success');
    }, 400);
}

async function deleteLead(id) {
    const confirmed = await showConfirmModal('Are you sure you want to delete this lead?', 'red', 'Delete');
    if (confirmed) {
        try {
            const result = await api.delete(`/api/leads/${id}`);
            if (result && result.success) {
                allLeads = allLeads.filter(l => l.id !== id);
                renderLeads();
                updateExportButton();
                showToast('Lead deleted successfully', 'success');
            } else {
                showToast('Failed to delete lead.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to delete lead.', 'error');
        }
    }
}
