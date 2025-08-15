document.addEventListener("DOMContentLoaded", function () {
    // Load Markdown files into sections
    loadMarkdown("about.md", "about-content");
    loadMarkdown("services.md", "services-content");
    loadMarkdown("partners.md", "partners-content");
    loadMarkdown("contact.md", "contact-content");

    // Set footer year
    document.getElementById("footer-year").textContent = new Date().getFullYear();
});

function loadMarkdown(file, elementId) {
    fetch(file)
        .then(response => response.text())
        .then(text => {
            document.getElementById(elementId).innerHTML = marked.parse(text);
        })
        .catch(err => console.error("Error loading " + file, err));
}
