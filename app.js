document.addEventListener("DOMContentLoaded", () => {
    const files = {
        "about-content": "content/about.md",
        "law-content": "content/law.md",
        "partners-content": "content/partners.md",
        "services-content": "content/services.md",
        "contact-content": "content/contact.md"
    };

    for (const [id, path] of Object.entries(files)) {
        fetch(path)
            .then(res => res.text())
            .then(text => {
                document.getElementById(id).innerHTML = marked.parse(text);
            })
            .catch(err => {
                console.error(`Error loading ${path}:`, err);
                document.getElementById(id).innerHTML = "<p>Content currently unavailable.</p>";
            });
    }

    document.getElementById("yr").textContent = new Date().getFullYear();
});
