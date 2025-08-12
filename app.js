// 年を自動表示
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // モバイルで必要になったらトグル化（今は横スクロール式）
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.top-nav .container');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  // スムーススクロール時、固定ナビ分だけズラす（古いブラウザ対策）
  document.querySelectorAll('.top-nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navH = 64;
      const y = el.getBoundingClientRect().top + window.pageYOffset - (navH + 8);
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const FEED_URL =
    'https://api.rss2json.com/v1/api.json?rss_url=https://note.com/yona_dreammaker/rss';

  const ul = document.getElementById('note-feed');
  const fallback = document.getElementById('note-fallback');
  if (!ul) return;

  // 本文から最初の <img src="..."> を拾う
  const pickImageFromHtml = (html) => {
    if (!html) return null;
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : null;
  };

  // サムネ選定ロジック
  const pickThumb = (item) => {
    // 1) note RSSのthumbnail
    if (item.thumbnail) return item.thumbnail;
    // 2) content or description 内の最初の画像
    const fromContent = pickImageFromHtml(item.content || item.description);
    if (fromContent) return fromContent;
    // 3) 自前のデフォルト画像（用意してね：/img/note/default-cover.jpg）
    return 'img/note/default-cover.jpg';
  };

  fetch(FEED_URL)
    .then(r => r.json())
    .then(data => {
      if (!data || !data.items) throw new Error('no items');
      const items = data.items.slice(0, 3);
      ul.innerHTML = '';

      items.forEach(item => {
        const d = new Date(item.pubDate);
        const ymd = d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const thumb = pickThumb(item);
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
          <a class="link" href="${item.link}" target="_blank" rel="noopener">
            <div class="thumb-wrap">
              <img class="thumb" src="${thumb}" alt="" loading="lazy" decoding="async">
            </div>
            <div class="body">
              <div class="title">${item.title}</div>
              <div class="meta">
                <time datetime="${item.pubDate}">${ymd}</time>
                <span>note</span>
              </div>
            </div>
          </a>
        `;
        ul.appendChild(li);
      });
    })
    .catch(err => {
      console.warn('note feed error:', err);
      if (fallback) fallback.style.display = 'block';
    });
});
