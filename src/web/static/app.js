/**
 * Client-side script for National Material Master Harmonization Platform.
 * Implements Requirements 1 to 11 (including the canonical 8-tuple Core AI Pipeline).
 */

let allClusters = [];
let allPipelineTuples = [];
let currentFilter = 'ALL';
let currentPipelineFilter = 'ALL';
let currentActiveRole = 'APPROVER';
let selectedClusterId = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupTabNavigation();
  loadDashboardData();
  loadPipelineData();
  loadClusters();
  loadCatalog();
  loadGovernanceLedger();
});

// Theme Management (Light & Dark Mode)
function initTheme() {
  const saved = localStorage.getItem('cpse_theme') || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('cpse_theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerText = theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  logAuditEntry(`Theme switched to: ${next.toUpperCase()} MODE`);
}


// Role Switcher
function handleRoleChange() {
  const select = document.getElementById('user-role-select');
  currentActiveRole = select.value;
  document.getElementById('modal-approver-role').value = currentActiveRole;
  logAuditEntry(`Active user session role switched to: ${currentActiveRole}`);
}

// Actions Dropdown Menu
function toggleActionsMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('actions-dropdown');
  if (menu) menu.classList.toggle('show');
}

window.addEventListener('click', () => {
  const menu = document.getElementById('actions-dropdown');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// Tab navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.view-panel').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });

  if (tabId === 'pipeline-view') {
    loadPipelineData();
  }
}

// 1. Load Executive Dashboard
async function loadDashboardData() {
  try {
    const res = await fetch('/api/analytics/kpis');
    const data = await res.json();

    document.getElementById('kpi-total-masters').innerText = data.total_material_records.toLocaleString();
    document.getElementById('kpi-duplicate-clusters').innerText = data.total_duplicate_clusters.toLocaleString();
    document.getElementById('kpi-pending-clusters').innerText = data.pending_review_clusters;
    document.getElementById('pending-count-badge').innerText = data.pending_review_clusters;
    document.getElementById('kpi-harmonization-rate').innerText = `${data.harmonization_progress_pct}%`;
    document.getElementById('kpi-progress-bar').style.width = `${data.harmonization_progress_pct}%`;
    document.getElementById('kpi-potential-savings').innerText = `₹${data.total_potential_savings_inr.toLocaleString()}`;

    // Render distribution
    const distContainer = document.getElementById('distribution-container');
    distContainer.innerHTML = '';
    const cpseDist = data.cpse_distribution || {};
    const total = data.total_material_records || 1;

    for (const [cpse, count] of Object.entries(cpseDist)) {
      const pct = Math.round((count / total) * 100);
      const row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML = `
        <div class="dist-meta">
          <span>${cpse}</span>
          <span>${count} items (${pct}%)</span>
        </div>
        <div class="dist-track">
          <div class="dist-fill" style="width: ${pct}%;"></div>
        </div>
      `;
      distContainer.appendChild(row);
    }
  } catch (err) {
    console.error("Failed to load KPIs:", err);
  }
}

// 2. Load Core AI Transformation Pipeline (Requirement 11: 8-Tuple Output)
async function loadPipelineData() {
  try {
    const res = await fetch('/api/pipeline/outputs');
    allPipelineTuples = await res.json();
    renderPipelineTuples();
  } catch (err) {
    console.error("Failed to load pipeline outputs:", err);
  }
}

function filterPipeline(status) {
  currentPipelineFilter = status;
  document.querySelectorAll('#pipeline-view .filter-chip').forEach(c => {
    c.classList.toggle('active', c.innerText.toUpperCase().includes(status) || (status === 'ALL' && c.innerText.includes('All')));
  });
  renderPipelineTuples();
}

let pipelineSearchTimeout = null;
function handlePipelineSearch() {
  clearTimeout(pipelineSearchTimeout);
  pipelineSearchTimeout = setTimeout(renderPipelineTuples, 250);
}

function renderPipelineTuples() {
  const container = document.getElementById('pipeline-tuples-container');
  container.innerHTML = '';

  const query = (document.getElementById('pipeline-search-input')?.value || '').toUpperCase().trim();

  const filtered = allPipelineTuples.filter(item => {
    // Status filter
    if (currentPipelineFilter !== 'ALL') {
      if (item.approval_status !== currentPipelineFilter) return false;
    }
    // Search query filter
    if (query) {
      const inCode = item.cpse_code.toUpperCase().includes(query) || (item.common_national_material_code && item.common_national_material_code.includes(query));
      const inDesc = item.standardized_description.toUpperCase().includes(query) || item.raw_description.toUpperCase().includes(query);
      const inTax = item.classification?.taxonomy_path?.toUpperCase().includes(query);
      if (!inCode && !inDesc && !inTax) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="content-card" style="text-align: center; color: var(--text-secondary); padding: 40px;">No matching materials found in AI transformation pipeline.</div>`;
    return;
  }

  filtered.forEach(t => {
    const isHarmonized = t.approval_status === 'HARMONIZED';
    const card = document.createElement('div');
    card.className = `tuple-card ${isHarmonized ? 'harmonized' : 'candidate'}`;

    // Similar / Equivalent materials pills
    let similarHtml = '';
    if (t.similar_equivalent_materials && t.similar_equivalent_materials.length > 0) {
      similarHtml = t.similar_equivalent_materials.map(sm => `
        <span class="attr-chip" title="${sm.raw_description} (${sm.match_type})">
          <strong style="color: var(--cyan-primary);">${sm.cpse_id}:</strong> ${sm.local_material_code}
        </span>
      `).join(' ');
    } else {
      similarHtml = `<span style="color: var(--text-tertiary); font-size: 11px;">Unique / Distinct Specification</span>`;
    }

    // Specifications string
    const specs = t.standard_specifications || {};
    const specsList = [
      specs.size_dimension ? `<strong>Size:</strong> ${specs.size_dimension}` : null,
      specs.pressure_rating ? `<strong>Rating:</strong> ${specs.pressure_rating}` : null,
      specs.material_grade ? `<strong>Grade:</strong> ${specs.material_grade}` : null,
      specs.length_thickness ? `<strong>Thk/Len:</strong> ${specs.length_thickness}` : null,
      specs.standard_norm ? `<strong>Norm:</strong> ${specs.standard_norm}` : null
    ].filter(Boolean).join(' • ');

    const cnmcDisplay = t.common_national_material_code
      ? `<span class="cnmc-pill">${t.common_national_material_code}</span>`
      : `<span style="color: var(--gold-tertiary); font-weight: 600; font-size: 11px;">Awaiting Review</span>`;

    const statusBadge = isHarmonized
      ? `<span class="status-badge harmonized">HARMONIZED (CNMC ACTIVE)</span>`
      : `<span class="status-badge candidate">PENDING COMMITTEE SIGN-OFF</span>`;

    card.innerHTML = `
      <div class="tuple-header">
        <div class="tuple-code-pair">
          <span class="cpse-tag ${t.cpse_id}">${t.cpse_id}</span>
          <span class="code-mono" style="font-size: 14px;">${t.cpse_code}</span>
          <span style="color: var(--text-tertiary);">&rarr;</span>
          ${cnmcDisplay}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="conf-badge">${t.confidence_score}% AI Confidence</span>
          ${statusBadge}
        </div>
      </div>
      <div class="tuple-grid">
        <div class="tuple-cell">
          <div class="cell-title">1. Standardized Description</div>
          <div class="cell-content"><strong>${t.standardized_description}</strong></div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">Legacy: ${t.raw_description}</div>
        </div>
        <div class="tuple-cell">
          <div class="cell-title">2. Standard Specifications</div>
          <div class="cell-content" style="font-size: 12px; line-height: 1.6;">${specsList || 'General Engineering Specs'}</div>
        </div>
        <div class="tuple-cell">
          <div class="cell-title">3. Hierarchical Classification</div>
          <div class="cell-content" style="font-size: 12px;">
            <span class="code-mono" style="color: var(--cyan-primary);">${t.classification?.taxonomy_code || '99000000'}</span>
            <div style="color: var(--text-secondary); font-size: 11px; margin-top: 2px;">${t.classification?.taxonomy_path || '-'}</div>
          </div>
        </div>
        <div class="tuple-cell">
          <div class="cell-title">4. Similar / Equivalent CPSE Masters</div>
          <div class="cell-content" style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${similarHtml}
          </div>
        </div>
      </div>
      <div class="tuple-footer">
        <div>
          <span style="color: var(--text-tertiary);">Sign-off:</span> 
          <strong style="color: var(--text-secondary);">${t.approved_by || 'Awaiting Action'}</strong>
          ${t.approval_justification ? `<span style="color: var(--text-secondary);"> — <em>"${t.approval_justification}"</em></span>` : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          ${isHarmonized ? `
            <button class="btn btn-danger btn-sm" onclick="revertMappingPrompt('${t.cpse_id}', '${t.cpse_code}')">Revert Mapping</button>
          ` : `
            <button class="btn btn-secondary btn-sm" onclick="switchTab('workbench-view')">Review in Workbench &rarr;</button>
          `}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// 3. Load AI Resolution Clusters
async function loadClusters() {
  try {
    const res = await fetch('/api/clusters');
    allClusters = await res.json();
    renderClusters();
  } catch (err) {
    console.error("Failed to load clusters:", err);
  }
}

function filterClusters(status) {
  currentFilter = status;
  document.querySelectorAll('#workbench-view .filter-chip').forEach(c => {
    c.classList.toggle('active', c.innerText.toUpperCase().includes(status) || (status === 'ALL' && c.innerText.includes('All')));
  });
  renderClusters();
}

function renderClusters() {
  const container = document.getElementById('clusters-container');
  container.innerHTML = '';

  const filtered = allClusters.filter(c => {
    if (currentFilter === 'ALL') return true;
    return c.status === currentFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="content-card" style="text-align: center; color: var(--text-secondary); padding: 40px;">No clusters found in this view.</div>`;
    return;
  }

  filtered.forEach(c => {
    const isApproved = c.status === 'APPROVED';
    const card = document.createElement('div');
    card.className = `cluster-card ${isApproved ? 'approved' : 'pending'}`;

    // Rows of participating records
    let rowsHtml = '';
    c.records.forEach(r => {
      const attrs = r.attributes || {};
      const chips = [
        attrs.item_type ? `<span class="attr-chip">${attrs.item_type}</span>` : '',
        attrs.size_dimension ? `<span class="attr-chip">${attrs.size_dimension}</span>` : '',
        attrs.pressure_rating ? `<span class="attr-chip">${attrs.pressure_rating}</span>` : '',
        attrs.material_grade ? `<span class="attr-chip">${attrs.material_grade}</span>` : '',
        attrs.length_thickness ? `<span class="attr-chip">${attrs.length_thickness}</span>` : '',
        attrs.standard_norm ? `<span class="attr-chip">${attrs.standard_norm}</span>` : ''
      ].filter(Boolean).join('');

      rowsHtml += `
        <tr>
          <td><span class="cpse-tag ${r.cpse_id}">${r.cpse_id}</span></td>
          <td class="code-mono">${r.local_material_code}</td>
          <td class="raw-text-cell">${r.raw_description}</td>
          <td><div class="attr-chips">${chips}</div></td>
          <td><strong>${r.standard_uom}</strong></td>
        </tr>
      `;
    });

    // Action button or approved banner
    let actionAreaHtml = '';
    if (isApproved) {
      const assignedCnmc = c.records[0].assigned_cnmc || 'CNMC-PENDING';
      actionAreaHtml = `
        <div class="cnmc-banner">
          <div>
            <span class="cnmc-badge-sub">✓ HARMONIZED &amp; CODIFIED UNDER COMMON NATIONAL MATERIAL MASTER</span>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
              <span class="cnmc-code-text">${assignedCnmc}</span>
              <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('${assignedCnmc}', 'CNMC ${assignedCnmc} copied!')" title="Copy National Code" style="padding: 3px 8px; font-size: 11px;">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
            </div>
          </div>
          <span class="status-badge harmonized">MAPPING ACTIVE</span>
        </div>
      `;
    } else {
      actionAreaHtml = `
        <div class="cluster-actions">
          <button class="btn btn-danger btn-sm" onclick="rejectCluster('${c.cluster_id}')">Dismiss Pair</button>
          <button class="btn btn-success btn-sm" onclick="openApprovalModal('${c.cluster_id}', '${c.canonical_description}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Approve Harmonization & Issue CNMC
          </button>
        </div>
      `;
    }

    let decisionBadge = '';
    if (c.confidence_score >= 90) {
      decisionBadge = `<span class="badge-decision-exact">● EXACT DUPLICATE</span>`;
    } else if (c.confidence_score >= 75) {
      decisionBadge = `<span class="badge-decision-equiv">● TECHNICALLY EQUIVALENT</span>`;
    } else if (c.confidence_score >= 60) {
      decisionBadge = `<span class="badge-decision-alt">● FUNCTIONALLY ALTERNATIVE</span>`;
    } else {
      decisionBadge = `<span class="badge-decision-conflict">● CONFLICT</span>`;
    }

    card.innerHTML = `
      <div class="cluster-header">
        <div class="cluster-title-wrap">
          <span class="cluster-id">${c.cluster_id}</span>
          <span class="cluster-title">${c.canonical_description}</span>
        </div>
        <div class="cluster-meta-badges">
          ${decisionBadge}
          <span class="conf-badge">${c.confidence_score}% AI Confidence</span>
          <span class="savings-badge">Est. Savings: ₹${c.potential_savings_inr.toLocaleString()}</span>
        </div>
      </div>
      <div class="cluster-body">
        <div class="cluster-rationale">
          <strong>AI Rationale:</strong> ${c.rationale.join(' • ')}
        </div>
        <table class="spec-comparison-table">
          <thead>
            <tr>
              <th style="width: 80px;">CPSE</th>
              <th style="width: 170px;">Internal Code</th>
              <th>Legacy Description</th>
              <th>Standardized Parameters</th>
              <th style="width: 70px;">UoM</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        ${actionAreaHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

// 4. Modal Handlers (Requirement 5 & 7)
function openApprovalModal(clusterId, canonicalDesc) {
  selectedClusterId = clusterId;
  document.getElementById('modal-cluster-id').value = clusterId;
  document.getElementById('modal-canonical-desc').value = canonicalDesc;
  document.getElementById('modal-approver-role').value = currentActiveRole;
  document.getElementById('modal-justification').value = 'Verified physical and technical parameter equivalence across CPSE plants. Approved for Common National Code.';
  const modal = document.getElementById('approval-modal');
  if (modal) modal.classList.add('show', 'active');
}

function closeApprovalModal() {
  const modal = document.getElementById('approval-modal');
  if (modal) modal.classList.remove('show', 'active');
  selectedClusterId = null;
}

async function submitModalApproval() {
  if (!selectedClusterId) return;

  const approverName = document.getElementById('modal-approver-name').value;
  const role = document.getElementById('modal-approver-role').value;
  const justification = document.getElementById('modal-justification').value;

  try {
    const res = await fetch(`/api/clusters/${selectedClusterId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved_by: approverName,
        role: role,
        justification: justification
      })
    });
    const result = await res.json();
    if (result.status === 'SUCCESS') {
      logAuditEntry(`[${role}] ${approverName} approved cluster ${selectedClusterId}. Issued ${result.assigned_cnmc}. Justification: "${justification}"`);
      closeApprovalModal();
      showToast(`Cluster ${selectedClusterId} approved! Issued ${result.assigned_cnmc}`, 'success');
      await loadDashboardData();
      await loadClusters();
      await loadPipelineData();
      await loadCatalog();
    }
  } catch (err) {
    showToast("Approval error: " + err.message, 'error');
  }
}

// Manual Mapping Modal
function openManualMapModal() {
  const modal = document.getElementById('manual-map-modal');
  if (modal) modal.classList.add('show', 'active');
}

function closeManualMapModal() {
  const modal = document.getElementById('manual-map-modal');
  if (modal) modal.classList.remove('show', 'active');
}

async function submitManualMap() {
  const cpse = document.getElementById('manual-cpse-select').value;
  const localCode = document.getElementById('manual-local-code').value.trim();
  const targetCnmc = document.getElementById('manual-target-cnmc').value.trim();
  const justification = document.getElementById('manual-justification').value.trim();

  if (!localCode || !targetCnmc) {
    showToast("Please enter both Local Material Code and Target CNMC.", 'error');
    return;
  }

  try {
    const res = await fetch('/api/materials/manual-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpse_id: cpse,
        local_material_code: localCode,
        target_cnmc: targetCnmc,
        mapped_by: 'MANUAL_DATA_STEWARD',
        role: currentActiveRole,
        justification: justification || 'Manual code assignment per engineering drawing verification.'
      })
    });
    const result = await res.json();
    if (result.status === 'SUCCESS') {
      logAuditEntry(`Manual Mapping executed: ${cpse}:${localCode} -> ${targetCnmc}`);
      closeManualMapModal();
      showToast(`Mapped ${localCode} to ${targetCnmc}`, 'success');
      await loadDashboardData();
      await loadPipelineData();
      await loadCatalog();
    } else {
      showToast("Error: " + (result.detail || 'Manual mapping failed'), 'error');
    }
  } catch (err) {
    showToast("Manual map failed: " + err.message, 'error');
  }
}

// Reversal prompt (Requirement 7)
async function revertMappingPrompt(cpseId, localCode) {
  const reason = prompt(`Enter reason for reverting mapping on ${cpseId}:${localCode}:`, "Revising metallurgical specification as per physical sample.");
  if (!reason) return;

  try {
    const res = await fetch('/api/mappings/revert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpse_id: cpseId,
        local_material_code: localCode,
        reverted_by: 'QUALITY_OFFICER',
        reason: reason
      })
    });
    const result = await res.json();
    if (result.status === 'SUCCESS') {
      logAuditEntry(`Mapping reverted on ${cpseId}:${localCode}. Reason: ${reason}`);
      showToast(`Mapping reverted for ${localCode}`, 'info');
      await loadDashboardData();
      await loadPipelineData();
      await loadCatalog();
    }
  } catch (err) {
    showToast("Revert error: " + err.message, 'error');
  }
}

async function rejectCluster(clusterId) {
  try {
    const res = await fetch(`/api/clusters/${clusterId}/reject`, { method: 'POST' });
    const result = await res.json();
    if (result.status === 'REJECTED') {
      logAuditEntry(`Rejected cluster ${clusterId}.`);
      await loadDashboardData();
      await loadClusters();
      await loadPipelineData();
    }
  } catch (err) {
    alert("Rejection error: " + err.message);
  }
}

function logAuditEntry(message) {
  loadGovernanceLedger();
}

async function loadGovernanceLedger() {
  const container = document.getElementById('audit-log-container');
  if (!container) return;

  try {
    const res = await fetch('/api/governance/ledger');
    const data = await res.json();
    container.innerHTML = '';

    if (data.chain && data.chain.length > 0) {
      data.chain.forEach(tx => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const cnmcHtml = tx.assigned_cnmc 
          ? `<div class="log-sub">Issued Common National Code: <span class="cnmc-pill">${tx.assigned_cnmc}</span></div>` 
          : '';
        const recsHtml = tx.participating_records && tx.participating_records.length > 0 
          ? `<div class="log-sub text-muted">Records: ${tx.participating_records.join(', ')}</div>` 
          : '';

        entry.innerHTML = `
          <div class="log-time" style="display: flex; justify-content: space-between; align-items: center;">
            <span>${tx.tx_id} &bull; ${new Date(tx.timestamp).toLocaleTimeString()}</span>
            <span style="font-family: var(--font-mono); font-size: 9px; color: var(--emerald-secondary);">SHA-256 VERIFIED</span>
          </div>
          <div class="log-details">
            <strong>${tx.actor}</strong> &mdash; <code>${tx.action}</code>
            ${cnmcHtml}
            ${recsHtml}
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-tertiary); margin-top: 6px; word-break: break-all;">
              Hash: ${tx.current_hash.substring(0, 16)}... | Prev: ${tx.previous_hash.substring(0, 16)}...
            </div>
          </div>
        `;
        container.appendChild(entry);
      });
    }
  } catch (err) {
    console.error("Failed to load governance ledger:", err);
  }
}

// 5. Catalog Search
let searchTimeout = null;
function handleCatalogSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadCatalog, 250);
}

async function loadCatalog() {
  const query = document.getElementById('catalog-search-input')?.value || '';
  const cpse = document.getElementById('cpse-filter-select')?.value || '';

  const url = new URL('/api/catalog', window.location.origin);
  if (query) url.searchParams.set('query', query);
  if (cpse) url.searchParams.set('cpse', cpse);

  try {
    const res = await fetch(url.toString());
    const items = await res.json();
    const tbody = document.getElementById('catalog-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">No matching materials found.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const cnmcHtml = item.assigned_cnmc 
        ? `<span class="cnmc-pill" title="Common National Material Code">${item.assigned_cnmc}</span>`
        : `<span style="color: var(--text-tertiary); font-size: 11px;">Unmapped</span>`;

      const statusBadge = item.match_status === 'HARMONIZED'
        ? `<span class="status-badge harmonized">HARMONIZED</span>`
        : (item.match_status === 'CANDIDATE_MATCH'
            ? `<span class="status-badge candidate">PENDING MATCH</span>`
            : `<span class="status-badge unprocessed">UNPROCESSED</span>`);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="cpse-tag ${item.cpse_id}">${item.cpse_id}</span></td>
        <td class="code-mono">${item.local_material_code}</td>
        <td>${cnmcHtml}</td>
        <td>
          <strong>${item.standard_description}</strong>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${item.taxonomy_path}</div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--cyan-primary);">${item.size_dimension || '-'}</span> | 
          <span style="font-size: 12px; color: var(--gold-tertiary);">${item.material_grade || item.pressure_rating || '-'}</span>
        </td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load catalog:", err);
  }
}

// 7. Upload Catalog Modal Handlers
let selectedUploadFile = null;

function openUploadModal() {
  const modal = document.getElementById('upload-catalog-modal');
  if (modal) {
    modal.classList.add('show', 'active');
    selectedUploadFile = null;
    document.getElementById('csv-file-input').value = '';
    const badge = document.getElementById('selected-file-name');
    if (badge) {
      badge.style.display = 'none';
      badge.innerText = '';
    }
    const status = document.getElementById('upload-status-msg');
    if (status) {
      status.innerText = '';
      status.style.color = '';
    }
    const btn = document.getElementById('btn-submit-upload');
    if (btn) btn.disabled = false;
  }
}

function closeUploadModal() {
  const modal = document.getElementById('upload-catalog-modal');
  if (modal) modal.classList.remove('show', 'active');
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedUploadFile = file;
    const badge = document.getElementById('selected-file-name');
    if (badge) {
      badge.style.display = 'inline-flex';
      badge.innerText = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }
  }
}

async function submitCatalogUpload() {
  if (!selectedUploadFile) {
    alert("Please select or drop a CSV file to upload.");
    return;
  }

  const status = document.getElementById('upload-status-msg');
  const btn = document.getElementById('btn-submit-upload');
  if (status) {
    status.innerText = "Processing & normalizing material codes...";
    status.style.color = "var(--cyan-primary)";
  }
  if (btn) btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('file', selectedUploadFile);

    const res = await fetch('/api/upload-catalog', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Upload failed");
    }

    if (status) {
      status.innerText = `✓ Successfully ingested ${data.parsed_records} items!`;
      status.style.color = "var(--emerald-secondary)";
    }

    // Refresh dashboards and views
    setTimeout(() => {
      closeUploadModal();
      loadDashboardData();
      loadPipelineData();
      loadClusters();
      loadCatalog();
      loadGovernanceLedger();
    }, 1200);

  } catch (err) {
    if (status) {
      status.innerText = `❌ Error: ${err.message}`;
      status.style.color = "var(--rose-danger)";
    }
    if (btn) btn.disabled = false;
  }
}

// Setup drag and drop for upload zone
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('csv-drop-zone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        selectedUploadFile = files[0];
        const badge = document.getElementById('selected-file-name');
        if (badge) {
          badge.style.display = 'inline-flex';
          badge.innerText = `📄 ${files[0].name} (${(files[0].size / 1024).toFixed(1)} KB)`;
        }
      }
    }, false);
  }
});

// Interactive Toast & Clipboard Utilities
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-pill toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function copyToClipboard(text, msg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg, 'success');
    }).catch(() => {
      fallbackCopy(text, msg);
    });
  } else {
    fallbackCopy(text, msg);
  }
}

function fallbackCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast(msg, 'success');
}

// Global modal dismiss listeners (Escape key and backdrop click)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeApprovalModal();
    closeManualMapModal();
    closeUploadModal();
  }
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
    closeApprovalModal();
    closeManualMapModal();
    closeUploadModal();
  }
});

