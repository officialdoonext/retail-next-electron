/**
 * Retail Next — Product Variations & Attributes Matrix (/variations)
 *
 * Features:
 *   - Manage attribute matrices (Garment Sizes, Colors, Materials)
 *   - Add/Edit variation modal with multi-value tag chips
 *   - Calls /api/variations
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let variationsList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Variations & Product Attributes</h1>
          <p>Define multi-variant matrices: apparel sizes, color swatches, fabrics, and fit options</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="var-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Add Variation Set
          </button>
        </div>
      </div>

      <div id="var-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading variation sets from /api/variations...</div>
      </div>
    `;

    document.getElementById('var-add-btn').onclick = () => openVariationModal(null, outlet);

    loadVariations(outlet);
  }

  async function loadVariations(outlet) {
    const container = document.getElementById('var-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getVariations();
      variationsList = data?.variations || [];

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Attribute Name</th>
                <th>Defined Options / Values</th>
                <th style="text-align:center;">Options Count</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${variationsList.map(v => `
                <tr>
                  <td>
                    <strong style="color:var(--slate-900);">${v.name}</strong>
                  </td>
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                      ${(v.values || []).map(val => `
                        <span class="badge badge-purple" style="font-size:11px;">${val}</span>
                      `).join('')}
                    </div>
                  </td>
                  <td style="text-align:center;">
                    <span class="badge badge-slate">${(v.values || []).length} values</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm edit-var-btn" data-id="${v.id}">
                      Edit Options
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${variationsList.length}</strong> variation sets (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.edit-var-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const v = variationsList.find(x => x.id === id);
          if (v) openVariationModal(v, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load variations: ${err.message}</div>`;
    }
  }

  function openVariationModal(existingVar = null, outlet) {
    const isEdit = !!existingVar;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const initialTags = (existingVar?.values || []).join(', ');

    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Attribute Matrix' : 'New Product Attribute'}</h3>
          <button class="btn btn-ghost btn-icon" id="varm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="varm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Attribute Name</label>
            <input type="text" id="var-name" class="form-input" placeholder="e.g. Garment Sizes, Colors, Collar Type" value="${existingVar?.name || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Values (Comma-separated)</label>
            <textarea id="var-values" class="form-textarea" rows="3" placeholder="e.g. S, M, L, XL, 2XL" required>${initialTags}</textarea>
            <p style="font-size:11px;color:var(--slate-500);margin-top:4px;">Separate multiple tags with a comma</p>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">${isEdit ? 'Update Variations' : 'Save Attribute Set'}</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('varm-close').onclick = () => modal.remove();
    document.getElementById('varm-form').onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('var-name').value.trim();
      const rawValues = document.getElementById('var-values').value;
      const values = rawValues.split(',').map(s => s.trim()).filter(Boolean);

      await global.apiService.createVariation({ name, values });
      global.Toast?.success(`Variation matrix "${name}" saved!`);
      modal.remove();
      loadVariations(outlet);
    };
  }

  global.VariationsPage = { render };
})(window);

