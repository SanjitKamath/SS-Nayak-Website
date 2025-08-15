document.addEventListener('DOMContentLoaded', () => {
  // Load markdown files from /content/
  loadMD('content/about.md', (html) => {
    // Put the first paragraph under the hero as the short description
    const temp = document.createElement('div');
    temp.innerHTML = marked.parse(html);
    const firstP = temp.querySelector('p');
    document.getElementById('hero-desc').textContent =
      firstP ? firstP.textContent.trim() : 'A trusted Chartered Accountancy firm delivering expert financial, auditing, and advisory services.';

    // Keep the full about content (you might want all of it, including that first paragraph)
    document.getElementById('about-content').innerHTML = temp.innerHTML;
  });

  loadMD('content/law.md', (html) => {
    document.getElementById('law-content').innerHTML = marked.parse(html);
  });

  loadPartners('content/partners.md', 'partners-content');

  loadMD('content/services.md', (html) => {
    document.getElementById('services-content').innerHTML = marked.parse(html);
  });

  loadContact('content/contact.md', 'contact-content');

  // Footer year
  document.getElementById('yr').textContent = new Date().getFullYear();
});

/* ---------- helpers ---------- */
function loadMD(path, onOk) {
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`${path} -> ${res.status}`);
      return res.text();
    })
    .then(onOk)
    .catch(err => {
      console.error('MD load error:', err);
      onOk(`#`);
    });
}

/* Partners: try to create cards from headings; otherwise just render markdown */
function loadPartners(path, mountId) {
  loadMD(path, (raw) => {
    const txt = raw;
    // Try to split at H2/H3 headings like "## CA ..." or "### CA ..."
    const chunks = txt.split(/\n(?=##\s|###\s)/g).filter(Boolean);

    const mount = document.getElementById(mountId);
    mount.innerHTML = ''; // clear "Loading…"

    if (chunks.length > 1 || /^##\s|^###\s/.test(txt)) {
      chunks.forEach(block => {
        const titleMatch = block.match(/^(?:##|###)\s+(.+)\s*$/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Partner';
        const after = block.replace(/^(?:##|###)\s+.+\s*/m, '').trim();
        const detailsHTML = marked.parse(after);

        const card = document.createElement('div');
        card.className = 'partner-card';
        card.innerHTML = `<div>
            <h3>${title}</h3>
            ${detailsHTML ? `<div class="details">${detailsHTML}</div>` : ``}
          </div>`;
        mount.appendChild(card);
      });
    } else {
      // Fallback: render as given
      const wrapper = document.createElement('div');
      wrapper.className = 'partner-card';
      wrapper.innerHTML = `<div><h3>Our Partners</h3><div class="details">${marked.parse(txt)}</div></div>`;
      mount.appendChild(wrapper);
    }
  });
}

/* Contact: render as cards with icons if possible; otherwise plain markdown */
function loadContact(path, mountId) {
  loadMD(path, (raw) => {
    const html = marked.parse(raw);
    // If the md has lines with address/phone/email, try to format into items.
    // Otherwise just dump markdown.
    const mount = document.getElementById(mountId);

    // Simple heuristic: if it contains <ul> or multiple <p>, keep markdown
    if (/<ul|<ol|<p>.*<\/p>.*<p>/ims.test(html)) {
      mount.innerHTML = html;
      return;
    }

    // Otherwise, build three rows if icons available
    mount.innerHTML = `
      <div class="contact-item">
        <img src="assets/location-icon.svg" alt="" onerror="this.style.display='none'">
        <p>${html}</p>
      </div>
    `;
  });
}
