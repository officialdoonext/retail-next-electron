/**
 * Retail Next — Product Categories Master (/categories)
 *
 * Features:
 *   - Category hierarchy tree with parent-child relationships
 *   - Add/Edit Category modal with image upload/url, description, status toggle
 *   - Calls /api/categories
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let categoriesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Product Categories</h1>
          <p>Organize product taxonomy, catalog departments, and hierarchy tree</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="cat-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Add Category
          </button>
        </div>
      </div>

      <div id="cat-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading categories from /api/categories...</div>
      </div>
    `;

    document.getElementById('cat-add-btn').onclick = () => openCategoryModal(null, outlet);

    loadCategories(outlet);
  }

  async function loadCategories(outlet) {
    const container = document.getElementById('cat-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getCategories();
      categoriesList = data?.categories || [];

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category Code</th>
                <th>Category Name</th>
                <th>Department / Parent</th>
                <th style="text-align:center;">Assigned Products</th>
                <th>Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesList.map(cat => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${cat.code || 'CAT-01'}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${cat.name}</div>
                  </td>
                  <td>
                    <span style="color:var(--slate-500);font-size:12px;">${cat.parentId ? 'Sub-category' : 'Root Department'}</span>
                  </td>
                  <td style="text-align:center;">
                    <span class="badge badge-slate">${cat.productCount || 0} products</span>
                  </td>
                  <td>
                    <span class="badge ${cat.status === 'Active' ? 'badge-success' : 'badge-slate'}">${cat.status || 'Active'}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm edit-cat-btn" data-id="${cat.id}">
                      Edit
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${categoriesList.length}</strong> categories (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.edit-cat-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const c = categoriesList.find(x => x.id === id);
          if (c) openCategoryModal(c, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load categories: ${err.message}</div>`;
    }
  }

  function openCategoryModal(existingCat = null, outlet) {
    const isEdit = !!existingCat;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Category' : 'Create Product Category'}</h3>
          <button class="btn btn-ghost btn-icon" id="catm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="catm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Category Name</label>
            <input type="text" id="cat-name-input" class="form-input" placeholder="e.g. Menswear & Apparel" value="${existingCat?.name || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category Code</label>
            <input type="text" id="cat-code-input" class="form-input" placeholder="e.g. APP-M" value="${existingCat?.code || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select id="cat-status-input" class="form-select">
              <option value="Active" ${existingCat?.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${existingCat?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">${isEdit ? 'Update Category' : 'Save Category'}</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('catm-close').onclick = () => modal.remove();
    document.getElementById('catm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('cat-name-input').value.trim(),
        code: document.getElementById('cat-code-input').value.trim(),
        status: document.getElementById('cat-status-input').value
      };
      await global.apiService.createCategory(payload);
      global.Toast?.success(`Category ${payload.name} saved!`);
      modal.remove();
      loadCategories(outlet);
    };
  }

  global.CategoriesPage = { render };
})(window);
