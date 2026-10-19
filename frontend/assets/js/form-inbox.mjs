export function mountFormInbox(root, { fetchJSON, can, sites, escapeHtml: esc, formatDate }) {
  const statuses = { new: '待处理', processing: '跟进中', contacted: '已联系', closed: '已完成', invalid: '无效' }
  const labels = { full_name:'姓名',name:'姓名',work_email:'邮箱',email:'邮箱',company:'公司',phone:'电话',origin:'起始地',destination:'目的地',starting_point:'服务需求',cargo_details:'产品 / 货物信息',target_timing:'计划时间',additional_context:'补充说明',message:'需求说明',consent:'隐私同意',placement:'表单位置',purpose:'提交用途',reference_file_names_only:'参考文件（仅文件信息）' }
  const options = { 'product-sourcing':'产品采购','ocean-freight':'海运','air-freight':'空运','warehousing-fulfillment':'仓储与履约','packaging-branding':'包装与品牌','not-sure':'需要建议','ready-now':'已准备就绪','this-month':'本月','planning-ahead':'提前规划',newsletter:'资源订阅',true:'已同意' }
  const writable = can('content.write')
  let payload = null, selected = null, busy = false, error = '', notice = '', offset = 0, sequence = 0
  const filters = { site_id:'', locale:'', status:'', q:'' }
  const shell = document.createElement('div'); shell.className = 'form-inbox'; root.replaceChildren(shell)
  const value = (item, key) => item.values?.[key] || ''
  const fieldValue = (key, text) => {
    if (key === 'reference_file_names_only') {
      try { return JSON.parse(text).map(file => `${file.Name || file.name} · ${file.Size ?? file.size ?? 0} 字节`).join('\n') } catch { return text }
    }
    return options[text] || text
  }
  function detail() {
    if (!selected) return ''
    const fields = Object.entries(selected.values || {}).filter(([, text]) => text)
    return `<aside class="inbox-detail panel" aria-labelledby="inbox-detail-title"><header class="panel-header"><div><h2 id="inbox-detail-title" tabindex="-1">询盘 FV-${selected.id}</h2><p>${esc(selected.form_name)} · ${esc(selected.locale)}</p></div><button type="button" class="button button-secondary button-compact" data-inbox-close>关闭详情</button></header>
      <div class="inbox-detail-body"><dl class="inbox-fields"><div><dt>来源站点</dt><dd>${esc(selected.site_name)}</dd></div><div><dt>来源页面</dt><dd>${esc(selected.source_path || '—')}</dd></div><div><dt>提交时间</dt><dd>${esc(new Date(selected.created_at).toLocaleString('zh-CN'))}</dd></div>${fields.map(([key,text]) => `<div><dt>${esc(labels[key] || key.replace(/^context_/, '页面信息 · '))}</dt><dd>${esc(fieldValue(key,text))}</dd></div>`).join('')}</dl>
      <form data-inbox-followup><h3>跟进记录</h3><label for="inbox-status">处理状态</label><select id="inbox-status" name="status" ${writable?'':'disabled'}>${Object.entries(statuses).map(([key,label]) => `<option value="${key}" ${selected.status===key?'selected':''}>${label}</option>`).join('')}</select><label for="inbox-notes">内部备注</label><textarea id="inbox-notes" name="notes" rows="5" maxlength="5000" placeholder="记录沟通进展、负责人或下一步安排" ${writable?'':'readonly'}>${esc(selected.notes || '')}</textarea><p class="inbox-save-message" role="status" aria-live="polite"></p>${writable?'<button class="button button-primary" type="submit">保存跟进</button>':'<p>当前账号仅可查看；保存跟进需要内容编辑权限。</p>'}</form></div></aside>`
  }
  function render() {
    if (!shell.isConnected) return
    const rows = payload?.submissions || [], summary = payload?.summary || {}
    const totalAll = Object.values(summary).reduce((sum,n) => sum+Number(n),0)
    shell.innerHTML = `<header class="page-heading inbox-heading"><div><h1>表单收件箱</h1><p>汇总各站点的询盘与订阅，查看客户需求并记录跟进。</p></div><button class="button button-secondary" type="button" data-inbox-refresh ${busy?'disabled':''}>${busy?'读取中…':'刷新收件箱'}</button></header>
      <form class="inbox-filters" data-inbox-search><label>站点<select name="site_id"><option value="">全部可访问站点</option>${sites.map(site => `<option value="${Number(site.id)}" ${filters.site_id===String(site.id)?'selected':''}>${esc(site.name)}</option>`).join('')}</select></label><label>语言<select name="locale"><option value="">全部语言</option>${[['en','英语'],['de-DE','德语'],['fr-FR','法语'],['es-ES','西班牙语'],['it-IT','意大利语'],['nl-NL','荷兰语']].map(([code,label])=>`<option value="${code}" ${filters.locale===code?'selected':''}>${label} · ${code}</option>`).join('')}</select></label><label class="inbox-search-field">搜索<input type="search" name="q" maxlength="200" placeholder="姓名、邮箱、公司、编号或来源页面" value="${esc(filters.q)}"></label><button class="button button-primary" type="submit" ${busy?'disabled':''}>查询</button></form>
      <nav class="inbox-statuses" aria-label="按跟进状态筛选">${[['','全部'],...Object.entries(statuses)].map(([key,label])=>`<button type="button" data-inbox-filter="${key}" aria-pressed="${filters.status===key}">${label}<span>${key?summary[key]||0:totalAll}</span></button>`).join('')}</nav>
      <p class="inbox-notice" role="status" aria-live="polite" ${notice?'':'hidden'}>${esc(notice)}</p>
      <p class="inbox-error" role="alert" ${error?'':'hidden'}>${esc(error)}</p>
      <div class="inbox-workspace ${selected?'has-detail':''}"><section class="panel inbox-list" aria-label="提交记录" aria-busy="${busy}"><div class="table-scroll"><table class="module-table inbox-table"><thead><tr><th>客户 / 联系方式</th><th>站点 / 来源</th><th>状态</th><th>提交时间</th><th><span class="visually-hidden">操作</span></th></tr></thead><tbody>${rows.map(item=>`<tr ${selected?.id===item.id?'class="is-selected"':''}><td><strong>${esc(value(item,'full_name')||value(item,'name')||value(item,'work_email')||value(item,'email')||'未填写姓名')}</strong><span>${esc(value(item,'company'))}</span><span>${esc(value(item,'work_email')||value(item,'email'))}</span></td><td><strong>${esc(item.site_name)} <small>${esc(item.locale)}</small></strong><span>${esc(item.form_name)} · FV-${item.id}</span><span class="inbox-source">${esc(item.source_path || '/')}</span></td><td><span class="inbox-state inbox-state-${esc(item.status)}">${statuses[item.status]||esc(item.status)}</span></td><td>${esc(formatDate(item.created_at))}</td><td><button type="button" class="button button-secondary button-compact" data-inbox-open="${item.id}">查看<span class="visually-hidden"> FV-${item.id}</span></button></td></tr>`).join('')}</tbody></table></div>${rows.length?'':`<div class="inbox-empty" role="status"><h2>${busy?'正在读取表单…':error?'暂时无法显示记录':totalAll?'没有符合筛选条件的记录':'尚无表单提交'}</h2><p>${busy?'请稍候。':error?'请刷新收件箱重试。':'前台成功提交后，记录会出现在这里；可调整筛选或刷新查看。'}</p></div>`}<footer class="inbox-pagination"><span>${payload?.total?`${offset+1}–${Math.min(offset+25,payload.total)} / ${payload.total} 条`:'0 条记录'}</span><div><button type="button" class="button button-secondary button-compact" data-inbox-page="-1" ${busy||offset===0?'disabled':''}>上一页</button><button type="button" class="button button-secondary button-compact" data-inbox-page="1" ${busy||offset+25>=(payload?.total||0)?'disabled':''}>下一页</button></div></footer></section>${detail()}</div>`
  }
  async function load() {
    const request = ++sequence; busy=true; error=''; notice=''; render()
    try {
      const query = new URLSearchParams({...filters,offset:String(offset),limit:'25'})
      const result = await fetchJSON(`/api/v1/forms/submissions?${query}`)
      if (request!==sequence || !shell.isConnected) return
      payload=result
      if (offset>0 && offset>=result.total) { offset=Math.max(0,Math.floor((result.total-1)/25)*25); busy=false; return load() }
      if (selected) selected=result.submissions.find(row=>row.id===selected.id)||null
    } catch(e) { if(request===sequence) error=e.message||'读取失败，请重试。' }
    finally { if(request===sequence) { busy=false;render() } }
  }
  shell.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return
    if(button.hasAttribute('data-inbox-refresh')) { selected=null;void load() }
    if(button.hasAttribute('data-inbox-filter')) { filters.status=button.dataset.inboxFilter;offset=0;selected=null;void load() }
    if(button.hasAttribute('data-inbox-page')) { offset+=Number(button.dataset.inboxPage)*25;selected=null;void load() }
    if(button.hasAttribute('data-inbox-open')) { selected=payload.submissions.find(row=>row.id===Number(button.dataset.inboxOpen));render();shell.querySelector('#inbox-detail-title')?.focus() }
    if(button.hasAttribute('data-inbox-close')) { const id=selected?.id;selected=null;render();shell.querySelector(`[data-inbox-open="${id}"]`)?.focus() }
  })
  shell.addEventListener('submit',async event=>{
    const form=event.target;event.preventDefault()
    if(form.hasAttribute('data-inbox-search')) { const data=new FormData(form);for(const key of ['site_id','locale','q'])filters[key]=String(data.get(key)||'').trim();offset=0;selected=null;void load();return }
    if(!form.hasAttribute('data-inbox-followup')||!writable)return
    const button=form.querySelector('button[type="submit"]'), message=form.querySelector('.inbox-save-message'), row=selected
    if(button.disabled)return
    const data=new FormData(form);button.disabled=true;button.textContent='保存中…';message.textContent=''
    try {
      const result=await fetchJSON(`/api/v1/forms/submissions/${row.id}`,{method:'PUT',body:{status:data.get('status'),notes:data.get('notes'),version:row.version}})
      row.status=String(data.get('status'));row.notes=String(data.get('notes'));row.version=result.version
      await load();notice=filters.status && filters.status!==row.status?'跟进记录已保存，记录已移出当前状态筛选。':'跟进记录已保存。';render()
    }catch(e){ message.textContent=e.message||'保存失败，请重试。';message.setAttribute('role','alert') }
    finally{button.disabled=false;button.textContent='保存跟进'}
  })
  if(!can('content.read')) { shell.innerHTML='<div class="inbox-empty"><h1>表单收件箱</h1><p>当前账号没有查看表单的权限。</p></div>';return }
  void load()
}
