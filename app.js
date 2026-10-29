(() => {
  'use strict';

  // A chave antiga da PRF é mantida: atualizar o app não apaga o histórico.
  const PRF_KEY = 'prf-questoes-v1';
  const PMPE_KEY = 'pmpe-questoes-v1';
  const prfSubjects = [
    'Português', 'Direito Administrativo', 'Legislação PRF',
    'Direito Constitucional', 'Administração', 'Arquivologia',
    'Informática', 'Raciocínio Lógico', 'Ética e Conduta Pública'
  ];
  const pmpeSubjects = [
    'Português', 'História de Pernambuco', 'Raciocínio Lógico',
    'Informática', 'Direito Constitucional',
    'Direitos Humanos', 'Legislação Extravagante',
    // Preservar este valor para registros antigos e backups já existentes.
    'Direitos Humanos e Legislação Extravagante',
    'Estatuto dos Militares de Pernambuco'
  ];
  const $ = id => document.getElementById(id);

  function valid(r, subjects) {
    return r && typeof r.id === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(r.date) && subjects.includes(r.subject) &&
      Number.isSafeInteger(r.total) && r.total > 0 &&
      Number.isSafeInteger(r.correct) && r.correct >= 0 && r.correct <= r.total &&
      typeof r.topic === 'string';
  }

  function loadRecords(key, subjects) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed.filter(r => valid(r, subjects)) : [];
    } catch (_) {
      return [];
    }
  }

  const exams = {
    prf: {key: PRF_KEY, subjects: prfSubjects, records: loadRecords(PRF_KEY, prfSubjects)},
    pmpe: {key: PMPE_KEY, subjects: pmpeSubjects, records: loadRecords(PMPE_KEY, pmpeSubjects)}
  };
  function save(exam) {
    localStorage.setItem(exams[exam].key, JSON.stringify(exams[exam].records));
  }

  // Reaproveita a tela clássica, sem alterar seu estilo ou os identificadores antigos.
  const prfView = $('view-performance');
  prfView.id = 'view-performance-prf';
  prfView.querySelector('.section-title').textContent = 'Desempenho semanal PRF';
  prfView.querySelector('.section-title + p').textContent =
    'Somente registros feitos na seção PRF. As matérias comuns não são compartilhadas com a PMPE.';

  const pmpeView = prfView.cloneNode(true);
  pmpeView.id = 'view-performance-pmpe';
  pmpeView.querySelector('.section-title').textContent = 'Desempenho semanal PMPE';
  pmpeView.querySelector('.section-title + p').textContent =
    'Somente registros feitos na seção PMPE. O Estatuto integra Legislação; Redação não é contada como questão objetiva.';
  pmpeView.querySelectorAll('[id]').forEach(el => { el.id = 'pmpe-' + el.id; });
  prfView.insertAdjacentElement('afterend', pmpeView);

  const prfButton = document.querySelector('#menuPanel [data-view="performance"]');
  prfButton.dataset.view = 'performance-prf';
  prfButton.textContent = '📊 Desempenho semanal PRF';
  const pmpeButton = document.createElement('button');
  pmpeButton.dataset.view = 'performance-pmpe';
  pmpeButton.textContent = '📊 Desempenho semanal PMPE';
  prfButton.insertAdjacentElement('afterend', pmpeButton);

  const heading = document.querySelector('.app-header h1');
  if (heading) heading.textContent = 'Cronograma PMPE';
  const subtitle = document.querySelector('.app-header .sub');
  if (subtitle) subtitle.textContent = 'Foco Total até Fevereiro · Soldado · 15h/semana';
  const footer = document.querySelector('.foot');
  if (footer) footer.textContent =
    'Foco total PMPE até fevereiro de 2027. As matérias comuns também ajudam na preparação para a PRF. Seus registros da PRF permanecem guardados. As pausas não entram nas 15 horas.';

  function show(name) {
    document.querySelectorAll('.app-view').forEach(el => { el.hidden = el.id !== 'view-' + name; });
    $('menuPanel').hidden = true;
    $('menuToggle').setAttribute('aria-expanded', 'false');
    if (name === 'performance-prf') draw('prf');
    if (name === 'performance-pmpe') draw('pmpe');
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-view]').forEach(b =>
    b.addEventListener('click', () => show(b.dataset.view)));
  $('menuToggle').addEventListener('click', () => {
    const menu = $('menuPanel');
    menu.hidden = !menu.hidden;
    $('menuToggle').setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-wrap')) {
      $('menuPanel').hidden = true;
      $('menuToggle').setAttribute('aria-expanded', 'false');
    }
  });

  function field(exam, id) { return $(exam === 'prf' ? id : 'pmpe-' + id); }
  function iso(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function monday(d) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    return date;
  }
  function weekStart(date) {
    const [year, month, day] = date.split('-').map(Number);
    return iso(monday(new Date(year, month - 1, day)));
  }

  for (const exam of ['prf', 'pmpe']) {
    const config = exams[exam];
    const selector = field(exam, 'subject');
    config.subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      selector.appendChild(option);
    });
    field(exam, 'recordDate').value = iso(new Date());
    field(exam, 'recordForm').addEventListener('submit', event => {
      event.preventDefault();
      const total = Number(field(exam, 'total').value);
      const correct = Number(field(exam, 'correct').value);
      const date = field(exam, 'recordDate').value;
      const message = field(exam, 'formMessage');
      if (!Number.isSafeInteger(total) || total < 1 ||
          !Number.isSafeInteger(correct) || correct < 0 || correct > total ||
          !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        message.textContent = 'Confira os números: acertos não podem superar o total.';
        return;
      }
      const record = {
        id: String(Date.now()) + '-' + Math.random().toString(36).slice(2),
        date, subject: selector.value, total, correct,
        topic: field(exam, 'topic').value.trim()
      };
      config.records.push(record);
      try {
        save(exam);
        message.textContent = `Resultado registrado somente na ${exam.toUpperCase()}.`;
        field(exam, 'total').value = '';
        field(exam, 'correct').value = '';
        field(exam, 'topic').value = '';
        draw(exam);
      } catch (_) {
        config.records.pop();
        message.textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador.';
      }
    });
  }

  function draw(exam) {
    const {records, subjects} = exams[exam];
    const current = weekStart(iso(new Date()));
    const weekly = records.filter(r => weekStart(r.date) === current);
    const total = weekly.reduce((n, r) => n + r.total, 0);
    const errors = weekly.reduce((n, r) => n + r.total - r.correct, 0);
    field(exam, 'statTotal').textContent = total;
    field(exam, 'statErrors').textContent = errors;
    field(exam, 'statRate').textContent = total ? Math.round(100 * (total - errors) / total) + '%' : '0%';

    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const d = monday(new Date());
      d.setDate(d.getDate() - 7 * i);
      const key = iso(d);
      weeks.push({
        label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        value: records.filter(r => weekStart(r.date) === key).reduce((n, r) => n + r.total - r.correct, 0)
      });
    }
    const max = Math.max(1, ...weeks.map(w => w.value));
    const chart = field(exam, 'weeklyChart');
    chart.replaceChildren();
    weeks.forEach(w => {
      const column = document.createElement('div');
      column.className = 'chart-col';
      const value = document.createElement('b');
      value.textContent = w.value;
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = (w.value ? Math.max(5, w.value / max * 120) : 2) + 'px';
      const label = document.createElement('span');
      label.textContent = w.label;
      column.append(value, bar, label);
      chart.appendChild(column);
    });

    const bySubject = field(exam, 'subjectStats');
    bySubject.replaceChildren();
    const grouped = subjects.map(subject => ({
      subject,
      errors: weekly.filter(r => r.subject === subject).reduce((n, r) => n + r.total - r.correct, 0)
    })).filter(s => s.errors > 0).sort((a, b) => b.errors - a.errors);
    if (!grouped.length) bySubject.innerHTML = '<p class="empty">Ainda não há erros registrados nesta semana.</p>';
    grouped.forEach(g => {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = `${g.subject}: ${g.errors} erro(s)`;
      bySubject.appendChild(p);
    });

    const list = field(exam, 'recordList');
    list.replaceChildren();
    if (!records.length) list.innerHTML = '<p class="empty">Nenhum registro ainda.</p>';
    [...records].sort((a, b) => b.date.localeCompare(a.date)).forEach(record => {
      const row = document.createElement('div');
      row.className = 'record';
      const details = document.createElement('div');
      const heading = document.createElement('strong');
      heading.textContent = record.subject;
      const sub = document.createElement('div');
      sub.className = 'muted';
      sub.textContent = `${record.date.split('-').reverse().join('/')} · ${record.correct}/${record.total} acertos · ${record.total - record.correct} erros${record.topic ? ' · ' + record.topic : ''}`;
      details.append(heading, sub);
      const remove = document.createElement('button');
      remove.textContent = 'Excluir';
      remove.setAttribute('aria-label', 'Excluir registro de ' + record.subject);
      remove.addEventListener('click', () => {
        if (!confirm('Excluir este registro?')) return;
        const previous = exams[exam].records;
        exams[exam].records = previous.filter(r => r.id !== record.id);
        try { save(exam); draw(exam); }
        catch (_) { exams[exam].records = previous; alert('Não foi possível excluir o registro.'); }
      });
      row.append(details, remove);
      list.appendChild(row);
    });
  }

  $('exportData').addEventListener('click', () => {
    const content = JSON.stringify({
      app: 'cronograma-prf', version: 2,
      records: exams.prf.records, pmpeRecords: exams.pmpe.records
    }, null, 2);
    const url = URL.createObjectURL(new Blob([content], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-cronograma-prf-pmpe.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  $('importData').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2e6) throw Error('Arquivo muito grande.');
      const data = JSON.parse(await file.text());
      if (!data || data.app !== 'cronograma-prf' || !Array.isArray(data.records) ||
          !data.records.every(r => valid(r, prfSubjects))) throw Error('Backup inválido.');
      const isNew = data.version === 2;
      if (isNew && (!Array.isArray(data.pmpeRecords) ||
          !data.pmpeRecords.every(r => valid(r, pmpeSubjects)))) throw Error('Backup da PMPE inválido.');
      const prompt = isNew
        ? 'Importar backup? Os registros atuais da PRF e da PMPE serão substituídos.'
        : 'Backup antigo: importar somente os registros da PRF? Os registros da PMPE serão mantidos.';
      if (!confirm(prompt)) return;
      const oldPrf = exams.prf.records;
      const oldPmpe = exams.pmpe.records;
      exams.prf.records = data.records;
      if (isNew) exams.pmpe.records = data.pmpeRecords;
      try {
        save('prf');
        if (isNew) save('pmpe');
      } catch (_) {
        exams.prf.records = oldPrf;
        exams.pmpe.records = oldPmpe;
        try { save('prf'); if (isNew) save('pmpe'); } catch (_) {}
        throw Error('Não foi possível salvar o backup neste dispositivo.');
      }
      $('backupMessage').textContent = isNew
        ? `${exams.prf.records.length} registro(s) PRF e ${exams.pmpe.records.length} PMPE importados.`
        : `${exams.prf.records.length} registro(s) antigos da PRF importados; PMPE preservada.`;
      draw('prf');
      draw('pmpe');
    } catch (error) {
      $('backupMessage').textContent = error.message || 'Erro ao importar.';
    } finally {
      event.target.value = '';
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  draw('prf');
  draw('pmpe');
})();
