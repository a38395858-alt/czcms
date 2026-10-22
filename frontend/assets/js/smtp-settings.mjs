export function mountSMTPSettings(root, { fetchJSON, can, escapeHtml: esc, formatDate, tabs }) {
  const shell = document.createElement('div')
  shell.className = 'smtp-settings'
  root.replaceChildren(shell)
  if (!can('system.manage')) {
    shell.innerHTML = `<div class="page-heading"><div><h1>邮件转发</h1><p>当前账号没有管理邮件配置的权限，请联系系统管理员。</p></div></div>${tabs}`
    return
  }
  let settings = null, deliveries = [], total = 0, offset = 0, busy = false, dirty = false, listError = '', listSequence = 0
  const statuses = { pending: '等待发送', sending: '发送中', sent: '已发送', failed: '发送失败' }
  const header = () => `<div class="page-heading smtp-heading"><div><h1 id="module-title">邮件转发</h1><p>访客提交表单后，将完整内容发送到指定邮箱。</p></div></div>${tabs}`
  const field = (key, label, type = 'text', hint = '', extra = '') => `<label class="smtp-field" for="smtp-${key}"><span>${label}</span><input id="smtp-${key}" name="${key}" type="${type}" value="${esc(settings[key] ?? '')}" ${extra}>${hint ? `<small>${hint}</small>` : ''}</label>`
  function notice(text = '', error = false) {
    const target = shell.querySelector('[data-smtp-message]')
    if (!target) return
    target.textContent = text
    target.classList.toggle('smtp-error', error)
    target.setAttribute('role', error ? 'alert' : 'status')
  }
  function updateActions() {
    shell.querySelectorAll('[data-smtp-save]').forEach(button => { button.disabled = busy })
    const test = shell.querySelector('[data-smtp-test]')
    if (test) test.disabled = busy || dirty || (!settings?.password_configured && Boolean(settings?.username))
    shell.querySelector('form')?.setAttribute('aria-busy', String(busy))
    shell.querySelectorAll('form input, form select').forEach(input => { input.disabled = busy })
  }
  function render() {
    shell.innerHTML = `${header()}
      <form id="smtp-configuration" class="smtp-configuration">
        <section class="smtp-section" aria-labelledby="smtp-forward-title">
          <div class="smtp-section-intro"><h2 id="smtp-forward-title">表单通知</h2><p>适用于首页、专题页、联系页面及资源订阅表单。表单原始记录同时保留在后台收件箱。</p></div>
          <div class="smtp-fields">
            ${field('recipient', '收件邮箱', 'email', '所有开启通知的表单都会转发到此邮箱。', 'required maxlength="254" autocomplete="off"')}
            <label class="smtp-toggle" for="smtp-enabled"><input id="smtp-enabled" name="enabled" type="checkbox" ${settings.enabled ? 'checked' : ''}><span><strong>启用邮件转发</strong><small>保存后对新提交生效；关闭后暂停发送队列。</small></span></label>
          </div>
        </section>
        <section class="smtp-section" aria-labelledby="smtp-server-title">
          <div class="smtp-section-intro"><h2 id="smtp-server-title">SMTP 发信设置</h2><p>已预设 QQ 邮箱。请在 QQ 邮箱设置中开启 SMTP 服务，生成授权码后填写到右侧。</p><a href="https://mail.qq.com" target="_blank" rel="noopener noreferrer">打开 QQ 邮箱</a></div>
          <div class="smtp-fields">
            ${field('host', 'SMTP 服务器', 'text', '', 'required maxlength="253" autocomplete="off" spellcheck="false"')}
            ${field('port', '端口', 'number', 'QQ 邮箱 SSL/TLS 使用 465。', 'required min="1" max="65535"')}
            <label class="smtp-field" for="smtp-security"><span>连接加密</span><select id="smtp-security" name="security"><option value="tls" ${settings.security === 'tls' ? 'selected' : ''}>SSL/TLS（通常为 465）</option><option value="starttls" ${settings.security === 'starttls' ? 'selected' : ''}>STARTTLS（通常为 587）</option></select></label>
            ${field('username', 'SMTP 账号', 'text', 'QQ 邮箱填写完整邮箱地址。', 'maxlength="320" autocomplete="off" spellcheck="false"')}
            <label class="smtp-field smtp-password" for="smtp-password"><span>授权码 / SMTP 密码</span><input id="smtp-password" name="password" type="password" autocomplete="new-password" maxlength="1024" placeholder="${settings.password_configured ? '已保存授权码，留空保持不变' : '填写 QQ 邮箱 SMTP 授权码'}" aria-describedby="smtp-password-help"><small id="smtp-password-help">${settings.password_configured ? '授权码已加密保存。输入新值可替换；不会回显已有值。' : '使用 QQ 邮箱生成的 SMTP 授权码。此处不能填写 QQ 登录密码。'}</small></label>
            ${settings.password_configured ? '<label class="smtp-clear"><input name="clear_password" type="checkbox">清除已保存的授权码（需先关闭转发）</label>' : ''}
          </div>
        </section>
        <section class="smtp-section" aria-labelledby="smtp-sender-title">
          <div class="smtp-section-intro"><h2 id="smtp-sender-title">发件人</h2><p>邮件从此账号发送。有效的访客邮箱会作为回复地址，方便直接回复询盘。</p></div>
          <div class="smtp-fields">
            ${field('from_email', '发件邮箱', 'email', 'QQ 邮箱应与 SMTP 账号一致。', 'required maxlength="254" autocomplete="off"')}
            ${field('from_name', '发件人名称', 'text', '', 'maxlength="100"')}
          </div>
        </section>
        <div class="smtp-form-footer"><p data-smtp-message role="status" aria-live="polite"></p><div class="smtp-actions"><button class="button button-secondary" data-smtp-test type="button">发送测试邮件</button><button class="button button-primary" data-smtp-save type="submit">保存邮件设置</button></div></div>
      </form>
      <div class="smtp-test-result" role="status"><strong>最近测试</strong><span>${esc(settings.last_test_message || '尚未测试。请先保存授权码，再发送一封测试邮件。')}</span>${settings.last_tested_at ? `<time>${esc(formatDate(settings.last_tested_at))}</time>` : ''}</div>
      <section class="smtp-deliveries" aria-labelledby="smtp-deliveries-title"><header><div><h2 id="smtp-deliveries-title">表单邮件发送记录</h2><p>失败后自动重试，最多发送 5 次。启用前的历史提交不会补发。</p></div><button class="button button-secondary" type="button" data-smtp-refresh>刷新记录</button></header><div data-smtp-deliveries></div></section>`
    renderDeliveries()
    updateActions()
  }
  function renderDeliveries() {
    const target = shell.querySelector('[data-smtp-deliveries]')
    if (!target) return
    if (listError) {
      target.innerHTML = `<p class="smtp-error" role="alert">${esc(listError)} <button type="button" class="button button-secondary" data-smtp-refresh>重新加载</button></p>`
      return
    }
    target.innerHTML = `${deliveries.length ? `<div class="smtp-table-scroll"><table><thead><tr><th>表单 / 站点</th><th>收件邮箱</th><th>发送状态</th><th>尝试次数</th><th>提交时间</th><th>操作</th></tr></thead><tbody>${deliveries.map(item => `<tr><td><strong>FV-${Number(item.submission_id)} · ${esc(item.form_name)}</strong><small>${esc(item.site_name)}</small></td><td>${esc(item.recipient)}</td><td><span class="smtp-delivery-status smtp-delivery-${esc(item.status)}">${esc(statuses[item.status] || item.status)}</span>${item.last_error ? `<small class="smtp-delivery-error">${esc(item.last_error)}</small>` : ''}${item.status === 'pending' && item.attempts > 0 ? `<small>下次重试：${esc(formatDate(item.next_attempt_at))}</small>` : ''}${item.sent_at ? `<small>${esc(formatDate(item.sent_at))}</small>` : ''}</td><td>${Number(item.attempts)} / 5</td><td>${esc(formatDate(item.created_at))}</td><td>${item.status === 'failed' ? `<button class="button button-secondary" type="button" data-smtp-retry="${Number(item.id)}" ${settings.enabled ? '' : 'disabled title="请先启用邮件转发"'}>重新发送</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="smtp-empty"><strong>暂无发送记录</strong><p>保存授权码并启用转发后，新提交的表单会在这里显示发送结果。</p><a href="#/admin/form-inbox">查看表单收件箱</a></div>'}<footer class="smtp-pagination"><span>共 ${Number(total)} 条</span><button type="button" class="button button-secondary" data-smtp-page="-25" ${offset === 0 ? 'disabled' : ''}>上一页</button><button type="button" class="button button-secondary" data-smtp-page="25" ${offset + 25 >= total ? 'disabled' : ''}>下一页</button></footer>`
  }
  async function loadDeliveries() {
    const sequence = ++listSequence
    listError = ''
    try {
      const payload = await fetchJSON(`/api/v1/system/smtp/deliveries?offset=${offset}`)
      if (!shell.isConnected || sequence !== listSequence) return
      deliveries = payload.deliveries; total = payload.total
    } catch (error) { if (sequence === listSequence) listError = error.message || '读取发送记录失败，请重新加载。' }
    if (shell.isConnected && sequence === listSequence) renderDeliveries()
  }
  async function load() {
    shell.innerHTML = `${header()}<p class="smtp-loading" role="status">正在读取邮件配置…</p>`
    try {
      const payload = await fetchJSON('/api/v1/system/smtp')
      if (!shell.isConnected) return
      settings = payload; dirty = false; render()
      await loadDeliveries()
    } catch (error) {
      if (shell.isConnected) shell.innerHTML = `${header()}<div class="module-error" role="alert"><strong>邮件配置暂时无法读取</strong><p>${esc(error.message)}</p><button class="button button-secondary" type="button" data-smtp-reload>重新加载</button></div>`
    }
  }
  shell.addEventListener('input', event => {
    if (!event.target.closest('form')) return
    dirty = true; notice('配置有未保存修改，请先保存再测试。'); updateActions()
  })
  shell.addEventListener('submit', async event => {
    if (!event.target.matches('#smtp-configuration')) return
    event.preventDefault()
    if (busy) return
    const form = event.target, data = new FormData(form)
    const input = Object.fromEntries(['host', 'security', 'username', 'password', 'from_email', 'from_name', 'recipient'].map(key => [key, String(data.get(key) || '').trim()]))
    Object.assign(input, { port: Number(data.get('port')), enabled: data.has('enabled'), clear_password: data.has('clear_password'), version: settings.version })
    busy = true; notice('正在保存…'); updateActions()
    try {
      settings = await fetchJSON('/api/v1/system/smtp', { method: 'PUT', body: input })
      if (!shell.isConnected) return
      dirty = false; render(); notice(settings.enabled ? '设置已保存，新的表单提交将自动转发。' : '设置已保存，邮件转发当前已关闭。')
      shell.querySelector('[data-smtp-save]')?.focus()
    } catch (error) { if (shell.isConnected) notice(error.message || '保存失败，请重试。', true) }
    finally { busy = false; if (shell.isConnected) updateActions() }
  })
  shell.addEventListener('click', async event => {
    const button = event.target.closest('button')
    if (!button || button.disabled) return
    if (button.hasAttribute('data-smtp-reload')) { void load(); return }
    if (button.hasAttribute('data-smtp-refresh') || button.hasAttribute('data-smtp-page')) {
      if (button.dataset.smtpPage) offset = Math.max(0, offset + Number(button.dataset.smtpPage))
      button.disabled = true
      await loadDeliveries()
      button.disabled = false
      return
    }
    if (!button.hasAttribute('data-smtp-test') && !button.hasAttribute('data-smtp-retry')) return
    if (busy || (button.hasAttribute('data-smtp-test') && dirty)) return
    busy = true; button.disabled = true; updateActions()
    const testing = button.hasAttribute('data-smtp-test'), label = button.textContent
    button.textContent = testing ? '正在发送…' : '正在重发…'
    notice(testing ? `正在向 ${settings.recipient} 发送测试邮件…` : '正在加入重发队列…')
    try {
      const result = await fetchJSON(testing ? '/api/v1/system/smtp/test' : `/api/v1/system/smtp/deliveries/${button.dataset.smtpRetry}/retry`, { method: 'POST' })
      if (testing) {
        settings = await fetchJSON('/api/v1/system/smtp')
        if (shell.isConnected) render()
      } else await loadDeliveries()
      if (shell.isConnected) notice(testing ? result.message : '已加入重发队列，请稍后刷新查看结果。')
    } catch (error) {
      if (testing) {
        try { settings = await fetchJSON('/api/v1/system/smtp'); if (shell.isConnected) render() } catch { /* Preserve the original sending error. */ }
      }
      if (shell.isConnected) notice(error.message || '发送失败，请检查配置后重试。', true)
    }
    finally { busy = false; button.disabled = false; button.textContent = label; if (shell.isConnected) updateActions() }
  })
  void load()
}
