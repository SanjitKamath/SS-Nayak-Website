document.addEventListener("DOMContentLoaded", () => {
  const sections = ["about", "services", "partners", "contact"];
  sections.forEach(id => loadMarkdown(`${id}.md`, `${id}-content`));

  document.getElementById("footer-year").textContent = new Date().getFullYear();
});

function loadMarkdown(file, elementId) {
  fetch(file)
    .then(res => res.text())
    .then(txt => { document.getElementById(elementId).innerHTML = marked.parse(txt); })
    .catch(err => {
      console.error(`Error loading ${file}`, err);
      document.getElementById(elementId).innerHTML = "<p>Content unavailable</p>";
    });
}
