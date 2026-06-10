/* ============================================================
   Módulo: Base de Conhecimento (biblioteca pesquisável)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.knowledge = (function () {
  const { el, sound } = HDL.ui;
  const { knowledge, kbCategories } = HDL.data;

  let activeCat = 'Todas';
  let query = '';

  function render(view) {
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('book', 24), 'Base de Conhecimento'),
        el('p', { text: 'Biblioteca pesquisável de procedimentos e boas práticas de Redes, Windows, Office, VPN, Segurança e Help Desk. Consulte aqui enquanto resolve os desafios.' })
      )
    );

    const search = el('div', { class: 'search', style: 'max-width:420px;margin-bottom:18px' },
      el('span', { text: '🔎' }),
      el('input', {
        type: 'text', placeholder: 'Buscar artigo, comando, tema…', value: query,
        oninput: (e) => { query = e.target.value.toLowerCase(); renderResults(); }
      })
    );
    view.append(search);

    const grid = el('div', { class: 'kb-grid' });
    const cats = el('div', { class: 'kb-cats' });
    const allCats = ['Todas', ...kbCategories];
    function renderCats() {
      cats.innerHTML = '';
      allCats.forEach(c => {
        const count = c === 'Todas' ? knowledge.length : knowledge.filter(a => a.cat === c).length;
        cats.append(el('button', {
          class: activeCat === c ? 'is-active' : '',
          onclick: () => { activeCat = c; renderCats(); renderResults(); }
        }, c, el('span', { text: count })));
      });
    }
    renderCats();

    const results = el('div', { id: 'kbResults' });
    grid.append(cats, results);
    view.append(grid);

    renderResults();

    function renderResults() {
      const s = HDL.state.get();
      results.innerHTML = '';
      const items = knowledge.filter(a => {
        if (activeCat !== 'Todas' && a.cat !== activeCat) return false;
        if (query) {
          const hay = (a.title + ' ' + a.cat + ' ' + a.tags.join(' ') + ' ' + a.html).toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      });
      if (!items.length) {
        results.append(el('div', { class: 'empty' },
          el('div', { class: 'empty__ico', text: '🔍' }),
          el('div', { text: 'Nenhum artigo encontrado.' })));
        return;
      }
      items.forEach(a => {
        const id = artId(a);
        const read = s.kbRead.includes(id);
        const details = el('details', { class: 'card kb-article' },
          el('summary', {},
            el('span', {}, el('span', { class: 'chip chip--cat', style: 'margin-right:10px', text: a.cat }), a.title),
            el('span', {}, read ? el('span', { class: 'chip chip--done', style: 'margin-right:8px', text: '✓ Lido' }) : '', el('span', { class: 'arrow', text: '›' }))
          ),
          el('div', { class: 'kb-article__content' },
            wrapHtml(a.html),
            el('div', { class: 'kb-tags' }, ...a.tags.map(t => el('span', { class: 'chip chip--cat', text: '#' + t })))
          )
        );
        details.addEventListener('toggle', () => {
          if (details.open) { HDL.state.readArticle(id); sound.click(); }
        });
        results.append(details);
      });
    }
  }

  function wrapHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }
  function artId(a) { return a.cat + '::' + a.title; }

  /* ---- Base de Conhecimento Inteligente: sugestões por tags ---- */
  function suggest(tags, limit = 3) {
    if (!tags || !tags.length) return [];
    const scored = knowledge.map(a => {
      const score = a.tags.filter(t => tags.includes(t)).length;
      return { a, score };
    }).filter(x => x.score > 0).sort((x, y) => y.score - x.score);
    return scored.slice(0, limit).map(x => x.a);
  }

  function openArticleModal(a) {
    HDL.state.readArticle(artId(a));
    HDL.ui.modal({
      title: a.title, sub: '📚 Base de Conhecimento · ' + a.cat,
      body: el('div', {}, wrapHtml(a.html), el('div', { class: 'kb-tags', style: 'margin-top:14px' }, ...a.tags.map(t => el('span', { class: 'chip chip--cat', text: '#' + t })))),
      width: 640
    });
  }

  // Retorna um bloco DOM "Aprenda com o erro" ou null
  function suggestEl(tags) {
    const arts = suggest(tags, 3);
    if (!arts.length) return null;
    const box = el('div', { class: 'kb-suggest' },
      el('div', { class: 'kb-suggest__title' }, '💡 Aprenda com o erro — artigos relacionados')
    );
    arts.forEach(a => {
      box.append(el('div', { class: 'kb-suggest__item', onclick: () => openArticleModal(a) },
        el('span', { text: '📄' }), el('span', { text: a.title }), el('span', { style: 'margin-left:auto;color:var(--text-mute)', text: '›' })
      ));
    });
    return box;
  }

  return { render, suggest, suggestEl, openArticleModal };
})();
