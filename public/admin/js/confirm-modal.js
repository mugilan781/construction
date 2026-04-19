// Self-injecting Confirm Modal Utility
// Injects the modal HTML into the DOM on load and exposes showConfirmModal()

(function () {
    // Inject modal HTML into the page
    const modalHTML = `
    <div id="confirmModal" class="hidden fixed inset-0 z-[100] overflow-y-auto">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"></div>
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all">
                <div class="px-6 py-5">
                    <div class="flex items-center mb-4">
                        <div id="confirmIconWrap" class="h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <i id="confirmIcon" class="text-lg"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">Confirmation</h3>
                    </div>
                    <p id="confirmMessage" class="text-sm text-gray-600 leading-relaxed"></p>
                </div>
                <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
                    <button id="confirmCancelBtn" type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition duration-200">Cancel</button>
                    <button id="confirmActionBtn" type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-white transition duration-200 shadow"></button>
                </div>
            </div>
        </div>
    </div>`;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    });

    /**
     * Show a custom confirm modal.
     * @param {string} message - The confirmation message to display.
     * @param {'red'|'blue'} confirmColor - Color of the confirm button.
     * @param {string} confirmText - Text for the confirm button (e.g. "Delete", "Logout").
     * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled.
     */
    window.showConfirmModal = function (message, confirmColor = 'red', confirmText = 'Confirm') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const msgEl = document.getElementById('confirmMessage');
            const actionBtn = document.getElementById('confirmActionBtn');
            const cancelBtn = document.getElementById('confirmCancelBtn');
            const iconWrap = document.getElementById('confirmIconWrap');
            const icon = document.getElementById('confirmIcon');

            // Set message
            msgEl.textContent = message;

            // Set confirm button text & color
            actionBtn.textContent = confirmText;
            actionBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium text-white transition duration-200 shadow';

            if (confirmColor === 'red') {
                actionBtn.classList.add('bg-red-600', 'hover:bg-red-700');
                iconWrap.className = 'h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-red-100';
                icon.className = 'fas fa-exclamation-triangle text-lg text-red-600';
            } else {
                actionBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                iconWrap.className = 'h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-blue-100';
                icon.className = 'fas fa-sign-out-alt text-lg text-blue-600';
            }

            // Show modal
            modal.classList.remove('hidden');

            // Cleanup helper
            function cleanup() {
                modal.classList.add('hidden');
                actionBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
            }

            function onConfirm() {
                cleanup();
                resolve(true);
            }

            function onCancel() {
                cleanup();
                resolve(false);
            }

            actionBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
        });
    };
})();
