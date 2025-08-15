// app.js - loads markdown content from /content/*.md, renders using marked.js, and applies scroll animations

const CONTENT = {
  about: "content/about.md",
  services: "content/services.md",
  partners: "content/partners.md",
  contact: "content/contact.md"
};

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
  return r.text();
}

function mdToHtml(md) {
  if (window.marked) return marked.parse(md);
  // fallback naive parser (very small)
  return md.replace(/\n/g, "<br>");
}

/* Helpers to render partners as cards if partners.md is formatted as headings + lists.
   If partners.md is plain markdown, we simply inject the HTML. */
function renderPartnersHtml(html) {
  // Try to parse headings with their following lists into cards
  // Create a temporary container
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const nodes = Array.from(temp.children);

  // If structure is multiple H2/H3 nodes each with sibling paragraphs/lists, convert to grid cards.
  const cards = [];
  let current = null;
  nodes.forEach(n => {
    if (/H[1-6]/i.test(n.tagName)) {
      // new card
      if (current) cards.push(current);
      current = { title: n.textContent.trim(), body: [] };
    } else {
      if (!current) current = { title: "", body: [] };
      current.body.push(n.outerHTML);
    }
  });
  if (current) cards.push(current);

  // If we detected multiple cards -> format as card grid
  if (cards.length >= 2) {
    const out = document.createElement("div");
    out.className = "partners-grid-cards";
    cards.forEach(c => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h4>${c.title}</h4>` + c.body.join("");
      out.appendChild(card);
    });
    return out.outerHTML;
  }

  // else just return original html
  return html;
}

async function loadAll() {
  try {
    // load about
    const [aboutMd, servicesMd, partnersMd, contactMd] = await Promise.all([
      fetchText(CONTENT.about),
      fetchText(CONTENT.services),
      fetchText(CONTENT.partners),
      fetchText(CONTENT.contact)
    ]);

    document.getElementById("about-content").innerHTML = mdToHtml(aboutMd);
    document.getElementById("services-content").innerHTML = mdToHtml(servicesMd);

    // partners: attempt to render as cards for readability
    const partnersHtmlRaw = mdToHtml(partnersMd);
    document.getElementById("partners-content").innerHTML = renderPartnersHtml(partnersHtmlRaw);

    document.getElementById("contact-content").innerHTML = mdToHtml(contactMd);

    // hero description: try to take first paragraph from about
    const heroDesc = (aboutMd.split(/\n\s*\n/)[0] || "").replace(/\n/g,' ');
    if (heroDesc) document.getElementById("hero-desc").textContent = heroDesc;

    // footer year
    document.getElementById("footer-year").textContent = new Date().getFullYear();

    initScrollAnimations();
  } catch (err) {
    console.error(err);
    document.getElementById("about-content").innerHTML = `<p style="color:#a33">Failed to load content. ${err.message}</p>`;
  }
}

/* IntersectionObserver for reveal animations */
function initScrollAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.anim').forEach(el => obs.observe(el));
}

document.addEventListener("DOMContentLoaded", loadAll);
