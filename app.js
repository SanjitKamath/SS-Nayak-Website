document.addEventListener("DOMContentLoaded", function () {
    loadMarkdown("assets/about.md", "about-content");
    loadMarkdown("assets/services.md", "services-content");
    loadMarkdown("assets/partners.md", "partners-content");
    loadMarkdown("assets/contact.md", "contact-content");

    document.getElementById("footer-year").textContent = new Date().getFullYear();
});

function loadMarkdown(file, elementId) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then(text => {
            document.getElementById(elementId).innerHTML = marked.parse(text);
        })
        .catch(err => {
            console.error("Error loading " + file, err);
            document.getElementById(elementId).innerHTML = "<p>Content currently unavailable.</p>";
        });
}
