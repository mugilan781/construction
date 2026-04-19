let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

async function loadProjects() {
    try {
        const result = await api.get('/api/projects');
        if (result && result.success) {
            allProjects = result.data;
            renderProjects();
        } else {
            console.error('Failed to load projects');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderProjects() {
    const tbody = document.getElementById('projectsTableBody');
    if (allProjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-16 text-center"><div class="flex flex-col items-center justify-center"><div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><i class="fas fa-building text-2xl text-gray-400"></i></div><p class="text-sm font-medium text-gray-600 mb-1">No data available yet</p><p class="text-xs text-gray-400">Start by adding a new item</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = allProjects.map(project => {
        const isCompleted = project.status === 'completed';
        const statusClass = isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4"><div class="font-medium text-gray-900">${project.title}</div><div class="text-xs text-gray-500 truncate max-w-xs">${project.subtitle || project.description || ''}</div></td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700">${project.category}${project.is_case_study ? '<br><span class="text-[10px] text-accent uppercase font-bold">Featured</span>' : ''}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${project.status}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${project.location || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editProject(${project.id})" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProject(${project.id})" class="text-red-600 hover:text-red-900" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    }).join('');
}

function generateSiteProgressHTML(progressData = []) {
    let html = '';
    const phases = ['Foundation', 'Framing', 'Exteriors', 'Completion'];
    for(let i=0; i<4; i++) {
        const p = progressData[i] || {};
        html += `
        <div class="bg-gray-50 p-3 rounded border border-gray-200">
            <h5 class="text-sm font-semibold text-primary mb-2">Phase ${i+1}: ${phases[i]}</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><label class="block text-xs text-gray-600">Phase Title</label><input type="text" id="spTitle_${i}" value="${p.title || ''}" class="w-full px-2 py-1 text-sm border rounded"></div>
                <div><label class="block text-xs text-gray-600">Short Description</label><input type="text" id="spDesc_${i}" value="${p.desc || ''}" class="w-full px-2 py-1 text-sm border rounded"></div>
                ${p.image_url ? `<div class="col-span-2 text-xs text-green-600">Currently explicitly set: <img src="${p.image_url}" class="h-8 w-12 inline object-cover ml-2 rounded" /></div>` : ''}
                <div class="col-span-2"><label class="block text-xs text-gray-600">Upload New Phase Image</label><input type="file" id="spImg_${i}" name="site_image_${i+1}" accept="image/*" class="w-full text-xs"></div>
            </div>
        </div>`;
    }
    return html;
}

function generateMaterialsHTML(materialsData = []) {
    let html = '';
    for(let i=0; i<4; i++) {
        const m = materialsData[i] || {};
        html += `
        <div class="bg-gray-50 p-3 rounded border border-gray-200">
            <h5 class="text-sm font-semibold text-primary mb-2">Material Card ${i+1}</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div><label class="block text-xs text-gray-600">Icon Class (e.g. fas fa-gem)</label><input type="text" id="matIcon_${i}" value="${m.icon || ''}" class="w-full px-2 py-1 text-sm border rounded"></div>
                <div><label class="block text-xs text-gray-600">Title</label><input type="text" id="matTitle_${i}" value="${m.title || ''}" class="w-full px-2 py-1 text-sm border rounded"></div>
                <div><label class="block text-xs text-gray-600">Description</label><input type="text" id="matDesc_${i}" value="${m.desc || ''}" class="w-full px-2 py-1 text-sm border rounded"></div>
            </div>
        </div>`;
    }
    return html;
}

function openProjectModal(isEdit = false, project = null) {
    document.getElementById('modalTitle').innerText = isEdit ? 'Edit Project' : 'Add New Project';
    if (!isEdit) {
        document.getElementById('projectForm').reset();
        document.getElementById('pDescEditor').innerHTML = '';
        document.getElementById('pDescription').value = '';
        document.getElementById('siteProgressContainer').innerHTML = generateSiteProgressHTML();
        document.getElementById('materialsContainer').innerHTML = generateMaterialsHTML();
    } else {
        document.getElementById('siteProgressContainer').innerHTML = generateSiteProgressHTML(project.site_progress || []);
        document.getElementById('materialsContainer').innerHTML = generateMaterialsHTML(project.materials || []);
    }
    document.getElementById('projectModal').classList.remove('hidden');
}

function closeProjectModal() {
    const form = document.getElementById('projectForm');
    document.getElementById('projectModal').classList.add('hidden');
    form.reset();
    document.getElementById('projectId').value = '';
}

function editProject(id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;
    
    document.getElementById('projectId').value = project.id;
    document.getElementById('pTitle').value = project.title;
    document.getElementById('pSubtitle').value = project.subtitle || '';
    document.getElementById('pCategory').value = project.category;
    document.getElementById('pStatus').value = project.status || 'ongoing';
    document.getElementById('pIsCaseStudy').checked = project.is_case_study === 1 || project.is_case_study === true;
    
    document.getElementById('pLocation').value = project.location || '';
    document.getElementById('pTimeline').value = project.year || project.timeline || '';
    document.getElementById('pArea').value = project.area || '';
    document.getElementById('pArchitect').value = project.architect || '';
    
    document.getElementById('pVideoLink').value = project.video_link || '';

    document.getElementById('pDescription').value = project.description || '';
    document.getElementById('pDescEditor').innerHTML = project.description || '';

    openProjectModal(true, project);
}

async function saveProject() {
    let isValid = true;
    const form = document.getElementById('projectForm');

    const pTitle = document.getElementById('pTitle').value.trim();
    if (!pTitle) {
        alert("Title is required."); return;
    }

    const pDescEditorHtml = document.getElementById('pDescEditor').innerHTML;
    const pDesc = document.getElementById('pDescription');
    if (!pDescEditorHtml.trim() || pDescEditorHtml === '<br>') {
        alert("Description is required."); return;
    } else {
        pDesc.value = pDescEditorHtml;
    }

    const id = document.getElementById('projectId').value;
    const isEdit = !!id;
    const url = isEdit ? `/api/projects/${id}` : '/api/projects';
    
    const formData = new FormData();
    formData.append('title', pTitle);
    formData.append('subtitle', document.getElementById('pSubtitle').value);
    formData.append('description', document.getElementById('pDescription').value);
    formData.append('category', document.getElementById('pCategory').value);
    formData.append('status', document.getElementById('pStatus').value);
    formData.append('is_case_study', document.getElementById('pIsCaseStudy').checked ? 'true' : 'false');
    
    formData.append('location', document.getElementById('pLocation').value);
    formData.append('timeline', document.getElementById('pTimeline').value);
    formData.append('area', document.getElementById('pArea').value);
    formData.append('year', document.getElementById('pTimeline').value); // Fallback
    formData.append('architect', document.getElementById('pArchitect').value);
    
    formData.append('video_link', document.getElementById('pVideoLink').value);
    
    // Arrays/Objects
    let siteProgress = [];
    for(let i=0; i<4; i++) {
        let title = document.getElementById(`spTitle_${i}`).value;
        let desc = document.getElementById(`spDesc_${i}`).value;
        let fileInput = document.getElementById(`spImg_${i}`);
        
        // Preserve old imageUrl if editing and no new file selected (handled by backend or we can pass it manually)
        let oldImg = '';
        if(isEdit) {
            const project = allProjects.find(p => p.id == id);
            if(project && project.site_progress && project.site_progress[i]) oldImg = project.site_progress[i].image_url || '';
        }

        siteProgress.push({ title, desc, image_url: oldImg });
        if (fileInput && fileInput.files.length > 0) {
            formData.append(`site_image_${i+1}`, fileInput.files[0]);
        }
    }
    formData.append('site_progress', JSON.stringify(siteProgress));

    let materials = [];
    for(let i=0; i<4; i++) {
        materials.push({
            icon: document.getElementById(`matIcon_${i}`).value,
            title: document.getElementById(`matTitle_${i}`).value,
            desc: document.getElementById(`matDesc_${i}`).value
        });
    }
    formData.append('materials', JSON.stringify(materials));

    // General Images
    const mainImg = document.getElementById('pMainImg');
    if (mainImg && mainImg.files.length > 0) formData.append('image_url', mainImg.files[0]);

    const beforeFile = document.getElementById('pBeforeImg');
    if (beforeFile && beforeFile.files.length > 0) formData.append('before_image', beforeFile.files[0]);

    const afterFile = document.getElementById('pAfterImg');
    if (afterFile && afterFile.files.length > 0) formData.append('after_image', afterFile.files[0]);

    const galleryFile = document.getElementById('pGallery');
    if (galleryFile && galleryFile.files.length > 0) {
        for (let i = 0; i < galleryFile.files.length; i++) {
            formData.append('gallery', galleryFile.files[i]);
        }
    }

    const saveBtn = document.querySelector('button[onclick="saveProject()"]');
    let originalText = saveBtn.innerText;
    saveBtn.innerText = 'Saving...'; saveBtn.disabled = true;

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            closeProjectModal();
            loadProjects(); 
            showToast('Project saved successfully!');
        } else {
            showToast('Failed to save project: ' + (data.message || 'Error'), 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('An error occurred while saving.', 'error');
    } finally {
        saveBtn.innerText = originalText; saveBtn.disabled = false;
    }
}

async function deleteProject(id) {
    const confirmed = await showConfirmModal('Are you sure you want to delete this project?', 'red', 'Delete');
    if (confirmed) {
        const btns = document.querySelectorAll('button[onclick^="deleteProject"]');
        btns.forEach(b => { b.disabled = true; });
        try {
            const result = await api.delete(`/api/projects/${id}`);
            if (result && result.success) {
                allProjects = allProjects.filter(p => p.id !== id);
                renderProjects();
                showToast('Project deleted successfully');
            } else {
                showToast('Failed to delete project.', 'error');
            }
        } catch (err) {
            console.error(err);
        } finally {
            btns.forEach(b => { b.disabled = false; });
        }
    }
}
