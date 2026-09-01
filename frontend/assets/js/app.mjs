import { modules, navigationItems, quickActions } from './data.mjs?v=20260831.01'
import { contentEditorSlug, contentWordCount, escapeHtml, filterRows, normalizeTags, routeFromHash, sitePublicPath, statusClass } from './utils.mjs?v=20260831.01'

const $ = (selector, scope = document) => scope.querySelector(selector)
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]
const dashboardView = $('#dashboard-view')
const moduleView = $('#module-view')
const contentEditorView = $('#content-editor-view')
const mainContent = $('#main-content')
const entityDialog = $('#entity-dialog')
const entityForm = $('#entity-form')
const localizationDialog = $('#localization-dialog')
const localizationForm = $('#localization-form')
const aiProviderDialog = $('#ai-provider-dialog')
const aiProviderForm = $('#ai-provider-form')
const realRoutes = new Set(['sites', 'languages', 'content', 'taxonomy', 'templates', 'seo', 'urls', 'media', 'publishing', 'localization', 'users', 'audit', 'settings'])
const apiRoutes = new Set(['sites', 'languages', 'content', 'taxonomy', 'templates', 'seo', 'urls', 'media', 'publishing', 'localization', 'users', 'audit', 'settings'])
const siteScopedRoutes = new Set(['content', 'taxonomy', 'urls', 'publishing', 'localization'])
const contentBulkSelectionLimit = 100
const moduleState = { route: '', contentSection: '', contentScope: 'all', query: '', filter: '', selected: new Set() }
const contentEditorState = { key: '', item: null, newLocale: false, draftTimer: 0, seoTimer: 0, dirty: false, rendering: false, richSelection: null, imageUploading: false }
const templateEditorState = {
  expandedID: '',
  filesByTheme: new Map(),
  assetsByTheme: new Map(),
  activeByTheme: new Map(),
  loading: new Set(),
  errors: new Map(),
  changeNotes: new Map(),
}
const liveState = {
  csrfToken: $('meta[name="csrf-token"]')?.content ?? '',
  permissions: new Set(),
  sites: [],
  languages: [],
  siteLanguages: new Map(),
  siteDomains: new Map(),
  templates: null,
  taxonomy: [],
  roles: [],
  backups: [],
  systemStatus: null,
  aiConfiguration: null,
  seoSitemaps: null,
  localizationAIAvailable: false,
  me: null,
  loaded: new Set(),
  loading: new Set(),
  errors: new Map(),
}

class APIError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const siteStatus = { active: '运行中', maintenance: '维护中', disabled: '已停用' }
const languageStatus = { true: '已启用', false: '未启用' }
const contentStatus = { draft: '草稿', review: '待审核', published: '已发布', scheduled: '定时发布', needs_update: '需要更新', archived: '已归档' }
const contentTypes = { article: '文章', page: '页面', landing: '落地页', category: '栏目', product: '产品' }
const releaseTypes = { content: '内容增量', template: '模板变更', full: '全站发布' }
const releaseStatus = { queued: '排队中', running: '进行中', completed: '已完成', failed: '失败', rolled_back: '已回滚' }
const localizationStatus = { running: '执行中', completed: '已完成', partial: '部分完成', failed: '失败' }

function isScheduledContent(item) {
  if (item?.status !== 'published' || !item?.scheduled_at) return false
  const scheduled = new Date(item.scheduled_at).getTime()
  return Number.isFinite(scheduled) && scheduled > Date.now()
}

function icon(name, className = 'icon') {
  return `<svg class="${className}" aria-hidden="true"><use href="#i-${escapeHtml(name)}"></use></svg>`
}

function showToast(message, timeout = 3200) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.innerHTML = `${icon('check')}<span>${escapeHtml(message)}</span>`
  $('#toast-region').append(toast)
  window.setTimeout(() => toast.remove(), timeout)
}

function can(permission) {
  return liveState.permissions.has(permission)
}

function currentSiteID() {
  const value = Number($('#site-switcher')?.dataset.siteId || 0)
  return Number.isInteger(value) && value > 0 ? value : 0
}

function currentSite() {
  const siteID = currentSiteID()
  return liveState.sites.find((site) => Number(site.id) === siteID) ?? null
}

function isEnglishLocaleCode(locale) {
  const normalized = String(locale || '').trim().toLowerCase()
  return normalized === 'en' || normalized.startsWith('en-')
}

function defaultEnglishSite() {
  return liveState.sites.find((site) => String(site.code).toLowerCase() === 'global')
    ?? liveState.sites.find((site) => String(site.market_code).toUpperCase() === 'GLOBAL')
    ?? liveState.sites[0]
    ?? null
}

function siteScopedAPIPath(path) {
  const siteID = currentSiteID()
  if (!siteID) return path
  return `${path}${path.includes('?') ? '&' : '?'}site_id=${encodeURIComponent(siteID)}`
}

function isAllSitesContentScope() {
  return moduleState.contentScope === 'all'
}

function contentScopeLabel() {
  return isAllSitesContentScope() ? '所有可访问站点' : `当前站点：${currentSite()?.name || '未选择站点'}`
}

function renderContentScopePicker() {
  const allSites = isAllSitesContentScope()
  const loading = liveState.loading.has('content')
  return `<label class="content-scope-picker"><span>内容范围</span><select data-content-scope aria-label="选择内容查看范围" ${loading ? 'disabled' : ''}>
    <option value="current" ${allSites ? '' : 'selected'}>当前站点</option>
    <option value="all" ${allSites ? 'selected' : ''}>所有可访问站点</option>
  </select></label>`
}

function renderContentBulkTrigger(config) {
  if (!can('content.write')) return ''
  const selectableRows = filterRows(config.rows, moduleState.query, moduleState.filter).filter((row) => rowCanBeSelected('content', row))
  const selectedCount = moduleState.selected.size
  const selectableWithinLimit = selectableRows.slice(0, contentBulkSelectionLimit)
  const allSelected = selectableWithinLimit.length > 0 && selectableWithinLimit.every((row) => moduleState.selected.has(String(row.id)))
  const label = allSelected ? '取消批量选择' : selectedCount ? `已选 ${selectedCount} 项` : '批量操作'
  const title = allSelected ? '取消当前筛选结果的选择' : selectableRows.length ? `选择当前筛选结果（最多 ${contentBulkSelectionLimit} 条）后进行批量操作` : '当前筛选结果没有可操作内容'
  return `<button class="button button-secondary button-compact content-bulk-trigger" type="button" data-content-bulk-select aria-pressed="${selectedCount > 0}" title="${title}" ${selectableRows.length ? '' : 'disabled'}>${icon('clipboard', 'icon icon-sm')}<span>${label}</span></button>`
}

function viewPermission(route) {
  if (['dashboard', 'sites', 'languages'].includes(route)) return 'dashboard.view'
  if (route === 'content') return 'content.read'
  if (route === 'taxonomy') return 'content.read'
  if (route === 'templates') return 'templates.manage'
  if (route === 'seo' || route === 'localization') return 'seo.manage'
  if (route === 'media') return 'media.read'
  if (route === 'users') return 'users.manage'
  if (route === 'audit') return 'audit.read'
  if (route === 'settings') return 'system.view'
  if (route === 'jobs') return 'jobs.manage'
  if (['urls', 'publishing'].includes(route)) return 'publishing.manage'
  return 'dashboard.view'
}

function applyNavigationPermissions() {
	$$('.primary-nav [data-route]').forEach((link) => { link.hidden = !can(viewPermission(link.dataset.route)) })
	const contentSubnav = $('[data-content-subnav]')
	if (contentSubnav) contentSubnav.hidden = !can('content.read')
	const settingsSubnav = $('[data-settings-subnav]')
	if (settingsSubnav) settingsSubnav.hidden = !can('system.view')
	const seoSubnav = $('[data-seo-subnav]')
	if (seoSubnav) seoSubnav.hidden = !can('seo.manage')
}

function editPermission(route) {
  return route === 'sites' ? 'sites.manage'
    : route === 'languages' ? 'languages.manage'
      : route === 'content' ? 'content.write'
        : route === 'taxonomy' ? 'content.write'
        : route === 'templates' ? 'templates.manage'
          : route === 'media' ? 'media.upload'
                : route === 'users' ? 'users.manage'
                  : route === 'audit' ? 'audit.read'
                    : route === 'localization' ? 'content.write'
                    : route === 'settings' ? 'backup.manage'
                  : ['urls', 'publishing'].includes(route) ? 'publishing.manage' : ''
}

async function fetchJSON(path, options = {}) {
  const method = String(options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers ?? {})
  headers.set('Accept', 'application/json')
  let body = options.body
  if (body != null && typeof body !== 'string' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRF-Token', liveState.csrfToken)
  const response = await fetch(path, { ...options, method, headers, body, credentials: 'same-origin' })
  if (response.status === 401) {
    location.assign(`/login?next=${encodeURIComponent(location.pathname + location.hash)}`)
    throw new APIError('登录状态已失效，请重新登录', 401)
  }
  let payload = null
  try { payload = await response.json() } catch { /* empty response */ }
  if (!response.ok) throw new APIError(payload?.error || `请求失败（HTTP ${response.status}）`, response.status)
  return payload
}

function closePopovers(except = null) {
  $$('.popover, .search-results').forEach((element) => {
    if (element !== except) element.hidden = true
  })
  $$('[aria-expanded="true"]').forEach((button) => {
    const target = button.id === 'site-switcher' ? $('#site-menu') : button.id === 'notification-button' ? $('#notification-menu') : button.id === 'account-button' ? $('#account-menu') : null
    if (target && target !== except) button.setAttribute('aria-expanded', 'false')
  })
}

function togglePopover(button, popover) {
  const willOpen = popover.hidden
  closePopovers(popover)
  popover.hidden = !willOpen
  button.setAttribute('aria-expanded', String(willOpen))
  if (willOpen) popover.querySelector('button, a')?.focus()
}

function badge(value) {
  return `<span class="badge ${statusClass(value)}">${escapeHtml(value)}</span>`
}

function renderStats(stats, className = '') {
  return `<section class="stats-grid ${className}" aria-label="关键状态">${stats.map((item) => `
    <article class="stat-card"><div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div><span class="stat-icon tone-${escapeHtml(item.tone)}">${icon(item.icon)}</span></article>
  `).join('')}</section>`
}

function sitePreviewURL(row) {
  const port = Number(row?._raw?.local_port || 0)
  return port >= 1024 && port <= 65535 ? `http://localhost:${port}/` : ''
}

function rowCanBeSelected(route, row) {
  if (route === 'sites') return can('sites.manage') && row?._raw?.status !== 'disabled'
  if (route === 'content') return can('content.write')
	if (['media', 'users', 'audit', 'settings', 'taxonomy', 'localization'].includes(route)) return false
  return true
}

function selectableRowsForBulk(route, rows) {
  return route === 'content' ? rows.slice(0, contentBulkSelectionLimit) : rows
}

function renderSiteRowActions(row, editable) {
  const label = escapeHtml(row.name || '站点')
  const previewURL = sitePreviewURL(row)
  const disabled = row?._raw?.status === 'disabled'
  return `<div class="row-actions" aria-label="${label}操作">
    ${editable ? `<button class="row-action-button row-action-edit" type="button" data-site-edit aria-label="编辑${label}">${icon('edit', 'icon icon-sm')}<span>编辑</span></button>` : ''}
    ${previewURL && !disabled ? `<a class="row-action-button row-action-preview" href="${escapeHtml(previewURL)}" target="_blank" rel="noopener" aria-label="在新窗口预览${label}">${icon('eye', 'icon icon-sm')}<span>预览</span></a>` : `<button class="row-action-button row-action-preview" type="button" disabled title="已停用站点没有本地预览" aria-label="预览${label}">${icon('eye', 'icon icon-sm')}<span>预览</span></button>`}
    ${editable ? `<button class="row-action-button row-action-danger" type="button" data-site-delete aria-label="删除${label}" ${disabled ? 'disabled title="此站点已经停用"' : ''}>${icon('trash', 'icon icon-sm')}<span>删除</span></button>` : ''}
  </div>`
}

function renderContentRowActions(row, editable) {
  const label = escapeHtml(row.name || '内容')
	const raw = row?._raw
	const site = liveState.sites.find((candidate) => Number(candidate.id) === Number(raw?.site_id))
	const publishedURL = raw?.status === 'published' && !isScheduledContent(raw) && site ? contentFrontendPreviewURL(site, raw) : ''
	const securedPreviewURL = raw?.content_id && raw?.site_id && raw?.locale ? `/admin/content-preview/${encodeURIComponent(raw.content_id)}/${encodeURIComponent(raw.site_id)}/${encodeURIComponent(raw.locale)}` : ''
	const viewURL = publishedURL || securedPreviewURL
	const viewTitle = publishedURL ? '在新窗口打开已发布的前端页面' : '在新窗口使用前端模板安全预览'
  return `<div class="row-actions content-row-actions" aria-label="${label}操作">
    ${editable ? `<button class="row-action-button row-action-edit" type="button" data-content-edit aria-label="编辑${label}">${icon('edit', 'icon icon-sm')}<span>编辑</span></button>` : ''}
		${viewURL ? `<a class="row-action-button row-action-preview" href="${escapeHtml(viewURL)}" target="_blank" rel="noopener" aria-label="${viewTitle}：${label}">${icon('eye', 'icon icon-sm')}<span>查看</span></a>` : `<button class="row-action-button row-action-preview" type="button" data-content-view aria-label="查看${label}">${icon('eye', 'icon icon-sm')}<span>查看</span></button>`}
    ${editable ? `<button class="row-action-button row-action-danger" type="button" data-content-delete aria-label="删除${label}">${icon('trash', 'icon icon-sm')}<span>删除</span></button>` : ''}
  </div>`
}

function templatePreviewPath(item) {
  if (!item?.renderable) return ''
  const binding = Array.isArray(item.bindings) ? item.bindings[0] : null
  const siteCode = binding?.site_code || liveState.sites[0]?.code || 'global'
  const locale = binding?.locale || 'en'
  return `/admin/template-preview/${encodeURIComponent(item.id)}/${encodeURIComponent(siteCode)}/${encodeURIComponent(locale)}`
}

function renderTemplateRowActions(row) {
  const label = escapeHtml(row.name || '模板')
  const previewPath = templatePreviewPath(row._raw)
  const expanded = String(templateEditorState.expandedID) === String(row.id)
  return `<div class="row-actions template-row-actions" aria-label="${label}操作">
    <button class="row-action-button row-action-edit" type="button" data-template-toggle aria-expanded="${expanded}" aria-controls="template-workspace-${escapeHtml(row.id)}" aria-label="${expanded ? '收起' : '编辑'}${label}">${icon('edit', 'icon icon-sm')}<span>${expanded ? '收起' : '编辑'}</span></button>
    <button class="row-action-button row-action-edit" type="button" data-template-details aria-label="查看${label}详情">${icon('file', 'icon icon-sm')}<span>详情</span></button>
    ${previewPath ? `<a class="row-action-button row-action-preview" href="${escapeHtml(previewPath)}" target="_blank" rel="noopener" aria-label="在新窗口预览${label}">${icon('eye', 'icon icon-sm')}<span>预览</span></a>` : `<button class="row-action-button row-action-preview" type="button" disabled title="模板通过渲染编译后才能预览" aria-label="预览${label}">${icon('eye', 'icon icon-sm')}<span>预览</span></button>`}
  </div>`
}

const templateGroupLabels = { layout: '公共结构', page: '页面模板', system: '系统页面' }

function templateDraftValue(file) {
  return file?._draft ?? file?.content ?? ''
}

function templateLineNumbers(source) {
  const count = Math.max(1, String(source || '').split('\n').length)
  return Array.from({ length: count }, (_, index) => String(index + 1)).join('\n')
}

function templateFileIcon(file) {
  if (file?.key === 'home') return 'home'
  if (file?.key === 'header' || file?.key === 'footer') return 'layers'
  if (file?.key === 'not_found') return 'alert'
  if (file?.key === 'search') return 'search'
  return 'file'
}

function renderTemplateFileTree(themeID, files, activeKey, assets = []) {
  const groups = ['layout', 'page', 'system']
  return groups.map((group) => {
    const children = files.filter((file) => file.group === group)
    if (!children.length) return ''
    return `<section class="template-file-group" aria-labelledby="template-group-${escapeHtml(themeID)}-${group}">
      <h4 id="template-group-${escapeHtml(themeID)}-${group}">${escapeHtml(templateGroupLabels[group] || group)}<span>${children.length}</span></h4>
      ${children.map((file) => `<div class="template-file-entry ${file.key === 'page' ? 'is-page' : ''}"><button class="template-file-button ${file.key === activeKey ? 'is-active' : ''} ${file._dirty ? 'is-dirty' : ''}" type="button" data-template-file="${escapeHtml(file.key)}" aria-pressed="${file.key === activeKey}">${icon(templateFileIcon(file), 'icon icon-sm')}<span><strong>${escapeHtml(file.label)}</strong><small>${escapeHtml(file.filename)}</small></span><i aria-label="${file._dirty ? '有未保存修改' : '已保存'}"></i></button>${file.key === 'page' ? `<a class="template-page-manager-link" href="#/admin/content?section=pages" title="管理使用此模板的单页面">管理页面</a><a class="template-page-create-link" href="#/admin/content?section=pages&editor=create&content_type=page" title="新建一个单页面">新建页面</a>` : ''}</div>`).join('')}
    </section>`
  }).join('') + (assets.length ? `<section class="template-file-group" aria-label="模板 CSS 与 JS 资源"><h4>样式与交互<span>${assets.length}</span></h4>${assets.map((asset) => `<div class="template-file-entry"><button class="template-file-button ${asset.key === activeKey ? 'is-active' : ''} ${asset._dirty ? 'is-dirty' : ''}" type="button" data-template-asset="${escapeHtml(asset.key)}" aria-pressed="${asset.key === activeKey}">${icon(asset.type === 'css' ? 'layers' : 'code', 'icon icon-sm')}<span><strong>${escapeHtml(asset.label)}</strong><small>${escapeHtml(asset.filename)}</small></span><i aria-label="${asset._dirty ? '有未保存修改' : '已保存'}"></i></button></div>`).join('')}</section>` : '')
}

function renderTemplateValidation(file) {
  const validation = file?._validation
  const valid = validation?.valid === true
  const invalid = validation && !validation.valid
  const stateClass = valid ? 'is-valid' : invalid ? 'is-invalid' : ''
  const label = valid ? '校验通过' : invalid ? '需要修正' : '等待校验'
  const message = validation?.message || '保存前会执行 Go 模板解析、危险标签检查和文件大小检查。'
  return `<div class="template-validation ${stateClass}" role="${invalid ? 'alert' : 'status'}" aria-live="polite">${icon(valid ? 'check' : invalid ? 'alert' : 'lock')}<span><strong>${label}</strong><small>${escapeHtml(message)}</small></span></div>`
}

function renderTemplateWorkspace(row) {
  const item = row._raw
  const themeID = String(row.id)
  const workspaceID = `template-workspace-${themeID}`
  const previewPath = templatePreviewPath(item)
  if (templateEditorState.loading.has(themeID)) {
    return `<tr class="template-workspace-row"><td colspan="${modules.templates.columns.length + 2}"><section class="template-workspace template-workspace-loading" id="${workspaceID}" aria-label="正在读取${escapeHtml(row.name)}模板文件"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div><span>正在安全读取模板清单…</span></section></td></tr>`
  }
  const error = templateEditorState.errors.get(themeID)
  if (error) {
    return `<tr class="template-workspace-row"><td colspan="${modules.templates.columns.length + 2}"><section class="template-workspace template-workspace-error" id="${workspaceID}">${icon('alert')}<span><strong>模板工作区加载失败</strong><small>${escapeHtml(error)}</small></span><button class="button button-secondary button-compact" type="button" data-template-retry>重新加载</button></section></td></tr>`
  }
  const files = templateEditorState.filesByTheme.get(themeID) || []
  const assets = templateEditorState.assetsByTheme.get(themeID) || []
  if (!files.length && !assets.length) {
    return `<tr class="template-workspace-row"><td colspan="${modules.templates.columns.length + 2}"><section class="template-workspace template-workspace-error" id="${workspaceID}">${icon('file')}<span><strong>模板包没有可编辑文件</strong><small>请在 theme.json 中声明头部、尾部和页面模板文件。</small></span></section></td></tr>`
  }
  let activeKey = templateEditorState.activeByTheme.get(themeID)
  if (!files.some((file) => file.key === activeKey) && !assets.some((asset) => asset.key === activeKey)) activeKey = files[0]?.key || assets[0]?.key
  templateEditorState.activeByTheme.set(themeID, activeKey)
  const active = files.find((file) => file.key === activeKey) || assets.find((asset) => asset.key === activeKey)
  const source = templateDraftValue(active)
  const changed = Boolean(active?._dirty)
  const note = templateEditorState.changeNotes.get(themeID) || ''
  return `<tr class="template-workspace-row"><td colspan="${modules.templates.columns.length + 2}">
    <section class="template-workspace" id="${workspaceID}" data-template-workspace="${escapeHtml(themeID)}" aria-label="${escapeHtml(row.name)}模板编辑器">
      <header class="template-workspace-header">
        <div class="template-workspace-title"><span class="template-workspace-mark">${icon('template')}</span><span><small>模板结构编辑</small><strong>${escapeHtml(row.name)}</strong></span>${badge(item.renderable ? '当前可渲染' : '草稿模板')}</div>
        <div class="template-workspace-actions">${previewPath ? `<a class="button button-secondary button-compact" href="${escapeHtml(previewPath)}" target="_blank" rel="noopener">${icon('eye', 'icon icon-sm')}整站预览</a>` : ''}<button class="icon-button compact" type="button" data-template-close aria-label="收起模板编辑器">${icon('close')}</button></div>
      </header>
      <div class="template-editor-layout">
        <nav class="template-file-tree" aria-label="模板组成文件">${renderTemplateFileTree(themeID, files, activeKey, assets)}</nav>
        <section class="template-code-panel" aria-labelledby="template-file-title-${escapeHtml(themeID)}">
          <header class="template-code-header">
            <div><span class="template-code-language">${active._asset ? escapeHtml(active.type.toUpperCase()) : 'HTML'}</span><span><strong id="template-file-title-${escapeHtml(themeID)}">${escapeHtml(active.label)}</strong><small>${escapeHtml(active.filename)} · v${escapeHtml(active.version)}</small></span></div>
            <div class="template-code-actions"><button class="button button-quiet button-compact" type="button" data-template-revert ${changed ? '' : 'disabled'}>撤销未保存</button><button class="button button-secondary button-compact" type="button" data-template-validate>${icon('check', 'icon icon-sm')}校验代码</button><button class="button button-primary button-compact" type="button" data-template-save ${changed ? '' : 'disabled'}>${icon('edit', 'icon icon-sm')}保存修订</button></div>
          </header>
          <div class="template-code-shell">
            <pre class="template-line-numbers" aria-hidden="true">${templateLineNumbers(source)}</pre>
            <textarea class="template-source" data-template-source spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="编辑 ${escapeHtml(active.label)}">${escapeHtml(source)}</textarea>
          </div>
          <footer class="template-code-footer"><span data-template-save-state class="${changed ? 'is-dirty' : ''}"><i></i>${changed ? '有未保存修改' : '全部修改已保存'}</span><span><b data-template-lines>${escapeHtml(String(source.split('\n').length))}</b> 行 · <b data-template-bytes>${escapeHtml(String(new TextEncoder().encode(source).length))}</b> 字节 · Ctrl / ⌘ + S 保存</span></footer>
        </section>
        <aside class="template-inspector" aria-label="模板文件说明">
          ${renderTemplateValidation(active)}
          <section><h4>可用数据</h4><div class="template-variable-list"><code>.SiteName</code><code>.HomePath</code><code>.Locale</code><code>.Copy</code><code>.Content</code><code>.Published</code></div><p>字段由服务端白名单提供，模板不能读取数据库、服务器文件或执行命令。</p></section>
          <label class="template-change-note"><span>本次修改说明</span><textarea rows="3" maxlength="200" data-template-change-note placeholder="例如：调整英语站头部导航结构">${escapeHtml(note)}</textarea><small>会与修订版本一起写入审计记录。</small></label>
          <section class="template-revision-summary"><h4>修订记录</h4><p><strong>${escapeHtml(active.change_count || 0)}</strong> 次保存 · 最近由 ${escapeHtml(active.updated_by || 'CZCMS 系统')} 更新</p><small>${escapeHtml(formatDate(active.updated_at))}</small></section>
          <div class="template-draft-note">${icon('lock', 'icon icon-sm')}<span><strong>安全草稿</strong><small>保存只建立模板修订，不会直接替换正在运行的前台模板。</small></span></div>
        </aside>
      </div>
    </section>
  </td></tr>`
}

function renderMediaRowActions(row, editable) {
  const label = escapeHtml(row.name || '媒体')
  const item = row._raw
  return `<div class="row-actions media-row-actions" aria-label="${label}操作">
    <a class="row-action-button row-action-preview" href="${escapeHtml(item?.url || '#')}" target="_blank" rel="noopener" aria-label="在新窗口查看${label}">${icon('eye', 'icon icon-sm')}<span>查看</span></a>
    ${editable ? `<button class="row-action-button row-action-edit" type="button" data-media-edit aria-label="编辑${label} Alt 文本">${icon('edit', 'icon icon-sm')}<span>编辑</span></button><button class="row-action-button row-action-danger" type="button" data-media-delete aria-label="删除${label}" ${Number(item?.reference_count || 0) > 0 ? 'disabled title="媒体仍被内容引用，不能删除"' : ''}>${icon('trash', 'icon icon-sm')}<span>删除</span></button>` : ''}
  </div>`
}

function renderUserRowActions(row, editable) {
  if (!editable) return '—'
  const label = escapeHtml(row.name || '用户')
  return `<div class="row-actions"><button class="row-action-button row-action-edit" type="button" data-user-edit aria-label="编辑${label}权限">${icon('edit', 'icon icon-sm')}<span>权限</span></button></div>`
}

function renderAuditRowActions(row) {
  return `<button class="row-action-button row-action-preview" type="button" data-audit-view aria-label="查看审计记录 ${escapeHtml(row.id)}">${icon('eye', 'icon icon-sm')}<span>详情</span></button>`
}

function renderLocalizationRowActions(row) {
  const job = row?._raw
  const editPath = job?.content_id && job?.source_site_id && job?.source_locale
    ? `#/admin/content?editor=edit&content_id=${encodeURIComponent(job.content_id)}&site_id=${encodeURIComponent(job.source_site_id)}&locale=${encodeURIComponent(job.source_locale)}` : ''
  return `<div class="row-actions localization-row-actions" aria-label="本土化任务操作">
    ${editPath ? `<a class="row-action-button row-action-edit" href="${escapeHtml(editPath)}" aria-label="打开英语源内容">${icon('edit', 'icon icon-sm')}<span>源内容</span></a>` : ''}
    <button class="row-action-button row-action-preview" type="button" data-localization-details aria-label="查看本土化任务详情">${icon('eye', 'icon icon-sm')}<span>结果</span></button>
  </div>`
}

function renderTaxonomyRowActions(row, editable) {
	if (!editable) return '—'
	const label = escapeHtml(row.name || '栏目或标签')
	const disabled = row?._raw?.status === 'disabled'
	return `<div class="row-actions" aria-label="${label}操作"><button class="row-action-button row-action-edit" type="button" data-taxonomy-edit aria-label="编辑${label}">${icon('edit', 'icon icon-sm')}<span>编辑</span></button><button class="row-action-button row-action-danger" type="button" data-taxonomy-disable aria-label="停用${label}" ${disabled ? 'disabled title="此条目已经停用"' : ''}>${icon('trash', 'icon icon-sm')}<span>停用</span></button></div>`
}

function renderBulkActions(config) {
  const count = moduleState.selected.size
  if (moduleState.route === 'sites' && can('sites.manage')) {
    if (!count) return ''
    return `<div class="bulk-action-bar" role="region" aria-label="站点批量操作">
      <span><strong>已选择 ${count} 个站点</strong><small>删除将安全停用站点并保留内容与审计数据。</small></span>
      <button class="button button-danger button-compact" type="button" data-bulk-delete-sites>批量删除</button>
    </div>`
  }
  if (moduleState.route === 'content' && can('content.write')) {
    const selectedRows = activeModuleConfig('content').rows.filter((row) => moduleState.selected.has(String(row.id)))
    const groupCount = new Set(selectedRows.map((row) => String(row._raw?.content_id || row.id))).size
    const disabled = count ? '' : 'disabled'
    const heading = count ? `批量操作 · 已选择 ${count} 个语言版本` : '批量操作'
    const helper = count ? `涉及 ${groupCount} 个内容组；批量删除会原子地将所有内容组移到回收站。` : `请先勾选内容；可批量修改状态、栏目或删除（每次最多 ${contentBulkSelectionLimit} 个语言版本）。`
    return `<div class="bulk-action-bar" role="region" aria-label="内容批量操作">
      <span><strong>${heading}</strong><small>${helper}</small></span>
      <div class="bulk-action-controls">
        <label><span class="visually-hidden">批量设置内容状态</span><select data-bulk-content-status ${disabled}><option value="draft">草稿</option><option value="review">待审核</option><option value="published">已发布</option><option value="needs_update">需要更新</option><option value="archived">已归档</option></select></label>
        <button class="button button-secondary button-compact" type="button" data-bulk-update-status ${disabled}>应用状态</button>
        <label><span class="visually-hidden">批量设置栏目</span><input type="text" maxlength="100" placeholder="栏目名称；留空可清除" data-bulk-content-category ${disabled}></label>
        <button class="button button-secondary button-compact" type="button" data-bulk-update-category ${disabled}>修改栏目</button>
        <button class="button button-quiet button-compact" type="button" data-clear-selection ${disabled}>取消选择</button>
        <button class="button button-danger button-compact" type="button" data-bulk-delete-contents ${disabled}>批量删除</button>
      </div>
    </div>`
  }
  return ''
}

function renderModuleTableRegion(config) {
  return `${renderBulkActions(config)}${renderModuleTable(config)}`
}

function renderModuleTable(config) {
  const route = moduleState.route
  const explicitActions = ['sites', 'content', 'taxonomy', 'templates', 'media', 'localization', 'users', 'audit'].includes(route)
  if (liveState.loading.has(route)) {
    return `<div class="module-loading" role="status" aria-label="正在读取${escapeHtml(config.entityName)}"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>`
  }
  if (liveState.errors.has(route)) {
    return `<div class="module-error">${icon('alert')}<strong>暂时无法读取${escapeHtml(config.entityName)}</strong><p>${escapeHtml(liveState.errors.get(route))}</p><button class="button button-secondary" type="button" data-retry-module>重新加载</button></div>`
  }
  const rows = filterRows(config.rows, moduleState.query, moduleState.filter)
  const selectableRows = rows.filter((row) => rowCanBeSelected(route, row))
  const selectableRowsForCurrentAction = selectableRowsForBulk(route, selectableRows)
  const allSelected = selectableRowsForCurrentAction.length > 0 && selectableRowsForCurrentAction.every((row) => moduleState.selected.has(String(row.id)))
  const header = config.columns.map((column) => `<th style="${column.width ? `width:${escapeHtml(column.width)}` : ''}">${escapeHtml(column.label)}</th>`).join('')
  const editable = !realRoutes.has(route) || can(editPermission(route))
  const body = rows.length ? rows.map((row) => {
    const cells = config.columns.map((column) => {
      const value = row[column.key] ?? '—'
      const shouldBadge = ['status', 'level', 'language', 'code', 'mfa'].includes(column.key)
      if (route === 'templates' && column.key === 'name') {
        const expanded = String(templateEditorState.expandedID) === String(row.id)
        return `<td><button class="template-name-button" type="button" data-template-toggle aria-expanded="${expanded}" aria-controls="template-workspace-${escapeHtml(row.id)}"><span class="template-row-chevron">${icon('chevron', 'icon icon-sm')}</span><span><strong>${escapeHtml(value)}</strong><small>${expanded ? '正在编辑模板结构' : '点击展开模板结构'}</small></span></button></td>`
      }
      return `<td>${shouldBadge ? badge(value) : escapeHtml(value)}</td>`
    }).join('')
    const actionVerb = ['templates', 'publishing'].includes(route) ? '查看' : '编辑'
    const action = route === 'sites' ? renderSiteRowActions(row, editable)
      : route === 'content' ? renderContentRowActions(row, editable)
        : route === 'taxonomy' ? renderTaxonomyRowActions(row, editable)
        : route === 'templates' ? renderTemplateRowActions(row)
          : route === 'media' ? renderMediaRowActions(row, editable)
            : route === 'users' ? renderUserRowActions(row, editable)
              : route === 'audit' ? renderAuditRowActions(row)
				: route === 'localization' ? renderLocalizationRowActions(row)
				: route === 'settings' ? '—'
                : editable ? `<button class="icon-button compact" type="button" aria-label="${actionVerb} ${escapeHtml(row.name ?? config.entityName)}" data-row-menu>${icon('more')}</button>` : '—'
    const selectable = rowCanBeSelected(route, row)
    const selected = moduleState.selected.has(String(row.id))
    const expanded = route === 'templates' && String(templateEditorState.expandedID) === String(row.id)
    const summary = `<tr data-row-id="${row.id}" ${route === 'templates' ? 'data-template-row' : ''} class="${selected ? 'is-selected ' : ''}${expanded ? 'is-expanded' : ''}"><td><input type="checkbox" aria-label="选择 ${escapeHtml(row.name ?? config.entityName)}" data-select-row value="${row.id}" ${selected ? 'checked' : ''} ${selectable ? '' : 'disabled'}></td>${cells}<td class="${explicitActions ? 'explicit-action-cell' : ''}">${action}</td></tr>`
    return summary + (expanded ? renderTemplateWorkspace(row) : '')
  }).join('') : `<tr><td colspan="${config.columns.length + 2}"><div class="empty-state">${icon('search')}<strong>没有符合条件的结果</strong><p>请调整筛选条件，或创建第一条记录。</p></div></td></tr>`
  const selectionLabel = route === 'content' ? `选择当前页最多 ${contentBulkSelectionLimit} 条可操作内容` : '选择当前页全部可操作记录'
  return `<div class="table-scroll"><table class="module-table"><thead><tr><th><input type="checkbox" aria-label="${selectionLabel}" data-select-all ${allSelected ? 'checked' : ''} ${selectableRowsForCurrentAction.length ? '' : 'disabled'}></th>${header}<th class="action-column ${explicitActions ? 'explicit-action-column' : ''}">操作</th></tr></thead><tbody>${body}</tbody></table></div>`
}

function renderModuleGuide(route) {
  if (route === 'content' && contentSection() === 'pages') return `<section class="module-guide" aria-label="单页面管理说明"><div><strong>一个页面，一个路径</strong><span>关于我们、联系我们与专题页都是独立内容实例，不是新建模板文件。</span></div><div><strong>使用当前语言模板</strong><span>页面会按站点 / Locale 绑定的 <code>pages/page.html</code> 渲染，可在模板管理中编辑外观。</span></div><div><strong>布局与收录可控</strong><span>默认规则：新建单页面默认 noindex；联系页建议保持 noindex，企业介绍、服务和专题可在编辑器中启用 index 并进入 Sitemap。</span></div></section>`
  if (route === 'content') return `<section class="module-guide" aria-label="内容发布流程"><div><strong>内容工作流</strong><span>草稿 → 提交审核 → 立即或定时发布</span></div><div><strong>SEO 独立配置</strong><span>每个站点 / Locale 分别保存标题、关键词、Canonical 和 JSON-LD</span></div><div><strong>URL 安全</strong><span>Slug 保存时检查冲突，旧路径请在 URL 与伪静态中建立重定向</span></div></section>`
	if (route === 'taxonomy') return `<section class="module-guide" aria-label="栏目与标签说明"><div><strong>独立范围</strong><span>栏目和标签按站点与 Locale 隔离，不会误用到其他国家站</span></div><div><strong>层级栏目</strong><span>栏目可设置上级栏目；标签保持扁平，便于合并和筛选</span></div><div><strong>安全停用</strong><span>停用不会删除文章关系，历史页面和审计记录仍可追溯</span></div></section>`
  if (route === 'templates') return `<section class="module-guide" aria-label="模板安装说明"><div><strong>声明式模板包</strong><span>必须包含 theme.json 和 Go HTML 模板</span></div><div><strong>自动安全检查</strong><span>拒绝脚本、活动 SVG、目录穿越、符号链接和压缩炸弹</span></div><div><strong>独立绑定</strong><span>进入站点编辑，为每个 Locale 选择不同的已验证模板</span></div></section>`
  if (route === 'urls') return `<section class="module-guide" aria-label="URL 状态码说明"><div><strong>301 / 308</strong><span>永久迁移，适合正式变更 Slug</span></div><div><strong>302 / 307</strong><span>临时跳转，不转移长期规范地址</span></div><div><strong>410 Gone</strong><span>明确告知搜索引擎内容已永久删除</span></div></section>`
  if (route === 'publishing') return `<section class="module-guide" aria-label="发布检查流程"><div><strong>1. 目标检查</strong><span>站点、Locale、模板绑定和权限</span></div><div><strong>2. 生成检查</strong><span>内容状态、SEO 字段和 URL 冲突</span></div><div><strong>3. 原子切换</strong><span>完成后记录页面数、结果和审计轨迹</span></div></section>`
	if (route === 'media') return `<section class="module-guide" aria-label="媒体安全说明"><div><strong>上传即清洗</strong><span>校验真实 MIME、重新编码图片并移除附加数据</span></div><div><strong>Alt 可维护</strong><span>可搜索缺少 Alt 的图片，保存结果进入审计日志</span></div><div><strong>引用保护</strong><span>封面或正文仍在使用的媒体禁止删除</span></div></section>`
	if (route === 'users') return `<section class="module-guide" aria-label="权限管理说明"><div><strong>RBAC 角色</strong><span>动作权限由角色授予，不直接散落到用户</span></div><div><strong>数据范围</strong><span>可限制到指定站点和 Locale</span></div><div><strong>二次验证</strong><span>创建用户和修改权限必须重新验证密码与 MFA</span></div></section>`
	if (route === 'audit') return `<section class="module-guide" aria-label="审计日志说明"><div><strong>只追加</strong><span>SQLite 触发器拒绝修改和删除审计记录</span></div><div><strong>敏感值脱敏</strong><span>密码、令牌、Cookie 和密钥不会写入日志</span></div><div><strong>可追溯</strong><span>记录操作人、请求、IP、对象、结果与时间</span></div></section>`
	if (route === 'settings') return `<section class="module-guide" aria-label="系统维护说明"><div><strong>运行状态</strong><span>展示真实数据库、内存与进程信息</span></div><div><strong>加密快照</strong><span>备份采用 AES-GCM，并在创建后自动解密校验</span></div><div><strong>安全恢复</strong><span>恢复必须离线执行，服务端拒绝覆盖现有文件</span></div></section>`
	if (route === 'localization') return `<section class="module-guide" aria-label="AI 本土化流程"><div><strong>英语为源</strong><span>只从已发布英语版本发起，确保源事实和品牌含义稳定。</span></div><div><strong>语境重写</strong><span>AI 按目标国家和 Locale 重新组织正文、SEO 与关键词，不做逐句翻译。</span></div><div><strong>人工审核</strong><span>目标版本以“草稿 / AI 待审”保存；核对后可提交审核，再按站点独立发布。</span></div></section>`
	if (route === 'seo' || route === 'jobs') return `<section class="module-guide" aria-label="模块接入状态"><div><strong>当前状态</strong><span>此中心页面尚未接入真实任务数据，不展示演示数字</span></div><div><strong>现在可用</strong><span>${route === 'seo' ? '内容编辑器中的页面 SEO、Canonical、结构化数据和可选 AI 建议' : '发布管理中的真实发布记录和检查结果'}</span></div><div><strong>下一步</strong><span>按开发文档建立持久化任务、审核、重试和回滚闭环</span></div></section>`
  return ''
}

function settingsSection() {
  const section = currentRouteParams().get('section') || 'status'
  return ['status', 'backups', 'ai'].includes(section) ? section : 'status'
}

function seoSection() {
  const section = currentRouteParams().get('section') || 'sitemap'
  return ['sitemap', 'robots'].includes(section) ? section : 'sitemap'
}

function contentSection() {
  const section = currentRouteParams().get('section') || 'articles'
  return section === 'pages' ? 'pages' : 'articles'
}

function contentModuleConfig() {
  const base = modules.content
  const rows = base.rows.filter((row) => contentSection() === 'pages' ? row?._raw?.content_type === 'page' : row?._raw?.content_type !== 'page')
  const countBy = (status) => rows.filter((row) => row.status === status).length
  if (contentSection() !== 'pages') return {
    ...base,
    stats: [{ label: '内容总数', value: String(rows.length), tone: 'blue', icon: 'file' }, { label: '待审核', value: String(countBy('待审核')), tone: 'amber', icon: 'clipboard' }, { label: '已发布', value: String(countBy('已发布')), tone: 'green', icon: 'check' }, { label: '需要更新', value: String(countBy('需要更新')), tone: 'red', icon: 'alert' }],
    rows,
  }
  return {
    ...base,
    title: '单页面',
    subtitle: '创建和维护关于我们、联系我们、专题与自定义落地页面',
    primaryAction: '新建单页面',
    entityName: '单页面',
    stats: [{ label: '单页面总数', value: String(rows.length), tone: 'blue', icon: 'file' }, { label: '待审核', value: String(countBy('待审核')), tone: 'amber', icon: 'clipboard' }, { label: '已发布', value: String(countBy('已发布')), tone: 'green', icon: 'check' }, { label: '需要更新', value: String(countBy('需要更新')), tone: 'red', icon: 'alert' }],
    filters: ['全部单页面', '草稿', '待审核', '定时发布', '已发布', '需要更新'],
    rows,
  }
}

function activeModuleConfig(route = moduleState.route) {
  return route === 'content' ? contentModuleConfig() : modules[route]
}

function renderSettingsTabs(section = settingsSection()) {
  const tabs = [
    { key: 'status', label: '运行状态' },
    { key: 'backups', label: '备份与恢复' },
    { key: 'ai', label: 'AI 配置' },
  ]
  return `<nav class="settings-tabs" aria-label="系统设置二级菜单">${tabs.map((tab) => `<a href="#/admin/settings?section=${tab.key}" ${tab.key === section ? 'aria-current="page"' : ''}>${escapeHtml(tab.label)}</a>`).join('')}</nav>`
}

function renderSEOTabs(section = seoSection()) {
  const tabs = [
    { key: 'sitemap', label: '站点地图设置', hint: 'Sitemap.xml 与收录范围' },
    { key: 'robots', label: 'robots 设置', hint: '抓取规则与测试屏蔽' },
  ]
  return `<nav class="settings-tabs seo-tabs" aria-label="SEO 中心二级菜单">${tabs.map((tab) => `<a href="#/admin/seo?section=${tab.key}" ${tab.key === section ? 'aria-current="page"' : ''}><span>${escapeHtml(tab.label)}</span><small>${escapeHtml(tab.hint)}</small></a>`).join('')}</nav>`
}

function renderContentTabs(section = contentSection()) {
  const tabs = [
    { key: 'articles', label: '文章管理', hint: '资讯、指南与产品内容' },
    { key: 'pages', label: '单页面', hint: '关于我们、联系我们与专题页面' },
  ]
  return `<nav class="settings-tabs content-tabs" aria-label="内容管理二级菜单">${tabs.map((tab) => `<a href="#/admin/content?section=${tab.key}" ${tab.key === section ? 'aria-current="page"' : ''}><span>${escapeHtml(tab.label)}</span><small>${escapeHtml(tab.hint)}</small></a>`).join('')}</nav>`
}

function aiProviderHost(value) {
  try { return new URL(value).host || value } catch { return value || '—' }
}

function aiProviderNeedsKey(provider) {
  try {
    const host = new URL(provider.base_url).hostname.toLowerCase()
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1'
  } catch { return true }
}

function aiConnectionStatus(provider) {
  if (aiProviderNeedsKey(provider) && !provider.api_key_configured) return { label: '未配置密钥', className: 'ai-status-muted' }
  const states = {
    online: { label: '连接正常', className: 'ai-status-online' },
    offline: { label: '连接失败', className: 'ai-status-offline' },
    testing: { label: '正在测试', className: 'ai-status-testing' },
    untested: { label: '尚未测试', className: 'ai-status-muted' },
  }
  return states[provider.last_test_status] || states.untested
}

function renderAIProviderRows(providers, editable) {
  if (!providers.length) return `<tr><td colspan="7"><div class="ai-empty-state">${icon('bot')}<strong>还没有 AI 接口配置</strong><p>先添加一个服务商或本机模型，后续开发具体 AI 功能时即可直接调用。</p>${editable ? '<button class="button button-primary" type="button" data-ai-provider-create>新增 AI 配置</button>' : ''}</div></td></tr>`
  return providers.map((provider) => {
    const state = aiConnectionStatus(provider)
    const keyState = provider.api_key_configured ? `已配置 ·•••• ${escapeHtml(provider.api_key_last_four || '')}` : aiProviderNeedsKey(provider) ? '未配置' : '本机接口可留空'
    const testDisabled = aiProviderNeedsKey(provider) && !provider.api_key_configured
    return `<tr data-ai-provider-id="${escapeHtml(provider.id)}">
      <td><div class="ai-provider-name"><span class="ai-provider-mark">AI</span><span><strong>${escapeHtml(provider.name)}</strong><small>${escapeHtml(aiProviderPresetLabel(provider))}</small></span></div></td>
      <td><strong class="ai-model-name">${escapeHtml(provider.default_model)}</strong></td>
      <td><span class="ai-api-host" title="${escapeHtml(provider.base_url)}">${escapeHtml(aiProviderHost(provider.base_url))}</span></td>
      <td><span class="ai-key-state">${icon('lock', 'icon icon-sm')}${keyState}</span></td>
      <td><div class="ai-status-cell"><span class="ai-status ${state.className}" title="${escapeHtml(provider.last_test_message || state.label)}"><i></i>${state.label}</span>${provider.last_test_status === 'offline' && provider.last_test_message ? `<small class="ai-status-detail" role="status">${escapeHtml(provider.last_test_message)}</small>` : ''}</div></td>
      <td>${editable ? `<label class="switch-control" title="${provider.enabled ? '停用此提供方' : '启用此提供方'}"><input type="checkbox" data-ai-provider-toggle ${provider.enabled ? 'checked' : ''}><span aria-hidden="true"></span><em>${provider.enabled ? '已启用' : '已停用'}</em></label>` : provider.enabled ? '已启用' : '已停用'}</td>
      <td><div class="row-actions ai-provider-actions">${editable ? `<button class="row-action-button row-action-preview" type="button" data-ai-provider-test ${testDisabled ? 'disabled title="请先配置 API Key"' : ''}>${icon('refresh', 'icon icon-sm')}<span>测试</span></button><button class="row-action-button row-action-edit" type="button" data-ai-provider-edit>${icon('edit', 'icon icon-sm')}<span>编辑</span></button><button class="row-action-button row-action-danger" type="button" data-ai-provider-delete>${icon('trash', 'icon icon-sm')}<span>删除</span></button>` : '—'}</div></td>
    </tr>`
  }).join('')
}

function renderAISettings() {
  moduleState.route = 'settings'
  const payload = liveState.aiConfiguration
  const loading = liveState.loading.has('settings')
  const error = liveState.errors.get('settings')
  const editable = can('system.manage')
  if (loading && !payload) {
    moduleView.innerHTML = `<div class="page-heading"><div><h1>AI 配置</h1><p>统一管理内容与多语言功能使用的 AI 提供方</p></div></div>${renderSettingsTabs('ai')}<div class="module-loading" role="status"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>`
    return
  }
  if (error && !payload) {
    moduleView.innerHTML = `<div class="page-heading"><div><h1>AI 配置</h1><p>统一管理内容与多语言功能使用的 AI 提供方</p></div></div>${renderSettingsTabs('ai')}<div class="module-error">${icon('alert')}<strong>暂时无法读取 AI 配置</strong><p>${escapeHtml(error)}</p><button class="button button-secondary" type="button" data-retry-module>重新加载</button></div>`
    return
  }
  const providers = payload?.providers ?? []
  const enabled = providers.filter((provider) => provider.enabled).length
  const recentlyTested = [...providers].filter((provider) => provider.last_tested_at).sort((a, b) => new Date(b.last_tested_at) - new Date(a.last_tested_at))[0]
  const latestState = recentlyTested ? aiConnectionStatus(recentlyTested).label : '尚未测试'
  const summary = [
    { label: '提供方配置', value: String(providers.length), tone: 'blue', icon: 'bot' },
    { label: '已启用', value: String(enabled), tone: 'green', icon: 'check' },
    { label: '最近连接测试', value: latestState, tone: recentlyTested?.last_test_status === 'online' ? 'green' : recentlyTested ? 'red' : 'gray', icon: 'refresh' },
  ]
  moduleView.innerHTML = `
    <div class="page-heading ai-page-heading"><div><span class="breadcrumb">系统设置 / AI 配置</span><h1 id="module-title">AI 配置</h1><p>集中维护多个 AI 接口和模型；具体功能接入时再按需选择。</p></div>${editable ? `<button class="button button-primary" type="button" data-ai-provider-create>${icon('plus', 'icon icon-sm')}新增 AI 配置</button>` : ''}</div>
    ${renderSettingsTabs('ai')}
    <div class="ai-security-notice" role="note">${icon('lock')}<span><strong>密钥与内容安全</strong><small>API Key 使用主密钥派生的 AES-GCM 密钥加密保存，页面只显示末四位。配置变更、测试和调用失败均写入审计日志；AI 结果是否需要审核由具体功能流程决定。</small></span></div>
    ${renderStats(summary, 'module-stats ai-summary')}
    <section class="panel ai-provider-panel" aria-labelledby="ai-provider-title">
      <header class="panel-header"><div><h2 id="ai-provider-title">AI 接口与模型</h2><p>可添加多个服务商配置；预设均使用 OpenAI 兼容协议，远程地址必须使用 HTTPS。</p></div><button class="button button-secondary button-compact" type="button" data-ai-refresh>${icon('refresh', 'icon icon-sm')}刷新状态</button></header>
      <div class="table-scroll"><table class="ai-provider-table"><thead><tr><th>配置名称</th><th>默认模型</th><th>API 地址</th><th>密钥</th><th>连接状态</th><th>启用</th><th>操作</th></tr></thead><tbody>${renderAIProviderRows(providers, editable)}</tbody></table></div>
    </section>
    ${!editable ? `<div class="ai-readonly-note">${icon('lock')}当前账号只有查看权限；修改 AI 配置需要“管理系统设置”权限。</div>` : ''}`
}

function seoSitemapState(site) {
  if (site.status === 'maintenance') return { label: '维护中', detail: '前台暂时不可用', tone: 'amber' }
  if (Number(site.language_count || 0) < 1) return { label: '待绑定模板', detail: '需要启用语言并选择可渲染模板', tone: 'amber' }
  return { label: '已生成', detail: '地图与 robots 自动更新', tone: 'green' }
}

function seoExternalLink(url, label, iconName = 'eye') {
  if (!url || url === '/sitemap.xml' || url === '/robots.txt') return '<span class="seo-domain-pending">待绑定正式域名</span>'
  return `<a class="row-action-button row-action-preview" href="${escapeHtml(url)}" target="_blank" rel="noopener">${icon(iconName, 'icon icon-sm')}<span>${escapeHtml(label)}</span></a>`
}

function renderSEOCenter() {
  moduleState.route = 'seo'
  const payload = liveState.seoSitemaps
  const loading = liveState.loading.has('seo')
  const error = liveState.errors.get('seo')
  const section = seoSection()
  const sectionLabel = section === 'robots' ? 'robots' : '站点地图'
  const heading = `<div class="page-heading seo-page-heading"><div><h1 id="module-title">SEO 中心</h1><p>${section === 'robots' ? '查看每个站点的 robots.txt 抓取策略与本地测试屏蔽状态。' : '查看每个站点的 Sitemap.xml、收录范围和自动排除规则。'}</p></div><button class="button button-primary" type="button" data-seo-refresh ${loading ? 'disabled' : ''}>${icon('refresh', 'icon icon-sm')}${loading ? '刷新中…' : '刷新状态'}</button></div>${renderSEOTabs(section)}`
  if (!payload && !error) {
    moduleView.innerHTML = `${heading}<div class="module-loading" role="status" aria-label="正在读取${sectionLabel}状态"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>`
    return
  }
  if (error && !payload) {
    moduleView.innerHTML = `${heading}<div class="module-error">${icon('alert')}<strong>暂时无法读取${sectionLabel}状态</strong><p>${escapeHtml(error)}</p><button class="button button-secondary" type="button" data-retry-module>重新加载</button></div>`
    return
  }
  const sites = payload?.sites ?? []
  const summary = payload?.summary ?? {}
  const stats = [
    { label: '接入站点', value: String(summary.site_count ?? sites.length), tone: 'blue', icon: 'globe' },
    { label: '运行中站点', value: String(summary.active_site_count ?? sites.filter((site) => site.status === 'active').length), tone: 'green', icon: 'check' },
    { label: '可收录内容 URL', value: Number(summary.indexable_page_count ?? 0).toLocaleString('zh-CN'), tone: 'cyan', icon: 'search' },
    { label: section === 'robots' ? '单页面 noindex' : '单页面暂不进地图', value: Number(summary.single_page_excluded_count ?? 0).toLocaleString('zh-CN'), tone: 'gray', icon: 'lock' },
  ]
  if (section === 'robots') {
    const robotsRows = sites.length ? sites.map((site) => {
      const localRobots = site.robots_url || ''
      const publicRobots = site.public_robots_url || ''
      const active = site.status !== 'disabled'
      return `<tr><td><div class="seo-site-name"><span class="seo-site-mark">${icon('globe', 'icon icon-sm')}</span><span><strong>${escapeHtml(site.name)}</strong><small>${escapeHtml(site.code)} · localhost:${escapeHtml(site.local_port)}</small></span></div></td><td><a class="seo-machine-url" href="${escapeHtml(localRobots)}" target="_blank" rel="noopener" title="${escapeHtml(localRobots)}">${icon('lock', 'icon icon-sm')}<code>/robots.txt</code></a></td><td><span class="seo-robots-policy ${active ? 'is-active' : 'is-disabled'}"><strong>${active ? '自动生成' : '站点已停用'}</strong><small>${active ? '生产允许抓取，测试端口禁止收录' : '不会提供公开入口'}</small></span></td><td><span class="seo-count-stack"><strong>${Number(site.single_page_excluded_count || 0).toLocaleString('zh-CN')}</strong><span>页面级 noindex</span></span></td><td><div class="row-actions seo-public-actions">${seoExternalLink(publicRobots, '正式 robots', 'lock')}</div></td></tr>`
    }).join('') : `<tr><td colspan="5"><div class="empty-state">${icon('lock')}<strong>当前账号还没有可管理的站点</strong><p>新增站点后会自动生成 robots.txt。</p></div></td></tr>`
    moduleView.innerHTML = `${heading}${renderStats(stats, 'module-stats seo-summary')}<section class="seo-automation-note" aria-labelledby="seo-robots-automation-title"><span class="seo-automation-icon">${icon('lock')}</span><div><h2 id="seo-robots-automation-title">robots 自动化策略</h2><p>正式域名允许公开页面抓取，并屏蔽后台、API、登录、账户和预览路径；localhost 测试端口固定返回 <code>Disallow: /</code>。单页面依靠页面级 <code>noindex,follow</code>，不会写入 robots 禁止规则。</p></div></section><section class="panel seo-sitemap-panel seo-robots-panel" aria-labelledby="seo-robots-title"><header class="panel-header"><div><h2 id="seo-robots-title">站点 robots 入口</h2><p>每个站点一份动态 robots.txt；发布和站点状态变更后自动更新。</p></div><span class="seo-panel-status">${icon('refresh', 'icon icon-sm')}实时查询</span></header><div class="table-scroll"><table class="seo-sitemap-table seo-robots-table"><thead><tr><th>站点</th><th>本地测试入口</th><th>抓取策略</th><th>自动屏蔽</th><th>正式域名入口</th></tr></thead><tbody>${robotsRows}</tbody></table></div></section><section class="seo-operation-note" aria-label="robots 操作说明"><div>${icon('lock')}<span><strong>本地测试保护</strong><small>本地端口的 robots 会禁止全部抓取，避免开发内容被搜索引擎收录。</small></span></div><div>${icon('file')}<span><strong>无需手工编辑</strong><small>robots.txt 由系统按站点状态和环境生成，不建议直接上传覆盖。</small></span></div></section>`
    return
  }
  const rows = sites.length ? sites.map((site) => {
    const state = seoSitemapState(site)
    const localSitemap = site.sitemap_url || ''
    return `<tr>
      <td><div class="seo-site-name"><span class="seo-site-mark">${icon('globe', 'icon icon-sm')}</span><span><strong>${escapeHtml(site.name)}</strong><small>${escapeHtml(site.code)} · localhost:${escapeHtml(site.local_port)}</small></span></div></td>
      <td><a class="seo-machine-url" href="${escapeHtml(localSitemap)}" target="_blank" rel="noopener" title="${escapeHtml(localSitemap)}">${icon('file', 'icon icon-sm')}<code>/sitemap.xml</code></a></td>
      <td><div class="seo-count-stack"><strong>${Number(site.indexable_page_count || 0).toLocaleString('zh-CN')}</strong><span>可收录内容 · ${Number(site.language_count || 0)} 个可渲染语言</span></div></td>
      <td><div class="seo-count-stack seo-noindex-count"><strong>${Number(site.single_page_excluded_count || 0).toLocaleString('zh-CN')}</strong><span>单页面 noindex</span></div></td>
      <td><span class="seo-state seo-state-${state.tone}"><i></i><strong>${escapeHtml(state.label)}</strong><small>${escapeHtml(state.detail)}</small></span></td>
      <td><div class="row-actions seo-public-actions">${seoExternalLink(site.public_sitemap_url, '正式 Sitemap')}</div></td>
    </tr>`
  }).join('') : `<tr><td colspan="6"><div class="empty-state">${icon('globe')}<strong>当前账号还没有可管理的上线站点</strong><p>新增站点并绑定语言模板后，系统会自动提供对应 sitemap.xml。</p></div></td></tr>`
  moduleView.innerHTML = `${heading}
    ${renderStats(stats, 'module-stats seo-summary')}
    <section class="seo-automation-note" aria-labelledby="seo-automation-title"><span class="seo-automation-icon">${icon('check')}</span><div><h2 id="seo-automation-title">自动化收录规则</h2><p>已发布、允许 index 且可被当前模板渲染的内容会自动进入所属站点地图。<strong>单页面</strong>新建默认输出 <code>noindex,follow</code>；企业介绍、服务和专题页经审核后可在编辑器设为 <code>index,follow</code> 并进入 Sitemap。系统不使用 robots.txt 的 Disallow 代替页面 robots 指令。</p></div></section>
    <section class="panel seo-sitemap-panel" aria-labelledby="seo-sitemap-title"><header class="panel-header"><div><h2 id="seo-sitemap-title">站点地图入口</h2><p>每个站点一份动态 sitemap.xml。新增站点、绑定语言模板或发布内容后无需手工生成。</p></div><span class="seo-panel-status">${icon('refresh', 'icon icon-sm')}实时查询</span></header><div class="table-scroll"><table class="seo-sitemap-table"><thead><tr><th>站点</th><th>本地 Sitemap</th><th>收录范围</th><th>自动排除</th><th>生成状态</th><th>正式 Sitemap</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="seo-operation-note" aria-label="站点地图操作说明"><div>${icon('link')}<span><strong>上线方式</strong><small>在“站点管理”绑定并解析正式域名后，对应域名会自动提供 <code>/sitemap.xml</code>；本地端口仅用于预览。</small></span></div><div>${icon('file')}<span><strong>内容变化</strong><small>发布、定时到点、修改 robots_index、删除内容或切换模板后，下一次访问即得到更新后的地图。</small></span></div></section>`
}

function renderModule(route, options = {}) {
  const config = activeModuleConfig(route)
  if (!config) return navigate('/admin')
	if (route === 'settings' && settingsSection() === 'ai') {
		renderAISettings()
		return
	}
	if (route === 'seo') {
		renderSEOCenter()
		return
	}
  const sectionKey = route === 'content' ? contentSection() : ''
  if (moduleState.route !== route || moduleState.contentSection !== sectionKey) {
    moduleState.route = route
    moduleState.contentSection = sectionKey
    moduleState.query = ''
    moduleState.filter = config.filters[0]
    moduleState.selected.clear()
  }
  const selectedCount = moduleState.selected.size
  const permission = editPermission(route)
  const showPrimary = !realRoutes.has(route) || can(permission)
  const scopedSite = siteScopedRoutes.has(route) ? currentSite() : null
  const scopeLabel = route === 'content' ? contentScopeLabel() : scopedSite ? `当前站点：${scopedSite.name}` : ''
  const statusText = liveState.loading.has(route) ? '正在读取…' : liveState.errors.has(route) ? '读取失败' : selectedCount ? `已选择 ${selectedCount} 项 · <button class="text-button" data-clear-selection>取消选择</button>` : `共 ${filterRows(config.rows, moduleState.query, moduleState.filter).length} 条记录`
  moduleView.innerHTML = `
    <div class="page-heading">
      <div><h1 id="module-title">${escapeHtml(config.title)}</h1><p>${escapeHtml(config.subtitle)}${scopeLabel ? `<span class="module-scope">${escapeHtml(scopeLabel)}</span>` : ''}</p></div>
      ${showPrimary ? `<button class="button button-primary" type="button" data-module-primary>${icon('plus', 'icon icon-sm')}${escapeHtml(config.primaryAction)}</button>` : ''}
    </div>
    ${route === 'content' ? renderContentTabs(contentSection()) : route === 'settings' ? renderSettingsTabs(settingsSection()) : ''}
    ${renderStats(config.stats, 'module-stats')}
    ${renderModuleGuide(route)}
    <div class="module-toolbar">
      ${route === 'content' ? renderContentScopePicker() : ''}
      ${route === 'content' ? renderContentBulkTrigger(config) : ''}
      <div class="filter-group" role="group" aria-label="筛选 ${escapeHtml(config.entityName)}">
        ${config.filters.map((filter) => `<button class="filter-button" type="button" data-filter="${escapeHtml(filter)}" aria-pressed="${filter === moduleState.filter}">${escapeHtml(filter)}</button>`).join('')}
      </div>
      <label class="module-search">${icon('search', 'icon icon-sm')}<input type="search" value="${escapeHtml(moduleState.query)}" placeholder="搜索${escapeHtml(config.entityName)}" aria-label="搜索${escapeHtml(config.entityName)}" data-module-search></label>
    </div>
    <section class="panel module-panel" aria-labelledby="module-list-title">
      <header class="panel-header"><h2 id="module-list-title">${escapeHtml(config.entityName)}列表</h2><div class="selection-info">${statusText}</div></header>
      <div id="module-table-region">${renderModuleTableRegion(config)}</div>
    </section>`
  syncModuleSelectionControl(config)
  if (options.focus) moduleView.querySelector(options.focus)?.focus()
}

function refreshModuleTable() {
  const config = activeModuleConfig()
  if (!config) return
  const tableRegion = $('#module-table-region', moduleView)
  if (tableRegion) tableRegion.innerHTML = renderModuleTableRegion(config)
  const selectionInfo = $('.selection-info', moduleView)
  if (selectionInfo) {
    const count = moduleState.selected.size
    selectionInfo.innerHTML = count ? `已选择 ${count} 项 · <button class="text-button" data-clear-selection>取消选择</button>` : `共 ${filterRows(config.rows, moduleState.query, moduleState.filter).length} 条记录`
  }
  syncModuleSelectionControl(config)
}

function templateRowByID(themeID) {
  return modules.templates.rows.find((item) => String(item.id) === String(themeID))
}

function activeTemplateFile(themeID) {
  const key = templateEditorState.activeByTheme.get(String(themeID))
  return (templateEditorState.filesByTheme.get(String(themeID)) || []).find((file) => file.key === key) || (templateEditorState.assetsByTheme.get(String(themeID)) || []).find((asset) => asset.key === key)
}

async function loadTemplateWorkspace(themeID, force = false) {
  const id = String(themeID)
  if (!force && templateEditorState.filesByTheme.has(id)) return
  templateEditorState.loading.add(id)
  templateEditorState.errors.delete(id)
  refreshModuleTable()
  try {
    const [payload, assetPayload] = await Promise.all([fetchJSON(`/api/v1/templates/${encodeURIComponent(id)}/files`), fetchJSON(`/api/v1/templates/${encodeURIComponent(id)}/assets`)]).catch((error) => { throw error })
    const files = (payload.files || []).map((file) => ({ ...file, _draft: file.content, _dirty: false, _validation: null }))
    const assets = (assetPayload.assets || []).map((asset) => ({ ...asset, _asset: true, _draft: asset.content, _dirty: false, _validation: null }))
    templateEditorState.filesByTheme.set(id, files)
    templateEditorState.assetsByTheme.set(id, assets)
    if (!templateEditorState.activeByTheme.has(id) && (files[0] || assets[0])) templateEditorState.activeByTheme.set(id, (files[0] || assets[0]).key)
  } catch (error) {
    templateEditorState.errors.set(id, error.message || '无法读取模板文件')
  } finally {
    templateEditorState.loading.delete(id)
    refreshModuleTable()
  }
}

async function toggleTemplateWorkspace(themeID, forceOpen = false) {
  const id = String(themeID || '')
  if (!id) return
  if (!forceOpen && String(templateEditorState.expandedID) === id) {
    templateEditorState.expandedID = ''
    refreshModuleTable()
    return
  }
  templateEditorState.expandedID = id
  refreshModuleTable()
  await loadTemplateWorkspace(id)
  window.setTimeout(() => $(`#template-workspace-${CSS.escape(id)} .template-source`, moduleView)?.focus(), 0)
}

function updateTemplateEditorMetrics(workspace, source) {
  const lines = String(source || '').split('\n').length
  const bytes = new TextEncoder().encode(source || '').length
  const lineNumbers = $('.template-line-numbers', workspace)
  const lineCount = $('[data-template-lines]', workspace)
  const byteCount = $('[data-template-bytes]', workspace)
  if (lineNumbers) lineNumbers.textContent = templateLineNumbers(source)
  if (lineCount) lineCount.textContent = String(lines)
  if (byteCount) byteCount.textContent = String(bytes)
}

async function validateActiveTemplateFile(themeID, button) {
  const id = String(themeID)
  const file = activeTemplateFile(id)
  if (!file) return
  const original = button?.innerHTML || ''
  if (button) { button.disabled = true; button.textContent = '正在校验…' }
  try {
    const resourceType = file._asset ? 'assets' : 'files'
    const result = await fetchJSON(`/api/v1/templates/${encodeURIComponent(id)}/${resourceType}/${encodeURIComponent(file.key)}/validate`, { method: 'POST', body: { content: templateDraftValue(file) } })
    file._validation = result
    refreshModuleTable()
    showToast(result.valid ? `${file.label}校验通过` : `${file.label}存在需要修正的问题`)
  } catch (error) {
    file._validation = { valid: false, message: error.message || '校验失败' }
    refreshModuleTable()
    showToast(error.message || '校验模板失败')
  } finally {
    if (button?.isConnected) { button.disabled = false; button.innerHTML = original }
  }
}

async function saveActiveTemplateFile(themeID, button) {
  const id = String(themeID)
  const file = activeTemplateFile(id)
  if (!file || !file._dirty) return
  const source = templateDraftValue(file)
  const note = templateEditorState.changeNotes.get(id) || ''
  const original = button?.innerHTML || ''
  if (button) { button.disabled = true; button.textContent = '正在安全保存…' }
  try {
    const resourceType = file._asset ? 'assets' : 'files'
    const updated = await fetchJSON(`/api/v1/templates/${encodeURIComponent(id)}/${resourceType}/${encodeURIComponent(file.key)}`, { method: 'PUT', body: { content: source, version: Number(file.version), change_note: note } })
    Object.assign(file, updated, { _draft: updated.content, _dirty: false, _validation: { valid: true, message: '已通过安全校验并保存为新的模板修订' } })
    templateEditorState.changeNotes.set(id, '')
    refreshModuleTable()
    showToast(`${file.label}已保存为 v${file.version}`)
  } catch (error) {
    file._validation = { valid: false, message: error.message || '保存失败；当前输入已保留' }
    refreshModuleTable()
    showToast(error.status === 409 ? '模板已被其他人修改；当前输入已保留，请刷新模板后再合并' : error.message || '保存模板失败')
  } finally {
    if (button?.isConnected) { button.disabled = false; button.innerHTML = original }
  }
}

function syncModuleSelectionControl(config) {
  const selectAll = $('[data-select-all]', moduleView)
  if (!selectAll) return
  const selectableRows = selectableRowsForBulk(moduleState.route, filterRows(config.rows, moduleState.query, moduleState.filter).filter((row) => rowCanBeSelected(moduleState.route, row)))
  const selectedCount = selectableRows.filter((row) => moduleState.selected.has(String(row.id))).length
  selectAll.checked = selectableRows.length > 0 && selectedCount === selectableRows.length
  selectAll.indeterminate = selectedCount > 0 && selectedCount < selectableRows.length
  selectAll.setAttribute('aria-checked', selectAll.indeterminate ? 'mixed' : String(selectAll.checked))
}

function currentRoute() {
  return routeFromHash(location.hash)
}

function currentRouteParams() {
  const query = location.hash.split('?')[1] ?? ''
  return new URLSearchParams(query)
}

function navigate(path) {
  location.hash = path
}

function applyRoute() {
  const route = currentRoute()
  const isDashboard = route === 'dashboard'
  const editorMode = route === 'content' ? currentRouteParams().get('editor') : ''
  const isContentEditor = Boolean(editorMode)
  dashboardView.hidden = !isDashboard
  moduleView.hidden = isDashboard || isContentEditor
  contentEditorView.hidden = !isContentEditor
  if (!isContentEditor) {
    contentEditorState.key = ''
    contentEditorState.dirty = false
    contentEditorView.innerHTML = ''
    document.body.classList.remove('editor-fullscreen-open')
  }
	$$('.primary-nav a').forEach((link) => {
		if (link.dataset.route === route || (route === 'taxonomy' && link.dataset.route === 'content')) link.setAttribute('aria-current', 'page')
		else link.removeAttribute('aria-current')
	})
	$$('[data-settings-section]').forEach((link) => {
		if (route === 'settings' && link.dataset.settingsSection === settingsSection()) link.setAttribute('aria-current', 'page')
		else link.removeAttribute('aria-current')
	})
	$$('[data-seo-section]').forEach((link) => {
		if (route === 'seo' && link.dataset.seoSection === seoSection()) link.setAttribute('aria-current', 'page')
		else link.removeAttribute('aria-current')
	})
	$$('[data-content-section]').forEach((link) => {
		const active = (route === 'content' && link.dataset.contentSection === contentSection()) || (route === 'taxonomy' && link.dataset.contentSection === 'taxonomy')
		if (active) link.setAttribute('aria-current', 'page')
		else link.removeAttribute('aria-current')
	})
  if (isContentEditor) {
    void renderContentEditorRoute(editorMode)
  } else if (!isDashboard) {
    const contentSectionChanged = route === 'content' && moduleState.contentSection !== contentSection()
    renderModule(route)
    if (realRoutes.has(route) && (!liveState.loaded.has(route) || contentSectionChanged) && !liveState.loading.has(route)) void loadRoute(route, contentSectionChanged)
  }
  const item = navigationItems.find((entry) => entry.key === route)
  document.title = `${isContentEditor ? (editorMode === 'edit' ? '编辑内容' : editorMode === 'locale' ? '添加语言版本' : '新增内容') : item?.label ?? '控制台'} · CZCMS`
  mainContent.focus({ preventScroll: true })
  closeMobileMenu()
  closePopovers()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

function formatDuration(start, finish) {
  if (!start || !finish) return '—'
  const seconds = Math.max(0, Math.round((new Date(finish).getTime() - new Date(start).getTime()) / 1000))
  if (!Number.isFinite(seconds)) return '—'
  return seconds < 60 ? `${seconds} 秒` : `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`
}

function formatDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function defaultContentScheduledAt(item, creating = false) {
  return creating ? formatDateTimeLocal(new Date()) : formatDateTimeLocal(item?.scheduled_at)
}

function updateSiteData(items) {
  liveState.sites = items
  modules.sites.rows = items.map((item) => ({
    id: item.id, name: item.name, market: item.market_code,
    domain: item.primary_domain ? `${item.primary_domain}${item.domain_count > 1 ? `（${item.domain_count} 个）` : ''}` : `localhost:${item.local_port}`,
    languages: `${item.language_count} 种`, status: siteStatus[item.status] ?? item.status, updatedAt: formatDate(item.updated_at), _raw: item,
  }))
  modules.sites.stats[0].value = String(items.length)
  modules.sites.stats[1].value = String(items.filter((item) => item.status === 'active').length)
  modules.sites.stats[2].value = String(items.filter((item) => item.status === 'maintenance').length)
  modules.sites.stats[3].value = String(items.reduce((sum, item) => sum + Number(item.domain_count || 0), 0))
  renderSiteMenu()
}

function updateLanguageData(items) {
  liveState.languages = items
  modules.languages.rows = items.map((item) => ({
    id: item.id, name: item.name_zh, native: item.native_name, locale: item.default_locale,
    sites: `${item.site_count} 个站点`, completion: '—', status: languageStatus[String(item.enabled)], _raw: item,
  }))
  modules.languages.stats[0].value = String(items.length)
  modules.languages.stats[1].value = String(items.filter((item) => item.enabled).length)
  modules.languages.stats[2].value = '—'
  modules.languages.stats[3].value = String(items.filter((item) => item.direction === 'rtl').length)
}

function updateContentData(items, total, counts = {}) {
  modules.content.rows = items.map((item) => ({
    id: item.id, name: item.title, type: contentTypes[item.content_type] ?? item.content_type,
    site: item.site_name || `站点 #${item.site_id}`, language: item.language_name || item.locale, owner: item.owner_name || '未分配', status: contentStatus[isScheduledContent(item) ? 'scheduled' : item.status] ?? item.status,
    updatedAt: formatDate(item.updated_at), _raw: item,
  }))
  modules.content.stats[0].value = Number(total).toLocaleString('zh-CN')
	modules.content.stats[1].value = Number(counts.review ?? 0).toLocaleString('zh-CN')
	modules.content.stats[2].value = Number(counts.published ?? 0).toLocaleString('zh-CN')
	modules.content.stats[3].value = Number(counts.needs_update ?? 0).toLocaleString('zh-CN')
}

function updateTaxonomyData(items) {
	liveState.taxonomy = items ?? []
	modules.taxonomy.rows = liveState.taxonomy.map((item) => ({
		id: item.id, name: item.name, kind: item.kind === 'category' ? '栏目' : '标签', scope: `${item.site_name} / ${item.locale}`,
		parent: item.parent_name || '—', usage: String(item.usage_count || 0), status: item.status === 'active' ? (Number(item.usage_count) > 0 ? '使用中' : '可使用') : '已停用',
		updatedAt: formatDate(item.updated_at), _raw: item,
	}))
	modules.taxonomy.stats[0].value = String(liveState.taxonomy.filter((item) => item.kind === 'category').length)
	modules.taxonomy.stats[1].value = String(liveState.taxonomy.filter((item) => item.kind === 'tag').length)
	modules.taxonomy.stats[2].value = String(liveState.taxonomy.filter((item) => Number(item.usage_count) > 0).length)
	modules.taxonomy.stats[3].value = String(liveState.taxonomy.filter((item) => item.status !== 'active').length)
}

function updateTemplateData(items) {
  modules.templates.rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    language: item.binding_count ? `已绑定 ${item.binding_count} 个站点语言` : '尚未绑定',
    version: item.version,
    pages: item.renderable ? `${item.kind === 'builtin' ? '内置' : '已编译'} · ${item.render_key}` : '安全已验证 · 待部署',
    status: item.status === 'disabled' ? '已停用' : item.renderable && Number(item.binding_count) > 0 ? '已生效' : item.renderable ? '可绑定' : '待部署',
    updatedAt: formatDate(item.created_at),
    _raw: item,
  }))
  modules.templates.stats[0].value = String(items.length)
  modules.templates.stats[1].value = String(items.filter((item) => item.renderable && Number(item.binding_count) > 0).length)
  modules.templates.stats[2].value = String(items.filter((item) => !item.renderable || item.status !== 'validated').length)
  modules.templates.stats[3].value = String(items.length)
}

function updateURLData(items) {
  modules.urls.rows = items.map((item) => ({
    id: item.id,
    name: item.source_path,
    target: item.status_code === 410 ? '—（Gone）' : item.target_path,
    site: `${item.site_name} / ${item.locale}`,
    code: String(item.status_code),
    status: item.enabled ? '生效中' : '已停用',
    updatedAt: formatDate(item.updated_at),
    _raw: item,
  }))
  modules.urls.stats[0].value = String(items.filter((item) => item.enabled).length)
  modules.urls.stats[1].value = String(items.filter((item) => item.status_code === 301 && item.enabled).length)
  modules.urls.stats[3].value = String(items.filter((item) => item.status_code === 410).length)
}

function updatePublishingData(items) {
  modules.publishing.rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    scope: `${item.site_name} / ${item.locale} · ${releaseTypes[item.release_type] ?? item.release_type}`,
    pages: String(item.page_count ?? 0),
    duration: formatDuration(item.started_at, item.finished_at),
    status: releaseStatus[item.status] ?? item.status,
    updatedAt: formatDate(item.started_at || item.created_at),
    _raw: item,
  }))
  modules.publishing.stats[0].value = String(items.length)
  modules.publishing.stats[1].value = items.length ? `${Math.round(items.filter((item) => item.status === 'completed').length / items.length * 1000) / 10}%` : '—'
  modules.publishing.stats[2].value = String(items.filter((item) => item.status === 'failed').length)
  const completedDurations = items.filter((item) => item.started_at && item.finished_at).map((item) => Math.max(0, (new Date(item.finished_at).getTime() - new Date(item.started_at).getTime()) / 1000)).filter(Number.isFinite)
  modules.publishing.stats[3].value = completedDurations.length ? `${Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length)} 秒` : '—'
}

function updateLocalizationData(payload) {
  const jobs = payload?.jobs ?? []
  liveState.localizationAIAvailable = Boolean(payload?.ai_available)
  modules.localization.rows = jobs.map((job) => {
    const targets = job.results ?? []
    const created = Number(job.created_count || 0)
    const skipped = Number(job.skipped_count || 0)
    const failed = Number(job.failed_count || 0)
    const targetLabel = targets.length ? targets.map((item) => `${item.locale} · ${item.status === 'created' ? '已创建' : item.status === 'skipped' ? '已跳过' : '失败'}`).join('、') : '—'
    return {
      id: job.id,
      name: job.source_title || `内容组 #${job.content_id}`,
      target: targetLabel,
      mode: job.scope === 'full' ? '完整页面 + SEO' : job.scope,
      progress: `${created} 创建 · ${skipped} 跳过 · ${failed} 失败`,
      status: localizationStatus[job.status] ?? job.status,
      updatedAt: formatDate(job.updated_at || job.created_at),
      _raw: job,
    }
  })
  modules.localization.stats[0].value = String(jobs.length)
  modules.localization.stats[1].value = String(jobs.reduce((sum, job) => sum + Number(job.created_count || 0), 0))
  modules.localization.stats[2].value = String(jobs.reduce((sum, job) => sum + Number(job.failed_count || 0), 0))
  modules.localization.stats[3].value = liveState.localizationAIAvailable ? '已配置' : '未配置'
}

function formatBytes(value) {
  const bytes = Number(value || 0)
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function updateMediaData(payload) {
  const items = payload.media ?? []
  modules.media.rows = items.map((item) => ({
    id: item.id, name: item.original_name, type: item.media_type === 'image/png' ? 'PNG 图片' : 'JPEG 图片',
    size: formatBytes(item.byte_size), references: String(item.reference_count ?? 0), status: item.alt_text?.trim() ? 'Alt 已完成' : '缺少 Alt',
    updatedAt: formatDate(item.updated_at || item.created_at), _raw: item,
  }))
  modules.media.stats[0].value = Number(payload.total ?? items.length).toLocaleString('zh-CN')
  modules.media.stats[1].value = formatBytes(payload.total_bytes)
  modules.media.stats[2].value = Number(payload.missing_alt_total ?? items.filter((item) => !item.alt_text?.trim()).length).toLocaleString('zh-CN')
  modules.media.stats[3].value = Number(payload.reference_total ?? items.reduce((sum, item) => sum + Number(item.reference_count || 0), 0)).toLocaleString('zh-CN')
}

function updateUserData(users, roles) {
  liveState.roles = roles ?? []
  modules.users.rows = (users ?? []).map((item) => ({
    id: item.id, name: item.display_name || item.username, role: item.roles?.map((code) => liveState.roles.find((role) => role.code === code)?.name || code).join('、') || '未分配',
    scope: item.scopes?.some((scope) => Number(scope.site_id) === 0 && scope.locale === '*') ? '全部站点与语言' : `${item.scopes?.length || 0} 个范围`,
    mfa: item.mfa_enabled ? '已启用' : '未启用', status: item.status === 'active' ? '活跃' : '已停用', updatedAt: formatDate(item.last_login_at), _raw: item,
  }))
  modules.users.stats[0].value = String(users?.length ?? 0)
  modules.users.stats[1].value = String((users ?? []).filter((item) => item.mfa_enabled).length)
  modules.users.stats[2].value = String((users ?? []).filter((item) => item.status !== 'active').length)
  modules.users.stats[3].value = String((roles ?? []).length)
}

function auditActionLabel(action = '') {
  const labels = {
    'security.login_succeeded': '安全 · 登录成功', 'security.login_failed': '安全 · 登录失败',
    'security.user_created': '安全 · 创建用户', 'security.user_access_updated': '安全 · 修改用户权限',
    'security.account_unlocked': '安全 · 账户解锁', 'security.permission_denied': '安全 · 权限被拒绝',
    'security.scope_denied': '安全 · 数据范围被拒绝', 'media.uploaded': '媒体 · 上传完成',
    'media.imported': '媒体 · 远程图片本地化', 'media.alt_updated': '媒体 · 更新 Alt', 'media.deleted': '媒体 · 删除',
    'backup.created': '系统 · 创建加密备份', 'content.created': '内容 · 创建', 'content.updated': '内容 · 更新',
    'content.ai_localized': '内容 · AI 本土化生成', 'content.ai_localization_completed': '内容 · AI 本土化任务完成',
    'content.deleted': '内容 · 移入回收站', 'site.created': '站点 · 创建', 'site.updated': '站点 · 更新',
  }
  if (labels[action]) return labels[action]
  const prefix = action.split('.')[0]
  const group = { security: '安全', media: '媒体', backup: '系统', content: '内容', site: '站点', language: '语言', template: '模板', publishing: '发布' }[prefix]
  return group ? `${group} · ${action}` : action
}

function updateAuditData(records) {
  modules.audit.rows = (records ?? []).map((item) => ({
    id: item.id, name: auditActionLabel(item.action), actor: item.actor_name || (item.actor_user_id ? `用户 #${item.actor_user_id}` : '系统'),
    target: `${item.target_type || '—'}${item.target_id ? ` · ${item.target_id}` : ''}`, ip: item.ip_address || '—', status: item.success ? '成功' : '失败', category: String(item.action || '').startsWith('security.') ? '安全事件' : '业务事件', updatedAt: formatDate(item.created_at), _raw: item,
  }))
  modules.audit.stats[0].value = String(records?.length ?? 0)
  modules.audit.stats[1].value = String((records ?? []).filter((item) => item.success).length)
  modules.audit.stats[2].value = String((records ?? []).filter((item) => !item.success).length)
}

function updateSystemData(status, backups) {
  liveState.systemStatus = status
  liveState.backups = backups ?? []
  const counts = status?.counts ?? {}
  const latest = liveState.backups[0]
  modules.settings.stats[0].value = status?.status || '未知'
  modules.settings.stats[1].value = formatBytes(status?.database_bytes)
  modules.settings.stats[2].value = formatBytes(status?.memory_alloc_bytes)
  modules.settings.stats[3].value = latest ? formatDate(latest.created_at) : '尚无'
  modules.settings.rows = [
    { id: 'service', name: '服务状态', description: `Go ${status?.runtime || '—'} · ${status?.goroutines ?? 0} 个协程`, value: status?.status || '未知', owner: '系统', status: status?.status || '未知', group: '运行状态', updatedAt: '刚刚' },
    { id: 'database', name: 'SQLite 数据库', description: `${Number(counts.contents || 0).toLocaleString('zh-CN')} 条内容 · ${Number(counts.media || 0).toLocaleString('zh-CN')} 个媒体`, value: formatBytes(status?.database_bytes), owner: '系统', status: status?.database === '正常' ? '正常' : '异常', group: '运行状态', updatedAt: '刚刚' },
    { id: 'backup', name: '加密备份', description: latest ? `${latest.storage_name} · SHA256 ${String(latest.sha256 || '').slice(0, 12)}…` : '尚未创建加密备份', value: latest ? formatDate(latest.verified_at) : '尚无', owner: latest?.creator_name || '—', status: latest ? '已验证' : '待创建', group: '备份记录', updatedAt: latest ? formatDate(latest.created_at) : '—' },
  ]
}

function updateAIConfiguration(payload) {
  liveState.aiConfiguration = payload ?? { providers: [], routes: [], environment_fallback: {}, review_required: true }
}

function updateSEOSitemapData(payload) {
  liveState.seoSitemaps = payload ?? { sites: [], summary: {} }
  const sites = liveState.seoSitemaps.sites ?? []
  const summary = liveState.seoSitemaps.summary ?? {}
  modules.seo.stats[0].value = String(summary.site_count ?? sites.length)
  modules.seo.stats[1].value = String(summary.active_site_count ?? sites.filter((site) => site.status === 'active').length)
  modules.seo.stats[2].value = Number(summary.indexable_page_count ?? 0).toLocaleString('zh-CN')
  modules.seo.stats[3].value = Number(summary.single_page_excluded_count ?? 0).toLocaleString('zh-CN')
}

function renderDashboardData() {
  const siteBody = $('#dashboard-site-body')
  if (siteBody) {
    siteBody.innerHTML = liveState.sites.length ? liveState.sites.map((site) => `<tr><td><strong>${escapeHtml(site.name)}</strong></td><td>${escapeHtml(site.market_code || '—')}</td><td><a class="table-link" href="http://localhost:${escapeHtml(site.local_port)}/" target="_blank" rel="noopener">localhost:${escapeHtml(site.local_port)}</a></td><td>${escapeHtml(site.language_count)} 种</td><td>${escapeHtml(site.resolved_domain_count || 0)} / ${escapeHtml(site.domain_count || 0)}</td><td>${badge(siteStatus[site.status] ?? site.status)}</td></tr>`).join('') : '<tr><td colspan="6"><div class="dashboard-loading">当前账号没有可访问的站点</div></td></tr>'
  }
  if ($('#review-count')) $('#review-count').textContent = modules.content.stats[1].value
  if ($('#failure-count')) $('#failure-count').textContent = modules.publishing.stats[2].value
  if ($('#cache-state')) $('#cache-state').textContent = liveState.systemStatus?.cache_strategy || '读取中'
  const actionList = $('#action-list')
  const actionEmpty = $('#action-empty')
  if (actionList && actionEmpty) {
    const actions = []
    const reviews = Number(String(modules.content.stats[1].value).replaceAll(',', '')) || 0
    const failures = Number(String(modules.publishing.stats[2].value).replaceAll(',', '')) || 0
    if (failures > 0 && can('publishing.manage')) actions.push(`<article data-task="发布失败"><span class="task-icon tone-solid-red">!</span><strong>${failures} 个发布任务失败</strong><button class="button button-secondary" type="button" data-handle-task="publishing">查看发布</button></article>`)
    if (reviews > 0 && can('content.read')) actions.push(`<article data-task="内容审核"><span class="task-icon tone-solid-amber">!</span><strong>${reviews} 条内容等待审核</strong><button class="button button-secondary" type="button" data-handle-task="content">去处理</button></article>`)
    const maintenance = liveState.sites.filter((site) => site.status === 'maintenance').length
    if (maintenance > 0 && can('dashboard.view')) actions.push(`<article data-task="站点维护"><span class="task-icon tone-solid-blue">!</span><strong>${maintenance} 个站点处于维护状态</strong><button class="button button-secondary" type="button" data-handle-task="sites">查看站点</button></article>`)
    actionList.innerHTML = actions.join('')
    actionList.hidden = actions.length === 0
    actionEmpty.hidden = actions.length !== 0
  }
  const recentBody = $('#recent-content-body')
  if (recentBody) {
    const rows = modules.content.rows.slice(0, 5)
    recentBody.innerHTML = rows.length ? rows.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${badge(row.language)}</td><td>${escapeHtml(row._raw?.site_name || '—')}</td><td>${badge(row.status)}</td><td>${escapeHtml(row.updatedAt)}</td><td><button class="icon-button compact" type="button" aria-label="在内容管理中打开${escapeHtml(row.name)}" data-dashboard-content="${escapeHtml(row.id)}">${icon('arrow', 'icon icon-sm')}</button></td></tr>`).join('') : '<tr><td colspan="6"><div class="dashboard-loading">还没有内容记录</div></td></tr>'
  }
  const status = liveState.systemStatus
  if ($('#dashboard-database')) $('#dashboard-database').innerHTML = `${icon(status?.database === '正常' ? 'check' : 'alert')}${status ? `数据库${escapeHtml(status.database)}` : '数据库状态未读取'}`
  if ($('#dashboard-runtime')) $('#dashboard-runtime').innerHTML = `${icon(status?.status === '正常' ? 'check' : 'alert')}${status ? `Go ${escapeHtml(status.runtime)} · 已运行 ${Math.max(0, Math.floor(Number(status.uptime_seconds || 0) / 60))} 分钟` : '运行状态未读取'}`
  const latest = liveState.backups[0]
  if ($('#dashboard-backup')) $('#dashboard-backup').innerHTML = `${icon(latest ? 'check' : 'lock')}${latest ? `最近备份 ${escapeHtml(formatDate(latest.created_at))}` : '尚无备份记录'}`
	const notificationButton = $('#notification-button')
	const notificationDot = $('.notification-dot')
	const notificationItems = $('#notification-items')
	if (notificationButton && notificationDot && notificationItems) {
		const notices = []
		const reviewCount = Number(String(modules.content.stats[1].value).replaceAll(',', '')) || 0
		const failureCount = Number(String(modules.publishing.stats[2].value).replaceAll(',', '')) || 0
		if (failureCount > 0 && can('publishing.manage')) notices.push(`<a href="#/admin/publishing"><span class="signal signal-red"></span><span><strong>${escapeHtml(failureCount)} 个发布任务失败</strong><small>来自真实发布记录</small></span></a>`)
		if (reviewCount > 0 && can('content.read')) notices.push(`<a href="#/admin/content"><span class="signal signal-amber"></span><span><strong>${escapeHtml(reviewCount)} 条内容等待审核</strong><small>来自真实内容状态</small></span></a>`)
		if (liveState.systemStatus?.database && liveState.systemStatus.database !== '正常' && can('system.view')) notices.push(`<a href="#/admin/settings"><span class="signal signal-red"></span><span><strong>SQLite 状态异常</strong><small>请立即检查系统状态</small></span></a>`)
		notificationItems.innerHTML = notices.length ? notices.join('') : '<span class="notification-empty">当前没有需要处理的实时通知</span>'
		notificationDot.hidden = notices.length === 0
		notificationDot.textContent = String(notices.length)
		notificationButton.setAttribute('aria-label', notices.length ? `通知，${notices.length} 条待处理` : '通知，无待处理事项')
	}
}

async function loadRoute(route, force = false) {
  if (!apiRoutes.has(route) || (liveState.loaded.has(route) && !force)) return
  if (siteScopedRoutes.has(route) && !liveState.loaded.has('sites')) {
    await loadRoute('sites')
    if (liveState.errors.has('sites')) {
      liveState.errors.set(route, '无法读取站点范围，请先重新加载站点数据')
      if (currentRoute() === route) renderModule(route)
      return
    }
  }
  liveState.loading.add(route)
  liveState.errors.delete(route)
  if (currentRoute() === route) renderModule(route)
  try {
    if (route === 'sites') {
      const payload = await fetchJSON('/api/v1/sites')
      updateSiteData(payload.sites ?? [])
    } else if (route === 'languages') {
      const payload = await fetchJSON('/api/v1/languages')
      updateLanguageData(payload.languages ?? [])
    } else if (route === 'content') {
		const contentPath = contentSection() === 'pages' ? '/api/v1/contents?limit=100&content_type=page' : '/api/v1/contents?limit=100&content_type=non_page'
		const payload = await fetchJSON(isAllSitesContentScope() ? contentPath : siteScopedAPIPath(contentPath))
		updateContentData(payload.contents ?? [], payload.total ?? 0, payload.status_counts ?? {})
	    } else if (route === 'taxonomy') {
	      const payload = await fetchJSON(siteScopedAPIPath('/api/v1/taxonomy/terms'))
	      updateTaxonomyData(payload.terms ?? [])
	    } else if (route === 'templates') {
      const payload = await fetchJSON('/api/v1/templates')
      liveState.templates = payload.templates ?? []
      updateTemplateData(liveState.templates)
	    } else if (route === 'seo') {
	      updateSEOSitemapData(await fetchJSON('/api/v1/seo/sitemaps'))
	    } else if (route === 'urls') {
      const payload = await fetchJSON(siteScopedAPIPath('/api/v1/urls/redirects'))
      updateURLData(payload.redirects ?? [])
    } else if (route === 'publishing') {
      const payload = await fetchJSON(siteScopedAPIPath('/api/v1/publishing/releases'))
      updatePublishingData(payload.releases ?? [])
	    } else if (route === 'localization') {
	      updateLocalizationData(await fetchJSON(siteScopedAPIPath('/api/v1/localization/jobs')))
	    } else if (route === 'media') {
	      updateMediaData(await fetchJSON('/api/v1/media?limit=100'))
	    } else if (route === 'users') {
	      const [users, roles] = await Promise.all([fetchJSON('/api/v1/security/users'), fetchJSON('/api/v1/security/roles')])
	      updateUserData(users.users ?? [], roles.roles ?? [])
	    } else if (route === 'audit') {
	      const payload = await fetchJSON('/api/v1/audit?limit=100')
	      updateAuditData(payload.records ?? [])
	    } else if (route === 'settings') {
	      const [status, backups, aiConfiguration] = await Promise.all([fetchJSON('/api/v1/system/status'), can('backup.manage') ? fetchJSON('/api/v1/system/backups?limit=20') : Promise.resolve({ backups: [] }), fetchJSON('/api/v1/system/ai')])
	      updateSystemData(status, backups.backups ?? [])
	      updateAIConfiguration(aiConfiguration)
    }
    liveState.loaded.add(route)
		if (['sites', 'content', 'publishing', 'settings'].includes(route)) renderDashboardData()
  } catch (error) {
    if (error.status !== 401) liveState.errors.set(route, error.message || '网络连接失败，请稍后重试')
  } finally {
    liveState.loading.delete(route)
    if (currentRoute() === route) renderModule(route)
  }
}

async function ensureCoreData() {
  await Promise.all([loadRoute('sites'), loadRoute('languages')])
  if (liveState.errors.has('sites') || liveState.errors.has('languages')) throw new APIError('站点或语言数据尚未加载，请重试', 503)
}

async function loadSiteLanguages(siteID, force = false) {
  const key = String(siteID)
  if (!force && liveState.siteLanguages.has(key)) return liveState.siteLanguages.get(key)
  const payload = await fetchJSON(`/api/v1/sites/${encodeURIComponent(siteID)}/languages`)
  const items = payload.site_languages ?? []
  liveState.siteLanguages.set(key, items)
  return items
}

async function loadSiteDomains(siteID, force = false) {
  const key = String(siteID)
  if (!force && liveState.siteDomains.has(key)) return liveState.siteDomains.get(key)
  const payload = await fetchJSON(`/api/v1/sites/${encodeURIComponent(siteID)}/domains`)
  const items = payload.domains ?? []
  liveState.siteDomains.set(key, items)
  return items
}

async function loadTemplates(force = false) {
  if (!force && liveState.templates) return liveState.templates
  const payload = await fetchJSON('/api/v1/templates')
  liveState.templates = payload.templates ?? []
  return liveState.templates
}

function renderSiteMenu() {
  const menu = $('#site-menu')
  const availableSites = liveState.sites.filter((site) => site.status !== 'disabled')
  if (!availableSites.length) {
    menu.innerHTML = '<div class="popover-loading">没有可访问的站点</div>'
    $('#current-site').textContent = '无可用站点'
    delete $('#site-switcher').dataset.siteId
    return
  }
  menu.innerHTML = availableSites.map((site, index) => `<button role="menuitemradio" aria-checked="false" data-site-id="${site.id}" data-site-name="${escapeHtml(site.name)}"><strong>${escapeHtml(site.name)}</strong><span>${index === 0 ? '默认站点' : escapeHtml(site.market_code)}</span></button>`).join('')
  let stored = ''
  try { stored = localStorage.getItem('czcms-site-id') ?? '' } catch { /* storage can be unavailable */ }
  const current = availableSites.find((site) => String(site.id) === stored) ?? availableSites[0]
  $('#current-site').textContent = current.name
  $('#site-switcher').dataset.siteId = String(current.id)
  menu.querySelector(`[data-site-id="${CSS.escape(String(current.id))}"]`)?.setAttribute('aria-checked', 'true')
}

function field(label, name, value = '', options = {}) {
  const type = options.type ?? 'text'
  const wide = options.wide ? ' form-field-wide' : ''
  const attrs = [options.required ? 'required' : '', options.readonly ? 'readonly' : '', options.min != null ? `min="${options.min}"` : '', options.max != null ? `max="${options.max}"` : '', options.step != null ? `step="${options.step}"` : '', options.minlength ? `minlength="${options.minlength}"` : '', options.maxlength ? `maxlength="${options.maxlength}"` : '', options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : '', options.autocomplete ? `autocomplete="${escapeHtml(options.autocomplete)}"` : '', options.inputmode ? `inputmode="${escapeHtml(options.inputmode)}"` : ''].filter(Boolean).join(' ')
  const control = options.textarea ? `<textarea class="${options.code ? 'code-field' : ''}" name="${name}" ${attrs}>${escapeHtml(value)}</textarea>` : `<input type="${type}" name="${name}" value="${escapeHtml(value)}" ${attrs}>`
  return `<label class="form-field${wide}"><span>${escapeHtml(label)}</span>${control}${options.help ? `<small>${escapeHtml(options.help)}</small>` : ''}</label>`
}

function selectField(label, name, choices, selected, options = {}) {
  const wide = options.wide ? ' form-field-wide' : ''
  return `<label class="form-field${wide}"><span>${escapeHtml(label)}</span><select name="${name}" ${options.required ? 'required' : ''} ${options.disabled ? 'disabled' : ''}>${choices.map((choice) => `<option value="${escapeHtml(choice.value)}" ${String(choice.value) === String(selected) ? 'selected' : ''}>${escapeHtml(choice.label)}</option>`).join('')}</select>${options.help ? `<small>${escapeHtml(options.help)}</small>` : ''}</label>`
}

function checkboxField(label, name, checked) {
  return `<label class="checkbox-field"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`
}

function domainStatus(domain) {
  if (domain.dns_status === 'resolved') return { label: 'DNS 可解析', tone: 'green' }
  if (domain.dns_status === 'failed') return { label: '未解析到地址', tone: 'red' }
  return { label: '等待检查', tone: 'amber' }
}

function siteDomainFields(item, domains) {
  const previewURL = `http://localhost:${item.local_port}/`
  const rows = domains.length ? domains.map((domain) => {
    const state = domainStatus(domain)
    const addresses = domain.resolved_addresses?.length ? domain.resolved_addresses.join('、') : '尚无解析结果'
    return `<div class="domain-row" data-domain-id="${domain.id}">
      <div class="domain-main"><strong>${escapeHtml(domain.hostname)}</strong><span>${domain.kind === 'primary' ? '主域名' : domain.redirect_to_primary ? '别名 · 跳转主域名' : '别名 · 独立访问'}</span></div>
      <span class="badge badge-${state.tone}">${escapeHtml(state.label)}</span>
      <span class="domain-addresses" title="${escapeHtml(addresses)}">${escapeHtml(addresses)}</span>
      <div class="domain-actions">${domain.kind === 'alias' ? `<button class="button button-quiet button-compact" type="button" data-primary-domain="${domain.id}" data-domain-version="${domain.version}" data-domain-hostname="${escapeHtml(domain.hostname)}">设为主域名</button>` : ''}<button class="button button-secondary button-compact" type="button" data-check-domain="${domain.id}">检查 DNS</button><button class="button button-quiet button-compact" type="button" data-delete-domain="${domain.id}" data-domain-version="${domain.version}" aria-label="删除域名 ${escapeHtml(domain.hostname)}">删除</button></div>
    </div>`
  }).join('') : '<div class="domain-empty"><strong>尚未绑定正式域名</strong><span>当前可以先使用上方 localhost 地址完成模板和内容测试。</span></div>'
  return `<div class="site-access-fields form-field-wide"><section class="form-section site-access-section" aria-labelledby="local-preview-heading">
    <div class="section-heading"><div><h3 id="local-preview-heading">独立端口测试</h3><p>这个多语言站点使用专属 localhost 端口，不需要修改 hosts 或 DNS。</p></div><a class="button button-secondary" href="${escapeHtml(previewURL)}" target="_blank" rel="noopener">打开预览</a></div>
    ${field('本地预览地址', 'local_preview_url', previewURL, { readonly: true, wide: true, help: '端口变更需先保存站点；本地页面自动 noindex，不会被搜索引擎收录。' })}
  </section>
  <section class="form-section site-access-section" aria-labelledby="domain-binding-heading">
    <div class="section-heading"><div><h3 id="domain-binding-heading">正式域名与解析</h3><p>先在这里绑定，再到域名服务商把 A / AAAA 或 CNAME 记录指向本服务器。</p></div></div>
    <div class="domain-list">${rows}</div>
    <div class="domain-add-grid">
      ${field('域名', 'domain_hostname', '', { maxlength: 253, placeholder: 'www.example.com', help: '不要填写 https://、端口或路径。' })}
      ${selectField('类型', 'domain_kind', [{ value: 'primary', label: '主域名' }, { value: 'alias', label: '别名域名' }], domains.some((domain) => domain.kind === 'primary') ? 'alias' : 'primary')}
      ${checkboxField('别名访问时 308 跳转到主域名', 'domain_redirect', true)}
      <div class="domain-add-action"><button class="button button-secondary" type="button" data-add-domain>添加域名</button></div>
    </div>
    <div class="dns-guide"><strong>解析步骤</strong><ol><li>在域名服务商添加 DNS 记录并指向部署 CZCMS 的服务器。</li><li>等待 DNS 生效后点击“检查 DNS”；此检查确认域名已有公开 A / AAAA 解析。</li><li>确认解析目标、反向代理和 HTTPS 证书均正确后，正式流量即可按域名进入对应站点。</li></ol></div>
  </section></div>`
}

function siteTemplatePreviewPath(theme, site, locale) {
  if (!theme?.renderable || !theme?.id || !site?.code || !locale) return ''
  return `/admin/template-preview/${encodeURIComponent(theme.id)}/${encodeURIComponent(site.code)}/${encodeURIComponent(locale)}`
}

function siteTemplateVisualClass(theme) {
  return theme?.render_key === 'atlas-commerce' ? 'is-atlas' : 'is-route'
}

function siteTemplateOption(theme, binding, site) {
  const selected = String(theme.id) === String(binding.theme_package_id ?? '')
  const previewPath = siteTemplatePreviewPath(theme, site, binding.locale)
  return `<label class="site-template-option ${selected ? 'is-selected is-current' : ''}" data-site-template-option>
    <input type="radio" name="theme_package_${binding.language_id}" value="${escapeHtml(theme.id)}" ${selected ? 'checked' : ''} data-site-template-choice data-template-name="${escapeHtml(theme.name)}" data-preview-src="${escapeHtml(previewPath)}">
    <span class="site-template-miniature ${siteTemplateVisualClass(theme)}" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="site-template-option-copy"><strong>${escapeHtml(theme.name)}</strong><small>${escapeHtml(theme.version)} · ${escapeHtml(theme.render_key || '已编译模板')}</small><em data-template-current-label>${selected ? '当前使用' : '点击选择并预览'}</em></span>
    <span class="site-template-check">${icon('check', 'icon icon-sm')}</span>
  </label>`
}

function siteCreateTemplateOption(theme, selected = false) {
  return `<label class="site-create-template-card ${selected ? 'is-selected' : ''}" data-site-create-template-card>
    <input type="radio" name="default_theme_package_id" value="${escapeHtml(theme.id)}" ${selected ? 'checked' : ''} data-site-create-template-choice>
    <span class="site-template-miniature ${siteTemplateVisualClass(theme)}" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="site-create-template-copy"><strong>${escapeHtml(theme.name)}</strong><small>${escapeHtml(theme.version)} · ${escapeHtml(theme.render_key || '已编译模板')}</small><em data-site-create-template-state>${selected ? '初始语言将使用此模板' : '选择为初始模板'}</em></span>
    <span class="site-template-check" aria-hidden="true">${icon('check', 'icon icon-sm')}</span>
  </label>`
}

function siteCreateTemplateFields(templates = [], canBindTemplates = false) {
  if (!canBindTemplates) return `<section class="site-create-template-section form-field-wide" aria-labelledby="site-create-template-heading">
    <div class="site-create-template-heading"><div><h3 id="site-create-template-heading">初始模板</h3><p>创建完成后会自动使用系统安全默认模板。</p></div></div>
    <div class="form-hint"><strong>模板权限受限</strong><span>当前账号不能选择模板；创建后可由具有“模板管理”权限的管理员为每种语言切换模板。</span></div>
  </section>`
  const renderableTemplates = templates.filter((theme) => theme.renderable)
  if (!renderableTemplates.length) return `<section class="site-create-template-section form-field-wide" aria-labelledby="site-create-template-heading">
    <div class="site-create-template-heading"><div><h3 id="site-create-template-heading">初始模板</h3><p>只有已通过安全检查并完成编译的模板可以用于新站点。</p></div></div>
    <div class="site-template-empty"><strong>没有可用模板</strong><span>请先在模板管理中安装并完成安全校验；系统会尝试使用 Global Route 安全默认模板。</span></div>
  </section>`
  const selectedID = renderableTemplates.find((theme) => theme.render_key === 'global-route')?.id ?? renderableTemplates[0].id
  return `<fieldset class="site-create-template-section form-field-wide" aria-describedby="site-create-template-help">
    <legend>初始模板</legend><p id="site-create-template-help">创建后将自动绑定到初始语言；后续可在“编辑站点 → 模板与预览”中按语言独立切换。</p>
    <div class="site-create-template-grid">${renderableTemplates.map((theme) => siteCreateTemplateOption(theme, String(theme.id) === String(selectedID))).join('')}</div>
  </fieldset>`
}

function siteLanguageFields(bindings = [], templates = [], editable = false, site = null) {
  if (!bindings.length) return '<div class="site-template-empty">此站点暂未配置语言绑定，请先在语言管理中添加语言。</div>'
  const previewURL = (binding) => site?.local_port ? `http://localhost:${site.local_port}${sitePublicPath(site, binding.locale)}` : ''
  if (!editable) return `<div class="site-template-readonly"><div class="form-hint"><strong>只读模板配置</strong><span>当前账号可以查看绑定和前台效果，但没有修改模板绑定的权限。</span></div>${bindings.map((binding) => {
    const theme = templates.find((item) => String(item.id) === String(binding.theme_package_id ?? ''))
    return `<div class="binding-row binding-row-readonly"><div class="binding-language"><strong>${escapeHtml(binding.language_name)}</strong><span>${escapeHtml(binding.locale)}</span></div><strong>${escapeHtml(theme?.name || (binding.theme_package_id ? `模板 #${binding.theme_package_id}` : '未绑定模板'))}</strong>${badge(binding.enabled ? '已启用' : '已停用')}${previewURL(binding) && binding.theme_package_id ? `<a class="button button-secondary button-compact" href="${escapeHtml(previewURL(binding))}" target="_blank" rel="noopener">查看站点</a>` : ''}</div>`
  }).join('')}</div>`
  const renderableTemplates = templates.filter((item) => item.renderable)
  if (!renderableTemplates.length) return '<div class="site-template-empty"><strong>没有可绑定模板</strong><span>请先到模板管理安装并通过安全校验。</span></div>'
  const languagePicker = bindings.length > 1 ? `<div class="site-template-language-picker">
    <div><label for="site-template-language-select">选择语言</label><small id="site-template-language-help">每种语言独立绑定模板与前台站点；切换不会修改其他语言设置。</small></div>
    <select id="site-template-language-select" data-site-language-select aria-describedby="site-template-language-help">${bindings.map((binding, index) => `<option value="${escapeHtml(binding.language_id)}" ${index === 0 ? 'selected' : ''}>${escapeHtml(binding.language_name)} · ${escapeHtml(binding.locale)} · ${binding.enabled ? '已启用' : '已停用'}</option>`).join('')}</select>
  </div>` : ''
  return `<div class="site-template-bindings">${languagePicker}${bindings.map((binding, index) => {
    const selectedTheme = renderableTemplates.find((item) => String(item.id) === String(binding.theme_package_id ?? ''))
    const selectedPreview = siteTemplatePreviewPath(selectedTheme, site, binding.locale)
    const frontendURL = previewURL(binding)
    return `<section class="site-template-workbench" data-binding-row="${binding.language_id}" data-binding-locale="${escapeHtml(binding.locale)}" data-current-theme="${escapeHtml(binding.theme_package_id ?? '')}" data-current-enabled="${String(Boolean(binding.enabled))}" ${index ? 'hidden' : ''}>
      <header class="site-template-workbench-header"><div><span class="site-template-locale">${escapeHtml(binding.locale)}</span><span><strong>${escapeHtml(binding.language_name)}</strong><small>${escapeHtml(binding.native_name || binding.language_name)} · 该语言独立选择前台模板</small></span></div><label class="switch-control"><input type="checkbox" name="binding_enabled_${binding.language_id}" ${binding.enabled ? 'checked' : ''} data-site-template-enabled><span></span><em>启用此语言站点</em></label></header>
      <div class="site-template-layout">
        <fieldset class="site-template-choices"><legend>选择模板</legend><p>选择后右侧立即加载真实网站效果，保存绑定后前台正式切换。</p><div class="site-template-option-list">${renderableTemplates.map((theme) => siteTemplateOption(theme, binding, site)).join('')}<label class="site-template-unbound ${binding.theme_package_id ? '' : 'is-selected'}"><input type="radio" name="theme_package_${binding.language_id}" value="" ${binding.theme_package_id ? '' : 'checked'} data-site-template-choice data-template-name="未绑定模板" data-preview-src=""><span>${icon('alert', 'icon icon-sm')}<strong>暂不绑定模板</strong><small>前台将停止渲染，适合尚未上线的站点。</small></span></label></div><div class="site-template-save-row"><span data-site-template-save-hint>${selectedTheme ? '当前模板已生效' : '当前没有绑定模板'}</span><button class="button button-primary button-compact" type="button" data-save-binding data-language-id="${binding.language_id}" data-binding-version="${binding.version}" disabled>保存模板绑定</button></div></fieldset>
        <section class="site-template-preview" aria-label="所选模板网站预览"><header><span><strong data-site-template-preview-title>${escapeHtml(selectedTheme?.name || '未绑定模板')}</strong><small data-site-template-preview-state>${selectedTheme ? '当前正在使用 · 安全预览' : '请选择一个模板查看网站效果'}</small></span><div><a class="button button-quiet button-compact" data-site-template-preview-link href="${escapeHtml(selectedPreview || '#')}" target="_blank" rel="noopener" ${selectedPreview ? '' : 'hidden'}>整页查看</a><a class="button button-secondary button-compact" data-site-template-frontend-link href="${escapeHtml(frontendURL || '#')}" target="_blank" rel="noopener" ${frontendURL && binding.theme_package_id && binding.enabled ? '' : 'hidden'}>打开当前站点</a></div></header><div class="site-template-preview-frame"><iframe data-site-template-frame src="${escapeHtml(selectedPreview || 'about:blank')}" title="${escapeHtml(binding.language_name)}所选模板预览" loading="eager" sandbox></iframe><div class="site-template-preview-empty" ${selectedPreview ? 'hidden' : ''}>${icon('template')}<strong>选择模板后在这里显示网站</strong><span>预览使用真实站点内容，但不会改变当前线上绑定。</span></div></div></section>
      </div>
    </section>`
  }).join('')}</div>`
}

function siteLanguageOverview(bindings = [], site = null) {
  if (!bindings.length) return '<div class="site-language-empty"><strong>尚未配置语言</strong><span>请先在语言管理中添加语言，再为每个语言站点选择模板。</span></div>'
  return `<div class="site-language-overview">
    <div class="site-language-overview-heading"><div><h3>语言切换</h3><p>为每个语言站点设置启用状态，并快速进入对应的模板与前台预览。</p></div><span class="site-language-count">${bindings.length} 个语言站点</span></div>
    <div class="site-language-card-list">${bindings.map((binding, index) => `<button class="site-language-card ${index === 0 ? 'is-current' : ''}" type="button" data-site-language-tab="${escapeHtml(binding.language_id)}" aria-pressed="${index === 0 ? 'true' : 'false'}"><span class="site-language-code">${escapeHtml(binding.locale)}</span><span class="site-language-card-copy"><strong>${escapeHtml(binding.language_name)}</strong><small>${escapeHtml(binding.native_name || binding.language_name)} · localhost:${escapeHtml(site?.local_port || '')}</small></span><span class="site-language-card-state">${binding.enabled ? '已启用' : '已停用'}<em>进入配置</em></span>${icon('chevron', 'icon icon-sm')}</button>`).join('')}</div>
    <div class="site-editor-note">${icon('link', 'icon icon-sm')}<span><strong>语言与模板独立生效</strong><small>点击语言卡片可直接进入该语言的模板预览；保存模板绑定后，前台对应端口立即使用新的设置。</small></span></div>
  </div>`
}

function siteFields(item = null, domains = [], bindings = [], templates = [], canBindTemplates = false) {
  const languages = liveState.languages.filter((language) => language.enabled).map((language) => ({ value: language.code, label: `${language.name_zh} / ${language.default_locale}` }))
  const suggestedPort = Math.max(8080, ...liveState.sites.map((site) => Number(site.local_port || 0))) + 1
  const identityFields = `<div class="form-grid site-identity-grid">
    ${field('站点名称', 'name', item?.name, { required: true, minlength: 2, maxlength: 100 })}
    ${field('站点代码', 'code', item?.code, { required: true, maxlength: 32, placeholder: 'germany' })}
    ${item ? `<input type="hidden" name="primary_domain" value="${escapeHtml(item.primary_domain || '')}">` : field('正式主域名（可选）', 'primary_domain', '', { maxlength: 253, placeholder: 'www.example.com', help: '可先留空，用 localhost 完成测试后再绑定。' })}
    ${field('本地预览端口', 'local_port', item?.local_port ?? suggestedPort, { type: 'number', required: true, min: 1024, max: 65535, step: 1, help: '每个站点必须使用不同端口；8080 保留给管理后台。' })}
    ${field('市场代码', 'market_code', item?.market_code ?? 'GLOBAL', { required: true, maxlength: 16, placeholder: 'DE' })}
    ${selectField('运行状态', 'status', [{ value: 'active', label: '运行中' }, { value: 'maintenance', label: '维护中' }, { value: 'disabled', label: '已停用' }], item?.status ?? 'active')}
    ${item ? '' : selectField('初始语言', 'default_language_code', languages, 'en', { required: true, help: '创建后可继续绑定其他语言和独立模板。' })}
  </div>`
  const seoTitle = item?.seo_title ?? ''
  const seoDescription = item?.seo_description ?? ''
  const faviconMediaID = item?.favicon_media_id ?? ''
  const faviconURL = item?.favicon_url ?? ''
  const siteSEOFields = `<div class="form-grid site-seo-grid">
    <label class="form-field form-field-wide"><span>默认站点 Title</span><input name="seo_title" value="${escapeHtml(seoTitle)}" maxlength="200" placeholder="例如：Global Route | International logistics and express shipping"><small><span>用于首页搜索标题；内容页有独立 SEO 标题时优先使用内容设置。</span><span data-count-for="seo_title">${seoTitle.length} / 200</span></small></label>
    <label class="form-field form-field-wide"><span>默认 Meta Description</span><textarea name="seo_description" maxlength="500" placeholder="概括站点首页服务与价值，供搜索结果和社交分享摘要使用">${escapeHtml(seoDescription)}</textarea><small><span>用于首页搜索摘要和 Open Graph 描述；内容页有独立描述时优先使用内容设置。</span><span data-count-for="seo_description">${seoDescription.length} / 500</span></small></label>
    <section class="site-favicon-field form-field-wide" aria-labelledby="site-favicon-heading"><div class="site-favicon-heading"><div><h4 id="site-favicon-heading">网站 Icon</h4><p>浏览器标签、书签和搜索结果使用的站点图标。</p></div><span class="badge badge-blue">安全媒体</span></div><input type="hidden" name="favicon_media_id" value="${escapeHtml(faviconMediaID)}"><input type="file" data-site-favicon-input accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden><div class="site-favicon-selector ${faviconURL ? 'is-selected' : ''}" data-site-favicon-selector><span class="site-favicon-preview"><img data-site-favicon-preview src="${escapeHtml(faviconURL || 'about:blank')}" alt="当前网站 Icon" ${faviconURL ? '' : 'hidden'}><span data-site-favicon-placeholder ${faviconURL ? 'hidden' : ''}>${icon('image', 'icon icon-sm')}</span></span><span><strong data-site-favicon-name>${faviconURL ? '已选择网站 Icon' : '尚未设置网站 Icon'}</strong><small data-site-favicon-details>${faviconURL ? '保存后将在前台所有页面生效' : '建议上传 512 × 512 的方形 PNG'}</small></span><span class="site-favicon-actions">${can('media.upload') ? `<button class="button button-secondary button-compact" type="button" data-site-favicon-upload>上传 Icon</button>` : ''}<button class="text-button" type="button" data-site-favicon-clear ${faviconURL ? '' : 'hidden'}>移除</button></span></div><small class="site-favicon-help">仅接受 JPEG / PNG。服务端会验证真实文件类型、尺寸和方形比例，图标将存入媒体中心，不能使用外部链接。</small></section>
  </div><div class="site-editor-note">${icon('search', 'icon icon-sm')}<span><strong>前台 SEO 生效规则</strong><small>首页使用此 Title；内容页优先使用内容自身的 SEO 标题。修改 Icon 或 Title 后，点击窗口底部的“保存修改”。</small></span></div>`
  if (!item) return `${identityFields}${siteCreateTemplateFields(templates, can('templates.manage'))}<div class="form-hint form-field-wide"><strong>创建后的访问地址</strong><span>系统会生成固定的 localhost 预览地址；初始模板会立即绑定到所选语言，之后可继续添加语言、切换独立模板并绑定正式域名。</span></div>`
  return `<div class="site-editor-shell"><nav class="site-editor-tabs" role="tablist" aria-label="编辑站点设置">
    <div class="site-editor-summary"><span class="site-editor-mark">${icon('globe')}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.market_code)} · localhost:${escapeHtml(item.local_port)}</small></div>
    <button type="button" role="tab" aria-selected="true" aria-controls="site-panel-identity" data-site-editor-tab="identity">${icon('settings', 'icon icon-sm')}<span><strong>基本信息</strong><small>名称、端口与状态</small></span></button>
    <button type="button" role="tab" aria-selected="false" aria-controls="site-panel-languages" tabindex="-1" data-site-editor-tab="languages">${icon('globe', 'icon icon-sm')}<span><strong>语言切换</strong><small>启用语言与站点入口</small></span></button>
    <button type="button" role="tab" aria-selected="false" aria-controls="site-panel-template" tabindex="-1" data-site-editor-tab="template">${icon('template', 'icon icon-sm')}<span><strong>模板与预览</strong><small>选择并查看网站</small></span></button>
    <button type="button" role="tab" aria-selected="false" aria-controls="site-panel-access" tabindex="-1" data-site-editor-tab="access">${icon('link', 'icon icon-sm')}<span><strong>访问与域名</strong><small>本地端口、DNS</small></span></button>
    ${can('seo.manage') ? `<button type="button" role="tab" aria-selected="false" aria-controls="site-panel-seo" tabindex="-1" data-site-editor-tab="seo">${icon('search', 'icon icon-sm')}<span><strong>SEO 设置</strong><small>标题、摘要与 Icon</small></span></button>` : ''}
  </nav><div class="site-editor-panels">
    <section class="site-editor-panel" id="site-panel-identity" role="tabpanel" data-site-editor-panel="identity"><header class="site-editor-panel-heading"><div><h3>基本信息</h3><p>管理站点身份、本地测试端口和运行状态。</p></div>${badge(siteStatus[item.status] ?? item.status)}</header>${identityFields}<div class="site-editor-note">${icon('lock', 'icon icon-sm')}<span><strong>保存保护</strong><small>站点代码和端口修改后会检查格式、重复占用和并发版本。</small></span></div></section>
    <section class="site-editor-panel site-editor-languages-panel" id="site-panel-languages" role="tabpanel" data-site-editor-panel="languages" hidden><header class="site-editor-panel-heading"><div><h3>语言切换</h3><p>查看已绑定语言、独立访问端口和当前启用状态。</p></div><a class="text-button" href="#/admin/languages">管理语言</a></header>${siteLanguageOverview(bindings, item)}</section>
    <section class="site-editor-panel site-editor-template-panel" id="site-panel-template" role="tabpanel" data-site-editor-panel="template" hidden><header class="site-editor-panel-heading"><div><h3>模板与网站预览</h3><p>为当前站点语言选择完整模板，实时查看首页效果。</p></div><a class="text-button" href="#/admin/templates">管理模板</a></header>${siteLanguageFields(bindings, templates, canBindTemplates, item)}</section>
    <section class="site-editor-panel site-editor-access-panel" id="site-panel-access" role="tabpanel" data-site-editor-panel="access" hidden><header class="site-editor-panel-heading"><div><h3>访问地址与正式域名</h3><p>本地测试互不占用端口，正式上线后可绑定多个域名。</p></div></header>${siteDomainFields(item, domains)}</section>
    ${can('seo.manage') ? `<section class="site-editor-panel site-editor-seo-panel" id="site-panel-seo" role="tabpanel" data-site-editor-panel="seo" hidden><header class="site-editor-panel-heading"><div><h3>SEO 设置</h3><p>配置站点首页默认标题、搜索摘要与浏览器网站 Icon。</p></div></header>${siteSEOFields}</section>` : ''}
  </div></div>`
}

function updateSiteTemplatePreview(workbench, choice) {
  if (!workbench || !choice) return
  const option = choice.closest('[data-site-template-option]')
  const unbound = choice.closest('.site-template-unbound')
  workbench.querySelectorAll('[data-site-template-option]').forEach((item) => item.classList.toggle('is-selected', item === option))
  workbench.querySelector('.site-template-unbound')?.classList.toggle('is-selected', Boolean(unbound))
  workbench.querySelectorAll('[data-template-current-label]').forEach((label) => { label.textContent = label.closest('[data-site-template-option]') === option ? '已选择 · 保存后生效' : '点击选择并预览' })
  const title = workbench.querySelector('[data-site-template-preview-title]')
  const state = workbench.querySelector('[data-site-template-preview-state]')
  const frame = workbench.querySelector('[data-site-template-frame]')
  const empty = workbench.querySelector('.site-template-preview-empty')
  const previewLink = workbench.querySelector('[data-site-template-preview-link]')
  const frontendLink = workbench.querySelector('[data-site-template-frontend-link]')
  const saveButton = workbench.querySelector('[data-save-binding]')
  const selectedID = choice.value
  const previewSrc = choice.dataset.previewSrc || ''
  const selectedName = choice.dataset.templateName || '未绑定模板'
  const currentID = workbench.dataset.currentTheme || ''
  const currentEnabled = workbench.dataset.currentEnabled === 'true'
  const enabled = Boolean(workbench.querySelector('[data-site-template-enabled]')?.checked)
  const dirty = String(selectedID) !== String(currentID) || enabled !== currentEnabled
  if (title) title.textContent = selectedName
  if (state) state.textContent = previewSrc ? (String(selectedID) === String(currentID) ? '当前正在使用 · 安全预览' : '待保存切换 · 安全预览') : '请选择一个模板查看网站效果'
  if (frame) {
    frame.src = previewSrc || 'about:blank'
    frame.hidden = !previewSrc
  }
  if (empty) empty.hidden = Boolean(previewSrc)
  if (previewLink) { previewLink.hidden = !previewSrc; previewLink.href = previewSrc || '#' }
  if (frontendLink) { frontendLink.hidden = !(previewSrc && selectedID && enabled && String(selectedID) === String(currentID)); }
  if (saveButton) { saveButton.disabled = !dirty; saveButton.closest('.site-template-save-row')?.querySelector('[data-site-template-save-hint]') && (saveButton.closest('.site-template-save-row').querySelector('[data-site-template-save-hint]').textContent = dirty ? '有待保存的模板或启用状态修改' : (selectedID ? '当前模板已生效' : '当前没有绑定模板')) }
}

function selectSiteTemplateLanguage(languageID) {
  const selectedID = String(languageID || '')
  const picker = $('[data-site-language-select]', entityForm)
  const workbenches = $$('[data-binding-row]', entityForm)
  const selectedWorkbench = workbenches.find((workbench) => String(workbench.dataset.bindingRow) === selectedID)
  if (!selectedWorkbench) return
  workbenches.forEach((workbench) => { workbench.hidden = workbench !== selectedWorkbench })
  if (picker) picker.value = selectedID
}

function updateSiteCreateTemplateSelection(choice) {
  if (!choice) return
  $$('.site-create-template-card', entityForm).forEach((card) => {
    const selected = card.contains(choice)
    card.classList.toggle('is-selected', selected)
    const state = card.querySelector('[data-site-create-template-state]')
    if (state) state.textContent = selected ? '初始语言将使用此模板' : '选择为初始模板'
  })
}

function languageFields(item = null) {
  const sites = liveState.sites.map((site) => ({ value: site.id, label: site.name }))
  return `<div class="form-grid">
    ${field('语言代码', 'code', item?.code, { required: true, maxlength: 32, placeholder: 'sv' })}
    ${field('默认 Locale', 'default_locale', item?.default_locale, { required: true, maxlength: 35, placeholder: 'sv-SE' })}
    ${field('中文名称', 'name_zh', item?.name_zh, { required: true, maxlength: 60, placeholder: '瑞典语' })}
    ${field('本地名称', 'native_name', item?.native_name, { required: true, maxlength: 100, placeholder: 'Svenska' })}
    ${selectField('文字方向', 'direction', [{ value: 'ltr', label: '从左到右（LTR）' }, { value: 'rtl', label: '从右到左（RTL）' }], item?.direction ?? 'ltr')}
    ${item ? '' : selectField('首次绑定站点', 'site_id', sites, sites[0]?.value ?? '', { required: true })}
    ${checkboxField('启用此语言', 'enabled', item?.enabled ?? true)}
  </div>`
}

async function contentFields(item = null, newLocale = false) {
  const siteID = (item?.site_id ?? currentSiteID()) || liveState.sites[0]?.id
  const bindings = siteID ? await loadSiteLanguages(siteID) : []
  const siteChoices = liveState.sites.map((site) => ({ value: site.id, label: site.name }))
  const localeChoices = bindings.filter((binding) => binding.enabled || binding.locale === item?.locale).map((binding) => ({ value: binding.locale, label: `${binding.language_name} / ${binding.locale}` }))
  const seo = item ?? {}
  const structured = seo.structured_data ? JSON.stringify(seo.structured_data, null, 2) : '{}'
  return `<div class="content-editor-shell">
    <div class="content-editor-main">
      <section class="editor-section" aria-labelledby="content-main-heading"><div class="editor-section-heading"><div><h3 id="content-main-heading">内容主体</h3><p>先完成标题和正文，再从右侧安排栏目、标签与发布状态。</p></div><span class="editor-locale-badge">${escapeHtml(localeChoices.find((choice) => String(choice.value) === String(item?.locale))?.label ?? item?.locale ?? '新语言版本')}</span></div>
        ${field('标题', 'title', item?.title, { required: true, minlength: 2, maxlength: 200, wide: true, placeholder: '例如：欧洲国际物流服务指南' })}
        <div class="editor-meta-grid">${field('Slug / 伪静态路径', 'slug', item?.slug, { required: true, maxlength: 180, placeholder: 'europe/logistics-guide', help: '仅使用字母、数字、短横线和 /；保存时检查冲突。' })}${selectField('内容类型', 'content_type', Object.entries(contentTypes).map(([value, label]) => ({ value, label })), item?.content_type ?? 'article')}</div>
        <div class="form-field form-field-wide"><span>正文</span><div class="rich-editor"><div class="rich-toolbar" role="toolbar" aria-label="正文编辑工具"><button type="button" class="editor-tool" data-editor-command="bold"><strong>B</strong><span>加粗</span></button><button type="button" class="editor-tool" data-editor-command="heading"><strong>H2</strong><span>标题</span></button><button type="button" class="editor-tool" data-editor-command="link">${icon('link', 'icon icon-sm')}<span>链接</span></button><span class="editor-toolbar-spacer"></span><button type="button" class="editor-tool" data-editor-command="preview" aria-pressed="false">预览</button></div><textarea name="body_html" class="code-field rich-textarea" data-richtext maxlength="200000" placeholder="使用工具栏快速插入 HTML，或直接粘贴经过整理的正文…">${escapeHtml(item?.body_html ?? '')}</textarea><iframe class="rich-preview" data-rich-preview title="正文预览" sandbox="allow-same-origin" hidden></iframe></div><small>支持安全 HTML；保存草稿时可暂不填写，发布前必须有正文。<span class="editor-char-count" data-char-count-for="body_html">0 / 200000</span></small></div>
        ${field('摘要', 'summary', item?.summary, { textarea: true, maxlength: 500, wide: true, placeholder: '用于列表页、分享卡片和搜索结果摘要' })}
      </section>
      ${can('seo.manage') ? `<details class="editor-section seo-editor-section" ${item ? 'open' : ''}><summary><span><strong>独立 SEO 设置</strong><small>每个站点 / Locale 单独保存，不做机械翻译</small></span><span class="seo-ready-indicator">标题 · 描述 · Canonical</span></summary><div class="form-grid">
        ${field('页面 H1', 'seo_h1', seo.h1 ?? item?.title, { maxlength: 200 })}
        ${field('SEO 标题', 'seo_title', seo.seo_title ?? item?.title, { maxlength: 200 })}
        ${field('核心关键词', 'primary_keyword', seo.primary_keyword, { maxlength: 100 })}
        ${field('次要关键词', 'secondary_keywords', (seo.secondary_keywords ?? []).join(', '), { maxlength: 1000, help: '用英文逗号分隔，最多 20 个。' })}
        ${field('Meta Description', 'meta_description', seo.meta_description, { textarea: true, maxlength: 500, wide: true })}
        ${field('Canonical URL', 'canonical_url', seo.canonical_url, { type: 'url', maxlength: 2048, wide: true, placeholder: 'https://example.com/path' })}
        ${field('Open Graph 标题', 'og_title', seo.og_title, { maxlength: 200 })}
        ${field('Open Graph 描述', 'og_description', seo.og_description, { textarea: true, maxlength: 500 })}
        ${field('JSON-LD 结构化数据', 'structured_data', structured, { textarea: true, code: true, wide: true })}
        ${checkboxField('允许搜索引擎收录（index）', 'robots_index', seo.robots_index ?? true)}
      </div></details>` : ''}
    </div>
    <aside class="content-editor-side" aria-label="内容发布设置">
      <section class="editor-side-section"><h3>发布设置</h3>${selectField('站点', 'site_id', siteChoices, siteID, { required: true, disabled: Boolean(item) && !newLocale, help: item && !newLocale ? '现有内容的站点不能直接迁移；请添加新的语言版本。' : '' })}${selectField('语言 / Locale', 'locale', localeChoices, item?.locale ?? localeChoices[0]?.value ?? '', { required: true, disabled: Boolean(item) && !newLocale })}${selectField('内容状态', 'status', Object.entries(contentStatus).filter(([value]) => value !== 'scheduled').map(([value, label]) => ({ value, label })), item?.status ?? 'draft')}${field('定时发布时间', 'scheduled_at', defaultContentScheduledAt(item, !item || newLocale), { type: 'datetime-local', help: '默认当前时间；改为未来时间并发布后，前台会在到点时自动开放，最多受 60 秒页面缓存影响。' })}</section>
      <section class="editor-side-section"><h3>归档与展示</h3>${field('栏目', 'category', item?.category, { maxlength: 100, placeholder: '物流知识 / 服务指南' })}${field('Tag 标签', 'tags', (item?.tags ?? []).join(', '), { maxlength: 1800, placeholder: '国际物流, 欧洲专线', help: '逗号分隔；自动去重，最多 30 个。' })}${field('模板套装 Key', 'template_key', item?.template_key, { maxlength: 100, placeholder: 'global-commerce/article' })}</section>
      <section class="editor-side-section publish-check-panel"><h3>发布前检查</h3><div class="check-row"><span class="check-dot check-dot-neutral"></span><span>标题和 Slug</span><small>保存时校验</small></div><div class="check-row"><span class="check-dot check-dot-neutral"></span><span>正文安全清洗</span><small>服务端执行</small></div><div class="check-row"><span class="check-dot check-dot-neutral"></span><span>SEO 字段完整</span><small>发布前检查</small></div><p>发布操作会写入审计日志，可在发布管理中追踪。</p></section>
    </aside>
  </div>`
}

function siteBaseURL(site) {
  if (!site) return 'http://localhost:8081'
  return site.primary_domain ? `https://${site.primary_domain}` : `http://localhost:${site.local_port}`
}

function contentFrontendPreviewURL(site, item) {
  const port = Number(site?.local_port || 0)
  const base = port >= 1024 && port <= 65535 ? `http://localhost:${port}` : siteBaseURL(site).replace(/\/+$/, '')
  const slug = String(item?.slug || '').split('/').filter(Boolean).map((part) => encodeURIComponent(part)).join('/')
  const locale = Number(site?.language_count || 0) > 1 ? encodeURIComponent(String(item?.locale || '').trim()) : ''
  return `${base}${sitePublicPath(site, locale, slug)}`
}

function contentTaxonomyTerms(siteID, locale, kind) {
  return liveState.taxonomy
    .filter((term) => term.status === 'active' && term.kind === kind && Number(term.site_id) === Number(siteID) && term.locale === locale)
    .sort((left, right) => String(left.name).localeCompare(String(right.name), locale || 'zh-CN'))
}

function taxonomyOptionMarkup(terms) {
  return terms.map((term) => `<option value="${escapeHtml(term.name)}">${escapeHtml(term.slug)}</option>`).join('')
}

function contentTagHelpText(count) {
  return count
    ? `可从 ${count} 个现有标签中选择；输入后按回车、逗号，离开输入框或保存时自动创建；最多 30 个，重复项自动合并。`
    : '当前范围还没有标签；输入后按回车、逗号，离开输入框或保存时自动创建；最多 30 个，重复项自动合并。'
}

function refreshContentTaxonomySuggestions(form) {
  if (!form) return
  const siteID = Number(contentEditorFormValue(form, 'site_id') || form.dataset.siteId || 0)
  const locale = contentEditorFormValue(form, 'locale') || form.dataset.locale || ''
  const categories = contentTaxonomyTerms(siteID, locale, 'category')
  const tags = contentTaxonomyTerms(siteID, locale, 'tag')
  const categoryList = form.querySelector('#content-category-suggestions')
  const tagList = form.querySelector('#content-tag-suggestions')
  if (categoryList) categoryList.innerHTML = taxonomyOptionMarkup(categories)
  if (tagList) tagList.innerHTML = taxonomyOptionMarkup(tags)
  const categoryHelp = form.querySelector('[data-category-suggestion-count]')
  const tagHelp = form.querySelector('[data-tag-suggestion-count]')
  if (categoryHelp) categoryHelp.textContent = categories.length ? `当前范围有 ${categories.length} 个可用栏目；也可输入新名称，保存时自动创建。` : '当前范围还没有栏目；输入名称并保存后会自动创建。'
  if (tagHelp) tagHelp.textContent = contentTagHelpText(tags.length)
}

function editorDraftKey(form) {
  const mode = form?.dataset.mode ?? 'create'
  const identity = mode === 'edit' ? `${form.dataset.contentId}:${form.dataset.siteId}:${form.dataset.locale}` : mode
  return `czcms-content-draft:${identity}`
}

function requestedContentType() {
  const type = String(currentRouteParams().get('content_type') || '').trim().toLowerCase()
  return Object.hasOwn(contentTypes, type) ? type : 'article'
}

function pagePresetMarkup() {
  const presets = [
    { key: 'about', label: '关于我们', slug: 'about-us', category: '企业信息', layout: 'standard', template: 'page/about', hint: '团队、使命与服务能力' },
    { key: 'contact', label: '联系我们', slug: 'contact-us', category: '企业信息', layout: 'contact', template: 'page/contact', hint: '联系信息与安全询盘表单' },
    { key: 'topic', label: '专题页面', slug: 'campaign', category: '专题活动', layout: 'landing', template: 'page/landing', hint: '活动、解决方案或专题聚合' },
    { key: 'service', label: '服务页面', slug: 'services', category: '服务介绍', layout: 'standard', template: 'page/service', hint: '单项服务与转化信息' },
    { key: 'custom', label: '自定义页面', slug: '', category: '', layout: 'custom', template: 'page/custom', hint: '从空白页面开始' },
  ]
  return `<section class="page-preset-panel" aria-labelledby="page-preset-heading"><div><h2 id="page-preset-heading">选择单页面模板</h2><p>模板会决定页面结构、前台资源和默认 SEO 策略；保存后可继续修改正文与 SEO。</p></div><div class="page-preset-list">${presets.map((preset) => `<button type="button" class="page-preset-button" data-page-preset="${preset.key}" data-page-title="${preset.label}" data-page-slug="${preset.slug}" data-page-category="${preset.category}" data-page-layout="${preset.layout}" data-page-template="${preset.template}" data-page-index-policy="noindex"><strong>${escapeHtml(preset.label)}</strong><small>${escapeHtml(preset.hint)}</small><em>${escapeHtml(preset.template)}</em></button>`).join('')}</div></section>`
}

const contactFormFieldPresets = [
  { key: 'name', type: 'text', label: '姓名 / 联系人', placeholder: '请输入您的姓名', required: true },
  { key: 'email', type: 'email', label: '邮箱', placeholder: 'name@example.com', required: true },
  { key: 'phone', type: 'tel', label: '联系电话', placeholder: '+49 30 123456', required: false },
  { key: 'country', type: 'country', label: '所在国家 / 地区', placeholder: '例如：Germany', required: false },
  { key: 'service', type: 'select', label: '咨询服务', placeholder: '', options: ['国际快递', '空运', '海运', '清关服务'], required: false },
  { key: 'message', type: 'textarea', label: '需求说明', placeholder: '请说明货物、起运地、目的地与预计时效。', required: true },
  { key: 'consent', type: 'checkbox', label: '我同意使用以上信息处理本次咨询', placeholder: '', required: true },
]

async function contactPageFormManagerMarkup(item) {
  if (!item?.id) return `<section class="publish-sidebar-section contact-form-manager is-pending" aria-labelledby="contact-form-heading"><h2 id="contact-form-heading">联系表单</h2><p>选择“联系我们”模板后保存，系统会自动生成并绑定标准安全询盘表单。</p></section>`
  if (item.page_layout !== 'contact') return `<section class="publish-sidebar-section contact-form-manager" aria-labelledby="contact-form-heading"><h2 id="contact-form-heading">联系表单</h2><p>当前模板不包含询盘表单。选择“联系我们”模板并保存后，系统会自动绑定标准安全表单。</p></section>`
  try {
    const bindingPayload = await fetchJSON(`/api/v1/content-locales/${encodeURIComponent(item.id)}/form`)
    const bound = bindingPayload.form ?? null
    const summary = bound ? `${bound.fields?.length || 0} 个标准字段 · ${bound.status === 'active' ? '前台已启用' : '已停用'}` : '系统将在保存时自动绑定'
    return `<section class="publish-sidebar-section contact-form-manager" aria-labelledby="contact-form-heading" data-contact-page-id="${escapeHtml(item.id)}">
      <header class="sidebar-section-heading"><h2 id="contact-form-heading">默认询盘表单</h2>${bound ? `<button class="text-button" type="button" data-contact-action="submissions" data-contact-form-id="${escapeHtml(bound.id)}">查看询盘</button>` : ''}</header>
      <div class="contact-form-current ${bound ? 'is-bound' : ''}"><span>${icon(bound ? 'check' : 'alert', 'icon icon-sm')}</span><div><strong>${escapeHtml(bound?.name || '等待保存页面')}</strong><small>${escapeHtml(summary)}</small></div></div>
      ${bound ? `<div class="contact-form-actions"><button class="button button-secondary button-compact" type="button" data-contact-action="edit" data-contact-form-id="${escapeHtml(bound.id)}">高级字段设置</button><button class="button button-primary button-compact" type="button" data-contact-action="submissions" data-contact-form-id="${escapeHtml(bound.id)}">查看询盘</button></div>` : '<p class="form-help">无需手动新建或绑定；保存此页后自动完成。</p>'}
    </section>`
  } catch (error) {
    if (error?.status === 404) {
      return `<section class="publish-sidebar-section contact-form-manager is-pending" aria-labelledby="contact-form-heading"><h2 id="contact-form-heading">默认询盘表单</h2><p>这是已有的联系页面，尚未绑定默认表单。保存当前页面后，系统会自动生成并绑定安全询盘表单。</p><button class="button button-primary button-compact" type="button" data-contact-action="ensure">保存页面并自动生成</button></section>`
    }
    return `<section class="publish-sidebar-section contact-form-manager is-error" aria-labelledby="contact-form-heading"><h2 id="contact-form-heading">联系表单</h2><p>无法读取表单配置：${escapeHtml(error.message || '请稍后重试')}</p><button class="button button-secondary button-compact" type="button" data-contact-action="refresh">重新读取</button></section>`
  }
}

async function contentEditorPageMarkup(item = null, newLocale = false) {
  const sourceSite = defaultEnglishSite()
  const siteID = item?.site_id ?? (newLocale ? Number($('#site-switcher')?.dataset.siteId || liveState.sites[0]?.id || 0) : Number(sourceSite?.id || 0))
  const bindings = siteID ? await loadSiteLanguages(siteID) : []
  const siteChoices = liveState.sites.map((site) => ({ value: site.id, label: `${site.name} · ${site.primary_domain || `localhost:${site.local_port}`}` }))
  const localeChoices = bindings.filter((binding) => binding.enabled || binding.locale === item?.locale).map((binding) => ({ value: binding.locale, label: `${binding.language_name} / ${binding.locale}` }))
  const selectedLocale = item?.locale ?? localeChoices[0]?.value ?? ''
  const categoryTerms = contentTaxonomyTerms(siteID, selectedLocale, 'category')
  const tagTerms = contentTaxonomyTerms(siteID, selectedLocale, 'tag')
  const selectedSite = liveState.sites.find((site) => Number(site.id) === Number(siteID)) ?? liveState.sites[0]
  const baseURL = siteBaseURL(selectedSite)
  const tags = (item?.tags ?? []).join(', ')
  const secondaryKeywords = (item?.secondary_keywords ?? []).join(', ')
  const structured = item?.structured_data ? JSON.stringify(item.structured_data, null, 2) : '{}'
  const mode = item?.content_id && !newLocale ? 'edit' : newLocale ? 'locale-create' : 'create'
  const scheduledAt = defaultContentScheduledAt(item, mode !== 'edit')
  const contentType = item?.content_type || requestedContentType()
  const isSinglePage = contentType === 'page'
  const templatePlaceholder = isSinglePage ? 'page/company' : 'article/zh-cn'
  const listPath = isSinglePage ? '#/admin/content?section=pages' : '#/admin/content?section=articles'
  const heading = newLocale ? '添加语言版本' : item ? (isSinglePage ? '编辑单页面' : '编辑内容') : isSinglePage ? '新建单页面' : '新增英语内容'
  const title = item?.title ?? ''
  const seoTitle = item?.seo_title ?? title
  const metaDescription = item?.meta_description ?? ''
  const coverSelected = Boolean(item?.cover_media_id)
  const coverName = item?.cover_original_name || (coverSelected ? `媒体 #${item.cover_media_id}` : '尚未选择封面素材')
  const coverDetails = coverSelected && item?.cover_width && item?.cover_height ? `${item.cover_width} × ${item.cover_height} · 已安全扫描` : '建议 1200 × 630，仅支持 JPEG / PNG'
  const livePageURL = item?.status === 'published' && !isScheduledContent(item) ? contentFrontendPreviewURL(selectedSite, item) : ''
  const localePath = Number(selectedSite?.language_count || 0) > 1 ? `/${escapeHtml(selectedLocale)}` : ''
  const contactFormManager = isSinglePage ? await contactPageFormManagerMarkup(item) : ''
  return `<form id="content-editor-form" class="content-page-form" data-mode="${mode}" data-id="${escapeHtml(item?.id ?? '')}" data-content-id="${escapeHtml(item?.content_id ?? '')}" data-site-id="${escapeHtml(item?.site_id ?? siteID)}" data-locale="${escapeHtml(item?.locale ?? selectedLocale)}" data-ai-state="${escapeHtml(item?.ai_state ?? 'manual')}" data-version="${escapeHtml(item?.version ?? '')}" data-content-version="${escapeHtml(item?.content_version ?? '')}" novalidate>
    <header class="content-page-heading">
      <div class="content-heading-copy"><nav class="content-breadcrumb" aria-label="面包屑"><a href="${listPath}">${isSinglePage ? '单页面' : '内容管理'}</a><span aria-hidden="true">/</span><span>${heading}</span></nav><div class="content-title-line"><h1>${heading}</h1>${item?.ai_state === 'pending' ? '<span class="badge badge-amber">AI 生成 · 待人工审核</span>' : item?.ai_state === 'reviewed' ? '<span class="badge badge-green">AI 版本 · 已人工审核</span>' : ''}<p>${newLocale ? '为同一内容组创建独立的本地化版本' : isSinglePage ? '页面布局、SEO 收录和表单绑定都由后台单独管理；联系页默认 noindex，企业介绍/服务/专题可主动启用收录。' : !item ? '默认先完成并发布英语源内容，再由 AI 同步其他国家站' : isEnglishLocaleCode(item.locale) ? '英语源内容可在发布后同步为其他语言的待审核版本' : '目标语言版本可独立审核、修改和发布'}</p></div></div>
      <div class="content-heading-actions" aria-label="内容操作">
        ${item?.content_id ? `<button class="button button-secondary" type="button" data-content-action="revisions">${icon('clipboard', 'icon icon-sm')}版本历史</button>` : ''}
        ${livePageURL ? `<a class="button button-secondary" href="${escapeHtml(livePageURL)}" target="_blank" rel="noopener">${icon('eye', 'icon icon-sm')}打开前台</a>` : ''}
        <button class="button button-secondary" type="button" data-content-action="save">保存草稿</button>
        <button class="button button-secondary" type="button" data-content-action="review">提交审核</button>
        <button class="button button-secondary" type="button" data-content-action="preview" aria-pressed="false">${icon('search', 'icon icon-sm')}预览</button>
        <button class="button button-primary" type="button" data-content-action="publish">${icon('send', 'icon icon-sm')}立即发布</button>
      </div>
    </header>
    <div class="content-page-error" id="content-page-error" role="alert" tabindex="-1" hidden></div>
    <div class="content-page-grid">
      <div class="content-compose-column">
        <section class="content-compose-panel" aria-labelledby="content-compose-heading">
          <h2 class="visually-hidden" id="content-compose-heading">内容编辑</h2>
          ${isSinglePage && !item && !newLocale ? pagePresetMarkup() : ''}
          <label class="content-title-control"><span>内容标题 <b aria-hidden="true">*</b></span><span class="counted-input"><input name="title" value="${escapeHtml(title)}" minlength="2" maxlength="200" required placeholder="输入清晰、具体的内容标题" autocomplete="off"><small data-count-for="title">${title.length} / 60</small></span></label>
          <div class="content-slug-control"><label for="content-slug">URL / 伪静态路径</label><div class="slug-input-row"><span class="slug-origin" data-url-origin>${escapeHtml(baseURL)}</span><span class="slug-locale" data-url-locale>${localePath}</span><input id="content-slug" name="slug" value="${escapeHtml(item?.slug ?? '')}" maxlength="180" required placeholder="guide/multilingual-website-seo" autocomplete="off"><button class="text-button" type="button" data-content-action="slug">自动生成</button></div><small>独立语言站使用端口根域名，不重复添加语言目录；仅使用字母、数字、短横线和 /。</small></div>
          <input type="hidden" name="content_type" value="${escapeHtml(contentType)}">
          <div class="rich-editor rich-editor-visual" data-editor-mode="visual">
            <div class="rich-toolbar" role="toolbar" aria-label="正文编辑工具">
              <div class="editor-tool-group" aria-label="历史"><button type="button" class="editor-tool editor-tool-icon" data-rich-command="undo" aria-label="撤销" title="撤销">↶</button><button type="button" class="editor-tool editor-tool-icon" data-rich-command="redo" aria-label="重做" title="重做">↷</button></div>
              <label class="editor-block-select"><span class="visually-hidden">段落格式</span><select data-rich-block><option value="p">正文</option><option value="h2">标题 2</option><option value="h3">标题 3</option><option value="h4">标题 4</option><option value="blockquote">引用</option><option value="pre">代码块</option></select></label>
              <div class="editor-tool-group" aria-label="文字格式"><button type="button" class="editor-tool editor-tool-icon" data-rich-command="bold" aria-label="加粗" title="加粗"><strong>B</strong></button><button type="button" class="editor-tool editor-tool-icon" data-rich-command="italic" aria-label="斜体" title="斜体"><em>I</em></button><button type="button" class="editor-tool editor-tool-icon" data-rich-command="underline" aria-label="下划线" title="下划线"><u>U</u></button></div>
              <div class="editor-tool-group" aria-label="段落"><button type="button" class="editor-tool editor-tool-icon" data-rich-command="justifyLeft" aria-label="左对齐" title="左对齐">≡</button><button type="button" class="editor-tool editor-tool-icon" data-rich-command="insertUnorderedList" aria-label="项目列表" title="项目列表">☷</button><button type="button" class="editor-tool editor-tool-icon" data-rich-command="insertOrderedList" aria-label="编号列表" title="编号列表">1.</button></div>
              <div class="editor-tool-group" aria-label="插入"><button type="button" class="editor-tool" data-rich-command="createLink" aria-label="插入链接">${icon('link', 'icon icon-sm')}<span>链接</span></button><button type="button" class="editor-tool" data-rich-command="insertImage" aria-label="插入图片">${icon('image', 'icon icon-sm')}<span>图片</span></button></div>
              <span class="editor-toolbar-spacer"></span>
              <button type="button" class="editor-tool" data-rich-command="source" aria-pressed="false">源码</button><button type="button" class="editor-tool" data-rich-command="fullscreen" aria-pressed="false">全屏</button>
            </div>
            <div class="wysiwyg-editor" data-rich-editor contenteditable="true" role="textbox" aria-multiline="true" aria-label="正文内容" data-placeholder="开始撰写正文，输入 / 可插入内容块…"></div>
            <input type="file" data-rich-image-input accept="image/jpeg,image/png,.jpg,.jpeg,.png" hidden aria-label="选择正文图片">
            <textarea name="body_html" class="rich-source" data-rich-source maxlength="200000" aria-label="正文 HTML 源码" hidden>${escapeHtml(item?.body_html ?? '')}</textarea>
            <iframe class="rich-preview rich-page-preview" data-rich-preview title="正文预览" sandbox="allow-same-origin" hidden></iframe>
            <footer class="rich-editor-status"><span data-word-count>字数 0 · 阅读约 1 分钟</span><span class="editor-media-state" data-media-state role="status" aria-live="polite" hidden></span><span class="draft-save-state" data-draft-state><i></i>尚未保存</span></footer>
          </div>
          <label class="form-field content-summary-field"><span>内容摘要</span><textarea name="summary" maxlength="500" placeholder="用于内容列表、分享卡片和搜索摘要；建议控制在 120 字以内">${escapeHtml(item?.summary ?? '')}</textarea><small><span>概括正文价值，不机械重复标题。</span><span data-count-for="summary">${String(item?.summary ?? '').length} / 500</span></small></label>
        </section>

        ${can('seo.manage') ? `<section class="content-seo-panel" aria-labelledby="content-seo-heading">
          <header class="content-section-heading"><div><h2 id="content-seo-heading">Google SEO 设置</h2><p>每个站点和 Locale 独立配置；优先使用已配置 AI，未配置时从当前文章生成默认值。</p></div><div class="seo-heading-actions"><button class="button button-secondary button-compact" type="button" data-content-action="seo-extract">${icon('bot', 'icon icon-sm')}<span>AI 自动提取</span></button><span class="seo-score" data-seo-score><i></i>SEO 评分 0</span></div></header>
          <div class="seo-primary-grid">
            <label class="form-field"><span>SEO 标题</span><input name="seo_title" value="${escapeHtml(seoTitle)}" maxlength="200" placeholder="本地搜索用户会点击的标题"><small><span>建议 30–60 个字符。</span><span data-count-for="seo_title">${seoTitle.length} / 60</span></small></label>
            <label class="form-field"><span>核心关键词</span><input name="primary_keyword" value="${escapeHtml(item?.primary_keyword ?? '')}" maxlength="100" placeholder="例如：多语言 SEO"></label>
          </div>
          <label class="form-field"><span>次要关键词</span><input name="secondary_keywords" value="${escapeHtml(secondaryKeywords)}" maxlength="1000" placeholder="Google SEO, 国际站优化, hreflang"><small>使用逗号分隔，最多 20 个。</small></label>
          <label class="form-field"><span>Meta Description</span><textarea name="meta_description" maxlength="500" placeholder="说明页面能解决什么问题，并自然包含核心关键词">${escapeHtml(metaDescription)}</textarea><small><span>建议 70–160 个字符。</span><span data-count-for="meta_description">${metaDescription.length} / 160</span></small></label>
          <label class="form-field"><span>Canonical URL</span><input name="canonical_url" type="url" value="${escapeHtml(item?.canonical_url ?? '')}" maxlength="2048" placeholder="https://example.com/guide/page"></label>
          <section class="search-preview" aria-labelledby="search-preview-heading"><h3 id="search-preview-heading">搜索结果预览</h3><div class="search-preview-card"><span data-search-url>${escapeHtml(baseURL + sitePublicPath(selectedSite, selectedLocale, item?.slug ?? ''))}</span><strong data-search-title>${escapeHtml(seoTitle || title || '页面 SEO 标题')}</strong><p data-search-description>${escapeHtml(metaDescription || '填写 Meta Description 后，这里会显示搜索结果摘要。')}</p></div></section>
          <details class="seo-advanced"><summary>高级 SEO 与结构化数据</summary><div class="seo-advanced-grid">
            ${field('页面 H1', 'seo_h1', item?.h1 ?? title, { maxlength: 200 })}
            ${field('Open Graph 标题', 'og_title', item?.og_title ?? '', { maxlength: 200 })}
            ${field('Open Graph 描述', 'og_description', item?.og_description ?? '', { textarea: true, maxlength: 500 })}
            ${field('JSON-LD 结构化数据', 'structured_data', structured, { textarea: true, code: true })}
            ${isSinglePage ? `<div class="page-seo-policy"><label class="form-field"><span>页面布局</span><select name="page_layout"><option value="standard" ${(item?.page_layout ?? 'standard') === 'standard' ? 'selected' : ''}>普通页面（关于我们 / 服务）</option><option value="contact" ${(item?.page_layout ?? '') === 'contact' ? 'selected' : ''}>联系页面（可绑定询盘表单）</option><option value="landing" ${(item?.page_layout ?? '') === 'landing' ? 'selected' : ''}>专题 / 落地页</option><option value="custom" ${(item?.page_layout ?? '') === 'custom' ? 'selected' : ''}>自定义页面</option></select><small>布局控制前台加载的页面和表单资源；正文不能直接放入任意 HTML 表单。</small></label><label class="form-field"><span>搜索引擎收录</span><select name="index_policy"><option value="noindex" ${(item?.index_policy ?? 'noindex') === 'noindex' ? 'selected' : ''}>不收录（noindex, follow）</option><option value="index" ${(item?.index_policy ?? '') === 'index' ? 'selected' : ''}>允许收录并进入 Sitemap</option></select><small>联系表单、隐私和提交成功页建议不收录；企业介绍、服务和专题可以开启。</small></label><input type="checkbox" name="robots_index" checked hidden></div>` : checkboxField('允许搜索引擎收录（index）', 'robots_index', item?.robots_index ?? true)}
          </div></details>
        </section>` : ''}
      </div>

      <aside class="content-publish-sidebar" aria-label="发布设置">
        <section class="publish-sidebar-section"><h2>发布设置</h2><div class="publish-summary-row"><span>状态</span>${selectField('状态', 'status', Object.entries(contentStatus).filter(([value]) => value !== 'scheduled').map(([value, label]) => ({ value, label })), item?.status ?? 'draft')}</div><div class="publish-summary-row"><span>发布时间</span>${field('发布时间', 'scheduled_at', scheduledAt, { type: 'datetime-local', help: '默认当前时间；改为未来时间并发布后，前台会在到点时自动开放，最多受 60 秒页面缓存影响。' })}</div><div class="publish-summary-row publish-owner"><span>作者</span><strong>${escapeHtml(item?.owner_name || '当前管理员')}</strong></div><button class="button button-primary publish-sidebar-button" type="button" data-content-action="publish">立即发布</button></section>
        <section class="publish-sidebar-section"><header class="sidebar-section-heading"><h2>站点与语言</h2><button type="button" class="text-button" data-content-action="localize">AI 同步其他语言</button></header>${selectField('目标站点', 'site_id', siteChoices, siteID, { required: true, disabled: Boolean(item) && !newLocale })}${selectField('内容语言', 'locale', localeChoices, selectedLocale, { required: true, disabled: Boolean(item) && !newLocale })}<input type="hidden" name="cover_media_id" value="${escapeHtml(item?.cover_media_id ?? '')}"><div class="cover-selector ${coverSelected ? 'is-selected' : ''}" data-cover-selector><span class="cover-placeholder">${icon('image')}</span><span><small>封面图</small><strong data-cover-name>${escapeHtml(coverName)}</strong><em data-cover-details>${escapeHtml(coverDetails)}</em></span><span class="cover-actions"><button class="button button-secondary button-compact" type="button" data-content-action="media">${coverSelected ? '更换' : '上传'}</button><button class="text-button" type="button" data-content-action="cover-remove" ${coverSelected ? '' : 'hidden'}>移除</button></span></div></section>
        <section class="publish-sidebar-section"><h2>栏目、标签与模板</h2><label class="form-field"><span>栏目</span><input name="category" list="content-category-suggestions" value="${escapeHtml(item?.category ?? '')}" maxlength="100" placeholder="选择或输入栏目"><datalist id="content-category-suggestions">${taxonomyOptionMarkup(categoryTerms)}</datalist><small data-category-suggestion-count>${categoryTerms.length ? `当前范围有 ${categoryTerms.length} 个可用栏目；也可输入新名称，保存时自动创建。` : '当前范围还没有栏目；输入名称并保存后会自动创建。'}</small></label><label class="form-field tag-editor-field"><span>标签</span><input type="hidden" name="tags" value="${escapeHtml(tags)}"><div class="tag-editor" data-tag-editor><div class="tag-chip-list" data-tag-list></div><input type="text" data-tag-entry list="content-tag-suggestions" maxlength="80" aria-describedby="content-tag-help" placeholder="输入标签后按回车或逗号"></div><datalist id="content-tag-suggestions">${taxonomyOptionMarkup(tagTerms)}</datalist><small id="content-tag-help" data-tag-suggestion-count>${contentTagHelpText(tagTerms.length)}</small></label>${field('页面模板', 'template_key', item?.template_key ?? '', { maxlength: 100, placeholder: templatePlaceholder })}</section>
        ${contactFormManager}
        <section class="publish-sidebar-section publish-check-panel"><h2>发布前检查</h2><div class="check-row" data-publish-check="title"><span class="check-dot check-dot-neutral"></span><span>标题与 URL</span><small>待填写</small></div><div class="check-row" data-publish-check="body"><span class="check-dot check-dot-neutral"></span><span>正文内容</span><small>待填写</small></div><div class="check-row" data-publish-check="seo"><span class="check-dot check-dot-neutral"></span><span>SEO 字段</span><small>待完善</small></div><div class="check-row" data-publish-check="cover"><span class="check-dot check-dot-warning"></span><span>封面图</span><small>建议上传</small></div><p>发布时服务端会再次执行权限、URL 冲突与富文本安全检查，并写入审计日志。</p></section>
      </aside>
    </div>
  </form>`
}

async function renderContentEditorRoute(editorMode) {
  const params = currentRouteParams()
  const key = `${editorMode}:${params.get('content_id') || ''}:${params.get('site_id') || ''}:${params.get('locale') || ''}:${params.get('content_type') || ''}:${params.get('section') || ''}`
  if (contentEditorState.rendering || (contentEditorState.key === key && $('#content-editor-form', contentEditorView))) return
  contentEditorState.rendering = true
  contentEditorState.key = key
  contentEditorView.innerHTML = '<div class="content-editor-loading" role="status"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div><span>正在准备内容编辑器…</span></div>'
  try {
    await ensureCoreData()
    if (!liveState.loaded.has('taxonomy')) await loadRoute('taxonomy')
    let item = null
    let newLocale = editorMode === 'locale'
    if (editorMode === 'edit') {
      const contentID = Number(params.get('content_id'))
      const siteID = Number(params.get('site_id'))
      const locale = params.get('locale') ?? ''
      if (!contentID || !siteID || !locale) throw new APIError('编辑地址缺少内容、站点或 Locale 参数', 400)
      item = await fetchJSON(`/api/v1/contents/${contentID}/locales/${encodeURIComponent(locale)}?site_id=${siteID}`)
    }
    if (newLocale) {
      const contentID = Number(params.get('content_id'))
      if (!contentID) throw new APIError('添加语言版本前需要指定原内容', 400)
      item = { content_id: contentID, content_type: params.get('content_type') || 'article' }
    }
    contentEditorState.item = item
    contentEditorState.newLocale = newLocale
    contentEditorView.innerHTML = await contentEditorPageMarkup(item, newLocale)
    initializeContentEditorPage()
  } catch (error) {
    contentEditorView.innerHTML = `<div class="content-editor-route-error">${icon('alert')}<h1>无法打开内容编辑器</h1><p>${escapeHtml(error.message || '请稍后重试')}</p><div><a class="button button-secondary" href="#/admin/content">返回内容列表</a><button class="button button-primary" type="button" data-editor-retry>重新加载</button></div></div>`
  } finally {
    contentEditorState.rendering = false
  }
}

function contentEditorFormValue(form, name) {
  const field = form?.elements?.[name]
  return String(field?.value ?? '').trim()
}

function updateContentPageCount(form, name, limit) {
  const count = form?.elements?.[name]?.value?.length ?? 0
  const output = form?.querySelector(`[data-count-for="${name}"]`)
  if (output) output.textContent = `${count.toLocaleString('zh-CN')} / ${limit}`
}

function editorPlainText(html) {
  const template = document.createElement('template')
  template.innerHTML = String(html ?? '')
  return template.content.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function updateContentPageChecks(form) {
  const checks = {
    title: Boolean(contentEditorFormValue(form, 'title') && contentEditorFormValue(form, 'slug')),
    body: Boolean(editorPlainText(form?.elements?.body_html?.value)),
    seo: Boolean(contentEditorFormValue(form, 'seo_title') && contentEditorFormValue(form, 'meta_description')),
    cover: Boolean(contentEditorFormValue(form, 'cover_media_id')),
  }
  Object.entries(checks).forEach(([key, passed]) => {
    const row = form?.querySelector(`[data-publish-check="${key}"]`)
    if (!row) return
    row.classList.toggle('is-complete', passed)
    const dot = row.querySelector('.check-dot')
    const label = row.querySelector('small')
    if (dot) dot.className = `check-dot ${passed ? 'check-dot-success' : key === 'cover' ? 'check-dot-warning' : 'check-dot-neutral'}`
    if (label) label.textContent = passed ? '已完成' : key === 'cover' ? '建议上传' : key === 'seo' ? '待完善' : '待填写'
  })
  const score = [checks.title, checks.body, checks.seo].filter(Boolean).length
  const scoreElement = form?.querySelector('[data-seo-score]')
  if (scoreElement) scoreElement.innerHTML = `<i></i>SEO 评分 ${score === 3 ? '92' : score === 2 ? '68' : score === 1 ? '42' : '0'}`
}

function updateContentPagePreview(form) {
  if (!form) return
  const site = liveState.sites.find((item) => String(item.id) === contentEditorFormValue(form, 'site_id')) ?? liveState.sites[0]
  const origin = siteBaseURL(site)
  const locale = contentEditorFormValue(form, 'locale') || form.dataset.locale || 'en'
  const slug = contentEditorFormValue(form, 'slug')
  const url = `${origin}${sitePublicPath(site, locale, slug)}`
  const title = contentEditorFormValue(form, 'seo_title') || contentEditorFormValue(form, 'title') || '页面 SEO 标题'
  const description = contentEditorFormValue(form, 'meta_description') || '填写 Meta Description 后，这里会显示搜索结果摘要。'
  const originElement = form.querySelector('[data-url-origin]')
  const localeElement = form.querySelector('[data-url-locale]')
  if (originElement) originElement.textContent = origin
  if (localeElement) localeElement.textContent = Number(site?.language_count || 0) > 1 ? `/${locale}` : ''
  const urlElement = form.querySelector('[data-search-url]')
  const titleElement = form.querySelector('[data-search-title]')
  const descriptionElement = form.querySelector('[data-search-description]')
  if (urlElement) urlElement.textContent = url
  if (titleElement) titleElement.textContent = `${title} | CZCMS`
  if (descriptionElement) descriptionElement.textContent = description
}

function updateContentPageWordCount(form) {
  const words = contentWordCount(editorPlainText(form?.elements?.body_html?.value))
  const node = form?.querySelector('[data-word-count]')
  if (node) node.textContent = `字数 ${words.toLocaleString('zh-CN')} · 阅读约 ${Math.max(1, Math.ceil(words / 320))} 分钟`
}

function syncVisualEditor(form, source = 'visual') {
  const visual = form?.querySelector('[data-rich-editor]')
  const sourceField = form?.elements?.body_html
  if (!visual || !sourceField) return
  if (source === 'visual') sourceField.value = visual.innerHTML
  else visual.innerHTML = sourceField.value
  updateContentPageWordCount(form)
  updateContentPageChecks(form)
  updateContentPagePreview(form)
  updateContentPageCount(form, 'body_html', '200,000')
}

function saveLocalContentDraft(form) {
  if (!form) return
  if (contentEditorState.draftTimer) window.clearTimeout(contentEditorState.draftTimer)
  contentEditorState.dirty = true
  const state = form.querySelector('[data-draft-state]')
  if (state) {
    state.classList.remove('is-saved')
    state.innerHTML = '<i></i>正在保存本地草稿…'
  }
  contentEditorState.draftTimer = window.setTimeout(() => {
    try {
      const values = Object.fromEntries(new FormData(form).entries())
      values.body_html = form.elements.body_html?.value ?? ''
      values.__checkboxes = Object.fromEntries([...form.querySelectorAll('input[type="checkbox"][name]')].map((field) => [field.name, field.checked]))
      sessionStorage.setItem(editorDraftKey(form), JSON.stringify({ values, savedAt: new Date().toISOString() }))
      if (state) {
        state.classList.add('is-saved')
        state.innerHTML = '<i></i>本地草稿已保存'
      }
    } catch { /* sessionStorage may be unavailable */ }
  }, 700)
}

function restoreLocalContentDraft(form) {
  if (!form || form.dataset.mode !== 'create') return
  try {
    const raw = sessionStorage.getItem(editorDraftKey(form))
    if (!raw) return
    const draft = JSON.parse(raw)
    if (!draft?.values || !window.confirm('检测到未提交的本地草稿，要恢复吗？')) return
    Object.entries(draft.values).forEach(([name, value]) => {
      if (form.elements[name] && typeof value === 'string') form.elements[name].value = value
    })
    Object.entries(draft.values.__checkboxes ?? {}).forEach(([name, checked]) => {
      if (form.elements[name]?.matches?.('input[type="checkbox"]')) form.elements[name].checked = Boolean(checked)
    })
    const coverID = contentEditorFormValue(form, 'cover_media_id')
    const coverSelector = form.querySelector('[data-cover-selector]')
    if (coverID && coverSelector) {
      coverSelector.classList.add('is-selected')
      coverSelector.querySelector('[data-cover-name]').textContent = `媒体 #${coverID}（从草稿恢复）`
      coverSelector.querySelector('[data-cover-details]').textContent = '保存时会再次验证媒体文件'
      coverSelector.querySelector('[data-content-action="media"]').textContent = '更换'
      coverSelector.querySelector('[data-content-action="cover-remove"]').hidden = false
    }
    syncVisualEditor(form, 'source')
    const state = form.querySelector('[data-draft-state]')
    if (state) {
      state.classList.add('is-saved')
      state.innerHTML = '<i></i>已恢复本地草稿'
    }
  } catch { /* ignore malformed local draft */ }
}

function clearLocalContentDraft(form) {
  try { sessionStorage.removeItem(editorDraftKey(form)) } catch { /* storage can be unavailable */ }
}

function focusRichEditor(form) {
  const editor = form?.querySelector('[data-rich-editor]')
  if (!editor) return
  editor.focus()
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function rememberRichSelection(form) {
  const visual = form?.querySelector('[data-rich-editor]')
  const selection = window.getSelection?.()
  if (!visual || !selection || selection.rangeCount < 1) return
  const range = selection.getRangeAt(0)
  if (visual.contains(range.commonAncestorContainer)) contentEditorState.richSelection = range.cloneRange()
}

function restoreRichSelection(form) {
  const visual = form?.querySelector('[data-rich-editor]')
  const saved = contentEditorState.richSelection
  const selection = window.getSelection?.()
  if (!visual || !selection) return false
  if (saved && visual.contains(saved.commonAncestorContainer)) {
    selection.removeAllRanges()
    selection.addRange(saved)
    return true
  }
  focusRichEditor(form)
  return true
}

function editorMediaURL(media) {
  if (media?.url) return String(media.url)
  if (media?.id && media?.sha256) return `/media/${encodeURIComponent(media.id)}/${String(media.sha256).slice(0, 16)}`
  if (media?.id) return `/media/${encodeURIComponent(media.id)}`
  return ''
}

function setEditorMediaState(form, message = '', tone = '') {
  const state = form?.querySelector('[data-media-state]')
  if (!state) return
  state.hidden = !message
  state.className = `editor-media-state${tone ? ` is-${tone}` : ''}`
  state.textContent = message
}

function insertRichHTML(form, html) {
  const source = form?.querySelector('[data-rich-source]')
  const visual = form?.querySelector('[data-rich-editor]')
  if (!source || !visual) return
  if (!source.hidden) {
    const start = source.selectionStart ?? source.value.length
    const end = source.selectionEnd ?? start
    source.setRangeText(html, start, end, 'end')
    source.dispatchEvent(new Event('input', { bubbles: true }))
    return
  }
  restoreRichSelection(form)
  const selection = window.getSelection?.()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (!range || !visual.contains(range.commonAncestorContainer)) {
    focusRichEditor(form)
    return insertRichHTML(form, html)
  }
  const template = document.createElement('template')
  template.innerHTML = html
  range.deleteContents()
  const fragment = template.content
  const last = fragment.lastChild
  range.insertNode(fragment)
  range.setStartAfter(last || range.startContainer)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  syncVisualEditor(form, 'visual')
}

function safeEditorFileName(file, prefix = 'editor-image') {
  const extension = file?.type === 'image/png' ? '.png' : '.jpg'
  const name = String(file?.name || '').split(/[\\/]/).pop()?.replace(/[^\p{L}\p{N}._ ()-]/gu, '').trim()
  if (name && /\.(?:jpe?g|png)$/i.test(name)) return name.slice(0, 180)
  return `${prefix}-${Date.now()}${extension}`
}

async function uploadRichImage(form, file, selection = null) {
  if (!file || (!/^image\/(?:jpeg|png)$/i.test(file.type || '') && !/\.(?:jpe?g|png)$/i.test(file.name || ''))) {
    showToast('正文图片仅支持 JPEG 或 PNG')
    return
  }
  if (file.size > 12 * 1024 * 1024) {
    showToast('正文图片不能超过 12 MB')
    return
  }
  if (selection) contentEditorState.richSelection = selection
  else rememberRichSelection(form)
  const stateMessage = contentEditorState.imageUploading ? '正在继续上传图片…' : '正在上传图片…'
  contentEditorState.imageUploading = true
  setEditorMediaState(form, stateMessage)
  const body = new FormData()
  body.append('file', file, safeEditorFileName(file))
  try {
    const media = await fetchJSON('/api/v1/media/upload', { method: 'POST', body })
    const src = editorMediaURL(media)
    if (!src) throw new APIError('上传成功但未返回可访问的图片地址', 502)
    const alt = String(file.name || '').replace(/\.[^.]+$/, '').trim().slice(0, 200)
    insertRichHTML(form, `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${media.width ? ` width="${Number(media.width)}"` : ''}${media.height ? ` height="${Number(media.height)}"` : ''} loading="lazy">`)
    saveLocalContentDraft(form)
    setEditorMediaState(form, '图片已上传并插入正文', 'success')
    window.setTimeout(() => setEditorMediaState(form), 2400)
  } catch (error) {
    setEditorMediaState(form, error.message || '图片上传失败', 'error')
    showToast(error.message || '图片上传失败')
  } finally {
    contentEditorState.imageUploading = false
  }
}

function sanitizePastedHTML(html) {
  const template = document.createElement('template')
  template.innerHTML = String(html || '')
  template.content.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form,input,button').forEach((node) => node.remove())
  template.content.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      if (name.startsWith('on') || name === 'style' || (['href', 'src'].includes(name) && /^(?:javascript:|vbscript:|data:text\/html)/i.test(value))) node.removeAttribute(attribute.name)
    })
  })
  template.content.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src')?.trim() || ''
    if (/^\/\//.test(src)) image.setAttribute('src', `${location.protocol}${src}`)
    if (src && !/^(?:https?:\/\/|\/|data:image\/(?:jpeg|png);base64,)/i.test(image.getAttribute('src') || '')) image.removeAttribute('src')
    image.removeAttribute('srcset')
  })
  return template.innerHTML
}

function dataURLToFile(dataURL, filename = 'pasted-image.png') {
  const match = String(dataURL).match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/i)
  if (!match) return null
  try {
    const bytes = atob(match[2])
    const buffer = new Uint8Array(bytes.length)
    for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index)
    const extension = match[1].toLowerCase() === 'image/png' ? '.png' : '.jpg'
    const safeName = String(filename).replace(/\.(?:jpe?g|png)$/i, '') + extension
    return new File([buffer], safeName, { type: match[1].toLowerCase() })
  } catch { return null }
}

async function localizePastedImage(form, image, source) {
  const token = `czcms-image-${Date.now()}-${Math.random().toString(36).slice(2)}`
  image.dataset.czcmsImportToken = token
  try {
    let media
    if (/^data:image\/(?:jpeg|png);base64,/i.test(source)) {
      const file = dataURLToFile(source, `pasted-image-${Date.now()}.png`)
      if (!file) throw new APIError('剪贴板图片格式无法读取', 422)
      const body = new FormData()
      body.append('file', file, safeEditorFileName(file, 'pasted-image'))
      media = await fetchJSON('/api/v1/media/upload', { method: 'POST', body })
    } else {
      media = await fetchJSON('/api/v1/media/import', { method: 'POST', body: { url: source } })
    }
    const localURL = editorMediaURL(media)
    if (!localURL) throw new APIError('图片导入成功但未返回可访问地址', 502)
    const current = form.querySelector(`[data-czcms-import-token="${CSS.escape(token)}"]`)
    if (current) {
      current.setAttribute('src', localURL)
      current.removeAttribute('data-czcms-import-token')
      current.setAttribute('loading', 'lazy')
      if (!current.getAttribute('alt')) current.setAttribute('alt', '本地化图片')
    }
    syncVisualEditor(form, 'visual')
    saveLocalContentDraft(form)
    setEditorMediaState(form, '复制内容中的图片已本地化', 'success')
    window.setTimeout(() => setEditorMediaState(form), 2400)
  } catch (error) {
    const current = form.querySelector(`[data-czcms-import-token="${CSS.escape(token)}"]`)
    if (current) {
      current.removeAttribute('data-czcms-import-token')
      current.classList.add('editor-image-import-failed')
      current.setAttribute('alt', '图片本地化失败，请重新上传')
    }
    setEditorMediaState(form, error.message || '图片本地化失败', 'error')
    showToast(error.message || '图片本地化失败')
  }
}

function handleRichPaste(event, form) {
  const clipboard = event.clipboardData
  if (!clipboard) return
  const item = [...(clipboard.items || [])].find((entry) => /^image\/(?:jpeg|png)$/i.test(entry.type || ''))
  if (item) {
    event.preventDefault()
    rememberRichSelection(form)
    const file = item.getAsFile?.()
    if (file) void uploadRichImage(form, file, contentEditorState.richSelection)
    return
  }
  const html = clipboard.getData('text/html')
  if (!html) return
  const cleaned = sanitizePastedHTML(html)
  const template = document.createElement('template')
  template.innerHTML = cleaned
  const images = [...template.content.querySelectorAll('img')]
    .map((image) => ({ image, source: image.getAttribute('src')?.trim() || '' }))
    .filter(({ source }) => /^(?:https?:\/\/|data:image\/(?:jpeg|png);base64,)/i.test(source))
  images.forEach(({ image }, index) => {
    image.dataset.czcmsPasteIndex = String(index)
    image.removeAttribute('src')
    image.setAttribute('alt', image.getAttribute('alt') || '正在本地化图片…')
  })
  event.preventDefault()
  rememberRichSelection(form)
  insertRichHTML(form, template.innerHTML)
  if (images.length) {
    images.forEach(({ source }, index) => {
      const image = form.querySelector(`[data-rich-editor] [data-czcms-paste-index="${index}"]`)
      if (image) {
        image.removeAttribute('data-czcms-paste-index')
        void localizePastedImage(form, image, source)
      }
    })
    setEditorMediaState(form, `正在本地化 ${images.length} 张复制图片…`)
  }
}

function contentCanonicalURL(form) {
  const siteID = Number(contentEditorFormValue(form, 'site_id') || form?.dataset.siteId || 0)
  const site = liveState.sites.find((item) => Number(item.id) === siteID) ?? liveState.sites[0]
  const locale = contentEditorFormValue(form, 'locale') || form?.dataset.locale || ''
  const slug = contentEditorFormValue(form, 'slug').replace(/^\/+|\/+$/g, '')
  return `${siteBaseURL(site).replace(/\/+$/, '')}${sitePublicPath(site, locale, slug)}`
}

function applyLocalSEODefaults(form, overwrite = false) {
  if (!form?.elements?.seo_title) return
  const title = contentEditorFormValue(form, 'title')
  const body = editorPlainText(form.elements.body_html?.value)
  const summary = contentEditorFormValue(form, 'summary')
  const description = (summary || body || title).slice(0, 160).trim()
  const tags = normalizeTags(contentEditorFormValue(form, 'tags'), 20)
  const values = {
    seo_title: title,
    seo_h1: title,
    meta_description: description,
    primary_keyword: tags[0] || title.slice(0, 100),
    secondary_keywords: tags.join(', '),
    canonical_url: contentCanonicalURL(form),
    og_title: title,
    og_description: description,
  }
  Object.entries(values).forEach(([name, value]) => {
    if (form.elements[name] && (overwrite || !contentEditorFormValue(form, name))) form.elements[name].value = value
  })
  if (form.elements.structured_data && (overwrite || !contentEditorFormValue(form, 'structured_data') || contentEditorFormValue(form, 'structured_data') === '{}')) {
    const isSinglePage = contentEditorFormValue(form, 'content_type') === 'page'
    form.elements.structured_data.value = JSON.stringify({ '@context': 'https://schema.org', '@type': isSinglePage ? 'WebPage' : 'Article', ...(isSinglePage ? { name: title } : { headline: title }), description, inLanguage: contentEditorFormValue(form, 'locale') || form.dataset.locale || '' }, null, 2)
  }
  updateContentPageCount(form, 'seo_title', 60)
  updateContentPageCount(form, 'meta_description', 160)
  updateContentPagePreview(form)
  updateContentPageChecks(form)
}

async function extractContentSEO(form, button, { silent = false } = {}) {
  if (!form || !contentEditorFormValue(form, 'title')) {
    form?.elements?.title?.focus()
    showToast('请先填写文章标题')
    return
  }
  syncVisualEditor(form, 'visual')
  const original = button?.innerHTML || ''
  if (button) {
    button.disabled = true
    button.textContent = '正在提取…'
  }
  try {
    const result = await fetchJSON('/api/v1/content/seo-suggestions', {
      method: 'POST',
      body: {
        site_id: Number(contentEditorFormValue(form, 'site_id') || form.dataset.siteId || 0),
        title: contentEditorFormValue(form, 'title'),
        summary: contentEditorFormValue(form, 'summary'),
        body_html: form.elements.body_html?.value || '',
        locale: contentEditorFormValue(form, 'locale') || form.dataset.locale || '',
        tags: normalizeTags(contentEditorFormValue(form, 'tags'), 20),
      },
    })
    const suggestion = result?.suggestions || {}
    const fieldValues = {
      seo_h1: suggestion.h1,
      seo_title: suggestion.title,
      meta_description: suggestion.meta_description,
      primary_keyword: suggestion.primary_keyword,
      secondary_keywords: Array.isArray(suggestion.secondary_keywords) ? suggestion.secondary_keywords.join(', ') : suggestion.secondary_keywords,
      og_title: suggestion.og_title,
      og_description: suggestion.og_description,
      structured_data: suggestion.structured_data ? JSON.stringify(suggestion.structured_data, null, 2) : '',
    }
    Object.entries(fieldValues).forEach(([name, value]) => {
      // Background extraction only fills blanks. Clicking the visible button
      // is an explicit request to apply the newly generated candidate.
      if (form.elements[name] && value != null && (button || !contentEditorFormValue(form, name))) form.elements[name].value = String(value)
    })
    if (!contentEditorFormValue(form, 'canonical_url')) form.elements.canonical_url.value = contentCanonicalURL(form)
    applyLocalSEODefaults(form)
    saveLocalContentDraft(form)
    if (!silent) showToast(result?.message || (result?.ai_available ? 'AI 候选已生成，请人工审核' : '已从文章内容生成 SEO 默认值'))
  } catch (error) {
    applyLocalSEODefaults(form, true)
    saveLocalContentDraft(form)
    if (!silent) showToast(`${error.message || 'AI 提取暂不可用'}；已使用文章内容生成默认值`)
  } finally {
    if (button) {
      button.disabled = false
      button.innerHTML = original
    }
  }
}

function runContentRichCommand(form, command) {
  const visual = form?.querySelector('[data-rich-editor]')
  if (!visual) return
  if (command === 'source') {
    const source = form.querySelector('[data-rich-source]')
    const sourceMode = form.querySelector('[data-rich-command="source"]')
    const isSource = source?.hidden === false
    if (isSource) {
      source.hidden = true
      visual.hidden = false
      syncVisualEditor(form, 'source')
    } else {
      syncVisualEditor(form, 'visual')
      source.hidden = false
      visual.hidden = true
      source.focus()
    }
    sourceMode?.setAttribute('aria-pressed', String(!isSource))
    return
  }
  if (command === 'fullscreen') {
    const editor = form.querySelector('.rich-editor')
    const button = form.querySelector('[data-rich-command="fullscreen"]')
    const full = editor?.classList.toggle('is-fullscreen') ?? false
    button?.setAttribute('aria-pressed', String(full))
    document.body.classList.toggle('editor-fullscreen-open', full)
    return
  }
  if (command === 'undo' || command === 'redo') {
    document.execCommand(command)
    syncVisualEditor(form, 'visual')
    return
  }
  if (command === 'createLink') {
    const href = window.prompt('输入链接地址（支持 https://、http:// 或站内路径）', 'https://')
    if (!href) return
    if (!/^(https?:\/\/|\/)/i.test(href.trim())) { showToast('链接地址需要以 http://、https:// 或 / 开头'); return }
    document.execCommand('createLink', false, href.trim())
  } else if (command === 'insertImage') {
    const input = form.querySelector('[data-rich-image-input]')
    if (!input) return
    rememberRichSelection(form)
    input.value = ''
    input.click()
  } else if (command === 'bold' || command === 'italic' || command === 'underline' || command === 'justifyLeft' || command === 'insertUnorderedList' || command === 'insertOrderedList') {
    document.execCommand(command)
  }
  syncVisualEditor(form, 'visual')
  focusRichEditor(form)
}

function renderContentTags(form) {
  const hidden = form?.elements?.tags
  const list = form?.querySelector('[data-tag-list]')
  if (!hidden || !list) return
  const tags = normalizeTags(hidden.value)
  hidden.value = tags.join(', ')
  list.innerHTML = tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}<button type="button" data-remove-tag="${escapeHtml(tag)}" aria-label="删除标签 ${escapeHtml(tag)}">×</button></span>`).join('')
}

function commitPendingContentTag(form) {
  const entry = form?.querySelector('[data-tag-entry]')
  if (!entry || !entry.value.trim()) return false
  addContentTag(form, entry.value)
  return true
}

function addContentTag(form, value) {
  const hidden = form?.elements?.tags
  const entry = form?.querySelector('[data-tag-entry]')
  if (!hidden || !entry) return
  const tags = normalizeTags(`${hidden.value},${value}`)
  hidden.value = tags.join(', ')
  entry.value = ''
  renderContentTags(form)
  saveLocalContentDraft(form)
}

function bindContentCover(media) {
  const form = $('#content-editor-form', contentEditorView)
  const selector = form?.querySelector('[data-cover-selector]')
  if (!form?.elements?.cover_media_id || !selector || !media?.id) return
  form.elements.cover_media_id.value = String(media.id)
  selector.classList.add('is-selected')
  selector.querySelector('[data-cover-name]').textContent = media.original_name || `媒体 #${media.id}`
  selector.querySelector('[data-cover-details]').textContent = media.width && media.height ? `${media.width} × ${media.height} · 已安全扫描` : '已上传并通过安全扫描'
  selector.querySelector('[data-content-action="media"]').textContent = '更换'
  selector.querySelector('[data-content-action="cover-remove"]').hidden = false
  updateContentPageChecks(form)
  saveLocalContentDraft(form)
}

function clearContentCover() {
  const form = $('#content-editor-form', contentEditorView)
  const selector = form?.querySelector('[data-cover-selector]')
  if (!form?.elements?.cover_media_id || !selector) return
  form.elements.cover_media_id.value = ''
  selector.classList.remove('is-selected')
  selector.querySelector('[data-cover-name]').textContent = '尚未选择封面素材'
  selector.querySelector('[data-cover-details]').textContent = '建议 1200 × 630，仅支持 JPEG / PNG'
  selector.querySelector('[data-content-action="media"]').textContent = '上传'
  selector.querySelector('[data-content-action="cover-remove"]').hidden = true
  updateContentPageChecks(form)
  saveLocalContentDraft(form)
}

function initializeContentEditorPage() {
  const form = $('#content-editor-form', contentEditorView)
  if (!form) return
  syncVisualEditor(form, 'source')
  restoreLocalContentDraft(form)
  renderContentTags(form)
  refreshContentTaxonomySuggestions(form)
  contentEditorState.dirty = false
  form.querySelector('[data-rich-block]')?.addEventListener('change', (event) => {
    focusRichEditor(form)
    document.execCommand('formatBlock', false, event.target.value)
    syncVisualEditor(form, 'visual')
    saveLocalContentDraft(form)
  })
  updateContentPagePreview(form)
  updateContentPageChecks(form)
}

function contentEditorPayload(form, statusOverride = null) {
  commitPendingContentTag(form)
  const source = form.elements.body_html?.value ?? ''
  let structuredData = {}
  if (form.elements.structured_data) {
    try { structuredData = JSON.parse(contentEditorFormValue(form, 'structured_data') || '{}') } catch { throw new APIError('JSON-LD 结构化数据不是有效的 JSON', 422) }
  }
  const scheduledValue = contentEditorFormValue(form, 'scheduled_at')
  let scheduledAt = ''
  if (scheduledValue) {
    const scheduledDate = new Date(scheduledValue)
    if (Number.isNaN(scheduledDate.getTime())) throw new APIError('定时发布时间格式无效，请重新选择时间', 422)
    scheduledAt = scheduledDate.toISOString()
  }
  const mode = form.dataset.mode
  const payload = {
    content_type: contentEditorFormValue(form, 'content_type') || 'article', site_id: Number(contentEditorFormValue(form, 'site_id') || form.dataset.siteId), locale: contentEditorFormValue(form, 'locale') || form.dataset.locale,
    status: statusOverride || contentEditorFormValue(form, 'status') || 'draft', title: contentEditorFormValue(form, 'title'), slug: contentEditorFormValue(form, 'slug'), summary: contentEditorFormValue(form, 'summary'), body_html: source,
    ai_state: form.dataset.aiState === 'pending' ? ((statusOverride || contentEditorFormValue(form, 'status')) === 'published' ? 'reviewed' : 'pending') : (form.dataset.aiState || 'manual'), category: contentEditorFormValue(form, 'category'), tags: normalizeTags(contentEditorFormValue(form, 'tags')), template_key: contentEditorFormValue(form, 'template_key'), cover_media_id: contentEditorFormValue(form, 'cover_media_id') ? Number(contentEditorFormValue(form, 'cover_media_id')) : null, scheduled_at: scheduledAt, page_layout: contentEditorFormValue(form, 'page_layout'), index_policy: contentEditorFormValue(form, 'index_policy'),
  }
  // A new single page starts noindex by default; an editor can explicitly
  // opt an about, service or campaign page into the sitemap via index_policy.
  const defaultRobotsIndex = payload.content_type === 'page' ? false : Boolean(form.elements.robots_index?.checked)
  if (form.elements.seo_title) payload.seo = { h1: contentEditorFormValue(form, 'seo_h1'), title: contentEditorFormValue(form, 'seo_title'), meta_description: contentEditorFormValue(form, 'meta_description'), primary_keyword: contentEditorFormValue(form, 'primary_keyword'), secondary_keywords: normalizeTags(contentEditorFormValue(form, 'secondary_keywords'), 20), canonical_url: contentEditorFormValue(form, 'canonical_url'), robots_index: payload.content_type === 'page' ? (payload.index_policy === 'index' || defaultRobotsIndex) : defaultRobotsIndex, og_title: contentEditorFormValue(form, 'og_title'), og_description: contentEditorFormValue(form, 'og_description'), structured_data: structuredData }
  if (mode === 'edit') { payload.version = Number(form.dataset.version || 0); delete payload.site_id; delete payload.locale }
  return payload
}

async function submitContentEditor(statusOverride = null) {
  const form = $('#content-editor-form', contentEditorView)
  if (!form) return
  commitPendingContentTag(form)
  syncVisualEditor(form, form.querySelector('[data-rich-source]')?.hidden === false ? 'source' : 'visual')
  applyLocalSEODefaults(form)
  if (!form.reportValidity()) return
  const status = statusOverride || contentEditorFormValue(form, 'status') || 'draft'
  const body = editorPlainText(form.elements.body_html?.value)
  const errorBox = $('#content-page-error', contentEditorView)
  const buttons = $$('[data-content-action]', form).filter((button) => ['save', 'review', 'publish'].includes(button.dataset.contentAction))
  const buttonLabels = new Map(buttons.map((button) => [button, button.innerHTML]))
  try {
    const payload = contentEditorPayload(form, statusOverride)
    if (status === 'published' && !body) throw new APIError('发布前必须填写正文；如内容尚未完成，请先保存草稿', 422)
    if (status !== 'draft' && !contentEditorFormValue(form, 'meta_description')) throw new APIError('提交审核或发布前请先填写 Meta Description，便于生成搜索摘要', 422)
    buttons.forEach((button) => { button.disabled = true })
    buttons.find((button) => button.dataset.contentAction === (status === 'published' ? 'publish' : status === 'review' ? 'review' : 'save'))?.replaceChildren(document.createTextNode(status === 'published' ? '正在发布…' : status === 'review' ? '正在提交…' : '正在保存…'))
    errorBox.hidden = true
    const mode = form.dataset.mode
    const path = mode === 'edit' ? `/api/v1/contents/${form.dataset.contentId}/locales/${encodeURIComponent(form.dataset.locale)}?site_id=${form.dataset.siteId}` : mode === 'locale-create' ? `/api/v1/contents/${form.dataset.contentId}/locales` : '/api/v1/contents'
    const saved = await fetchJSON(path, { method: mode === 'edit' ? 'PUT' : 'POST', body: payload })
    clearLocalContentDraft(form)
    contentEditorState.dirty = false
    showToast(status === 'published' ? '内容已发布' : status === 'review' ? '内容已提交审核' : '草稿已保存')
    if (mode === 'create' && payload.content_type === 'page') {
      showToast(`单页面“${payload.title}”已创建，已显示在单页面列表`)
      location.hash = '#/admin/content?section=pages'
      return
    }
    if (saved?.content_id && saved?.site_id && saved?.locale) {
      const savedType = saved.content_type || payload.content_type
      const targetHash = `#/admin/content?section=${savedType === 'page' ? 'pages' : 'articles'}&editor=edit&content_id=${encodeURIComponent(saved.content_id)}&site_id=${encodeURIComponent(saved.site_id)}&locale=${encodeURIComponent(saved.locale)}`
      contentEditorState.item = saved
      if (location.hash === targetHash) {
        contentEditorState.key = ''
        void renderContentEditorRoute('edit')
      } else {
        location.hash = targetHash
      }
    } else {
      location.hash = '#/admin/content'
    }
  } catch (error) {
    if (error.status === 409) errorBox.textContent = '这条内容已被其他用户修改，请返回列表并重新打开后再保存。'
    else errorBox.textContent = error.message || '保存失败，请稍后重试'
    errorBox.hidden = false
    errorBox.focus()
  } finally {
    buttons.forEach((button) => {
      button.disabled = false
      button.innerHTML = buttonLabels.get(button)
    })
  }
}

function localizationTermList(value) {
  return String(value || '').split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 100)
}

function localizationResultMarkup(result, contentID) {
  const statusLabel = result.status === 'created' ? '已创建 AI 草稿' : result.status === 'skipped' ? '已安全跳过' : '执行失败'
  const editPath = result.status === 'created' && result.site_id && result.locale
    ? `#/admin/content?editor=edit&content_id=${encodeURIComponent(contentID)}&site_id=${encodeURIComponent(result.site_id)}&locale=${encodeURIComponent(result.locale)}` : ''
  return `<article class="localization-result is-${escapeHtml(result.status)}">
    <span class="localization-result-icon">${icon(result.status === 'created' ? 'check' : result.status === 'skipped' ? 'lock' : 'alert')}</span>
    <span><strong>${escapeHtml(result.language_name || result.locale)} · ${escapeHtml(result.locale)}</strong><small>${escapeHtml(result.site_name || '')}</small></span>
    <span class="localization-result-state"><b>${escapeHtml(statusLabel)}</b><small>${escapeHtml(result.message || '')}</small></span>
    ${editPath ? `<a class="button button-secondary button-compact" href="${escapeHtml(editPath)}">打开审核</a>` : ''}
  </article>`
}

function showLocalizationError(message) {
  const error = $('#localization-dialog-error')
  error.textContent = message
  error.hidden = false
  error.focus()
}

async function openContentLocalizationDialog() {
  const form = $('#content-editor-form', contentEditorView)
  const item = contentEditorState.item
  if (!form || !item?.content_id) {
    showToast('请先保存并发布英语源内容，再同步其他语言')
    return
  }
  if (contentEditorState.dirty) {
    showToast('当前有未保存修改，请先保存或发布英语内容')
    return
  }
  if (!isEnglishLocaleCode(item.locale)) {
    showToast('默认只允许从英语源内容发起 AI 本土化')
    return
  }
  if (item.status !== 'published') {
    showToast('请先发布英语源内容，再同步其他语言')
    return
  }
  const body = $('#localization-dialog-body')
  const startButton = $('#start-localization-button')
  $('#localization-dialog-error').hidden = true
  startButton.hidden = false
  startButton.disabled = true
  startButton.textContent = '读取目标语言…'
  body.innerHTML = '<div class="localization-loading" role="status"><div class="skeleton-line"></div><div class="skeleton-line"></div><span>正在检查目标站点、模板和已有语言版本…</span></div>'
  localizationForm.dataset.contentId = String(item.content_id)
  localizationForm.dataset.sourceSiteId = String(item.site_id)
  localizationForm.dataset.sourceLocale = item.locale
  if (!localizationDialog.open) localizationDialog.showModal()
  try {
    const payload = await fetchJSON(`/api/v1/contents/${encodeURIComponent(item.content_id)}/localization-options?source_site_id=${encodeURIComponent(item.site_id)}&source_locale=${encodeURIComponent(item.locale)}`)
    const targets = payload.targets ?? []
    const selectable = targets.filter((target) => target.accessible && target.site_online && target.template_online && !target.existing)
    body.innerHTML = `<section class="localization-source-card" aria-label="英语源内容"><span class="localization-source-icon">EN</span><span><small>已发布英语源内容</small><strong>${escapeHtml(payload.source?.title || item.title)}</strong><em>${escapeHtml(payload.source?.site_name || item.site_name)} · ${escapeHtml(payload.source?.locale || item.locale)}</em></span><span class="badge badge-green">事实源</span></section>
      <ol class="localization-flow" aria-label="本土化流程"><li class="is-complete"><b>1</b><span><strong>英语源内容</strong><small>已发布</small></span></li><li><b>2</b><span><strong>AI 语境重写</strong><small>正文 + SEO</small></span></li><li><b>3</b><span><strong>人工审核</strong><small>不会自动发布</small></span></li><li><b>4</b><span><strong>独立发布</strong><small>按国家站上线</small></span></li></ol>
      <section class="localization-target-section"><header><div><h3>同步到已上线模板的国家站</h3><p>系统按当前配置自动识别：站点运行中、语言已启用、模板已绑定且能够安全渲染时，默认加入本次同步。</p></div><button class="text-button" type="button" data-select-localization-targets ${selectable.length ? '' : 'disabled'}>取消选择全部</button></header><div class="localization-target-list">${targets.length ? targets.map((target) => {
		const disabled = !target.accessible || !target.site_online || !target.template_online || target.existing
		const status = target.existing ? `已存在 · ${contentStatus[target.existing_status] || target.existing_status}` : !target.site_online ? '站点未上线' : !target.template_bound ? '未绑定模板' : !target.template_online ? '模板不可上线' : !target.accessible ? '无权限' : '模板已上线'
        return `<label class="localization-target ${disabled ? 'is-disabled' : ''}"><input type="checkbox" name="localization_target" value="${escapeHtml(`${target.site_id}|${target.locale}`)}" ${disabled ? 'disabled' : 'checked'}><span class="locale-mark">${escapeHtml(String(target.locale).split('-')[0].toUpperCase())}</span><span><strong>${escapeHtml(target.language_name)} <em>${escapeHtml(target.native_name)}</em></strong><small>${escapeHtml(target.site_name)} · localhost:${escapeHtml(target.local_port)} · ${escapeHtml(target.market_code)}</small></span><span class="target-availability">${escapeHtml(status)}</span>${target.reason ? `<span class="target-reason">${escapeHtml(target.reason)}</span>` : ''}</label>`
      }).join('') : '<div class="localization-empty">没有可用的非英语目标站，请先让分站进入运行状态、启用语言并绑定可渲染模板。</div>'}</div></section>
      <section class="localization-controls"><header><h3>事实与术语保护</h3><p>品牌、产品型号、服务名等可锁定原样；禁用词会在保存前再次检查。</p></header><div class="localization-control-grid"><label class="form-field"><span>必须保留的术语</span><textarea name="locked_terms" maxlength="12000" placeholder="例如：Global Route, DDP\n使用逗号或换行分隔"></textarea></label><label class="form-field"><span>禁止出现的词</span><textarea name="forbidden_terms" maxlength="12000" placeholder="例如：保证到达, 最低价格\n使用逗号或换行分隔"></textarea></label></div></section>
      <aside class="localization-safety-note">${icon('lock')}<span><strong>发布安全门</strong><small>AI 版本统一保存为“草稿 / AI 待审”，不会覆盖已有版本，也不会自动上线。人工核对当地语法、关键词和事实后，再提交审核或发布。关键词只标记为 AI 语境建议；没有真实工具数据时不显示搜索量、排名或竞争度。</small></span></aside>`
    startButton.textContent = '同步到已上线分站'
    startButton.disabled = !payload.eligible || selectable.length === 0
    if (!payload.eligible && payload.reason) showLocalizationError(payload.reason)
  } catch (error) {
    body.innerHTML = '<div class="localization-empty">目标语言配置读取失败，请关闭后重试。</div>'
    startButton.textContent = '同步到已上线分站'
    startButton.disabled = true
    showLocalizationError(error.message || '读取目标语言配置失败')
  }
}

async function startContentLocalization() {
  const selected = $$('input[name="localization_target"]:checked', localizationForm)
  if (!selected.length) {
    showLocalizationError('请至少选择一个可用的目标语言')
    return
  }
  const button = $('#start-localization-button')
  const contentID = Number(localizationForm.dataset.contentId)
  const targets = selected.map((input) => {
    const [siteID, locale] = input.value.split('|')
    return { site_id: Number(siteID), locale }
  })
  button.disabled = true
  button.textContent = `AI 正在处理 0 / ${targets.length}…`
  $('#localization-dialog-error').hidden = true
  $$('.localization-target input', localizationForm).forEach((input) => { input.disabled = true })
  try {
    const result = await fetchJSON(`/api/v1/contents/${encodeURIComponent(contentID)}/localize`, {
      method: 'POST',
      body: {
        source_site_id: Number(localizationForm.dataset.sourceSiteId), source_locale: localizationForm.dataset.sourceLocale,
        targets, scope: 'full', overwrite: false,
        locked_terms: localizationTermList(localizationForm.elements.locked_terms?.value), forbidden_terms: localizationTermList(localizationForm.elements.forbidden_terms?.value),
      },
    })
    const created = Number(result.created_count || 0)
    const failed = Number(result.failed_count || 0)
    $('#localization-dialog-body').innerHTML = `<section class="localization-complete"><span class="localization-complete-icon">${icon(failed ? 'alert' : 'check')}</span><div><small>任务 #${escapeHtml(result.id)}</small><h3>${failed ? '本土化任务已完成，部分目标需要重试' : '本土化版本已生成，等待人工审核'}</h3><p>已创建 ${created} 个，跳过 ${Number(result.skipped_count || 0)} 个，失败 ${failed} 个。英语源内容没有被修改。</p></div></section><div class="localization-result-list">${(result.results ?? []).map((item) => localizationResultMarkup(item, result.content_id || contentID)).join('')}</div><aside class="localization-safety-note">${icon('clipboard')}<span><strong>下一步</strong><small>逐个打开目标版本，核对当地语法、关键词意图、事实、图片 Alt 和内链文案；确认后再独立发布。</small></span></aside>`
    button.hidden = true
    liveState.loaded.delete('localization')
    liveState.loaded.delete('content')
    showToast(`AI 本土化完成：创建 ${created} 个 AI 草稿`)
  } catch (error) {
    button.disabled = false
    button.textContent = '重试 AI 本土化'
    $$('.localization-target input', localizationForm).forEach((input) => {
      const target = input.closest('.localization-target')
      input.disabled = target?.classList.contains('is-disabled') || false
    })
    showLocalizationError(error.message || 'AI 本土化失败，请稍后重试')
  }
}

function openLocalizationJobDetails(job) {
  if (!job) return
  $('#localization-dialog-error').hidden = true
  $('#start-localization-button').hidden = true
  $('#localization-dialog-title').textContent = `本土化任务 #${job.id}`
  $('#localization-dialog-description').textContent = '查看实际执行结果；目标版本仍需人工审核后独立发布。'
  $('#localization-dialog-body').innerHTML = `<section class="localization-source-card"><span class="localization-source-icon">EN</span><span><small>${escapeHtml(job.source_site_name)} · ${escapeHtml(job.source_locale)}</small><strong>${escapeHtml(job.source_title)}</strong><em>${escapeHtml(job.requested_by || '系统')} · ${escapeHtml(formatDate(job.created_at))}</em></span><span class="badge ${statusClass(localizationStatus[job.status] || job.status)}">${escapeHtml(localizationStatus[job.status] || job.status)}</span></section><div class="localization-result-list">${(job.results ?? []).map((item) => localizationResultMarkup(item, job.content_id)).join('') || '<div class="localization-empty">此任务还没有目标结果。</div>'}</div>`
  if (!localizationDialog.open) localizationDialog.showModal()
}

async function openEntityDialog(entityName = '内容', item = null) {
  try {
    await ensureCoreData()
    const route = entityName === '站点' ? 'sites' : entityName === '语言' ? 'languages' : 'content'
    entityForm.reset()
    entityForm.dataset.route = route
    entityForm.dataset.mode = item ? 'edit' : 'create'
    entityForm.dataset.id = item?.id ?? ''
    entityForm.dataset.contentId = item?.content_id ?? ''
    entityForm.dataset.siteId = item?.site_id ?? ''
    entityForm.dataset.locale = item?.locale ?? ''
    entityForm.dataset.version = item?.version ?? ''
    entityForm.dataset.contentVersion = item?.content_version ?? ''
    entityDialog.classList.toggle('dialog-wide', route === 'sites')
    entityDialog.classList.toggle('dialog-site-editor', route === 'sites' && Boolean(item))
    entityDialog.classList.toggle('dialog-editor', route === 'content')
    $('#entity-dialog-title').textContent = `${item ? '编辑' : '新建'}${entityName}`
    $('#entity-dialog-description').textContent = route === 'content' ? '每个站点和 Locale 独立保存正文、关键词与 SEO。' : route === 'sites' && item ? '分区管理站点资料、模板效果与访问地址；模板绑定单独保存后立即生效。' : '保存时会检查权限、字段格式和并发版本。'
    $('#entity-dialog-error').hidden = true
    const domains = route === 'sites' && item ? await loadSiteDomains(item.id, true) : []
    const bindings = route === 'sites' && item ? await loadSiteLanguages(item.id, true) : []
    const templates = route === 'sites' && can('templates.manage') ? await loadTemplates() : []
    $('#entity-fields').innerHTML = route === 'sites' ? siteFields(item, domains, bindings, templates, can('templates.manage') && can('languages.manage')) : route === 'languages' ? languageFields(item) : await contentFields(item)
    if (route === 'content') updateEditorCharCount($('#entity-fields [data-richtext]'))
    const deleteButton = $('#delete-entity-button')
    deleteButton.hidden = !item
    deleteButton.textContent = route === 'content' ? '移到回收站' : '停用'
    $('#add-locale-button').hidden = !(route === 'content' && item)
    $('#save-entity-button').textContent = item ? '保存修改' : route === 'content' ? '保存草稿' : '创建'
    $('#save-entity-button').hidden = false
    $('#content-review-button').hidden = route !== 'content'
    $('#content-publish-button').hidden = route !== 'content'
    if (!entityDialog.open) entityDialog.showModal()
    window.setTimeout(() => $('#entity-fields input, #entity-fields select, #entity-fields textarea')?.focus(), 0)
  } catch (error) {
    showToast(error.message || '无法打开编辑表单')
  }
}

async function openTemplateDialog() {
  entityForm.reset()
  entityForm.dataset.route = 'templates'
  entityForm.dataset.mode = 'create'
  entityForm.dataset.id = ''
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = '安装模板'
  $('#entity-dialog-description').textContent = '上传 ZIP 模板包；服务端会校验 theme.json、路径、HTML/CSS 和压缩炸弹风险。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="form-grid"><label class="form-field form-field-wide"><span>模板 ZIP 包</span><input type="file" name="template_file" accept=".zip,application/zip" required><small>最大 50 MB。模板不得包含可执行 JavaScript、活动 SVG 或符号链接。</small></label><div class="form-hint form-field-wide"><strong>安装流程</strong><span>上传 → 安全验证 → 进入候选版本 → 在站点语言中绑定 → 创建发布。</span></div></div>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').textContent = '上传并验证'
  $('#save-entity-button').hidden = false
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields input')?.focus(), 0)
}

function contactFormFieldChoices(selected = [], submitLabel = '提交咨询') {
  const fields = selected.length ? selected : contactFormFieldPresets.filter((field) => ['name', 'email', 'message', 'consent'].includes(field.key))
  const typeLabels = { text: '文本框', email: '邮箱框', tel: '电话框', country: '国家 / 地区', select: '下拉框', textarea: '多行文本', checkbox: '复选框' }
  const items = fields.map((raw, index) => {
    const field = { key: raw.field_key ?? raw.key ?? `field-${index + 1}`, type: raw.field_type ?? raw.type ?? 'text', label: raw.label ?? '文本框', placeholder: raw.placeholder ?? '', help: raw.help_text ?? raw.help ?? '', options: raw.options ?? [], required: Boolean(raw.required) }
    const optionText = Array.isArray(field.options) ? field.options.join('\n') : String(field.options || '')
    return `<article class="contact-builder-item" data-builder-item data-field-key="${escapeHtml(field.key)}">
      <header class="contact-builder-item-header"><span class="contact-builder-drag" draggable="true" role="img" aria-label="拖动字段调整顺序">${icon('drag', 'icon icon-sm')}</span><div><strong data-builder-summary>${escapeHtml(field.label)}</strong><small>${escapeHtml(typeLabels[field.type] || field.type)}${field.required ? ' · 必填' : ''}</small></div><div class="contact-builder-item-actions"><button class="text-button" type="button" data-builder-move-up aria-label="上移字段">上移</button><button class="text-button" type="button" data-builder-move-down aria-label="下移字段">下移</button><button class="text-button danger-text" type="button" data-builder-remove>删除</button></div></header>
      <div class="contact-builder-item-fields">
        <label class="form-field"><span>字段标识</span><input data-builder-prop="key" value="${escapeHtml(field.key)}" maxlength="80" placeholder="例如：company"></label>
        <label class="form-field"><span>前台显示文字</span><input data-builder-prop="label" value="${escapeHtml(field.label)}" maxlength="100" required placeholder="例如：公司名称"></label>
        <label class="form-field"><span>字段类型</span><select data-builder-prop="type">${Object.entries(typeLabels).map(([value, label]) => `<option value="${value}" ${field.type === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <label class="form-field"><span>占位提示</span><input data-builder-prop="placeholder" value="${escapeHtml(field.placeholder)}" maxlength="180" placeholder="输入框中的提示文字"></label>
        <label class="form-field form-field-wide"><span>帮助说明</span><input data-builder-prop="help" value="${escapeHtml(field.help)}" maxlength="180" placeholder="字段下方的补充说明（可选）"></label>
        <label class="form-field form-field-wide builder-options-field" ${field.type === 'select' ? '' : 'hidden'}><span>下拉选项</span><textarea data-builder-prop="options" rows="3" maxlength="1000" placeholder="每行一个选项，仅下拉框使用">${escapeHtml(optionText)}</textarea><small>每行一个选项；字段类型为下拉框时生效。</small></label>
        <label class="builder-required"><input type="checkbox" data-builder-prop="required" ${field.required ? 'checked' : ''}><span>提交前必须填写</span></label>
      </div>
    </article>`
  }).join('')
  return `<div class="contact-form-builder" data-contact-builder>
    <aside class="contact-builder-palette" aria-label="可拖入的字段"><div class="contact-builder-palette-heading"><strong>字段库</strong><small>拖入画布，或点击添加</small></div><div class="contact-builder-palette-list">${contactFormFieldPresets.map((field) => `<button class="contact-builder-palette-item" type="button" draggable="true" data-builder-add="${escapeHtml(field.type)}" data-builder-label="${escapeHtml(field.label)}"><span class="contact-builder-palette-icon">${icon('plus', 'icon icon-sm')}</span><span><strong>${escapeHtml(typeLabels[field.type] || field.label)}</strong><small>${escapeHtml(field.label)}</small></span></button>`).join('')}</div><div class="contact-builder-tip">姓名、邮箱和需求说明建议保留；系统会在保存时检查邮箱字段。</div></aside>
    <section class="contact-builder-workspace" aria-label="表单画布"><header class="contact-builder-workspace-heading"><div><strong>表单画布</strong><small>拖动字段调整顺序，点击字段后编辑显示文字和提示。</small></div><span class="contact-builder-badge">${fields.length} 个字段</span></header><div class="contact-builder-canvas" data-builder-canvas>${items || '<div class="contact-builder-empty" data-builder-empty>从左侧拖入一个字段，开始搭建联系表单</div>'}<div class="contact-builder-submit" data-builder-submit><span><strong>提交按钮</strong><small>固定放在表单底部，访客完成填写后提交询盘</small></span><button type="button" disabled>${escapeHtml(submitLabel || '提交咨询')}</button></div></div></section>
  </div>`
}

async function openContactFormDialog(page = contentEditorState.item, existing = null) {
  if (!page?.id || page.content_type !== 'page' || page.page_layout !== 'contact') {
    showToast('请先把页面保存为“联系页面”，再创建询盘表单')
    return
  }
  entityForm.reset()
  entityForm.dataset.route = 'forms'
  entityForm.dataset.mode = existing ? 'edit' : 'create'
  entityForm.dataset.id = existing?.id ?? ''
  entityForm.dataset.version = existing?.version ?? ''
  entityForm.dataset.pageId = String(page.id)
  entityForm.dataset.siteId = String(page.site_id)
  entityForm.dataset.locale = page.locale
  entityDialog.classList.remove('dialog-editor', 'dialog-site-editor')
  entityDialog.classList.add('dialog-wide', 'dialog-form-builder')
  $('#entity-dialog-title').textContent = existing ? '编辑联系表单' : '新建联系表单'
  $('#entity-dialog-description').textContent = existing ? `修改后会立即应用到 ${page.site_name || '当前站点'} / ${page.locale} 的已绑定联系页面。` : `将保存到 ${page.site_name || '当前站点'} / ${page.locale}，并在创建后自动绑定到当前联系页面。`
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="form-grid contact-form-dialog-fields">
    ${field('表单名称', 'name', existing?.name ?? `${page.title} · 询盘表单`, { required: true, maxlength: 100, wide: true, help: '仅后台识别使用，不直接显示给访客。' })}
    ${field('表单标识', 'form_key', existing?.form_key ?? `${contentEditorSlug(page.slug || page.title)}-enquiry`, { required: true, maxlength: 80, wide: true, disabled: Boolean(existing), help: existing ? '已创建的表单标识不可修改，避免提交地址失效。' : '用于安全提交地址；只使用小写字母、数字和短横线。' })}
    ${field('提交按钮文字', 'submit_label', existing?.submit_label ?? '提交咨询', { required: true, maxlength: 60, help: '例如：提交咨询、获取报价、Send request。' })}
    ${field('提交成功提示', 'success_message', existing?.success_message ?? '感谢您的咨询，我们会尽快回复。', { required: true, textarea: true, maxlength: 300, wide: true, help: '前台访客提交成功后显示。' })}
    <fieldset class="form-section form-field-wide contact-form-builder-section"><legend>可视化表单搭建</legend><p>从左侧字段库拖入或点击添加；在中间画布中修改文字、提示、必填与下拉选项。请保留邮箱或电话框，便于处理询盘。</p>${contactFormFieldChoices(existing?.fields ?? [], existing?.submit_label ?? '提交咨询')}</fieldset>
    <div class="form-hint form-field-wide"><strong>安全边界</strong><span>发布时会进行 CSRF、来源校验、蜜罐、限流、重复提交与服务端字段校验；询盘仅可由有当前站点/语言权限的账号查看。</span></div>
  </div>`
  $$('[data-builder-item]', entityForm).forEach((item) => { updateContactBuilderSummary(item); updateContactBuilderOptions(item) })
  updateContactBuilderSubmitLabel()
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').textContent = existing ? '保存表单' : '创建并绑定'
  $('#save-entity-button').hidden = false
  if (!entityDialog.open) entityDialog.showModal()
  // Put focus on the field palette so the drag affordance is immediately
  // visible even when the builder contains many expanded field settings.
  window.setTimeout(() => $('[data-builder-add]', entityForm)?.focus(), 0)
}

function contactFormPayload() {
  const items = $$('[data-builder-item]', entityForm)
  if (!items.length) throw new APIError('请至少拖入一个表单字段', 422)
  const fields = items.map((item, sortOrder) => {
    const value = (prop) => item.querySelector(`[data-builder-prop="${prop}"]`)
    let key = String(value('key')?.value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
    if (!key) key = `field-${sortOrder + 1}`
    const type = String(value('type')?.value || 'text').trim().toLowerCase()
    const options = type === 'select' ? String(value('options')?.value || '').split(/[\n,，]+/).map((entry) => entry.trim()).filter(Boolean).slice(0, 20) : []
    return { field_key: key, field_type: type, label: String(value('label')?.value || '').trim(), placeholder: String(value('placeholder')?.value || '').trim(), help_text: String(value('help')?.value || '').trim(), options, required: Boolean(value('required')?.checked), sort_order: sortOrder }
  })
  if (fields.some((field) => !field.label)) throw new APIError('请为每个字段填写前台显示文字', 422)
  if (new Set(fields.map((field) => field.field_key)).size !== fields.length) throw new APIError('字段标识不能重复，请修改后再保存', 422)
  if (fields.some((field) => field.field_type === 'select' && !field.options.length)) throw new APIError('下拉框至少需要填写一个选项', 422)
  if (!fields.some((field) => field.field_type === 'email' || field.field_type === 'tel')) throw new APIError('联系表单至少需要邮箱框或电话框，便于处理询盘', 422)
  return { site_id: Number(entityForm.dataset.siteId || 0), locale: entityForm.dataset.locale || '', form_key: formValue(entityForm, 'form_key'), name: formValue(entityForm, 'name'), status: 'active', submit_label: formValue(entityForm, 'submit_label'), success_message: formValue(entityForm, 'success_message'), notify_enabled: true, version: Number(entityForm.dataset.version || 0), fields }
}

function contactBuilderItemMarkup(type = 'text', label = '') {
  const labels = { text: '文本框', email: '邮箱', tel: '联系电话', country: '国家 / 地区', select: '下拉框', textarea: '多行文本', checkbox: '同意复选框' }
  const count = $$('[data-builder-item]', entityForm).length + 1
  const key = `field-${type}-${count}`
  const preset = contactFormFieldPresets.find((field) => field.type === type) ?? { label: labels[type] || '文本框', placeholder: '', options: [], required: false }
  const defaultLabel = label || preset.label || labels[type] || '文本框'
  const optionText = Array.isArray(preset.options) ? preset.options.join('\n') : ''
  return `<article class="contact-builder-item" data-builder-item data-field-key="${escapeHtml(key)}">
    <header class="contact-builder-item-header"><span class="contact-builder-drag" draggable="true" role="img" aria-label="拖动字段调整顺序">${icon('drag', 'icon icon-sm')}</span><div><strong data-builder-summary>${escapeHtml(defaultLabel)}</strong><small>${escapeHtml(labels[type] || type)}${preset.required ? ' · 必填' : ''}</small></div><div class="contact-builder-item-actions"><button class="text-button" type="button" data-builder-move-up aria-label="上移字段">上移</button><button class="text-button" type="button" data-builder-move-down aria-label="下移字段">下移</button><button class="text-button danger-text" type="button" data-builder-remove>删除</button></div></header>
    <div class="contact-builder-item-fields"><label class="form-field"><span>字段标识</span><input data-builder-prop="key" value="${escapeHtml(key)}" maxlength="80" placeholder="例如：company"></label><label class="form-field"><span>前台显示文字</span><input data-builder-prop="label" value="${escapeHtml(defaultLabel)}" maxlength="100" required placeholder="例如：公司名称"></label><label class="form-field"><span>字段类型</span><select data-builder-prop="type">${Object.entries(labels).map(([value, text]) => `<option value="${value}" ${type === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label><label class="form-field"><span>占位提示</span><input data-builder-prop="placeholder" value="${escapeHtml(preset.placeholder || '')}" maxlength="180" placeholder="输入框中的提示文字"></label><label class="form-field form-field-wide"><span>帮助说明</span><input data-builder-prop="help" maxlength="180" placeholder="字段下方的补充说明（可选）"></label><label class="form-field form-field-wide builder-options-field" ${type === 'select' ? '' : 'hidden'}><span>下拉选项</span><textarea data-builder-prop="options" rows="3" maxlength="1000" placeholder="每行一个选项，仅下拉框使用">${escapeHtml(optionText)}</textarea><small>每行一个选项；字段类型为下拉框时生效。</small></label><label class="builder-required"><input type="checkbox" data-builder-prop="required" ${preset.required ? 'checked' : ''}><span>提交前必须填写</span></label></div>
  </article>`
}

function updateContactBuilderEmpty() {
  const canvas = $('[data-builder-canvas]', entityForm)
  if (!canvas) return
  const hasItems = Boolean(canvas.querySelector('[data-builder-item]'))
  const empty = $('[data-builder-empty]', canvas)
  if (empty) empty.hidden = hasItems
  const badge = $('[data-contact-builder] .contact-builder-badge', entityForm)
  if (badge) badge.textContent = `${canvas.querySelectorAll('[data-builder-item]').length} 个字段`
}

function addContactBuilderItem(type, before = null, label = '') {
  const canvas = $('[data-builder-canvas]', entityForm)
  if (!canvas) return
  const submit = $('[data-builder-submit]', canvas)
  const markup = contactBuilderItemMarkup(type, label)
  if (before) before.insertAdjacentHTML('beforebegin', markup)
  else if (submit) submit.insertAdjacentHTML('beforebegin', markup)
  else canvas.insertAdjacentHTML('beforeend', markup)
  updateContactBuilderEmpty()
  const added = before?.previousElementSibling?.matches('[data-builder-item]') ? before.previousElementSibling : submit?.previousElementSibling?.matches('[data-builder-item]') ? submit.previousElementSibling : canvas.querySelector('[data-builder-item]:last-of-type')
  if (added) { updateContactBuilderSummary(added); updateContactBuilderOptions(added) }
  added?.querySelector('[data-builder-prop="label"]')?.focus()
}

function updateContactBuilderSummary(item) {
  const label = item.querySelector('[data-builder-prop="label"]')?.value?.trim() || '未命名字段'
  const type = item.querySelector('[data-builder-prop="type"]')?.value || 'text'
  const required = item.querySelector('[data-builder-prop="required"]')?.checked
  const typeLabels = { text: '文本框', email: '邮箱框', tel: '电话框', country: '国家 / 地区', select: '下拉框', textarea: '多行文本', checkbox: '复选框' }
  const summary = item.querySelector('[data-builder-summary]')
  const meta = summary?.nextElementSibling
  if (summary) summary.textContent = label
  if (meta) meta.textContent = `${typeLabels[type] || type}${required ? ' · 必填' : ''}`
}

function updateContactBuilderOptions(item) {
  const type = item.querySelector('[data-builder-prop="type"]')?.value || 'text'
  const options = item.querySelector('.builder-options-field')
  if (options) options.hidden = type !== 'select'
}

function updateContactBuilderSubmitLabel() {
  const preview = $('[data-builder-submit] button', entityForm)
  const label = formValue(entityForm, 'submit_label').trim() || '提交咨询'
  if (preview) preview.textContent = label
}

async function bindContactFormToPage(pageID, formID, button = null) {
  if (!pageID || !formID) throw new APIError('请选择要绑定的表单', 422)
  const original = button?.innerHTML
  if (button) { button.disabled = true; button.textContent = '绑定中…' }
  try {
    await fetchJSON(`/api/v1/content-locales/${encodeURIComponent(pageID)}/form`, { method: 'PUT', body: { form_id: Number(formID) } })
    contentEditorState.key = ''
    await renderContentEditorRoute('edit')
    showToast('联系表单已绑定到当前页面')
  } finally {
    if (button?.isConnected) { button.disabled = false; button.innerHTML = original }
  }
}

async function openContactFormSubmissions(page = contentEditorState.item, formID = 0) {
  if (!page?.site_id || !page?.locale || !formID) { showToast('尚未绑定可查看的联系表单'); return }
  const payload = await fetchJSON(`/api/v1/forms/submissions?site_id=${encodeURIComponent(page.site_id)}&locale=${encodeURIComponent(page.locale)}&limit=100`)
  const submissions = (payload.submissions ?? []).filter((item) => Number(item.form_id) === Number(formID))
  entityForm.reset()
  entityForm.dataset.route = 'form-submissions'
  entityDialog.classList.add('dialog-wide')
  entityDialog.classList.remove('dialog-editor', 'dialog-site-editor')
  $('#entity-dialog-title').textContent = '联系表单询盘'
  $('#entity-dialog-description').textContent = `${page.title} · ${submissions.length} 条询盘。状态更新会写入审计日志。`
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = submissions.length ? `<div class="table-scroll form-submission-table-wrap"><table class="module-table form-submission-table"><thead><tr><th>提交时间</th><th>访客信息</th><th>需求说明</th><th>状态</th></tr></thead><tbody>${submissions.map((submission) => { const values = submission.values ?? {}; const contact = [values.name, values.email, values.phone, values.country].filter(Boolean).join(' · ') || '—'; return `<tr data-form-submission-id="${escapeHtml(submission.id)}"><td>${escapeHtml(formatDate(submission.created_at))}</td><td>${escapeHtml(contact)}</td><td>${escapeHtml(values.message || values.service || '—')}</td><td><label class="visually-hidden" for="submission-status-${escapeHtml(submission.id)}">更新询盘状态</label><select id="submission-status-${escapeHtml(submission.id)}" data-form-submission-status><option value="new" ${submission.status === 'new' ? 'selected' : ''}>新询盘</option><option value="processing" ${submission.status === 'processing' ? 'selected' : ''}>处理中</option><option value="contacted" ${submission.status === 'contacted' ? 'selected' : ''}>已联系</option><option value="invalid" ${submission.status === 'invalid' ? 'selected' : ''}>无效</option><option value="closed" ${submission.status === 'closed' ? 'selected' : ''}>已关闭</option></select></td></tr>` }).join('')}</tbody></table></div>` : '<div class="empty-state"><strong>暂无询盘</strong><p>访客在已发布的联系页面提交后，内容会加密保存并显示在这里。</p></div>'
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = true
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields [data-form-submission-status]')?.focus(), 0)
}

async function openRedirectDialog(item = null) {
  await ensureCoreData()
  const siteID = (item?.site_id ?? currentSiteID()) || liveState.sites[0]?.id
  const bindings = siteID ? await loadSiteLanguages(siteID) : []
  const locales = bindings.filter((binding) => binding.enabled || binding.locale === item?.locale).map((binding) => ({ value: binding.locale, label: `${binding.language_name} / ${binding.locale}` }))
  entityForm.reset()
  entityForm.dataset.route = 'urls'
  entityForm.dataset.mode = item ? 'edit' : 'create'
  entityForm.dataset.id = item?.id ?? ''
  entityForm.dataset.version = item?.version ?? ''
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = `${item ? '编辑' : '新建'} URL 重定向`
  $('#entity-dialog-description').textContent = '支持站内路径和 HTTP/HTTPS 绝对地址；来源路径必须唯一且安全。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="form-grid">${selectField('站点', 'site_id', liveState.sites.map((site) => ({ value: site.id, label: site.name })), siteID, { required: true })}${selectField('语言 / Locale', 'locale', locales, item?.locale ?? locales[0]?.value ?? '', { required: true })}${field('来源路径', 'source_path', item?.source_path, { required: true, maxlength: 2048, placeholder: '/de/old-service.html', wide: true, help: '可省略开头的 /，保存时会自动补齐。' })}${selectField('状态码', 'status_code', [{ value: 301, label: '301 · 永久重定向' }, { value: 302, label: '302 · 临时重定向' }, { value: 307, label: '307 · 保留方法临时重定向' }, { value: 308, label: '308 · 保留方法永久重定向' }, { value: 410, label: '410 · 内容已删除' }], item?.status_code ?? 301, { required: true })}${field('目标路径或绝对 URL', 'target_path', item?.target_path, { maxlength: 2048, placeholder: '/de/logistik-service.html 或 https://example.com/new', wide: true })}${checkboxField('启用此规则', 'enabled', item?.enabled ?? true)}<div class="form-hint form-field-wide">410 规则不填写目标地址；其他状态码必须填写站内路径或 http/https 绝对地址。</div></div>`
  $('#delete-entity-button').hidden = !item
  $('#delete-entity-button').textContent = '删除规则'
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').textContent = item ? '保存修改' : '创建规则'
  $('#save-entity-button').hidden = false
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields input, #entity-fields select')?.focus(), 0)
}

async function openTaxonomyDialog(item = null) {
	await ensureCoreData()
	if (!liveState.loaded.has('taxonomy')) await loadRoute('taxonomy', true)
	const siteID = Number(item?.site_id || $('#site-switcher')?.dataset.siteId || liveState.sites[0]?.id || 0)
	const bindings = siteID ? await loadSiteLanguages(siteID) : []
	const locale = item?.locale || bindings.find((binding) => binding.enabled)?.locale || ''
	const kind = item?.kind || 'category'
	const parents = liveState.taxonomy.filter((term) => term.kind === 'category' && term.status === 'active' && Number(term.site_id) === siteID && term.locale === locale && Number(term.id) !== Number(item?.id))
	entityForm.reset()
	entityForm.dataset.route = 'taxonomy'
	entityForm.dataset.mode = item ? 'edit' : 'create'
	entityForm.dataset.id = item?.id ?? ''
	entityForm.dataset.version = item?.version ?? ''
	entityDialog.classList.remove('dialog-wide', 'dialog-editor')
	$('#entity-dialog-title').textContent = `${item ? '编辑' : '新建'}${kind === 'tag' ? '标签' : '栏目'}`
	$('#entity-dialog-description').textContent = '栏目和标签按站点与 Locale 隔离；重命名会同步已关联内容，停用不会删除历史关系。'
	$('#entity-dialog-error').hidden = true
	$('#entity-fields').innerHTML = `<div class="form-grid">${selectField('站点', 'site_id', liveState.sites.map((site) => ({ value: site.id, label: site.name })), siteID, { required: true, disabled: Boolean(item) })}${selectField('语言 / Locale', 'locale', bindings.filter((binding) => binding.enabled || binding.locale === locale).map((binding) => ({ value: binding.locale, label: `${binding.language_name} / ${binding.locale}` })), locale, { required: true, disabled: Boolean(item) })}${selectField('类型', 'kind', [{ value: 'category', label: '栏目' }, { value: 'tag', label: '标签' }], kind, { required: true, disabled: Boolean(item) })}${field('名称', 'name', item?.name, { required: true, maxlength: 100, placeholder: kind === 'tag' ? '国际快递' : '物流指南' })}${field('Slug', 'slug', item?.slug, { maxlength: 120, placeholder: '留空自动生成', help: '仅允许小写字母、数字、短横线和 /；创建后可独立维护。' })}${selectField('上级栏目', 'parent_id', [{ value: '', label: '无上级栏目' }, ...parents.map((term) => ({ value: term.id, label: term.name }))], item?.parent_id ?? '', { disabled: kind === 'tag', help: '标签保持扁平；栏目可以建立层级。' })}${selectField('状态', 'status', [{ value: 'active', label: '可使用' }, { value: 'disabled', label: '已停用' }], item?.status ?? 'active', { required: true })}<div class="form-hint form-field-wide"><strong>当前使用</strong><span>${item ? `${Number(item.usage_count || 0)} 个内容版本正在引用。` : '创建后可在内容编辑器中直接填写或选择。'}</span></div></div>`
	$('#delete-entity-button').hidden = !item || item?.status === 'disabled'
	$('#delete-entity-button').textContent = '停用'
	$('#add-locale-button').hidden = true
	$('#content-review-button').hidden = true
	$('#content-publish-button').hidden = true
	$('#save-entity-button').textContent = item ? '保存修改' : '创建'
	$('#save-entity-button').hidden = false
	if (!entityDialog.open) entityDialog.showModal()
	window.setTimeout(() => entityForm.elements.name?.focus(), 0)
}

const revisionActionLabels = { created: '创建', locale_created: '创建语言版本', ai_localized: 'AI 生成本土化版本', updated: '编辑', published: '发布', restored: '从历史恢复' }
const revisionFields = [
  ['title', '标题'], ['slug', 'URL / Slug'], ['category', '栏目'], ['tags', '标签'], ['summary', '摘要'], ['body_html', '正文'],
  ['seo_title', 'SEO 标题'], ['meta_description', 'Meta Description'], ['primary_keyword', '核心关键词'],
  ['secondary_keywords', '次要关键词'], ['canonical_url', 'Canonical'], ['robots_index', '允许收录'], ['template_key', '页面模板'],
]

function revisionValue(value, key) {
  if (Array.isArray(value)) return value.join('、') || '—'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (key === 'body_html') {
    const text = editorPlainText(value)
    return text ? `${text.slice(0, 180)}${text.length > 180 ? '…' : ''}` : '—'
  }
  const text = String(value ?? '').trim()
  return text ? `${text.slice(0, 220)}${text.length > 220 ? '…' : ''}` : '—'
}

function revisionDiffMarkup(current, revision) {
  const snapshot = revision.snapshot && typeof revision.snapshot === 'object' ? revision.snapshot : {}
  const changes = revisionFields.filter(([key]) => revisionValue(current?.[key], key) !== revisionValue(snapshot?.[key], key))
  return changes.length ? `<div class="revision-diff-list">${changes.map(([key, label]) => `<div><strong>${escapeHtml(label)}</strong><span><small>历史版本</small>${escapeHtml(revisionValue(snapshot?.[key], key))}</span><span><small>当前版本</small>${escapeHtml(revisionValue(current?.[key], key))}</span></div>`).join('')}</div>` : '<div class="revision-no-diff">此快照与当前版本的主要字段一致。</div>'
}

async function openRevisionHistory(item) {
  if (!item?.content_id) return
  const payload = await fetchJSON(`/api/v1/contents/${encodeURIComponent(item.content_id)}/revisions?limit=50`)
  const revisions = payload.revisions ?? []
  entityForm.reset()
  entityForm.dataset.route = 'revisions'
  entityForm.dataset.mode = 'history'
  entityForm.dataset.contentId = String(item.content_id)
  entityForm.dataset.siteId = String(item.site_id)
  entityForm.dataset.locale = item.locale
  entityForm.dataset.version = String(item.version)
  entityDialog.classList.add('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = '版本历史'
  $('#entity-dialog-description').textContent = `${item.title} · ${item.site_name} / ${item.locale}`
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = revisions.length ? `<div class="revision-history" aria-label="内容修订列表">${revisions.map((revision) => `<article class="revision-item" data-revision-id="${escapeHtml(revision.id)}"><header><div><strong>版本 ${escapeHtml(revision.version)} · ${escapeHtml(revisionActionLabels[revision.action] || revision.action)}</strong><span>${escapeHtml(revision.actor_name || '系统')} · ${escapeHtml(formatDate(revision.created_at))}</span></div><div class="revision-actions"><button class="button button-secondary button-compact" type="button" data-revision-compare aria-expanded="false">对比当前</button>${can('content.write') ? `<button class="button button-secondary button-compact" type="button" data-revision-restore ${Number(revision.version) === Number(item.version) ? 'disabled title="当前版本无需恢复"' : ''}>恢复为新草稿</button>` : ''}</div></header><div class="revision-diff" hidden>${revisionDiffMarkup(item, revision)}</div></article>`).join('')}</div>` : '<div class="empty-state revision-empty"><strong>尚无版本历史</strong><p>保存或发布内容后，这里会保留不可变修订快照。</p></div>'
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = true
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields [data-revision-compare]')?.focus(), 0)
}

async function restoreRevision(button) {
  const revision = button.closest('[data-revision-id]')
  const revisionID = Number(revision?.dataset.revisionId || 0)
  if (!revisionID) return
  if (!window.confirm('系统会把此历史快照复制为一个新的草稿版本，不会删除或覆盖现有修订记录。确定继续吗？')) return
  const original = button.textContent
  button.disabled = true
  button.textContent = '正在恢复…'
  try {
    await fetchJSON(`/api/v1/contents/${encodeURIComponent(entityForm.dataset.contentId)}/revisions/${encodeURIComponent(revisionID)}/restore`, { method: 'POST', body: { version: Number(entityForm.dataset.version || 0) } })
    entityDialog.close()
    liveState.loaded.delete('content')
    contentEditorState.key = ''
    await renderContentEditorRoute('edit')
    showToast('历史版本已恢复为新的草稿版本')
  } catch (error) {
    showEntityError(error.status === 409 ? '内容已被其他用户更新，请关闭版本历史并重新打开后再恢复。' : error.message || '恢复版本失败')
    button.disabled = false
    button.textContent = original
  }
}

async function openPublishingDialog() {
  await ensureCoreData()
  const siteID = currentSiteID() || liveState.sites[0]?.id
  const bindings = siteID ? await loadSiteLanguages(siteID) : []
  const locales = bindings.filter((binding) => binding.enabled).map((binding) => ({ value: binding.locale, label: `${binding.language_name} / ${binding.locale}` }))
  entityForm.reset()
  entityForm.dataset.route = 'publishing'
  entityForm.dataset.mode = 'create'
  entityForm.dataset.id = ''
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = '创建发布'
  $('#entity-dialog-description').textContent = '先完成发布前检查，再执行原子静态发布；发布结果会记录到审计日志。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="form-grid">${field('发布名称', 'name', '', { required: true, maxlength: 120, placeholder: '德国站内容增量发布 2026-08-27' })}${selectField('站点', 'site_id', liveState.sites.map((site) => ({ value: site.id, label: site.name })), siteID, { required: true })}${selectField('语言 / Locale', 'locale', locales, locales[0]?.value ?? '', { required: true })}${selectField('发布类型', 'release_type', Object.entries(releaseTypes).map(([value, label]) => ({ value, label })), 'content', { required: true })}${selectField('发布范围', 'scope', [{ value: 'changed', label: '仅变更内容' }, { value: 'locale', label: '当前语言全量' }, { value: 'site', label: '当前站点全量' }], 'changed', { required: true })}<div class="form-hint form-field-wide"><strong>执行前检查</strong><span>目标语言必须启用，并绑定已通过安全验证的模板；SEO、URL 冲突和内容状态由服务端再次检查。</span></div></div>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').textContent = '执行发布'
  $('#save-entity-button').hidden = false
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields input, #entity-fields select')?.focus(), 0)
}

async function openMediaUploadDialog(target = '') {
  entityForm.reset()
  entityForm.dataset.route = 'media'
  entityForm.dataset.mode = 'create'
  entityForm.dataset.id = ''
  entityForm.dataset.mediaTarget = target
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = '上传媒体'
  $('#entity-dialog-description').textContent = '媒体会先经过 MIME、扩展名、大小和病毒扫描；上传后再补充 Alt 文本。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="form-grid"><label class="form-field form-field-wide"><span>媒体文件</span><input type="file" name="media_file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" required><small>当前支持 JPEG / PNG；服务端会重新编码并移除附加数据。</small></label>${field('Alt 文本（可后续完善）', 'alt_text', '', { maxlength: 500, wide: true, placeholder: '客观描述图片主体和用途，不堆砌关键词' })}<div class="form-hint form-field-wide"><strong>安全提示</strong><span>禁止上传 HTML、JavaScript、可执行文件和包含脚本的 SVG。服务端会以真实文件类型为准，不信任扩展名。</span></div></div>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = false
  $('#save-entity-button').textContent = '上传并扫描'
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields input')?.focus(), 0)
}

function openMediaEditDialog(item) {
  entityForm.reset()
  entityForm.dataset.route = 'media'
  entityForm.dataset.mode = 'edit'
  entityForm.dataset.id = String(item.id)
  entityForm.dataset.version = String(item.version)
  entityDialog.classList.remove('dialog-wide', 'dialog-editor')
  $('#entity-dialog-title').textContent = item.original_name
  $('#entity-dialog-description').textContent = '维护图片替代文本；公开文件地址保持不变。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="media-detail-preview"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt_text || '')}" loading="lazy" width="${escapeHtml(item.width)}" height="${escapeHtml(item.height)}"><div><strong>${escapeHtml(item.width)} × ${escapeHtml(item.height)}</strong><span>${escapeHtml(formatBytes(item.byte_size))} · ${escapeHtml(item.media_type)}</span><span>${escapeHtml(item.uploader_name || '系统')} 上传 · ${escapeHtml(formatDate(item.created_at))}</span></div></div><div class="form-grid">${field('Alt 文本', 'alt_text', item.alt_text, { maxlength: 500, textarea: true, wide: true, placeholder: '描述图片中与页面内容有关的信息', help: '装饰性图片可以留空；有信息价值的图片应使用简洁、自然的描述。' })}<div class="form-hint form-field-wide"><strong>引用状态</strong><span>${Number(item.reference_count || 0) ? `当前被 ${escapeHtml(item.reference_count)} 处内容引用，因此不能删除。` : '当前未被内容引用，可以安全删除。'}</span></div></div>`
  const deleteButton = $('#delete-entity-button')
  deleteButton.hidden = false
  deleteButton.disabled = Number(item.reference_count || 0) > 0
  deleteButton.textContent = deleteButton.disabled ? '已被引用' : '删除媒体'
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = false
  $('#save-entity-button').textContent = '保存 Alt'
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => entityForm.elements.alt_text?.focus(), 0)
}

function userRoleFields(selected = []) {
  const values = new Set(selected)
  return `<fieldset class="choice-fieldset form-field-wide"><legend>角色</legend><div class="choice-grid">${liveState.roles.map((role) => `<label class="choice-row"><input type="checkbox" name="user_roles" value="${escapeHtml(role.code)}" ${values.has(role.code) ? 'checked' : ''}><span><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.permissions.length)} 项权限 · ${escapeHtml(role.code)}</small></span></label>`).join('')}</div></fieldset>`
}

async function userScopeFields(selected = []) {
  const values = new Set(selected.map((scope) => `${scope.site_id}|${scope.locale}`))
  if (!selected.length) values.add('0|*')
  const siteRows = await Promise.all(liveState.sites.map(async (site) => {
    const bindings = await loadSiteLanguages(site.id)
    const options = [`<label class="choice-row"><input type="checkbox" name="user_scopes" value="${site.id}|*" ${values.has(`${site.id}|*`) ? 'checked' : ''}><span><strong>${escapeHtml(site.name)} · 全部语言</strong><small>包含此站点当前及以后启用的语言</small></span></label>`]
    bindings.forEach((binding) => options.push(`<label class="choice-row"><input type="checkbox" name="user_scopes" value="${site.id}|${escapeHtml(binding.locale)}" ${values.has(`${site.id}|${binding.locale}`) ? 'checked' : ''}><span><strong>${escapeHtml(site.name)} · ${escapeHtml(binding.language_name)}</strong><small>${escapeHtml(binding.locale)}</small></span></label>`))
    return options.join('')
  }))
  return `<fieldset class="choice-fieldset form-field-wide"><legend>站点 / 语言数据范围</legend><div class="choice-grid"><label class="choice-row choice-row-global"><input type="checkbox" name="user_scopes" value="0|*" ${values.has('0|*') ? 'checked' : ''}><span><strong>全部站点与全部语言</strong><small>系统所有者和全局管理员使用；选择后无需再勾选其他范围</small></span></label>${siteRows.join('')}</div></fieldset>`
}

async function openUserDialog(item = null) {
  await ensureCoreData()
  if (!liveState.roles.length) await loadRoute('users', true)
  entityForm.reset()
  entityForm.dataset.route = 'users'
  entityForm.dataset.mode = item ? 'edit' : 'create'
  entityForm.dataset.id = item ? String(item.id) : ''
  entityDialog.classList.add('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = item ? `编辑 ${item.display_name || item.username} 的权限` : '创建用户'
  $('#entity-dialog-description').textContent = '角色决定可执行动作，数据范围限制可访问的站点与语言；保存前必须二次验证。'
  $('#entity-dialog-error').hidden = true
  const identity = item ? `<div class="form-hint form-field-wide"><strong>${escapeHtml(item.display_name || item.username)} · ${escapeHtml(item.username)}</strong><span>${escapeHtml(item.email || '未设置邮箱')} · ${item.mfa_enabled ? '已启用 MFA' : '尚未启用 MFA'}</span></div>` : `${field('用户名', 'username', '', { required: true, minlength: 3, maxlength: 64, autocomplete: 'off', help: '3–64 个字母、数字、点、下划线或连字符。' })}${field('显示名称', 'display_name', '', { required: true, maxlength: 100, autocomplete: 'name' })}${field('邮箱（可选）', 'email', '', { type: 'email', maxlength: 254, autocomplete: 'email' })}${field('初始密码', 'password', '', { type: 'password', required: true, minlength: 12, maxlength: 1024, autocomplete: 'new-password', help: '至少 12 个字符；请通过安全渠道交给新用户。' })}`
  const scopes = await userScopeFields(item?.scopes ?? [])
  const stepUp = `${field('当前操作人密码', 'operator_password', '', { type: 'password', required: true, autocomplete: 'current-password', wide: true, help: '敏感权限操作必须重新验证，不会写入审计日志。' })}${liveState.me?.mfa_enabled ? field('当前操作人 MFA 动态码', 'operator_mfa', '', { required: true, maxlength: 12, inputmode: 'numeric', autocomplete: 'one-time-code', wide: true }) : ''}`
  $('#entity-fields').innerHTML = `<div class="form-grid">${identity}${userRoleFields(item?.roles ?? ['editor'])}${scopes}${stepUp}</div>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = false
  $('#save-entity-button').textContent = item ? '保存权限' : '创建用户'
  if (!entityDialog.open) entityDialog.showModal()
  window.setTimeout(() => $('#entity-fields input')?.focus(), 0)
}

function openAuditDetails(item) {
  entityForm.reset()
  entityForm.dataset.route = 'audit'
  entityForm.dataset.mode = 'view'
  entityDialog.classList.remove('dialog-wide', 'dialog-editor')
  $('#entity-dialog-title').textContent = `审计记录 #${item.id}`
  $('#entity-dialog-description').textContent = '此记录受数据库触发器保护，只能读取，不能修改或删除。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="detail-list"><div><span>操作</span><code>${escapeHtml(item.action)}</code></div><div><span>结果</span>${badge(item.success ? '成功' : '失败')}</div><div><span>操作人</span><strong>${escapeHtml(item.actor_name || (item.actor_user_id ? `用户 #${item.actor_user_id}` : '系统'))}</strong></div><div><span>目标</span><strong>${escapeHtml(item.target_type || '—')} · ${escapeHtml(item.target_id || '—')}</strong></div><div><span>IP 地址</span><code>${escapeHtml(item.ip_address || '—')}</code></div><div><span>请求 ID</span><code>${escapeHtml(item.request_id || '—')}</code></div><div><span>时间</span><strong>${escapeHtml(item.created_at)}</strong></div></div><section class="audit-metadata"><h3>脱敏元数据</h3><pre>${escapeHtml(JSON.stringify(item.metadata || {}, null, 2))}</pre></section>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = true
  if (!entityDialog.open) entityDialog.showModal()
}

function openTemplateDetails(item) {
	const bindings = Array.isArray(item.bindings) ? item.bindings : []
	const bindingList = bindings.length ? bindings.map((binding) => {
		const previewPath = `/admin/template-preview/${encodeURIComponent(item.id)}/${encodeURIComponent(binding.site_code)}/${encodeURIComponent(binding.locale)}`
		return `<div class="template-binding-item"><span><strong>${escapeHtml(binding.site_name)}</strong><small>${escapeHtml(binding.locale)} · localhost:${escapeHtml(binding.local_port)}</small></span><a class="button button-secondary button-compact" href="${escapeHtml(previewPath)}" target="_blank" rel="noopener">${icon('eye', 'icon icon-sm')}预览</a></div>`
	}).join('') : '<p class="content-readonly-empty">尚未绑定站点语言。可先预览模板，再进入站点管理完成绑定。</p>'
  entityForm.reset()
  entityForm.dataset.route = 'templates'
  entityForm.dataset.mode = 'view'
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = `${item.name} · ${item.version}`
  $('#entity-dialog-description').textContent = '已安装模板包的校验结果和使用情况。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="detail-list"><div><span>运行状态</span>${badge(item.renderable ? '可安全渲染' : item.status === 'disabled' ? '已停用' : '安全已验证 · 待部署')}</div><div><span>模板类型</span><strong>${escapeHtml(item.kind === 'builtin' ? '系统内置模板' : '上传模板包')}</strong></div><div><span>渲染入口</span><code>${escapeHtml(item.render_key || '尚未编译')}</code></div><div><span>绑定数量</span><strong>${escapeHtml(item.binding_count ?? 0)} 个站点语言</strong></div><div><span>登记人</span><strong>${escapeHtml(item.uploaded_by || 'CZCMS 系统')}</strong></div><div><span>SHA256</span><code>${escapeHtml(item.sha256)}</code></div><div><span>安装时间</span><strong>${escapeHtml(formatDate(item.created_at))}</strong></div></div><section class="template-binding-section" aria-labelledby="template-binding-heading"><div class="section-heading"><div><h3 id="template-binding-heading">生效范围与预览</h3><p>预览不会修改当前绑定，也不会被搜索引擎收录。</p></div></div><div class="template-binding-list">${bindingList}</div></section><div class="form-hint"><strong>${item.renderable ? '切换模板' : '部署说明'}</strong><span>${item.renderable ? '前往站点编辑，为每个 Locale 单独选择模板；保存后对应前台立即切换。' : '上传包已通过静态安全检查，但必须完成隔离解压、资源发布和模板编译后才能绑定。'}</span><button class="button button-secondary button-compact" type="button" data-go-sites>前往站点管理</button></div>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = true
  if (!entityDialog.open) entityDialog.showModal()
}

function openPublishingDetails(item) {
  const checks = Array.isArray(item.checks) ? item.checks : []
  entityForm.reset()
  entityForm.dataset.route = 'publishing'
  entityForm.dataset.mode = 'view'
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.remove('dialog-editor')
  $('#entity-dialog-title').textContent = `${item.name} · #${item.id}`
  $('#entity-dialog-description').textContent = '发布结果为只读记录；失败任务可在任务中心重试。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = `<div class="detail-list"><div><span>目标</span><strong>${escapeHtml(item.site_name)} / ${escapeHtml(item.locale)}</strong></div><div><span>发布类型</span><strong>${escapeHtml(releaseTypes[item.release_type] ?? item.release_type)}</strong></div><div><span>页面数量</span><strong>${escapeHtml(item.page_count ?? 0)}</strong></div><div><span>状态</span>${badge(releaseStatus[item.status] ?? item.status)}</div><div><span>创建人</span><strong>${escapeHtml(item.created_by || '系统')}</strong></div></div><section class="release-checks"><h3>发布前检查</h3>${checks.length ? checks.map((check) => `<div>${icon(check.passed ? 'check' : 'alert')}<span>${escapeHtml(check.label)}</span>${badge(check.passed ? '已通过' : '失败')}</div>`).join('') : '<p>此历史记录没有可展示的检查明细。</p>'}</section>`
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#content-review-button').hidden = true
  $('#content-publish-button').hidden = true
  $('#save-entity-button').hidden = true
  if (!entityDialog.open) entityDialog.showModal()
}

async function openLocaleDialog() {
  const contentID = entityForm.dataset.contentId
  const contentType = formValue(entityForm, 'content_type') || 'article'
  entityForm.dataset.mode = 'locale-create'
  entityDialog.classList.remove('dialog-wide')
  entityDialog.classList.add('dialog-editor')
  entityForm.dataset.id = ''
  entityForm.dataset.version = ''
  $('#entity-dialog-title').textContent = '添加语言版本'
  $('#entity-dialog-description').textContent = '创建同一内容组的新站点 / Locale 版本；正文和 SEO 应按当地语境独立撰写。'
  $('#entity-dialog-error').hidden = true
  $('#entity-fields').innerHTML = await contentFields({ content_type: contentType }, true)
  entityForm.dataset.contentId = contentID
  $('#delete-entity-button').hidden = true
  $('#add-locale-button').hidden = true
  $('#save-entity-button').textContent = '保存语言版本'
  window.setTimeout(() => $('#entity-fields input, #entity-fields select, #entity-fields textarea')?.focus(), 0)
}

async function editRow(route, row) {
  if (!row?._raw) return
	if (route === 'taxonomy') {
		await openTaxonomyDialog(row._raw)
		return
	}
	if (route === 'media') {
		openMediaEditDialog(row._raw)
		return
	}
	if (route === 'users') {
		await openUserDialog(row._raw)
		return
	}
	if (route === 'audit') {
		openAuditDetails(row._raw)
		return
	}
  if (route === 'urls') {
    await openRedirectDialog(row._raw)
    return
  }
  if (route === 'publishing') {
    openPublishingDetails(row._raw)
    return
  }
  if (route === 'templates') {
    openTemplateDetails(row._raw)
    return
  }
  if (route !== 'content') {
    await openEntityDialog(modules[route].entityName, row._raw)
    return
  }
  try {
    const raw = row._raw
    navigate(`/admin/content?section=${raw.content_type === 'page' ? 'pages' : 'articles'}&editor=edit&content_id=${encodeURIComponent(raw.content_id)}&site_id=${encodeURIComponent(raw.site_id)}&locale=${encodeURIComponent(raw.locale)}`)
  } catch (error) {
    showToast(error.message || '读取内容详情失败')
  }
}

async function viewContentRow(row) {
  if (!row?._raw || !can('content.read')) return
  const raw = row._raw
  try {
    const item = await fetchJSON(`/api/v1/contents/${encodeURIComponent(raw.content_id)}/locales/${encodeURIComponent(raw.locale)}?site_id=${encodeURIComponent(raw.site_id)}`)
    const site = liveState.sites.find((candidate) => Number(candidate.id) === Number(item.site_id))
		const previewURL = contentFrontendPreviewURL(site, item)
		const frontendLink = item.status === 'published' ? `<a class="content-frontend-link" href="${escapeHtml(previewURL)}" target="_blank" rel="noopener">${icon('eye', 'icon icon-sm')}打开前台页面</a>` : '<span class="content-preview-hint">发布后可打开前台页面</span>'
    const tagList = Array.isArray(item.tags) && item.tags.length ? item.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('') : '<span class="content-readonly-empty">未设置标签</span>'
    entityForm.reset()
    entityForm.dataset.route = 'content'
    entityForm.dataset.mode = 'view'
    entityForm.dataset.contentId = String(item.content_id)
    entityForm.dataset.siteId = String(item.site_id)
    entityForm.dataset.locale = item.locale
    entityDialog.classList.add('dialog-wide')
    entityDialog.classList.remove('dialog-editor')
    $('#entity-dialog-title').textContent = item.title
    $('#entity-dialog-description').textContent = `${item.site_name} · ${item.language_name || item.locale} · 只读查看`
    $('#entity-dialog-error').hidden = true
    $('#entity-fields').innerHTML = `<div class="content-readonly">
      <div class="content-readonly-summary" aria-label="内容基本信息">
        <div><span>内容类型</span><strong>${escapeHtml(contentTypes[item.content_type] ?? item.content_type)}</strong></div>
        <div><span>状态</span>${badge(contentStatus[item.status] ?? item.status)}</div>
        <div><span>负责人</span><strong>${escapeHtml(item.owner_name || '未分配')}</strong></div>
        <div><span>最近更新</span><strong>${escapeHtml(formatDate(item.updated_at))}</strong></div>
      </div>
      <section class="content-readonly-section" aria-labelledby="readonly-body-heading">
		<header><div><h3 id="readonly-body-heading">内容预览</h3><p>${escapeHtml(previewURL)}</p></div><div class="content-readonly-header-actions"><span>${escapeHtml(item.locale)}</span>${frontendLink}</div></header>
        <iframe class="content-readonly-frame" title="${escapeHtml(item.title)}正文预览" sandbox="allow-same-origin"></iframe>
      </section>
      <section class="content-readonly-section" aria-labelledby="readonly-seo-heading">
        <header><div><h3 id="readonly-seo-heading">SEO 与内容信息</h3><p>当前站点和 Locale 独立保存的搜索信息</p></div></header>
        <div class="detail-list content-readonly-details">
          <div><span>SEO 标题</span><strong>${escapeHtml(item.seo_title || '未设置')}</strong></div>
          <div><span>Meta Description</span><strong>${escapeHtml(item.meta_description || '未设置')}</strong></div>
          <div><span>主关键词</span><strong>${escapeHtml(item.primary_keyword || '未设置')}</strong></div>
          <div><span>Canonical</span><code>${escapeHtml(item.canonical_url || '未设置')}</code></div>
          <div><span>标签</span><span class="content-readonly-tags">${tagList}</span></div>
        </div>
      </section>
    </div>`
    const frame = $('.content-readonly-frame', entityForm)
    if (frame) {
      frame.srcdoc = `<!doctype html><html lang="${escapeHtml(item.locale)}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"><style>body{font:16px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#1f2b3d;max-width:72ch;margin:0 auto;padding:30px 28px 50px;overflow-wrap:anywhere}h1{font-size:30px;line-height:1.3;margin:0 0 12px}h2{font-size:21px;margin:1.6em 0 .55em}p{margin:.75em 0}img{max-width:100%;height:auto}a{color:#1459c7}.summary{color:#5d6879;font-size:17px;margin-bottom:28px}</style></head><body><h1>${escapeHtml(item.h1 || item.title)}</h1>${item.summary ? `<p class="summary">${escapeHtml(item.summary)}</p>` : ''}${item.body_html || '<p>此内容暂未填写正文。</p>'}</body></html>`
    }
    $('#delete-entity-button').hidden = true
    $('#add-locale-button').hidden = true
    $('#content-review-button').hidden = true
    $('#content-publish-button').hidden = true
    $('#save-entity-button').hidden = true
    if (!entityDialog.open) entityDialog.showModal()
  } catch (error) {
    showToast(error.message || '读取内容详情失败')
  }
}

async function deleteContentRows(rows, button) {
  if (!can('content.write')) return
  const groups = new Map()
  rows.forEach((row) => {
    const raw = row?._raw
    if (raw?.content_id && !groups.has(String(raw.content_id))) groups.set(String(raw.content_id), row)
  })
  const targets = [...groups.values()]
  if (!targets.length) return
  const names = targets.slice(0, 3).map((row) => row.name).join('、')
  const extra = targets.length > 3 ? ` 等 ${targets.length} 个内容组` : ''
  if (!window.confirm(`将 ${names}${extra} 移到回收站？\n\n删除内容组会同时移除其全部站点 / 语言版本；数据和修订记录仍会保留，操作将写入审计日志。`)) return
  const original = button?.innerHTML || ''
  if (button) {
    button.disabled = true
    button.textContent = targets.length > 1 ? '正在批量删除…' : '正在删除…'
  }
  try {
    const result = await fetchJSON('/api/v1/contents/bulk-delete', {
      method: 'POST',
      body: { targets: targets.map((row) => ({ content_id: Number(row._raw.content_id), version: Number(row._raw.content_version || 0) })) },
    })
    moduleState.selected.clear()
    liveState.loaded.delete('content')
    await loadRoute('content', true)
    const deleted = Number(result.deleted || targets.length)
    showToast(targets.length > 1 ? `已将 ${deleted} 个内容组移到回收站` : `内容“${targets[0].name}”已移到回收站`)
  } catch (error) {
    showToast(error.status === 409 ? '有内容已被其他用户修改，本次没有删除任何内容；请刷新后重试' : error.message || '批量删除失败')
  } finally {
    if (button) {
      button.disabled = false
      button.innerHTML = original
    }
  }
}

async function bulkUpdateSelectedContents(changes, button) {
  if (!can('content.write')) return
  const rows = activeModuleConfig('content').rows.filter((row) => moduleState.selected.has(String(row.id)) && row?._raw)
  if (!rows.length) return
  const statusLabel = changes.status ? contentStatus[changes.status] || changes.status : ''
  const description = changes.status
    ? `把选中的 ${rows.length} 个语言版本状态改为“${statusLabel}”`
    : `${changes.category ? `把选中的 ${rows.length} 个语言版本移到栏目“${changes.category}”` : `清除选中的 ${rows.length} 个语言版本的栏目`}`
  const warning = changes.status === 'published' ? '\n\n发布前将检查正文；任一内容不合格或版本冲突时整批回滚。' : '\n\n任一版本冲突时整批回滚，不会只修改一部分。'
  if (!window.confirm(`${description}？${warning}`)) return
  const original = button?.innerHTML || ''
  if (button) { button.disabled = true; button.textContent = '正在处理…' }
  try {
    const payload = {
      targets: rows.map((row) => ({ content_id: Number(row._raw.content_id), site_id: Number(row._raw.site_id), locale: row._raw.locale, version: Number(row._raw.version) })),
      ...changes,
    }
    const result = await fetchJSON('/api/v1/contents/bulk-update', { method: 'POST', body: payload })
    moduleState.selected.clear()
    await loadRoute('content', true)
    showToast(`已批量更新 ${Number(result.updated || rows.length)} 个内容版本`)
  } catch (error) {
    showToast(error.status === 409 ? '有内容已被其他用户修改，本次没有更新任何记录；请刷新后重试' : error.message || '批量更新失败')
  } finally {
    if (button) { button.disabled = false; button.innerHTML = original }
  }
}

async function deleteContentRow(row, button) {
  if (!row?._raw) return
  await deleteContentRows([row], button)
}

async function deleteSelectedContents(button) {
  const rows = activeModuleConfig('content').rows.filter((row) => moduleState.selected.has(String(row.id)))
  await deleteContentRows(rows, button)
}

async function deleteMediaRow(row, button) {
  const item = row?._raw
  if (!item || !can('media.upload')) return
  if (Number(item.reference_count || 0) > 0) {
    showToast(`此媒体仍被 ${item.reference_count} 处内容引用，不能删除`)
    return
  }
  if (!window.confirm(`永久删除媒体“${item.original_name}”？\n\n公开地址将立即失效，操作不可撤销并会写入审计日志。`)) return
  const original = button.textContent
  button.disabled = true
  button.textContent = '删除中…'
  try {
    await fetchJSON(`/api/v1/media/${encodeURIComponent(item.id)}`, { method: 'DELETE', body: { version: Number(item.version || 0) } })
    await loadRoute('media', true)
    showToast('媒体已永久删除')
  } catch (error) {
    showToast(error.message || '媒体删除失败')
  } finally {
    button.disabled = false
    button.textContent = original
  }
}

async function disableTaxonomyRow(row, button) {
	const item = row?._raw
	if (!item || !can('content.write') || item.status === 'disabled') return
	if (!window.confirm(`停用“${item.name}”？\n\n已关联内容会继续保留此${item.kind === 'category' ? '栏目' : '标签'}，但新内容默认不再选择它；操作将写入审计日志。`)) return
	const original = button?.textContent || ''
	if (button) { button.disabled = true; button.textContent = '停用中…' }
	try {
		await fetchJSON(`/api/v1/taxonomy/terms/${encodeURIComponent(item.id)}`, { method: 'DELETE', body: { version: Number(item.version || 0) } })
		await loadRoute('taxonomy', true)
		showToast(`${item.kind === 'category' ? '栏目' : '标签'}“${item.name}”已停用，内容关系已保留`)
	} catch (error) {
		showToast(error.message || '停用失败，请刷新后重试')
	} finally {
		if (button) { button.disabled = false; button.textContent = original }
	}
}

function formValue(form, name) {
  return String(new FormData(form).get(name) ?? '').trim()
}

function sitePayload() {
  const payload = {
    name: formValue(entityForm, 'name'), code: formValue(entityForm, 'code'), primary_domain: formValue(entityForm, 'primary_domain'),
    local_port: Number(formValue(entityForm, 'local_port') || 0),
    market_code: formValue(entityForm, 'market_code'), status: formValue(entityForm, 'status'),
    default_language_code: formValue(entityForm, 'default_language_code'),
    default_theme_package_id: Number(formValue(entityForm, 'default_theme_package_id') || 0),
    version: Number(entityForm.dataset.version || 0),
  }
  if (entityForm.elements.seo_title) {
    payload.seo_title = formValue(entityForm, 'seo_title')
    payload.seo_description = formValue(entityForm, 'seo_description')
    payload.favicon_media_id = formValue(entityForm, 'favicon_media_id') ? Number(formValue(entityForm, 'favicon_media_id')) : null
  }
  return payload
}

async function uploadSiteFavicon(file) {
  if (!file || entityForm.dataset.route !== 'sites') return
  const selector = $('[data-site-favicon-selector]', entityForm)
  const uploadButton = $('[data-site-favicon-upload]', entityForm)
  if (file.size > 12 * 1024 * 1024) { showToast('网站 Icon 不能超过 12 MB'); return }
  const original = uploadButton?.textContent || '上传 Icon'
  if (uploadButton) { uploadButton.disabled = true; uploadButton.textContent = '上传中…' }
  try {
    const payload = new FormData()
    payload.append('file', file)
    payload.append('alt_text', '网站 Icon')
    const media = await fetchJSON('/api/v1/media/upload', { method: 'POST', body: payload })
    if (!media?.id || !media?.url) throw new APIError('Icon 上传结果无效', 500)
    const hidden = entityForm.elements.favicon_media_id
    const image = selector?.querySelector('[data-site-favicon-preview]')
    const placeholder = selector?.querySelector('[data-site-favicon-placeholder]')
    if (hidden) hidden.value = String(media.id)
    if (image) { image.src = media.url; image.hidden = false }
    if (placeholder) placeholder.hidden = true
    selector?.classList.add('is-selected')
    selector?.querySelector('[data-site-favicon-name]') && (selector.querySelector('[data-site-favicon-name]').textContent = media.original_name || '已选择网站 Icon')
    selector?.querySelector('[data-site-favicon-details]') && (selector.querySelector('[data-site-favicon-details]').textContent = `${media.width || 0} × ${media.height || 0} · 保存后将在前台所有页面生效`)
    selector?.querySelector('[data-site-favicon-clear]') && (selector.querySelector('[data-site-favicon-clear]').hidden = false)
    showToast('网站 Icon 已上传，请保存站点设置')
  } catch (error) {
    showToast(error.message || '网站 Icon 上传失败')
  } finally {
    if (uploadButton) { uploadButton.disabled = false; uploadButton.textContent = original }
  }
}

function clearSiteFavicon() {
  const selector = $('[data-site-favicon-selector]', entityForm)
  if (entityForm.elements.favicon_media_id) entityForm.elements.favicon_media_id.value = ''
  const image = selector?.querySelector('[data-site-favicon-preview]')
  const placeholder = selector?.querySelector('[data-site-favicon-placeholder]')
  if (image) { image.src = 'about:blank'; image.hidden = true }
  if (placeholder) placeholder.hidden = false
  selector?.classList.remove('is-selected')
  selector?.querySelector('[data-site-favicon-name]') && (selector.querySelector('[data-site-favicon-name]').textContent = '尚未设置网站 Icon')
  selector?.querySelector('[data-site-favicon-details]') && (selector.querySelector('[data-site-favicon-details]').textContent = '建议上传 512 × 512 的方形 PNG')
  const clear = selector?.querySelector('[data-site-favicon-clear]')
  if (clear) clear.hidden = true
}

function languagePayload() {
  return {
    code: formValue(entityForm, 'code'), name_zh: formValue(entityForm, 'name_zh'), native_name: formValue(entityForm, 'native_name'),
    default_locale: formValue(entityForm, 'default_locale'), direction: formValue(entityForm, 'direction'),
    enabled: Boolean(entityForm.elements.enabled?.checked), site_id: Number(formValue(entityForm, 'site_id') || 0), version: Number(entityForm.dataset.version || 0),
  }
}

function contentPayload() {
  let structuredData = {}
  if (entityForm.elements.structured_data) {
    const source = formValue(entityForm, 'structured_data') || '{}'
    try { structuredData = JSON.parse(source) } catch { throw new APIError('JSON-LD 结构化数据不是有效的 JSON', 422) }
  }
  const scheduledValue = formValue(entityForm, 'scheduled_at')
  const payload = {
    content_type: formValue(entityForm, 'content_type'), site_id: Number(formValue(entityForm, 'site_id') || entityForm.dataset.siteId), locale: formValue(entityForm, 'locale') || entityForm.dataset.locale,
    status: formValue(entityForm, 'status'), title: formValue(entityForm, 'title'), slug: formValue(entityForm, 'slug'),
    summary: formValue(entityForm, 'summary'), body_html: String(entityForm.elements.body_html?.value ?? ''), ai_state: 'manual',
    category: formValue(entityForm, 'category'),
    tags: normalizeTags(formValue(entityForm, 'tags')),
    template_key: formValue(entityForm, 'template_key'),
    scheduled_at: scheduledValue ? new Date(scheduledValue).toISOString() : '',
  }
  if (entityForm.elements.seo_title) {
    payload.seo = {
      h1: formValue(entityForm, 'seo_h1'), title: formValue(entityForm, 'seo_title'), meta_description: formValue(entityForm, 'meta_description'),
      primary_keyword: formValue(entityForm, 'primary_keyword'), secondary_keywords: formValue(entityForm, 'secondary_keywords').split(',').map((item) => item.trim()).filter(Boolean),
      canonical_url: formValue(entityForm, 'canonical_url'), robots_index: Boolean(entityForm.elements.robots_index?.checked),
      og_title: formValue(entityForm, 'og_title'), og_description: formValue(entityForm, 'og_description'), structured_data: structuredData,
    }
  }
  if (entityForm.dataset.mode === 'edit') {
    payload.version = Number(entityForm.dataset.version)
    delete payload.site_id
    delete payload.locale
  }
  return payload
}

function redirectPayload() {
  return {
    site_id: Number(formValue(entityForm, 'site_id') || 0),
    locale: formValue(entityForm, 'locale'),
    source_path: formValue(entityForm, 'source_path'),
    target_path: formValue(entityForm, 'target_path'),
    status_code: Number(formValue(entityForm, 'status_code') || 301),
    enabled: Boolean(entityForm.elements.enabled?.checked),
    version: Number(entityForm.dataset.version || 0),
  }
}

function publishingPayload() {
  return {
    name: formValue(entityForm, 'name'),
    site_id: Number(formValue(entityForm, 'site_id') || 0),
    locale: formValue(entityForm, 'locale'),
    release_type: formValue(entityForm, 'release_type'),
    scope: formValue(entityForm, 'scope'),
  }
}

function userPayload() {
  const roles = $$('input[name="user_roles"]:checked', entityForm).map((input) => input.value)
  let scopeValues = $$('input[name="user_scopes"]:checked', entityForm).map((input) => input.value)
  if (scopeValues.includes('0|*')) scopeValues = ['0|*']
  const scopes = scopeValues.map((value) => {
    const [siteID, locale] = value.split('|')
    return { site_id: Number(siteID), locale }
  })
  if (!roles.length) throw new APIError('至少选择一个角色', 422)
  if (!scopes.length) throw new APIError('至少选择一个站点 / 语言数据范围', 422)
  const payload = {
    roles, scopes, operator_password: formValue(entityForm, 'operator_password'), operator_mfa: formValue(entityForm, 'operator_mfa'),
  }
  if (entityForm.dataset.mode === 'create') {
    Object.assign(payload, {
      username: formValue(entityForm, 'username'), display_name: formValue(entityForm, 'display_name'),
      email: formValue(entityForm, 'email'), password: formValue(entityForm, 'password'),
    })
  }
  return payload
}

function taxonomyPayload() {
	const parent = formValue(entityForm, 'parent_id')
	return {
		site_id: Number(formValue(entityForm, 'site_id') || 0), locale: formValue(entityForm, 'locale'), kind: formValue(entityForm, 'kind'),
		name: formValue(entityForm, 'name'), slug: formValue(entityForm, 'slug'), parent_id: parent ? Number(parent) : null,
		status: formValue(entityForm, 'status') || 'active', version: Number(entityForm.dataset.version || 0),
	}
}

async function submitEntity(statusOverride = null) {
  if (!entityForm.reportValidity()) return
  const route = entityForm.dataset.route
  const mode = entityForm.dataset.mode
  const id = entityForm.dataset.id
  let path = ''
  let payload
  try {
  if (route === 'sites') {
    payload = sitePayload()
    path = mode === 'edit' ? `/api/v1/sites/${id}` : '/api/v1/sites'
  } else if (route === 'languages') {
    payload = languagePayload()
    path = mode === 'edit' ? `/api/v1/languages/${id}` : '/api/v1/languages'
  } else if (route === 'content') {
    payload = contentPayload()
    if (statusOverride) payload.status = statusOverride
    if (payload.status === 'published' && !payload.body_html.trim()) throw new APIError('发布前必须填写正文；如内容尚未完成，请先保存草稿', 422)
    path = mode === 'edit' ? `/api/v1/contents/${entityForm.dataset.contentId}/locales/${encodeURIComponent(entityForm.dataset.locale)}?site_id=${entityForm.dataset.siteId}` : mode === 'locale-create' ? `/api/v1/contents/${entityForm.dataset.contentId}/locales` : '/api/v1/contents'
  } else if (route === 'taxonomy') {
		payload = taxonomyPayload()
		path = mode === 'edit' ? `/api/v1/taxonomy/terms/${id}` : '/api/v1/taxonomy/terms'
  } else if (route === 'urls') {
    payload = redirectPayload()
    path = mode === 'edit' ? `/api/v1/urls/redirects/${id}` : '/api/v1/urls/redirects'
  } else if (route === 'publishing') {
    payload = publishingPayload()
    path = '/api/v1/publishing/releases'
  } else if (route === 'templates') {
    const file = entityForm.elements.template_file?.files?.[0]
    if (!file) throw new APIError('请选择要上传的 ZIP 模板包', 422)
    payload = new FormData()
    payload.append('file', file)
    path = '/api/v1/templates/upload'
  } else if (route === 'media') {
    if (mode === 'edit') {
      payload = { alt_text: formValue(entityForm, 'alt_text'), version: Number(entityForm.dataset.version || 0) }
      path = `/api/v1/media/${id}`
    } else {
      const file = entityForm.elements.media_file?.files?.[0]
      if (!file) throw new APIError('请选择要上传的媒体文件', 422)
      payload = new FormData()
      payload.append('file', file)
      payload.append('alt_text', formValue(entityForm, 'alt_text'))
      path = '/api/v1/media/upload'
    }
  } else if (route === 'users') {
		payload = userPayload()
		path = mode === 'edit' ? `/api/v1/security/users/${id}/access` : '/api/v1/security/users'
	} else if (route === 'forms') {
		payload = contactFormPayload()
		path = mode === 'edit' ? `/api/v1/forms/${encodeURIComponent(id)}` : '/api/v1/forms'
	} else if (route === 'form-submissions') {
		return
	}
  } catch (error) {
    showEntityError(error.message || '表单内容无效')
    return
  }
  const button = statusOverride === 'review' ? $('#content-review-button') : statusOverride === 'published' ? $('#content-publish-button') : $('#save-entity-button')
  const workflowButtons = [$('#save-entity-button'), $('#content-review-button'), $('#content-publish-button')]
  const original = button.textContent
  workflowButtons.forEach((item) => { item.disabled = true })
  button.textContent = statusOverride === 'review' ? '正在提交…' : statusOverride === 'published' ? '正在发布…' : '正在保存…'
  $('#entity-dialog-error').hidden = true
  try {
    const saved = await fetchJSON(path, { method: mode === 'edit' ? 'PUT' : 'POST', body: payload })
	    if (route === 'media' && entityForm.dataset.mediaTarget === 'content-cover') bindContentCover(saved)
	    if (route === 'forms' && mode !== 'edit' && entityForm.dataset.pageId) {
	      await fetchJSON(`/api/v1/content-locales/${encodeURIComponent(entityForm.dataset.pageId)}/form`, { method: 'PUT', body: { form_id: Number(saved.id) } })
	    }
    entityDialog.close()
    liveState.loaded.delete(route)
    if (route === 'sites' || route === 'languages') liveState.siteLanguages.clear()
    if (route === 'sites') liveState.siteDomains.clear()
    if (route === 'templates') liveState.templates = null
    if (apiRoutes.has(route)) await loadRoute(route, true)
	if (route === 'forms') {
	  contentEditorState.key = ''
	  await renderContentEditorRoute('edit')
	}
    showToast(route === 'publishing' ? `发布已创建（#${saved.id}）` : route === 'templates' ? `模板“${saved.name}”已上传并通过验证` : route === 'media' ? (mode === 'edit' ? '媒体 Alt 文本已保存' : `媒体“${saved.original_name ?? saved.storage_name ?? '文件'}”已上传并完成扫描`) : route === 'users' ? (mode === 'edit' ? '用户权限已更新' : `用户“${saved.display_name || saved.username}”已创建`) : route === 'forms' ? (mode === 'edit' ? `联系表单“${saved.name}”已更新` : `联系表单“${saved.name}”已创建并绑定`) : `${modules[route].entityName}“${saved.name ?? saved.name_zh ?? saved.title ?? saved.source_path}”已保存`)
  } catch (error) {
    const box = $('#entity-dialog-error')
    box.textContent = error.status === 409 ? '这条记录已被其他用户修改。请关闭窗口、刷新数据后再编辑。' : error.message || '保存失败，请稍后重试'
    box.hidden = false
    box.scrollIntoView({ block: 'nearest' })
  } finally {
    workflowButtons.forEach((item) => { item.disabled = false })
    button.textContent = original
  }
}

async function disableSiteRows(rows, button) {
  const activeRows = rows.filter((row) => row?._raw?.status !== 'disabled')
  if (!activeRows.length) {
    showToast('所选站点已经停用')
    return
  }
  const names = activeRows.slice(0, 3).map((row) => row.name).join('、')
  const extra = activeRows.length > 3 ? ` 等 ${activeRows.length} 个站点` : ''
  if (!window.confirm(`删除 ${names}${extra}？\n\n为保护站点数据，本操作会停用站点并关闭本地预览，不会物理删除内容；操作将写入审计日志。`)) return
  const original = button?.textContent || ''
  if (button) {
    button.disabled = true
    button.textContent = activeRows.length > 1 ? '正在批量删除…' : '正在删除…'
  }
  const failures = []
  let completed = 0
  try {
    for (const row of activeRows) {
      try {
        await fetchJSON(`/api/v1/sites/${encodeURIComponent(row.id)}`, { method: 'DELETE', body: { version: Number(row._raw?.version || 0) } })
        completed += 1
      } catch (error) {
        failures.push(`${row.name}：${error.message || '操作失败'}`)
      }
    }
    moduleState.selected.clear()
    liveState.siteLanguages.clear()
    liveState.siteDomains.clear()
    liveState.loaded.delete('sites')
    await loadRoute('sites', true)
    if (failures.length) {
      showToast(`已删除 ${completed} 个，${failures.length} 个失败：${failures[0]}`, 5200)
    } else {
      showToast(activeRows.length > 1 ? `已安全停用 ${completed} 个站点` : `站点“${activeRows[0].name}”已安全停用`)
    }
  } finally {
    if (button) {
      button.disabled = false
      button.textContent = original
    }
  }
}

async function deleteSiteRow(row, button) {
  if (!row?._raw || !can('sites.manage')) return
  await disableSiteRows([row], button)
}

async function deleteSelectedSites(button) {
  const rows = modules.sites.rows.filter((row) => moduleState.selected.has(String(row.id)))
  await disableSiteRows(rows, button)
}

async function deleteEntity() {
  const route = entityForm.dataset.route
  const label = route === 'content' ? '把此内容移到回收站' : route === 'urls' ? '删除此 URL 规则' : route === 'media' ? '永久删除此媒体' : `停用此${modules[route].entityName}`
  if (!window.confirm(`${label}？此操作会写入审计日志。`)) return
  const id = route === 'content' ? entityForm.dataset.contentId : entityForm.dataset.id
  const version = route === 'content' ? Number(entityForm.dataset.contentVersion) : Number(entityForm.dataset.version)
  const button = $('#delete-entity-button')
  button.disabled = true
  try {
    const endpoint = route === 'content' ? `/api/v1/contents/${id}` : route === 'urls' ? `/api/v1/urls/redirects/${id}` : route === 'taxonomy' ? `/api/v1/taxonomy/terms/${id}` : `/api/v1/${route}/${id}`
    await fetchJSON(endpoint, { method: 'DELETE', body: { version } })
    entityDialog.close()
    liveState.loaded.delete(route)
    if (['sites', 'languages'].includes(route)) liveState.siteLanguages.clear()
    await loadRoute(route, true)
    showToast(route === 'content' ? '内容已移到回收站' : route === 'urls' ? 'URL 规则已删除' : route === 'media' ? '媒体已永久删除' : `${modules[route].entityName}已停用`)
  } catch (error) {
    const box = $('#entity-dialog-error')
    box.textContent = error.message || '操作失败，请稍后重试'
    box.hidden = false
  } finally {
    button.disabled = false
  }
}

async function refreshSiteAccess() {
  const siteID = Number(entityForm.dataset.id)
  if (!siteID) return
  const [domains, payload] = await Promise.all([loadSiteDomains(siteID, true), fetchJSON('/api/v1/sites')])
  updateSiteData(payload.sites ?? [])
  liveState.loaded.add('sites')
  const site = liveState.sites.find((item) => item.id === siteID)
  if (!site) throw new APIError('站点已不存在或当前账号无权访问', 404)
  entityForm.dataset.version = String(site.version)
  if (entityForm.elements.primary_domain) entityForm.elements.primary_domain.value = site.primary_domain || ''
  const section = $('.site-access-fields', entityForm)
  if (section) section.outerHTML = siteDomainFields(site, domains)
}

async function addSiteDomain() {
  const hostname = formValue(entityForm, 'domain_hostname')
  const kind = formValue(entityForm, 'domain_kind') || 'alias'
  if (!hostname) {
    entityForm.elements.domain_hostname?.focus()
    showToast('请先输入需要绑定的正式域名')
    return
  }
  const button = $('[data-add-domain]', entityForm)
  button.disabled = true
  try {
    await fetchJSON(`/api/v1/sites/${entityForm.dataset.id}/domains`, { method: 'POST', body: { hostname, kind, redirect_to_primary: Boolean(entityForm.elements.domain_redirect?.checked) } })
    await refreshSiteAccess()
    showToast(`域名 ${hostname} 已添加，请完成 DNS 解析`)
  } catch (error) {
    showEntityError(error.message || '添加域名失败')
  } finally {
    button.disabled = false
  }
}

async function checkSiteDomain(domainID, button) {
  button.disabled = true
  const original = button.textContent
  button.textContent = '检查中…'
  try {
    const result = await fetchJSON(`/api/v1/sites/${entityForm.dataset.id}/domains/${domainID}/check`, { method: 'POST', body: {} })
    await refreshSiteAccess()
    showToast(result.dns_status === 'resolved' ? `DNS 已解析到 ${result.resolved_addresses.length} 个地址` : '暂未查询到公开 DNS 解析，请稍后重试')
  } catch (error) {
    showEntityError(error.message || 'DNS 检查失败')
  } finally {
    button.disabled = false
    button.textContent = original
  }
}

async function makePrimaryDomain(domainID, version, hostname, button) {
  button.disabled = true
  try {
    await fetchJSON(`/api/v1/sites/${entityForm.dataset.id}/domains/${domainID}`, { method: 'PUT', body: { hostname, kind: 'primary', redirect_to_primary: false, version } })
    await refreshSiteAccess()
    showToast(`${hostname} 已设为主域名`)
  } catch (error) {
    showEntityError(error.message || '设置主域名失败')
  } finally {
    button.disabled = false
  }
}

async function deleteSiteDomain(domainID, version, button) {
  if (!window.confirm('删除此域名绑定？域名流量将不再匹配到这个站点。')) return
  button.disabled = true
  try {
    await fetchJSON(`/api/v1/sites/${entityForm.dataset.id}/domains/${domainID}`, { method: 'DELETE', body: { version } })
    await refreshSiteAccess()
    showToast('域名绑定已删除')
  } catch (error) {
    showEntityError(error.message || '删除域名失败')
  } finally {
    button.disabled = false
  }
}

function showEntityError(message) {
  const box = $('#entity-dialog-error')
  box.textContent = message
  box.hidden = false
  box.scrollIntoView({ block: 'nearest' })
}

function updateEditorCharCount(textarea) {
  const counter = $('#entity-fields [data-char-count-for="body_html"]')
  if (counter && textarea) counter.textContent = `${textarea.value.length.toLocaleString('zh-CN')} / 200,000`
}

function refreshEditorPreview() {
  const textarea = $('#entity-fields [data-richtext]')
  const frame = $('#entity-fields [data-rich-preview]')
  if (!textarea || !frame || frame.hidden) return
  frame.srcdoc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>body{font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#243044;max-width:72ch;margin:24px auto;padding:0 18px}img{max-width:100%;height:auto}a{color:#1459c7}</style></head><body>${textarea.value}</body></html>`
}

function runEditorCommand(command) {
  const textarea = $('#entity-fields [data-richtext]')
  if (!textarea) return
  if (command === 'preview') {
    const frame = $('#entity-fields [data-rich-preview]')
    const button = $('#entity-fields [data-editor-command="preview"]')
    if (!frame || !button) return
    frame.hidden = !frame.hidden
    textarea.hidden = !frame.hidden
    button.setAttribute('aria-pressed', String(!frame.hidden))
    refreshEditorPreview()
    return
  }
  const start = textarea.selectionStart ?? textarea.value.length
  const end = textarea.selectionEnd ?? start
  const selected = textarea.value.slice(start, end)
  const snippets = { bold: [`<strong>`, `</strong>`], heading: [`<h2>`, `</h2>`], link: [`<a href="/">`, `</a>`] }
  const [before, after] = snippets[command] ?? ['', '']
  textarea.setRangeText(`${before}${selected || (command === 'heading' ? '小标题' : command === 'link' ? '链接文字' : '重点内容')}${after}`, start, end, 'select')
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  refreshEditorPreview()
  textarea.focus()
}

async function createEncryptedBackup() {
  if (!window.confirm('创建新的加密 SQLite 快照？\n\n系统会执行一致性快照、AES-GCM 加密、解密验证和 SQLite 完整性检查；完成后写入审计日志。')) return
  const button = $('[data-module-primary]', moduleView)
  const original = button?.textContent || ''
  if (button) { button.disabled = true; button.textContent = '正在创建并校验…' }
  try {
    const saved = await fetchJSON('/api/v1/system/backups', { method: 'POST', body: {} })
    await loadRoute('settings', true)
    showToast(`加密备份 #${saved.id} 已创建并验证`)
  } catch (error) {
    showToast(error.message || '备份创建失败，请检查服务日志')
  } finally {
    if (button) { button.disabled = false; button.textContent = original }
  }
}

function aiProviderFormValue(name) {
  return aiProviderForm?.elements?.[name]?.value?.trim() ?? ''
}

function showAIProviderError(message) {
  const box = $('#ai-provider-dialog-error')
  if (!box) return
  box.textContent = message
  box.hidden = false
  box.focus()
}

const aiProviderPresets = [
  { key: 'openai', label: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
  { key: 'deepseek', label: 'DeepSeek', baseURL: 'https://api.deepseek.com', model: 'deepseek-v4-flash' },
  { key: 'gemini', label: 'Google Gemini 兼容接口', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' },
  { key: 'qwen', label: '阿里云百炼 / Qwen', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { key: 'siliconflow', label: 'SiliconFlow', baseURL: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3' },
  { key: 'openrouter', label: 'OpenRouter', baseURL: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { key: 'groq', label: 'Groq', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { key: 'xai', label: 'xAI / Grok', baseURL: 'https://api.x.ai/v1', model: 'grok-3-mini' },
  { key: 'mistral', label: 'Mistral AI', baseURL: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  { key: 'moonshot', label: 'Moonshot / Kimi', baseURL: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { key: 'zhipu', label: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4.5' },
  { key: 'ollama', label: 'Ollama（本机）', baseURL: 'http://localhost:11434/v1', model: 'llama3.2' },
  { key: 'lmstudio', label: 'LM Studio（本机）', baseURL: 'http://localhost:1234/v1', model: 'local-model' },
  { key: 'custom', label: '自定义兼容接口', baseURL: '', model: '' },
]

function aiProviderPresetFor(provider) {
  if (!provider?.base_url) return 'custom'
  const normalizedURL = provider.base_url.replace(/\/$/, '')
  const match = aiProviderPresets.find((preset) => preset.baseURL && (normalizedURL === preset.baseURL || (preset.key === 'deepseek' && normalizedURL === `${preset.baseURL}/v1`)))
  return match?.key || 'custom'
}

function aiProviderPresetOptions(provider) {
  const selected = aiProviderPresetFor(provider)
  return aiProviderPresets.map((preset) => `<option value="${preset.key}" ${preset.key === selected ? 'selected' : ''}>${escapeHtml(preset.label)}</option>`).join('')
}

function aiProviderPresetLabel(provider) {
  const key = aiProviderPresetFor(provider)
  return aiProviderPresets.find((preset) => preset.key === key)?.label || '自定义兼容接口'
}

function aiModelDatalist() {
  const models = [
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini',
    'deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-v4-flash-vision-exp', 'deepseek-chat', 'deepseek-reasoner', 'qwen-plus', 'qwen-max', 'qwen-turbo',
    'deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1', 'glm-4.5',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'anthropic/claude-sonnet-4',
    'grok-3-mini', 'llama-3.3-70b-versatile', 'llama3.2', 'mistral-small-latest', 'moonshot-v1-8k',
  ]
  return `<datalist id="ai-model-presets">${models.map((model) => `<option value="${model}"></option>`).join('')}</datalist>`
}

function openAIProviderDialog(provider = null) {
  if (!aiProviderDialog || !aiProviderForm) return
  const fields = $('#ai-provider-fields')
  const editing = Boolean(provider?.id)
  $('#ai-provider-dialog-title').textContent = editing ? `编辑 AI 配置 · ${provider.name}` : '新增 AI 配置'
  $('#ai-provider-dialog-description').textContent = editing ? '留空 API Key 将保留原密钥；输入新密钥会替换旧密钥。' : '配置一个 OpenAI Chat Completions 兼容接口。远程服务必须使用 HTTPS。'
  fields.innerHTML = `${aiModelDatalist()}<div class="form-grid ai-provider-form-grid">
    <label class="form-field"><span>配置名称 <b aria-hidden="true">*</b></span><input name="name" required maxlength="100" value="${escapeHtml(provider?.name || '')}" placeholder="例如：OpenAI 主配置"><small>用于在多个接口配置中快速识别。</small></label>
    <label class="form-field"><span>接口预设</span><select name="provider_preset" data-ai-provider-preset>${aiProviderPresetOptions(provider)}</select><small>预设会填充接口地址和常用模型；全部使用 OpenAI 兼容协议。</small></label>
    <label class="form-field form-field-wide"><span>API 地址 <b aria-hidden="true">*</b></span><input name="base_url" type="url" required maxlength="500" value="${escapeHtml(provider?.base_url || 'https://api.openai.com/v1')}" placeholder="https://api.openai.com/v1"><small>只填写服务根地址，不要包含 /chat/completions、查询参数或片段；本机 HTTP 模型可用 http://localhost。</small></label>
    <label class="form-field form-field-wide"><span>API Key ${editing ? '<em>（留空保持不变）</em>' : '<b aria-hidden="true">*</b>'}</span><input name="api_key" type="password" autocomplete="new-password" maxlength="500" placeholder="${editing ? '留空保持当前密钥' : 'sk-…'}"><small>${editing && provider?.api_key_configured ? `当前密钥已配置，仅显示末四位 ·•••• ${escapeHtml(provider.api_key_last_four || '')}` : '密钥只会在服务端加密保存，永不通过 API 回显。'}</small></label>
    ${editing && provider?.api_key_configured ? '<label class="checkbox-field ai-clear-key"><input type="checkbox" name="clear_api_key"><span>清除当前 API Key（需要重新配置后才能调用远程服务）</span></label>' : ''}
    <label class="form-field"><span>默认模型 <b aria-hidden="true">*</b></span><input name="default_model" list="ai-model-presets" required maxlength="200" value="${escapeHtml(provider?.default_model || '')}" placeholder="例如：gpt-4.1-mini"><small>可从建议列表选择，也可以直接填写服务商提供的模型 ID。</small></label>
    <label class="form-field"><span>请求超时</span><select name="timeout_seconds">${[10, 20, 30, 60, 120].map((value) => `<option value="${value}" ${Number(provider?.timeout_seconds || 120) === value ? 'selected' : ''}>${value} 秒</option>`).join('')}</select><small>单次请求最长等待时间；长篇本土化建议使用 120 秒。</small></label>
    <label class="checkbox-field ai-enabled-field"><input type="checkbox" name="enabled" ${provider?.id ? (provider.enabled ? 'checked' : '') : 'checked'}><span><strong>启用此提供方</strong><small>停用后不会被后续 AI 功能调用。</small></span></label>
  </div>`
  aiProviderForm.elements.provider_preset?.addEventListener('change', (event) => {
    const preset = aiProviderPresets.find((item) => item.key === event.target.value)
    if (!preset || preset.key === 'custom') return
    const baseURL = aiProviderForm.elements.base_url
    const model = aiProviderForm.elements.default_model
    if (baseURL) baseURL.value = preset.baseURL
    if (model) model.value = preset.model
  }, { once: false })
  aiProviderForm.dataset.id = provider?.id ? String(provider.id) : ''
  aiProviderForm.dataset.version = provider?.version ? String(provider.version) : ''
  aiProviderForm.querySelector('[name="name"]')?.focus()
  $('#ai-provider-dialog-error').hidden = true
  if (typeof aiProviderDialog.showModal === 'function') aiProviderDialog.showModal()
}

async function saveAIProvider() {
  if (!aiProviderForm.reportValidity()) return
  const button = $('#save-ai-provider-button')
  const body = {
    name: aiProviderFormValue('name'), provider_type: aiProviderFormValue('provider_type') || 'openai_compatible', base_url: aiProviderFormValue('base_url'), api_key: aiProviderForm.elements.api_key?.value || '', default_model: aiProviderFormValue('default_model'), timeout_seconds: Number(aiProviderFormValue('timeout_seconds') || 120), enabled: Boolean(aiProviderForm.elements.enabled?.checked), version: Number(aiProviderForm.dataset.version || 0), clear_api_key: Boolean(aiProviderForm.elements.clear_api_key?.checked),
  }
  const id = aiProviderForm.dataset.id
  button.disabled = true
  const original = button.textContent
  button.textContent = '保存中…'
  try {
    const payload = await fetchJSON(id ? `/api/v1/system/ai/providers/${encodeURIComponent(id)}` : '/api/v1/system/ai/providers', { method: id ? 'PUT' : 'POST', body })
    aiProviderDialog.close()
    await loadRoute('settings', true)
    showToast(id ? 'AI 配置已更新' : 'AI 配置已添加')
    if (payload?.id) setTimeout(() => document.querySelector(`[data-ai-provider-id="${CSS.escape(String(payload.id))}"]`)?.scrollIntoView({ block: 'nearest' }), 0)
  } catch (error) {
    showAIProviderError(error.message || '保存 AI 配置失败')
  } finally {
    button.disabled = false
    button.textContent = original
  }
}

async function testAIProvider(provider, button) {
  if (!provider?.id) return
  button.disabled = true
  const original = button.textContent
  button.textContent = '测试中…'
  try {
    const payload = await fetchJSON(`/api/v1/system/ai/providers/${encodeURIComponent(provider.id)}/test`, { method: 'POST', body: {} })
    await loadRoute('settings', true)
    showToast(payload.ok ? 'AI 连接测试成功' : `连接测试失败：${payload.message || '请检查配置'}`)
  } catch (error) {
    showToast(error.message || '连接测试失败')
  } finally {
    button.disabled = false
    button.textContent = original
  }
}

async function deleteAIProvider(provider, button) {
  if (!provider?.id || !window.confirm(`确认删除 AI 配置“${provider.name}”吗？\n\n已分配的用途会自动清空，不会删除审计日志。`)) return
  button.disabled = true
  try {
    await fetchJSON(`/api/v1/system/ai/providers/${encodeURIComponent(provider.id)}`, { method: 'DELETE', body: { version: Number(provider.version) } })
    await loadRoute('settings', true)
    showToast('AI 配置已删除，相关用途已进入未配置状态')
  } catch (error) {
    button.disabled = false
    showToast(error.message || '删除 AI 配置失败')
  }
}

function openModuleAction(route) {
  if (route === 'content') return navigate(contentSection() === 'pages' ? '/admin/content?section=pages&editor=create&content_type=page' : '/admin/content?section=articles&editor=create&content_type=article')
  if (route === 'taxonomy') return openTaxonomyDialog().catch((error) => showToast(error.message || '栏目表单加载失败'))
  if (route === 'sites') return openEntityDialog('站点')
  if (route === 'languages') return openEntityDialog('语言')
  if (route === 'templates') return openTemplateDialog()
  if (route === 'urls') return openRedirectDialog()
  if (route === 'publishing') return openPublishingDialog()
  if (route === 'media') return openMediaUploadDialog()
  if (route === 'users') return openUserDialog().catch((error) => showToast(error.message || '用户表单加载失败'))
  if (route === 'audit') return loadRoute('audit', true)
  if (route === 'settings') return settingsSection() === 'ai' ? openAIProviderDialog() : createEncryptedBackup()
  if (route === 'seo') return loadRoute('seo', true)
  if (route === 'jobs') return navigate('/admin/publishing')
  if (route === 'localization') return navigate('/admin/content?editor=create')
  return undefined
}

async function saveSiteLanguageBinding(button) {
  const languageID = button.dataset.languageId
  const row = button.closest('[data-binding-row]')
  const themeValue = row?.querySelector(`[data-site-template-choice]:checked`)?.value ?? row?.querySelector(`select[name="theme_package_${CSS.escape(languageID)}"]`)?.value ?? ''
  const enabled = Boolean(row?.querySelector(`[data-site-template-enabled], input[name="binding_enabled_${CSS.escape(languageID)}"]`)?.checked)
  button.disabled = true
  const original = button.textContent
  button.textContent = '保存中…'
  try {
    const saved = await fetchJSON(`/api/v1/sites/${entityForm.dataset.id}/languages/${languageID}`, { method: 'PUT', body: { locale: row?.dataset.bindingLocale ?? '', enabled, theme_package_id: themeValue ? Number(themeValue) : null, version: Number(button.dataset.bindingVersion || 0) } })
    await loadSiteLanguages(entityForm.dataset.id, true)
    liveState.templates = null
    liveState.loaded.delete('templates')
    if (row) {
      row.dataset.currentTheme = themeValue
      row.dataset.currentEnabled = String(Boolean(saved.enabled))
      button.dataset.bindingVersion = String(saved.version || Number(button.dataset.bindingVersion || 0) + 1)
      const selected = row.querySelector('[data-site-template-choice]:checked')
      if (selected) updateSiteTemplatePreview(row, selected)
    }
    showToast(themeValue ? '模板绑定已保存，前台已切换' : '模板绑定已清除，前台已安全停用')
  } catch (error) {
    showEntityError(error.message || '保存语言模板绑定失败')
  } finally {
    button.textContent = original
    const selected = row?.querySelector('[data-site-template-choice]:checked')
    if (selected) updateSiteTemplatePreview(row, selected)
    else button.disabled = false
  }
}

function openMobileMenu() {
  $('#sidebar').classList.add('is-open')
  $('#mobile-overlay').hidden = false
  $('#mobile-menu-button').setAttribute('aria-expanded', 'true')
}

function closeMobileMenu() {
  $('#sidebar').classList.remove('is-open')
  $('#mobile-overlay').hidden = true
  $('#mobile-menu-button').setAttribute('aria-expanded', 'false')
}

function updateGlobalSearch(query) {
  const results = $('#search-results')
  const normalized = query.trim().toLocaleLowerCase('zh-CN')
  if (!normalized) {
    results.hidden = true
    return
  }
  const items = [
    ...navigationItems.filter((item) => can(viewPermission(item.key)) && `${item.label} ${item.description} ${item.keywords}`.toLocaleLowerCase('zh-CN').includes(normalized)),
    ...quickActions.filter((item) => can(item.permission) && `${item.label} ${item.description}`.toLocaleLowerCase('zh-CN').includes(normalized)),
  ].slice(0, 8)
  results.innerHTML = items.length ? items.map((item, index) => `<button class="search-result" type="button" role="option" aria-selected="${index === 0}" data-search-path="${escapeHtml(item.path)}" ${item.action ? `data-search-action="${item.action}"` : ''}>${icon(item.icon)}<span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.description)}</small></span></button>`).join('') : '<div class="search-empty">没有找到匹配的内容、URL或任务</div>'
  results.hidden = false
}

$('#site-switcher').addEventListener('click', () => togglePopover($('#site-switcher'), $('#site-menu')))
$('#notification-button').addEventListener('click', () => togglePopover($('#notification-button'), $('#notification-menu')))
$('#account-button').addEventListener('click', () => togglePopover($('#account-button'), $('#account-menu')))
$('#mobile-menu-button').addEventListener('click', () => $('#sidebar').classList.contains('is-open') ? closeMobileMenu() : openMobileMenu())
$('#mobile-overlay').addEventListener('click', closeMobileMenu)
entityDialog.addEventListener('close', () => {
  const deleteButton = $('#delete-entity-button')
  deleteButton.disabled = false
  deleteButton.textContent = '停用'
  entityDialog.classList.remove('dialog-form-builder')
})

localizationDialog?.addEventListener('close', () => {
	if ($('#localization-dialog-title')) $('#localization-dialog-title').textContent = 'AI 同步其他语言'
	if ($('#localization-dialog-description')) $('#localization-dialog-description').textContent = '从已发布英语内容为所有已上线模板分站生成符合当地语境的待审核版本。'
	if ($('#start-localization-button')) {
		$('#start-localization-button').hidden = false
		$('#start-localization-button').disabled = false
		$('#start-localization-button').textContent = '同步到已上线分站'
	}
})

$('#start-localization-button')?.addEventListener('click', () => { void startContentLocalization() })
$('#localization-dialog-body')?.addEventListener('click', (event) => {
	const selectAll = event.target.closest('[data-select-localization-targets]')
	if (!selectAll) return
	const inputs = $$('input[name="localization_target"]:not(:disabled)', localizationForm)
	const shouldSelect = inputs.some((input) => !input.checked)
	inputs.forEach((input) => { input.checked = shouldSelect })
	selectAll.textContent = shouldSelect ? '取消选择全部' : '选择全部可用项'
})

$('#site-menu').addEventListener('click', (event) => {
  const button = event.target.closest('[data-site-id]')
  if (!button) return
  if (String(currentSiteID()) === button.dataset.siteId) {
    closePopovers()
    return
  }
  if (contentEditorState.dirty && !window.confirm('当前内容还有未提交的修改。切换站点后本地草稿仍会保留，是否继续？')) return
  $('#current-site').textContent = button.dataset.siteName
  $('#site-switcher').dataset.siteId = button.dataset.siteId
  $$('#site-menu [data-site-id]').forEach((item) => item.setAttribute('aria-checked', String(item === button)))
  try { localStorage.setItem('czcms-site-id', button.dataset.siteId) } catch { /* storage can be unavailable */ }
  closePopovers()
  moduleState.selected.clear()
  moduleState.query = ''
  for (const route of siteScopedRoutes) {
    liveState.loaded.delete(route)
    liveState.errors.delete(route)
  }
  liveState.taxonomy = []
  contentEditorState.key = ''
  const route = currentRoute()
  if (route === 'dashboard') {
    const reloads = []
    if (can('content.read')) reloads.push(loadRoute('content', true))
    if (can('publishing.manage')) reloads.push(loadRoute('publishing', true))
    void Promise.all(reloads).then(() => renderDashboardData())
  } else if (siteScopedRoutes.has(route)) {
    if (route === 'content' && currentRouteParams().get('editor')) void renderContentEditorRoute(currentRouteParams().get('editor'))
    else void loadRoute(route, true)
  }
  showToast(`已切换到${button.dataset.siteName}，正在刷新当前站点数据`)
})

$('#global-search-input').addEventListener('input', (event) => updateGlobalSearch(event.target.value))
$('#global-search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopovers()
  if (event.key === 'Enter') $('#search-results [data-search-path]')?.click()
})
$('#search-results').addEventListener('click', (event) => {
  const item = event.target.closest('[data-search-path]')
  if (!item) return
  navigate(item.dataset.searchPath)
  $('#global-search-input').value = ''
  closePopovers()
  if (item.dataset.searchAction === 'create') window.setTimeout(() => void openModuleAction(currentRoute()), 0)
})

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    $('#global-search-input').focus()
  }
  if (event.key === 'Escape') {
    closePopovers()
    closeMobileMenu()
  }
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-switcher-wrap, .notification-wrap, .account-wrap, .global-search-wrap')) closePopovers()
  const createTarget = event.target.closest('[data-open-create]')
  if (createTarget) void openModuleAction(createTarget.dataset.openCreate === '内容' ? 'content' : createTarget.dataset.openCreate)
  const rowAction = event.target.closest('[data-row-action]')
  if (rowAction) showToast('请前往内容管理打开真实编辑器')
	const dashboardContent = event.target.closest('[data-dashboard-content]')
	if (dashboardContent) navigate('/admin/content')
})

$('#action-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-handle-task]')
  if (button) navigate(`/admin/${button.dataset.handleTask}`)
})

moduleView.addEventListener('click', (event) => {
  const retry = event.target.closest('[data-retry-module]')
  if (retry) { void loadRoute(moduleState.route, true); return }
  const seoRefresh = event.target.closest('[data-seo-refresh]')
  if (seoRefresh) { void loadRoute('seo', true); return }
  const aiCreate = event.target.closest('[data-ai-provider-create]')
  if (aiCreate) { openAIProviderDialog(); return }
  const aiRefresh = event.target.closest('[data-ai-refresh]')
  if (aiRefresh) { void loadRoute('settings', true); return }
  const aiTest = event.target.closest('[data-ai-provider-test]')
  if (aiTest) {
    const providerID = aiTest.closest('[data-ai-provider-id]')?.dataset.aiProviderId
    const provider = liveState.aiConfiguration?.providers?.find((item) => String(item.id) === String(providerID))
    void testAIProvider(provider, aiTest)
    return
  }
  const aiEdit = event.target.closest('[data-ai-provider-edit]')
  if (aiEdit) {
    const providerID = aiEdit.closest('[data-ai-provider-id]')?.dataset.aiProviderId
    const provider = liveState.aiConfiguration?.providers?.find((item) => String(item.id) === String(providerID))
    if (provider) openAIProviderDialog(provider)
    return
  }
  const aiDelete = event.target.closest('[data-ai-provider-delete]')
  if (aiDelete) {
    const providerID = aiDelete.closest('[data-ai-provider-id]')?.dataset.aiProviderId
    const provider = liveState.aiConfiguration?.providers?.find((item) => String(item.id) === String(providerID))
    void deleteAIProvider(provider, aiDelete)
    return
  }
  const filter = event.target.closest('[data-filter]')
  if (filter) {
    moduleState.filter = filter.dataset.filter
    moduleState.selected.clear()
    renderModule(moduleState.route)
    return
  }
  const contentBulkSelect = event.target.closest('[data-content-bulk-select]')
  if (contentBulkSelect) {
    const config = activeModuleConfig('content')
    const rows = selectableRowsForBulk('content', filterRows(config.rows, moduleState.query, moduleState.filter).filter((row) => rowCanBeSelected('content', row)))
    const allSelected = rows.length > 0 && rows.every((row) => moduleState.selected.has(String(row.id)))
    moduleState.selected.clear()
    if (!allSelected) rows.forEach((row) => moduleState.selected.add(String(row.id)))
    renderModule('content')
    return
  }
  if (event.target.closest('[data-clear-selection]')) {
    moduleState.selected.clear()
    renderModule(moduleState.route)
    return
  }
  const bulkDeleteSites = event.target.closest('[data-bulk-delete-sites]')
  if (bulkDeleteSites) {
    void deleteSelectedSites(bulkDeleteSites)
    return
  }
  const bulkDeleteContents = event.target.closest('[data-bulk-delete-contents]')
  if (bulkDeleteContents) {
    void deleteSelectedContents(bulkDeleteContents)
    return
  }
  const bulkUpdateStatus = event.target.closest('[data-bulk-update-status]')
  if (bulkUpdateStatus) {
    const status = $('[data-bulk-content-status]', moduleView)?.value || 'draft'
    void bulkUpdateSelectedContents({ status }, bulkUpdateStatus)
    return
  }
  const bulkUpdateCategory = event.target.closest('[data-bulk-update-category]')
  if (bulkUpdateCategory) {
    const category = $('[data-bulk-content-category]', moduleView)?.value?.trim() || ''
    void bulkUpdateSelectedContents({ category }, bulkUpdateCategory)
    return
  }
  const siteEdit = event.target.closest('[data-site-edit]')
  if (siteEdit) {
    const rowID = siteEdit.closest('tr')?.dataset.rowId
    const row = modules.sites.rows.find((item) => String(item.id) === String(rowID))
    void editRow('sites', row)
    return
  }
  const siteDelete = event.target.closest('[data-site-delete]')
  if (siteDelete) {
    const rowID = siteDelete.closest('tr')?.dataset.rowId
    const row = modules.sites.rows.find((item) => String(item.id) === String(rowID))
    void deleteSiteRow(row, siteDelete)
    return
  }
  const contentEdit = event.target.closest('[data-content-edit]')
  if (contentEdit) {
    const rowID = contentEdit.closest('tr')?.dataset.rowId
    const row = modules.content.rows.find((item) => String(item.id) === String(rowID))
    void editRow('content', row)
    return
  }
  const contentView = event.target.closest('[data-content-view]')
  if (contentView) {
    const rowID = contentView.closest('tr')?.dataset.rowId
    const row = modules.content.rows.find((item) => String(item.id) === String(rowID))
    void viewContentRow(row)
    return
  }
	const contentDelete = event.target.closest('[data-content-delete]')
  if (contentDelete) {
    const rowID = contentDelete.closest('tr')?.dataset.rowId
    const row = modules.content.rows.find((item) => String(item.id) === String(rowID))
    void deleteContentRow(row, contentDelete)
    return
  }
	const templateWorkspace = event.target.closest('[data-template-workspace]')
	const templateThemeID = templateWorkspace?.dataset.templateWorkspace
	const templateToggle = event.target.closest('[data-template-toggle]')
	if (templateToggle) {
		const rowID = templateToggle.closest('tr[data-row-id]')?.dataset.rowId
		void toggleTemplateWorkspace(rowID)
		return
	}
	if (event.target.closest('[data-template-close]')) {
		templateEditorState.expandedID = ''
		refreshModuleTable()
		return
	}
	if (event.target.closest('[data-template-retry]')) {
		void loadTemplateWorkspace(templateEditorState.expandedID, true)
		return
	}
	const templateFileButton = event.target.closest('[data-template-file]')
	if (templateFileButton && templateThemeID) {
		templateEditorState.activeByTheme.set(String(templateThemeID), templateFileButton.dataset.templateFile)
		refreshModuleTable()
		window.setTimeout(() => $(`#template-workspace-${CSS.escape(String(templateThemeID))} .template-source`, moduleView)?.focus(), 0)
		return
	}
	const templateAssetButton = event.target.closest('[data-template-asset]')
	if (templateAssetButton && templateThemeID) {
		templateEditorState.activeByTheme.set(String(templateThemeID), templateAssetButton.dataset.templateAsset)
		refreshModuleTable(); return
	}
	if (event.target.closest('[data-template-revert]') && templateThemeID) {
		const file = activeTemplateFile(templateThemeID)
		if (file) Object.assign(file, { _draft: file.content, _dirty: false, _validation: null })
		refreshModuleTable()
		showToast('已撤销当前文件的未保存修改')
		return
	}
	const templateValidate = event.target.closest('[data-template-validate]')
	if (templateValidate && templateThemeID) {
		void validateActiveTemplateFile(templateThemeID, templateValidate)
		return
	}
	const templateSave = event.target.closest('[data-template-save]')
	if (templateSave && templateThemeID) {
		void saveActiveTemplateFile(templateThemeID, templateSave)
		return
	}
	const templateDetails = event.target.closest('[data-template-details]')
	if (templateDetails) {
		const rowID = templateDetails.closest('tr')?.dataset.rowId
		const row = modules.templates.rows.find((item) => String(item.id) === String(rowID))
		if (row?._raw) openTemplateDetails(row._raw)
		return
	}
	const taxonomyEdit = event.target.closest('[data-taxonomy-edit]')
	if (taxonomyEdit) {
		const row = modules.taxonomy.rows.find((item) => String(item.id) === String(taxonomyEdit.closest('tr')?.dataset.rowId))
		if (row?._raw) void editRow('taxonomy', row)
		return
	}
	const taxonomyDisable = event.target.closest('[data-taxonomy-disable]')
	if (taxonomyDisable) {
		const row = modules.taxonomy.rows.find((item) => String(item.id) === String(taxonomyDisable.closest('tr')?.dataset.rowId))
		void disableTaxonomyRow(row, taxonomyDisable)
		return
	}
	const mediaEdit = event.target.closest('[data-media-edit]')
	if (mediaEdit) {
		const row = modules.media.rows.find((item) => String(item.id) === String(mediaEdit.closest('tr')?.dataset.rowId))
		if (row?._raw) openMediaEditDialog(row._raw)
		return
	}
	const mediaDelete = event.target.closest('[data-media-delete]')
	if (mediaDelete) {
		const row = modules.media.rows.find((item) => String(item.id) === String(mediaDelete.closest('tr')?.dataset.rowId))
		void deleteMediaRow(row, mediaDelete)
		return
	}
	const userEdit = event.target.closest('[data-user-edit]')
	if (userEdit) {
		const row = modules.users.rows.find((item) => String(item.id) === String(userEdit.closest('tr')?.dataset.rowId))
		if (row?._raw) void openUserDialog(row._raw).catch((error) => showToast(error.message || '用户权限表单加载失败'))
		return
	}
	const auditView = event.target.closest('[data-audit-view]')
	if (auditView) {
		const row = modules.audit.rows.find((item) => String(item.id) === String(auditView.closest('tr')?.dataset.rowId))
		if (row?._raw) openAuditDetails(row._raw)
		return
	}
	const localizationDetails = event.target.closest('[data-localization-details]')
	if (localizationDetails) {
		const row = modules.localization.rows.find((item) => String(item.id) === String(localizationDetails.closest('tr')?.dataset.rowId))
		if (row?._raw) openLocalizationJobDetails(row._raw)
		return
	}
	const templateRow = event.target.closest('tr[data-template-row]')
	if (templateRow && !event.target.closest('button, a, input, select, textarea, label')) {
		void toggleTemplateWorkspace(templateRow.dataset.rowId)
		return
	}
  const rowButton = event.target.closest('[data-row-menu]')
  if (rowButton) {
    const rowID = rowButton.closest('tr')?.dataset.rowId
    const row = modules[moduleState.route].rows.find((item) => String(item.id) === String(rowID))
    void editRow(moduleState.route, row)
    return
  }
  const primary = event.target.closest('[data-module-primary]')
  if (primary) {
    const config = activeModuleConfig()
    if (!config) return
    void openModuleAction(moduleState.route)
    return
  }
})

moduleView.addEventListener('input', (event) => {
	if (event.target.matches('[data-template-source]')) {
		const workspace = event.target.closest('[data-template-workspace]')
		const themeID = workspace?.dataset.templateWorkspace
		const file = activeTemplateFile(themeID)
		if (!workspace || !file) return
		file._draft = event.target.value
		file._dirty = file._draft !== file.content
		file._validation = null
		updateTemplateEditorMetrics(workspace, file._draft)
		const state = $('[data-template-save-state]', workspace)
		if (state) { state.classList.toggle('is-dirty', file._dirty); state.innerHTML = `<i></i>${file._dirty ? '有未保存修改' : '全部修改已保存'}` }
		const saveButton = $('[data-template-save]', workspace)
		const revertButton = $('[data-template-revert]', workspace)
		if (saveButton) saveButton.disabled = !file._dirty
		if (revertButton) revertButton.disabled = !file._dirty
		return
	}
	if (event.target.matches('[data-template-change-note]')) {
		const themeID = event.target.closest('[data-template-workspace]')?.dataset.templateWorkspace
		if (themeID) templateEditorState.changeNotes.set(String(themeID), event.target.value)
		return
	}
	if (event.target.matches('[data-module-search]')) {
		moduleState.query = event.target.value
		moduleState.selected.clear()
		refreshModuleTable()
	}
})

moduleView.addEventListener('keydown', (event) => {
	if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's' || !event.target.matches('[data-template-source]')) return
	event.preventDefault()
	const workspace = event.target.closest('[data-template-workspace]')
	const saveButton = $('[data-template-save]', workspace)
	if (workspace && saveButton && !saveButton.disabled) void saveActiveTemplateFile(workspace.dataset.templateWorkspace, saveButton)
})

moduleView.addEventListener('scroll', (event) => {
	if (!event.target.matches?.('[data-template-source]')) return
	const lineNumbers = $('.template-line-numbers', event.target.closest('.template-code-shell'))
	if (lineNumbers) lineNumbers.scrollTop = event.target.scrollTop
}, true)

moduleView.addEventListener('change', (event) => {
  if (event.target.matches('[data-content-scope]')) {
    moduleState.contentScope = event.target.value === 'all' ? 'all' : 'current'
    moduleState.selected.clear()
    liveState.loaded.delete('content')
    void loadRoute('content', true)
    return
  }
  if (event.target.matches('[data-select-row]')) {
    if (event.target.checked && moduleState.route === 'content' && !moduleState.selected.has(event.target.value) && moduleState.selected.size >= contentBulkSelectionLimit) {
      event.target.checked = false
      showToast(`批量操作每次最多选择 ${contentBulkSelectionLimit} 个语言版本`)
      return
    }
    event.target.checked ? moduleState.selected.add(event.target.value) : moduleState.selected.delete(event.target.value)
    refreshModuleTable()
  }
  if (event.target.matches('[data-select-all]')) {
    const config = activeModuleConfig()
    const rows = selectableRowsForBulk(moduleState.route, filterRows(config.rows, moduleState.query, moduleState.filter).filter((row) => rowCanBeSelected(moduleState.route, row)))
    moduleState.selected.clear()
    if (event.target.checked) rows.forEach((row) => moduleState.selected.add(String(row.id)))
    renderModule(moduleState.route)
  }
})

moduleView.addEventListener('change', (event) => {
  const toggle = event.target.closest('[data-ai-provider-toggle]')
  if (!toggle) return
  const providerID = toggle.closest('[data-ai-provider-id]')?.dataset.aiProviderId
  const provider = liveState.aiConfiguration?.providers?.find((item) => String(item.id) === String(providerID))
  if (!provider) return
  void (async () => {
    toggle.disabled = true
    try {
      await fetchJSON(`/api/v1/system/ai/providers/${encodeURIComponent(provider.id)}`, { method: 'PUT', body: { name: provider.name, provider_type: provider.provider_type, base_url: provider.base_url, default_model: provider.default_model, timeout_seconds: provider.timeout_seconds, enabled: toggle.checked, version: Number(provider.version) } })
      await loadRoute('settings', true)
      showToast(toggle.checked ? 'AI 提供方已启用' : 'AI 提供方已停用')
    } catch (error) {
      toggle.checked = provider.enabled
      toggle.disabled = false
      showToast(error.message || '更新 AI 提供方状态失败')
    }
  })()
})

$('#entity-fields').addEventListener('change', async (event) => {
  const route = entityForm.dataset.route
	if (route === 'forms') {
		const item = event.target.closest('[data-builder-item]')
		if (item) {
			updateContactBuilderSummary(item)
			if (event.target.matches('[data-builder-prop="type"]')) updateContactBuilderOptions(item)
		}
		if (event.target.name === 'submit_label') updateContactBuilderSubmitLabel()
	}
	if (route === 'form-submissions' && event.target.matches('[data-form-submission-status]')) {
		const row = event.target.closest('[data-form-submission-id]')
		const submissionID = Number(row?.dataset.formSubmissionId || 0)
		const previous = event.target.dataset.previousStatus || ''
		if (!submissionID) return
		event.target.disabled = true
		try {
			await fetchJSON(`/api/v1/forms/submissions/${encodeURIComponent(submissionID)}`, { method: 'PUT', body: { status: event.target.value } })
			event.target.dataset.previousStatus = event.target.value
			showToast('询盘状态已更新')
		} catch (error) {
			if (previous) event.target.value = previous
			showEntityError(error.message || '询盘状态更新失败')
		} finally { event.target.disabled = false }
		return
	}
  if (route === 'sites' && event.target.matches('[data-site-favicon-input]')) {
    const file = event.target.files?.[0]
    if (file) await uploadSiteFavicon(file)
    event.target.value = ''
    return
  }
  if (route === 'sites' && event.target.matches('[data-site-language-select]')) {
    selectSiteTemplateLanguage(event.target.value)
    return
  }
  if (route === 'sites' && event.target.matches('[data-site-create-template-choice]')) {
    updateSiteCreateTemplateSelection(event.target)
    return
  }
  if (route === 'sites' && event.target.matches('[data-site-template-choice], [data-site-template-enabled]')) {
    const workbench = event.target.closest('[data-binding-row]')
    const choice = event.target.matches('[data-site-template-choice]') ? event.target : workbench?.querySelector('[data-site-template-choice]:checked')
    updateSiteTemplatePreview(workbench, choice)
    return
  }
  if (route === 'taxonomy' && ['kind', 'locale'].includes(event.target.name)) {
	const parent = entityForm.elements.parent_id
	if (parent) {
		const isTag = formValue(entityForm, 'kind') === 'tag'
		const siteID = Number(formValue(entityForm, 'site_id') || 0)
		const localeValue = formValue(entityForm, 'locale')
		const current = parent.value
		const options = liveState.taxonomy.filter((term) => term.kind === 'category' && term.status === 'active' && Number(term.site_id) === siteID && term.locale === localeValue && String(term.id) !== String(entityForm.dataset.id))
		parent.innerHTML = `<option value="">无上级栏目</option>${options.map((term) => `<option value="${escapeHtml(term.id)}">${escapeHtml(term.name)}</option>`).join('')}`
		if (options.some((term) => String(term.id) === current)) parent.value = current
		parent.disabled = isTag
	}
	return
  }
  if (!['content', 'urls', 'publishing', 'taxonomy'].includes(route) || event.target.name !== 'site_id') return
  const localeSelect = entityForm.elements.locale
  if (!localeSelect) return
  localeSelect.disabled = true
  try {
    const bindings = await loadSiteLanguages(event.target.value)
    localeSelect.innerHTML = bindings.filter((item) => item.enabled).map((item) => `<option value="${escapeHtml(item.locale)}">${escapeHtml(item.language_name)} / ${escapeHtml(item.locale)}</option>`).join('')
	if (route === 'taxonomy') localeSelect.dispatchEvent(new Event('change', { bubbles: true }))
  } catch (error) {
    const box = $('#entity-dialog-error')
    box.textContent = error.message || '读取站点语言失败'
    box.hidden = false
  } finally {
    localeSelect.disabled = false
  }
})

$('#entity-fields').addEventListener('input', (event) => {
  if (event.target.matches('[data-richtext]')) {
    updateEditorCharCount(event.target)
    refreshEditorPreview()
  }
  if (entityForm.dataset.route === 'sites' && (event.target.name === 'seo_title' || event.target.name === 'seo_description')) {
    updateContentPageCount(entityForm, event.target.name, event.target.name === 'seo_description' ? 500 : 200)
  }
  if (entityForm.dataset.route === 'forms') {
    const item = event.target.closest('[data-builder-item]')
    if (item) updateContactBuilderSummary(item)
    if (event.target.name === 'submit_label') updateContactBuilderSubmitLabel()
  }
})

$('#entity-fields').addEventListener('keydown', (event) => {
  const tab = event.target.closest('[data-site-editor-tab]')
  if (!tab || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  const tabs = $$('[data-site-editor-tab]', entityForm)
  if (!tabs.length) return
  event.preventDefault()
  let next = tabs.indexOf(tab)
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = tabs.length - 1
  else next = (next + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  tabs[next].focus()
  tabs[next].click()
})

$('#entity-fields').addEventListener('click', (event) => {
  if (entityForm.dataset.route === 'forms') {
    const add = event.target.closest('[data-builder-add]')
    if (add) { addContactBuilderItem(add.dataset.builderAdd || 'text', null, add.dataset.builderLabel || ''); return }
    const item = event.target.closest('[data-builder-item]')
    if (item && event.target.closest('[data-builder-remove]')) { item.remove(); updateContactBuilderEmpty(); return }
    if (item && event.target.closest('[data-builder-move-up]')) { const previous = item.previousElementSibling; if (previous?.matches('[data-builder-item]')) previous.before(item); updateContactBuilderEmpty(); return }
    if (item && event.target.closest('[data-builder-move-down]')) { const next = item.nextElementSibling; if (next?.matches('[data-builder-item]')) next.after(item); updateContactBuilderEmpty(); return }
  }
  const editorTab = event.target.closest('[data-site-editor-tab]')
  if (editorTab) {
    const key = editorTab.dataset.siteEditorTab
    $$('[data-site-editor-tab]', entityForm).forEach((tab) => {
      const active = tab === editorTab
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
    })
    $$('[data-site-editor-panel]', entityForm).forEach((panel) => { panel.hidden = panel.dataset.siteEditorPanel !== key })
    return
  }
  const languageShortcut = event.target.closest('[data-site-language-tab]')
  if (languageShortcut) {
    const languageID = languageShortcut.dataset.siteLanguageTab
    $$('.site-language-card', entityForm).forEach((card) => card.setAttribute('aria-pressed', String(card === languageShortcut)))
    const templateTab = $('[data-site-editor-tab="template"]', entityForm)
    templateTab?.click()
    selectSiteTemplateLanguage(languageID)
    return
  }
  const localeTab = event.target.closest('[data-site-locale-tab]')
  if (localeTab) {
    const languageID = String(localeTab.dataset.siteLocaleTab)
    const tabs = localeTab.closest('[role="tablist"]')
    tabs?.querySelectorAll('[data-site-locale-tab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab === localeTab)))
    $$('[data-binding-row]', entityForm).forEach((workbench) => { workbench.hidden = String(workbench.dataset.bindingRow) !== languageID })
    return
  }
  const faviconUpload = event.target.closest('[data-site-favicon-upload]')
  if (faviconUpload) {
    $('[data-site-favicon-input]', entityForm)?.click()
    return
  }
  if (event.target.closest('[data-site-favicon-clear]')) {
    clearSiteFavicon()
    return
  }
  const editorCommand = event.target.closest('[data-editor-command]')
  if (editorCommand) { runEditorCommand(editorCommand.dataset.editorCommand); return }
  if (event.target.closest('[data-go-sites]')) { entityDialog.close(); navigate('/admin/sites'); return }
  const compareRevision = event.target.closest('[data-revision-compare]')
  if (compareRevision) {
    const diff = compareRevision.closest('.revision-item')?.querySelector('.revision-diff')
    if (!diff) return
    diff.hidden = !diff.hidden
    compareRevision.setAttribute('aria-expanded', String(!diff.hidden))
    compareRevision.textContent = diff.hidden ? '对比当前' : '收起对比'
    return
  }
  const restoreRevisionButton = event.target.closest('[data-revision-restore]')
  if (restoreRevisionButton) { void restoreRevision(restoreRevisionButton); return }
  const binding = event.target.closest('[data-save-binding]')
  if (binding) { void saveSiteLanguageBinding(binding); return }
  const add = event.target.closest('[data-add-domain]')
  if (add) { void addSiteDomain(); return }
  const check = event.target.closest('[data-check-domain]')
  if (check) { void checkSiteDomain(check.dataset.checkDomain, check); return }
  const primary = event.target.closest('[data-primary-domain]')
  if (primary) { void makePrimaryDomain(primary.dataset.primaryDomain, Number(primary.dataset.domainVersion), primary.dataset.domainHostname, primary); return }
  const remove = event.target.closest('[data-delete-domain]')
  if (remove) void deleteSiteDomain(remove.dataset.deleteDomain, Number(remove.dataset.domainVersion), remove)
})

$('#entity-fields').addEventListener('dragstart', (event) => {
  if (entityForm.dataset.route !== 'forms') return
  const palette = event.target.closest('[data-builder-add]')
  const dragHandle = event.target.closest('.contact-builder-drag')
  const item = dragHandle?.closest('[data-builder-item]')
  if (!palette && !item) return
  event.dataTransfer?.setData('text/plain', palette?.dataset.builderAdd || item?.dataset.fieldKey || '')
  if (item) item.classList.add('is-dragging')
  event.dataTransfer && (event.dataTransfer.effectAllowed = palette ? 'copy' : 'move')
})

$('#entity-fields').addEventListener('dragover', (event) => {
  if (entityForm.dataset.route !== 'forms' || !event.target.closest('[data-builder-canvas]')) return
  event.preventDefault()
  const item = event.target.closest('[data-builder-item]')
  $$('[data-builder-item].is-drop-target', entityForm).forEach((node) => node.classList.remove('is-drop-target'))
  if (item && !item.classList.contains('is-dragging')) item.classList.add('is-drop-target')
})

$('#entity-fields').addEventListener('drop', (event) => {
  if (entityForm.dataset.route !== 'forms') return
  const canvas = event.target.closest('[data-builder-canvas]')
  if (!canvas) return
  event.preventDefault()
  const dragged = $('[data-builder-item].is-dragging', entityForm)
  const target = event.target.closest('[data-builder-item]')
  const type = event.dataTransfer?.getData('text/plain') || 'text'
  if (dragged) {
    if (target && target !== dragged) (event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2 ? target.before(dragged) : target.after(dragged))
  } else addContactBuilderItem(type, target)
  $$('[data-builder-item].is-dragging, [data-builder-item].is-drop-target', entityForm).forEach((node) => node.classList.remove('is-dragging', 'is-drop-target'))
  updateContactBuilderEmpty()
})

$('#entity-fields').addEventListener('dragend', () => {
  if (entityForm.dataset.route !== 'forms') return
  $$('[data-builder-item].is-dragging, [data-builder-item].is-drop-target', entityForm).forEach((node) => node.classList.remove('is-dragging', 'is-drop-target'))
})

contentEditorView.addEventListener('click', (event) => {
	const contactAction = event.target.closest('[data-contact-action]')
	if (contactAction) {
		const command = contactAction.dataset.contactAction
		if (command === 'ensure') { void submitContentEditor(); return }
		if (command === 'edit') {
			void fetchJSON(`/api/v1/forms/${encodeURIComponent(contactAction.dataset.contactFormId || '')}`).then((payload) => openContactFormDialog(contentEditorState.item, payload)).catch((error) => showToast(error.message || '读取表单失败'))
			return
		}
		if (command === 'submissions') { void openContactFormSubmissions(contentEditorState.item, Number(contactAction.dataset.contactFormId || 0)).catch((error) => showToast(error.message || '读取询盘失败')); return }
		if (command === 'refresh') { contentEditorState.key = ''; void renderContentEditorRoute('edit'); return }
	}
  const preset = event.target.closest('[data-page-preset]')
  if (preset) {
    const form = $('#content-editor-form', contentEditorView)
    if (!form) return
    if (form.elements.title) form.elements.title.value = preset.dataset.pageTitle || ''
    if (form.elements.slug && preset.dataset.pageSlug) form.elements.slug.value = preset.dataset.pageSlug
    if (form.elements.category) form.elements.category.value = preset.dataset.pageCategory || ''
    if (form.elements.page_layout && preset.dataset.pageLayout) form.elements.page_layout.value = preset.dataset.pageLayout
    if (form.elements.template_key) form.elements.template_key.value = preset.dataset.pageTemplate || ''
    if (form.elements.index_policy) form.elements.index_policy.value = preset.dataset.pageIndexPolicy || 'noindex'
    updateContentPageCount(form, 'title', 60)
    updateContentPagePreview(form)
    updateContentPageChecks(form)
    saveLocalContentDraft(form)
    form.querySelector('[data-rich-editor]')?.focus()
    showToast(`已套用“${preset.dataset.pageTitle}”页面预设，可继续修改`)
    return
  }
  const retry = event.target.closest('[data-editor-retry]')
  if (retry) { contentEditorState.key = ''; void renderContentEditorRoute(currentRouteParams().get('editor') || 'create'); return }
  const action = event.target.closest('[data-content-action]')
  if (action) {
    const command = action.dataset.contentAction
    if (command === 'save') { void submitContentEditor('draft'); return }
    if (command === 'review') { void submitContentEditor('review'); return }
    if (command === 'publish') { void submitContentEditor('published'); return }
    if (command === 'preview') {
      const form = $('#content-editor-form', contentEditorView)
      const frame = form?.querySelector('[data-rich-preview]')
      const visual = form?.querySelector('[data-rich-editor]')
      if (!frame || !visual) return
      syncVisualEditor(form, 'visual')
      frame.hidden = !frame.hidden
      visual.hidden = !frame.hidden
      action.setAttribute('aria-pressed', String(!frame.hidden))
      if (!frame.hidden) frame.srcdoc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>body{font:16px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#1f2b3d;max-width:72ch;margin:30px auto;padding:0 24px}img{max-width:100%;height:auto}a{color:#1459c7}h2{margin-top:1.5em}</style></head><body>${form.elements.body_html.value}</body></html>`
      return
    }
    if (command === 'slug') {
      const form = $('#content-editor-form', contentEditorView)
      if (form?.elements.slug) { form.elements.slug.value = contentEditorSlug(contentEditorFormValue(form, 'title')); updateContentPagePreview(form); saveLocalContentDraft(form) }
      return
    }
    if (command === 'localize') { void openContentLocalizationDialog(); return }
    if (command === 'revisions') { void openRevisionHistory(contentEditorState.item).catch((error) => showToast(error.message || '读取版本历史失败')); return }
    if (command === 'media') { void openMediaUploadDialog('content-cover'); return }
    if (command === 'cover-remove') { clearContentCover(); return }
    if (command === 'seo-extract') { void extractContentSEO($('#content-editor-form', contentEditorView), action); return }
  }
  const richCommand = event.target.closest('[data-rich-command]')
  if (richCommand) { runContentRichCommand($('#content-editor-form', contentEditorView), richCommand.dataset.richCommand); return }
  const removeTag = event.target.closest('[data-remove-tag]')
  if (removeTag) {
    const form = $('#content-editor-form', contentEditorView)
    const tags = normalizeTags(form?.elements?.tags?.value).filter((tag) => tag.toLocaleLowerCase('zh-CN') !== removeTag.dataset.removeTag.toLocaleLowerCase('zh-CN'))
    if (form?.elements?.tags) form.elements.tags.value = tags.join(', ')
    renderContentTags(form)
    saveLocalContentDraft(form)
  }
})

contentEditorView.addEventListener('mousedown', (event) => {
  if (!event.target.closest('[data-rich-command="insertImage"]')) return
  rememberRichSelection($('#content-editor-form', contentEditorView))
})

contentEditorView.addEventListener('paste', (event) => {
  const visual = event.target.closest?.('[data-rich-editor]')
  if (!visual) return
  handleRichPaste(event, $('#content-editor-form', contentEditorView))
})

contentEditorView.addEventListener('keydown', (event) => {
  const entry = event.target.closest('[data-tag-entry]')
  if (entry && (event.key === 'Enter' || event.key === ',' || event.key === '，')) {
    event.preventDefault()
    addContentTag($('#content-editor-form', contentEditorView), entry.value)
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void submitContentEditor('draft')
  }
})

contentEditorView.addEventListener('change', async (event) => {
  const form = $('#content-editor-form', contentEditorView)
  if (!form) return
  if (event.target.matches('[data-rich-image-input]')) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void uploadRichImage(form, file, contentEditorState.richSelection)
    return
  }
  if (event.target.matches('[data-tag-entry]')) {
    commitPendingContentTag(form)
    return
  }
  updateContentPagePreview(form)
  updateContentPageChecks(form)
  saveLocalContentDraft(form)
  if (event.target.name === 'locale') {
    form.dataset.locale = event.target.value
    refreshContentTaxonomySuggestions(form)
    return
  }
  if (event.target.name !== 'site_id') return
  const locale = form.elements.locale
  if (!locale) return
  locale.disabled = true
  try {
    const bindings = await loadSiteLanguages(event.target.value)
    locale.innerHTML = bindings.filter((item) => item.enabled).map((item) => `<option value="${escapeHtml(item.locale)}">${escapeHtml(item.language_name)} / ${escapeHtml(item.locale)}</option>`).join('')
    form.dataset.siteId = event.target.value
    form.dataset.locale = locale.value
    refreshContentTaxonomySuggestions(form)
    updateContentPagePreview(form)
    updateContentPageChecks(form)
    saveLocalContentDraft(form)
  } catch (error) {
    const box = $('#content-page-error', contentEditorView)
    box.textContent = error.message || '读取站点语言失败'
    box.hidden = false
    box.focus()
  } finally {
    locale.disabled = false
  }
})

contentEditorView.addEventListener('focusout', (event) => {
  if (!event.target.matches?.('[data-tag-entry]')) return
  commitPendingContentTag($('#content-editor-form', contentEditorView))
})

contentEditorView.addEventListener('input', (event) => {
  const form = $('#content-editor-form', contentEditorView)
  if (!form) return
  if (event.target.matches('[data-tag-entry]') && !event.isComposing && /[,，]/.test(event.target.value)) {
    addContentTag(form, event.target.value)
    return
  }
  if (event.target.matches('[data-rich-editor]')) syncVisualEditor(form, 'visual')
  if (event.target.matches('[data-rich-source]')) syncVisualEditor(form, 'source')
  if (event.target.name === 'title' && !contentEditorFormValue(form, 'slug')) form.elements.slug.value = contentEditorSlug(event.target.value)
  const limit = event.target.name === 'title' || event.target.name === 'seo_title'
    ? 60
    : event.target.name === 'summary'
      ? 500
      : event.target.name === 'meta_description'
        ? 160
        : event.target.name === 'body_html'
          ? '200,000'
          : null
  if (limit) updateContentPageCount(form, event.target.name, limit)
  updateContentPagePreview(form)
  updateContentPageChecks(form)
  saveLocalContentDraft(form)
  if (['title', 'summary', 'body_html', 'tags'].includes(event.target.name) && form.elements.seo_title && contentEditorFormValue(form, 'title')) {
    if (contentEditorState.seoTimer) window.clearTimeout(contentEditorState.seoTimer)
    contentEditorState.seoTimer = window.setTimeout(() => {
      if (contentEditorFormValue(form, 'title') && (!contentEditorFormValue(form, 'meta_description') || !contentEditorFormValue(form, 'primary_keyword'))) void extractContentSEO(form, undefined, { silent: true })
    }, 900)
  }
})

contentEditorView.addEventListener('submit', (event) => {
  event.preventDefault()
  void submitContentEditor('draft')
})

entityForm.addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return
  event.preventDefault()
  if (!entityForm.reportValidity()) return
  void submitEntity()
})

aiProviderForm?.addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return
  event.preventDefault()
  void saveAIProvider()
})

aiProviderDialog?.addEventListener('close', () => {
  aiProviderForm?.reset()
  if (aiProviderForm) { aiProviderForm.dataset.id = ''; aiProviderForm.dataset.version = '' }
  const error = $('#ai-provider-dialog-error')
  if (error) { error.hidden = true; error.textContent = '' }
})

$('#delete-entity-button').addEventListener('click', () => void deleteEntity())
$('#add-locale-button').addEventListener('click', () => void openLocaleDialog())
$('#content-review-button').addEventListener('click', () => void submitEntity('review'))
$('#content-publish-button').addEventListener('click', () => void submitEntity('published'))
window.addEventListener('hashchange', applyRoute)

async function bootstrap() {
  try {
    const me = await fetchJSON('/api/v1/auth/me')
		liveState.me = me
    liveState.csrfToken = me.csrf_token || liveState.csrfToken
    liveState.permissions = new Set(me.permissions ?? [])
		applyNavigationPermissions()
		await loadRoute('sites')
		const initialRoutes = ['languages']
		if (can('content.read')) initialRoutes.push('content')
		if (can('publishing.manage')) initialRoutes.push('publishing')
		if (can('system.view')) initialRoutes.push('settings')
    await Promise.all(initialRoutes.map((route) => loadRoute(route)))
		renderDashboardData()
  } catch (error) {
    if (error.status !== 401) showToast(error.message || '后台初始化失败')
  } finally {
    applyRoute()
  }
}

if (!location.hash) history.replaceState(null, '', '#/admin')
applyRoute()
void bootstrap()
