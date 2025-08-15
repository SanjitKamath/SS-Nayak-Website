const CONTENT = {
  about: "content/about.md",
  law: "content/law.md",
  partners: "content/partners.md",
  services: "content/services.md",
  contact: "content/contact.md"
};

async function fetchText(url) {
  const r = await fetch(url);
  return await r.text();
}

function mdToHtml(md) {
  return marked.parse(md);
}

function renderPartnersHtml(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const nodes = Array.from(temp.children);
  const cards = [];
  let current = null;
  nodes.forEach(n => {
    if (/H[1-6]/i.test(n.tagName)) {
      if (current) cards.push(current);
      current = { title: n.textContent.trim(), body: [] };
    } else {
      if (!current) current = { title: "", body: [] };
      current.body.push(n.outerHTML);
    }
  });
  if (current) cards.push(current);
  if (cards.length >= 2) {
    return `<div class="partners-grid">${cards.map(c => `<div class="card"><h4>${c.title}</h4>${c.body.join("")}</div>`).join("")}</div>`;
  }
  return html;
}

async function loadAll() {
  const [aboutMd, lawMd, partnersMd, servicesMd, contactMd] = await Promise.all([
    fetchText(CONTENT.about),
    fetchText(CONTENT.law),
    fetchText(CONTENT.partners),
    fetchText(CONTENT.services),
    fetchText(CONTENT.contact)
  ]);

  document.getElementById("about-content").innerHTML = mdToHtml(aboutMd);
  document.getElementById("law-content").innerHTML = mdToHtml(lawMd);
  document.getElementById("partners-content").innerHTML = renderPartnersHtml(mdToHtml(partnersMd));
  document.getElementById("services-content").innerHTML = mdToHtml(servicesMd);
  document.getElementById("contact-content").innerHTML = mdToHtml(contactMd);

  document.getElementById("footer-year").textContent = new Date().getFullYear();
  initScrollAnimations();
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".anim").forEach(el => obs.observe(el));
}

document.addEventListener("DOMContentLoaded", loadAll);
