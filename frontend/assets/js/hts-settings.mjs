export function mountHTSSettings(root, { fetchJSON, can, escapeHtml: esc, formatDate, tabs }) {
  const shell = document.createElement('div')
  shell.className = 'hts-admin'
  root.replaceChildren(shell)
  let state = null, notification = null, busy = false, timer
  const header = `<div class="page-heading"><div><h1 id="module-title">美国 HTS 税则数据</h1><p>管理官方税则版本、每月自动更新及异常通知。</p></div></div>${tabs}`
  const statuses = { pending: '已加入邮件队列', sending: '正在发送', sent: '已发送', failed: '发送失败' }
  function render(message = '', error = false) {
    if (!shell.isConnected) { clearTimeout(timer); return }
    if (!can('system.manage')) { shell.innerHTML = header + '<p>当前账号没有管理税则数据的权限。</p>'; return }
    if (!state) { shell.innerHTML = header + `<p role="${error ? 'alert' : 'status'}">${esc(message || '正在读取税则数据…')}</p><button class="button button-secondary" data-hts-refresh>重新加载</button>`; return }
    shell.innerHTML = `${header}<section class="panel hts-admin-panel"><header><div><h2>当前服务版本</h2><p>${state.running ? '正在从 USITC 下载及校验。完成前继续使用当前版本。' : state.lastError ? '最近一次更新失败，已保留当前版本继续提供查询。' : '当前数据已导入本地检索索引。'}</p></div><div class="hts-admin-actions"><button class="button button-secondary" data-hts-refresh ${busy ? 'disabled' : ''}>刷新状态</button><button class="button button-primary" data-hts-sync ${busy || state.running ? 'disabled' : ''}>${state.running ? '正在更新…' : '立即检查并更新'}</button></div></header><dl class="hts-admin-facts"><div><dt>官方版本</dt><dd>${esc(state.label)}</dd></div><div><dt>版本生效日期</dt><dd>${esc(state.effectiveDate)}</dd></div><div><dt>10 位编码数量</dt><dd>${Number(state.entries).toLocaleString('zh-CN')}</dd></div><div><dt>最近核对官方数据</dt><dd>${esc(formatDate(state.retrievedAt))}</dd></div><div><dt>最近更新尝试</dt><dd>${esc(state.lastAttemptAt ? formatDate(state.lastAttemptAt) : '当前版本来自已核对的初始快照')}</dd></div><div><dt>自动更新</dt><dd>${state.autoSync ? `每月 1 日 02:00（${esc(state.timezone)}）` : '当前运行配置已关闭自动更新'}</dd></div><div><dt>下次定时检查</dt><dd>${state.autoSync ? esc(formatDate(state.nextSync)) : '已暂停'}</dd></div><div><dt>更新失败通知</dt><dd>${esc(notification.recipient || '尚未配置收件邮箱')} · ${notification.enabled ? 'SMTP 已启用' : 'SMTP 未启用，报警邮件将等待发送'}${state.alertStatus ? `<small>最近报警：${esc(statuses[state.alertStatus] || state.alertStatus)}</small>` : ''}</dd></div></dl>${state.lastError ? `<p class="hts-admin-error" role="alert"><strong>更新失败原因：</strong>${esc(state.lastError)}</p>` : ''}${state.alertError ? `<p class="hts-admin-error" role="alert">报警入队失败：${esc(state.alertError)}</p>` : ''}<p class="hts-admin-message" role="${error ? 'alert' : 'status'}">${esc(message)}</p></section><section class="hts-admin-help"><h2>更新与告警规则</h2><p>从官方完整导出重新生成检索数据，校验版本、记录数、章节覆盖和重复编码后，在一个事务中整体切换。下载异常或校验不通过时保留旧数据，一小时后重试；停机错过定时任务会在下次运行时补查。</p><p>同一更新月份的失败报警只入队一次，使用后台邮件转发中配置的收件邮箱和 SMTP。发信失败自动重试，最多 5 次。<a href="#/admin/settings?section=smtp">查看邮件配置</a></p><a href="/preview/global/tools/hts-code-lookup" target="_blank" rel="noopener">打开美国编码查询预览</a> · <a href="https://hts.usitc.gov/" target="_blank" rel="noopener noreferrer">打开 USITC 官方税则</a></section>`
  }
  async function load(message = '') {
    if (!shell.isConnected) return
    clearTimeout(timer)
    busy = true; render(message)
    try { const data = await fetchJSON('/api/v1/system/hts'); state = data.status; notification = data.notification; busy = false; render(message); if (state.running && shell.isConnected) timer = setTimeout(() => load(), 2500) }
    catch (err) { busy = false; render(err.message, true) }
  }
  shell.addEventListener('click', async event => {
    if (event.target.closest('[data-hts-refresh]')) { void load(); return }
    if (!event.target.closest('[data-hts-sync]') || busy || state?.running) return
    busy = true; render()
    try { const result = await fetchJSON('/api/v1/system/hts/sync', { method: 'POST', body: {} }); await load(result.message) }
    catch (err) { busy = false; render(err.message, true) }
  })
  render(); if (can('system.manage')) void load()
}
