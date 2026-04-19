let allTestimonials = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
});

async function loadTestimonials() {
    try {
        const result = await api.get('/api/testimonials');
        if (result && result.success) {
            allTestimonials = result.data;
            renderTestimonials();
        } else {
            console.error('Failed to load testimonials');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    
    if (allTestimonials.length === 0) {
        grid.innerHTML = `<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">No testimonials found.</div>`;
        return;
    }

    grid.innerHTML = allTestimonials.map(t => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < t.rating) {
                stars += '<i class="fas fa-star text-yellow-500"></i>';
            } else {
                stars += '<i class="far fa-star text-gray-300"></i>';
            }
        }

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover-card transition duration-200">
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h4 class="font-bold text-gray-800 leading-tight text-lg">${t.client_name}</h4>
                            <p class="text-sm text-gray-500">${t.company || 'Customer'}</p>
                        </div>
                        <div class="text-lg bg-gray-50 px-2 py-1 rounded">
                            ${stars}
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4 italic leading-relaxed">"${t.review}"</p>
                </div>
                <div class="border-t border-gray-100 pt-4 flex justify-end space-x-2 mt-auto">
                    <button onclick="editTestimonial(${t.id})" class="text-white bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-sm rounded px-3 py-1.5 mr-2 text-sm" title="Edit"><i class="fas fa-edit mr-1"></i> Edit</button>
                    <button onclick="deleteTestimonial(${t.id})" class="text-white bg-red-600 hover:bg-red-700 transition duration-200 shadow-sm rounded px-3 py-1.5 text-sm" title="Delete"><i class="fas fa-trash mr-1"></i> Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function openTestimonialModal(isEdit = false) {
    document.getElementById('modalTitle').innerText = isEdit ? 'Edit Testimonial' : 'Add Testimonial';
    if (!isEdit) document.getElementById('testimonialForm').reset();
    document.getElementById('testimonialModal').classList.remove('hidden');
}

function closeTestimonialModal() {
    const form = document.getElementById('testimonialForm');
    document.getElementById('testimonialModal').classList.add('hidden');
    form.reset();
    document.getElementById('tId').value = '';
    
    // clear validations
    form.querySelectorAll('.validation-msg').forEach(el => el.classList.add('hidden'));
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500'));
}

function editTestimonial(id) {
    const t = allTestimonials.find(x => x.id === id);
    if (!t) return;
    
    document.getElementById('tId').value = t.id;
    document.getElementById('tName').value = t.client_name;
    document.getElementById('tCompany').value = t.company || '';
    document.getElementById('tRating').value = t.rating;
    document.getElementById('tReview').value = t.review;

    openTestimonialModal(true);
}

async function saveTestimonial() {
    let isValid = true;
    let firstInvalid = null;
    const form = document.getElementById('testimonialForm');
    
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

    if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const client_name = document.getElementById('tName').value.trim();
    const rating = document.getElementById('tRating').value;
    const review = document.getElementById('tReview').value.trim();

    const id = document.getElementById('tId').value;
    const isEdit = !!id;
    const url = isEdit ? `/api/testimonials/${id}` : '/api/testimonials';
    
    const data = {
        client_name: client_name,
        company: document.getElementById('tCompany').value.trim(),
        rating: parseInt(rating),
        review: review
    };

    const saveBtn = document.getElementById('saveTestimonialBtn');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;
    saveBtn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        let result;
        if (isEdit) {
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
            closeTestimonialModal();
            loadTestimonials();
            showToast('Testimonial saved successfully!');
        } else {
            showToast('Failed to save testimonial: ' + (result?.message || 'Error'), 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('An error occurred while saving.', 'error');
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
        saveBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

async function deleteTestimonial(id) {
    const confirmed = await showConfirmModal('Are you sure you want to delete this testimonial?', 'red', 'Delete');
    if (confirmed) {
        const btns = document.querySelectorAll('button[onclick^="deleteTestimonial"]');
        btns.forEach(b => { b.disabled = true; b.classList.add('opacity-50', 'cursor-not-allowed'); });

        try {
            const result = await api.delete(`/api/testimonials/${id}`);
            if (result && result.success) {
                allTestimonials = allTestimonials.filter(t => t.id !== id);
                renderTestimonials();

                const toast = document.getElementById('toast');
                toast.querySelector('span').textContent = 'Deleted successfully';
                toast.classList.remove('translate-y-20', 'opacity-0');
                setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 3000);
            } else {
                showToast('Failed to delete testimonial.', 'error');
            }
        } catch (err) {
            console.error(err);
        } finally {
            btns.forEach(b => { b.disabled = false; b.classList.remove('opacity-50', 'cursor-not-allowed'); });
        }
    }
}
