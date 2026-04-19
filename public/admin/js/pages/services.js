let allServices = [];

document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

async function loadServices() {
    try {
        const result = await api.get('/api/services');
        if (result && result.success) {
            allServices = result.data;
            renderServices();
        } else {
            console.error('Failed to load services');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    
    if (allServices.length === 0) {
        grid.innerHTML = `<div class="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex flex-col items-center justify-center">
                <div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <i class="fas fa-tools text-2xl text-gray-400"></i>
                </div>
                <p class="text-sm font-medium text-gray-600 mb-1">No data available yet</p>
                <p class="text-xs text-gray-400">Start by adding a new item</p>
            </div>
        </div>`;
        return;
    }

    grid.innerHTML = allServices.map(service => {
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover-card">
                <div class="flex-1">
                    <h4 class="text-xl font-bold text-gray-800 mb-2">${service.name}</h4>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-3">${service.description}</p>
                </div>
                <div class="border-t border-gray-100 pt-4 mt-auto flex justify-end space-x-2">
                    <button onclick="editService(${service.id})" class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition">Edit</button>
                    <button onclick="deleteService(${service.id})" class="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium transition">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function openServiceModal(isEdit = false) {
    document.getElementById('modalTitle').innerText = isEdit ? 'Edit Service' : 'Add New Service';
    if (!isEdit) {
        document.getElementById('serviceForm').reset();
        document.getElementById('sDescEditor').innerHTML = '';
        document.getElementById('sProcessEditor').innerHTML = '';
        document.getElementById('sBenefitsEditor').innerHTML = '';
        document.getElementById('sDescription').value = '';
    }
    document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
    const form = document.getElementById('serviceForm');
    document.getElementById('serviceModal').classList.add('hidden');
    form.reset();
    document.getElementById('serviceId').value = '';
    
    // clear validations
    form.querySelectorAll('.validation-msg').forEach(el => el.classList.add('hidden'));
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500'));
}

function editService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;
    
    document.getElementById('serviceId').value = service.id;
    document.getElementById('sName').value = service.name;
    document.getElementById('sDescription').value = service.description || '';
    document.getElementById('sProcess').value = service.process || '';
    document.getElementById('sBenefits').value = service.benefits || '';

    // Populate generic native editors
    document.getElementById('sDescEditor').innerHTML = service.description || '';
    document.getElementById('sProcessEditor').innerHTML = service.process || '';
    document.getElementById('sBenefitsEditor').innerHTML = service.benefits || '';

    openServiceModal(true);
}

async function saveService() {
    let isValid = true;
    let firstInvalid = null;
    const form = document.getElementById('serviceForm');
    
    form.querySelectorAll('.validation-msg').forEach(el => el.classList.add('hidden'));
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500'));

    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            const msg = input.nextElementSibling;
            if (msg && msg.classList.contains('validation-msg')) {
                msg.classList.remove('hidden');
            }
            if (!firstInvalid) firstInvalid = input;
        }
    });

    // Sync all Native Rich Text values
    const sDescEditorHtml = document.getElementById('sDescEditor').innerHTML;
    const sDesc = document.getElementById('sDescription');
    if (!sDescEditorHtml.trim() || sDescEditorHtml === '<br>') {
        isValid = false;
        document.getElementById('descError').classList.remove('hidden');
    } else {
        document.getElementById('descError').classList.add('hidden');
        sDesc.value = sDescEditorHtml;
    }
    document.getElementById('sProcess').value = document.getElementById('sProcessEditor').innerHTML;
    document.getElementById('sBenefits').value = document.getElementById('sBenefitsEditor').innerHTML;

    if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const id = document.getElementById('serviceId').value;
    const isEdit = !!id;
    const url = isEdit ? `/api/services/${id}` : '/api/services';
    
    const data = {
        name: document.getElementById('sName').value,
        description: document.getElementById('sDescription').value,
        process: document.getElementById('sProcess').value,
        benefits: document.getElementById('sBenefits').value
    };

    const saveBtn = document.getElementById('saveServiceBtn') || document.querySelector('#serviceModal button[onclick="saveService()"]');
    let originalText = 'Save';
    if(saveBtn) {
        originalText = saveBtn.innerText;
        saveBtn.innerText = 'Saving...';
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-75', 'cursor-not-allowed');
    }

    try {
        let result;
        if (isEdit) {
            // we use direct fetch for PUT, because our API wrapper only supports POST natively (or we could extend api.js)
            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            result = await response.json();
        } else {
            result = await api.post(url, data);
        }
        
        if (result && result.success) {
            closeServiceModal();
            loadServices();
            showToast('Service saved successfully!');
        } else {
            showToast('Failed to save service: ' + (result?.message || 'Error'), 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('An error occurred while saving.', 'error');
    } finally {
        if(saveBtn) {
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
            saveBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }
}

async function deleteService(id) {
    const confirmed = await showConfirmModal('Are you sure you want to delete this service?', 'red', 'Delete');
    if (confirmed) {
        const btns = document.querySelectorAll('button[onclick^="deleteService"]');
        btns.forEach(b => { b.disabled = true; b.classList.add('opacity-50', 'cursor-not-allowed'); });

        try {
            const result = await api.delete(`/api/services/${id}`);
            if (result && result.success) {
                allServices = allServices.filter(s => s.id !== id);
                renderServices();

                showToast('Service deleted successfully');
            } else {
                showToast('Failed to delete service.', 'error');
            }
        } catch (err) {
            console.error(err);
        } finally {
            btns.forEach(b => { b.disabled = false; b.classList.remove('opacity-50', 'cursor-not-allowed'); });
        }
    }
}
