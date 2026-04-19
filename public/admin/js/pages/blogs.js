let allBlogs = [];

document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
});

async function loadBlogs() {
    try {
        const result = await api.get('/api/blogs');
        if (result && result.success) {
            allBlogs = result.data;
            renderBlogs();
        } else {
            console.error('Failed to load blogs');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderBlogs() {
    const tbody = document.getElementById('blogsTableBody');
    
    if (allBlogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">No blog posts available. Click "Add Post" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = allBlogs.map(blog => {
        let displayDate = 'Invalid date';
        
        let targetDate = blog.date || blog.created_at;
        if (targetDate) {
            const d = new Date(targetDate);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                displayDate = `${day}-${month}-${year}`;
            }
        }
        
        return `
            <tr class="hover:bg-gray-50 transition duration-200">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${blog.title}</div>
                    <div class="text-xs text-gray-500 truncate max-w-xs mt-1 leading-relaxed">${(blog.content || '').substring(0, 100)}...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                    ${blog.author}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    ${displayDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editBlog(${blog.id})" class="text-white bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-sm rounded px-3 py-1.5 mr-2" title="Edit"><i class="fas fa-edit mr-1"></i> Edit</button>
                    <button onclick="deleteBlog(${blog.id})" class="text-white bg-red-600 hover:bg-red-700 transition duration-200 shadow-sm rounded px-3 py-1.5" title="Delete"><i class="fas fa-trash mr-1"></i> Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openBlogModal(isEdit = false) {
    document.getElementById('modalTitle').innerText = isEdit ? 'Edit Blog Post' : 'Add New Blog Post';
    if (!isEdit) {
        document.getElementById('blogForm').reset();
        document.getElementById('bContentEditor').innerHTML = '';
        document.getElementById('bContent').value = '';
    }
    document.getElementById('blogModal').classList.remove('hidden');
}

function closeBlogModal() {
    const form = document.getElementById('blogForm');
    document.getElementById('blogModal').classList.add('hidden');
    form.reset();
    document.getElementById('blogId').value = '';
    
    // clear validations
    form.querySelectorAll('.validation-msg').forEach(el => el.classList.add('hidden'));
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500'));
}

function editBlog(id) {
    const blog = allBlogs.find(b => b.id === id);
    if (!blog) return;
    
    document.getElementById('blogId').value = blog.id;
    document.getElementById('bTitle').value = blog.title;
    document.getElementById('bAuthor').value = blog.author;
    // Format date for input[type=date]
    if (blog.date) {
        const d = new Date(blog.date);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            // Input date needs YYYY-MM-DD
            document.getElementById('bDate').value = `${year}-${month}-${day}`;
        }
    }
    document.getElementById('bContent').value = blog.content || '';
    document.getElementById('bContentEditor').innerHTML = blog.content || '';

    openBlogModal(true);
}

async function saveBlog() {
    let isValid = true;
    let firstInvalid = null;
    const form = document.getElementById('blogForm');
    
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
    
    // Sync Rich Text Content
    const editorHtml = document.getElementById('bContentEditor').innerHTML;
    const bContent = document.getElementById('bContent');
    if (!editorHtml.trim() || editorHtml === '<br>') {
        isValid = false;
        document.getElementById('contentError').classList.remove('hidden');
    } else {
        document.getElementById('contentError').classList.add('hidden');
        bContent.value = editorHtml;
    }

    if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const id = document.getElementById('blogId').value;
    const isEdit = !!id;
    const url = isEdit ? `/api/blogs/${id}` : '/api/blogs';
    
    const data = {
        title: document.getElementById('bTitle').value,
        author: document.getElementById('bAuthor').value,
        date: document.getElementById('bDate').value,
        content: document.getElementById('bContent').value
    };

    const saveBtn = document.getElementById('saveBlogBtn');
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
            closeBlogModal();
            loadBlogs();
            showToast('Blog post saved successfully!');
        } else {
            showToast('Failed to save blog: ' + (result?.message || 'Error'), 'error');
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

async function deleteBlog(id) {
    const confirmed = await showConfirmModal('Are you sure you want to delete this blog post?', 'red', 'Delete');
    if (confirmed) {
        try {
            const result = await api.delete(`/api/blogs/${id}`);
            if (result && result.success) {
                // Instantly remove from internal array without fetching again to prevent jumping/delay
                allBlogs = allBlogs.filter(b => b.id !== id);
                renderBlogs();
                showToast('Blog deleted successfully');
            } else {
                showToast('Failed to delete blog.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to delete blog.', 'error');
        }
    }
}
