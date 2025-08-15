// simple markdown loader with safe fallbacks and heading-trimming
const CONTENT = {
  about: "content/about.md",
  law: "content/law.md",
  partners: "content/partners.md",
  services: "content/services.md",
  contact: "content/contact.md"
};

async function fetchText(url) {
  try {
    // cache-buster so GitHub Pages serves latest during development
    const res = await fetch(url + "?_=" + Date.now());
    if (!res.ok) throw new Error("Fetch failed: " + res.status);
    return await res.text();
  } catch (e) {
    console.warn("Failed fetching", url, e);
    return null;
  }
}

// remove an initial H1/H2 heading from markdown so page titles don't duplicate
function removeLeadHeading(md) {
  if (!md) return md;
  return md.replace(/^\s{0,}#{1,2}\s.*(\r?\n)+/, "");
}

function mdToHtml(md) {
  if (!md) return "";
  try { return marked.parse(md); } catch (e) { console.warn("marked parse failed", e); return md; }
}

// render partners HTML robustly: split by heading nodes, create cards
function renderPartnersHtml(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const children = Array.from(doc.body.children);

  const cards = [];
  let current = null;
  children.forEach(node => {
    if (/^H[1-6]$/i.test(node.tagName)) {
      if (current) cards.push(current);
      current = { title: node.textContent.trim(), body: [] };
    } else {
      if (!current) current = { title: "", body: [] };
      current.body.push(node.outerHTML);
    }
  });
  if (current) cards.push(current);

  if (cards.length) {
    return cards.map(c => {
      return `<div class="partner-card"><h4>${c.title}</h4>${c.body.join("")}</div>`;
    }).join("");
  }

  // fallback: just return original HTML
  return html;
}

async function loadAll() {
  // fetch all md in parallel
  const keys = Object.keys(CONTENT);
  const promises = keys.map(k => fetchText(CONTENT[k]));
  const results = await Promise.all(promises);

  const aboutMd = removeLeadHeading(results[0]);
  const lawMd = removeLeadHeading(results[1]);
  const partnersMd = results[2]; // keep headings for splitting into cards
  const servicesMd = removeLeadHeading(results[3]);
  const contactMd = removeLeadHeading(results[4]);

  // About
  const aboutHtml = mdToHtml(aboutMd);
  document.getElementById("about-content").innerHTML = aboutHtml || `<p>SS Nayak & Associates provides accounting, audit and tax advisory services.</p>`;

  // Law
  const lawHtml = mdToHtml(lawMd);
  document.getElementById("law-content").innerHTML = lawHtml || `<p>We handle direct & indirect tax litigation and international tax advisory.</p>`;

  // Partners (special rendering)
  const partnersHtmlRendered = renderPartnersHtml(mdToHtml(partnersMd));
  document.getElementById("partners-content").innerHTML = partnersHtmlRendered || document.getElementById("partners-content").innerHTML;

  // Services
  const servicesHtml = mdToHtml(servicesMd);
  document.getElementById("services-content").innerHTML = servicesHtml || `<p>Tax Consulting, Audits, Business Advisory, Financial Planning.</p>`;

  // Contact
  const contactHtml = mdToHtml(contactMd);
  document.getElementById("contact-content").innerHTML = contactHtml || `<p>Email: <a href="mailto:contact@ssnayak.com">contact@ssnayak.com</a></p>`;

  // footer year
  const fy = new Date().getFullYear();
  const el = document.getElementById("footer-year");
  if (el) el.textContent = fy;

  initScrollAnimations();
}

function initScrollAnimations() {
  // keep simple: if IntersectionObserver supported, add 'in-view' to elements
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("in-view");
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".anim").forEach(el => obs.observe(el));
}

document.addEventListener("DOMContentLoaded", loadAll);
