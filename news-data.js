document.addEventListener("DOMContentLoaded", () => {

    /* ================= CONFIG ================= */
    const SHEET_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSE-bOPVF0xg2wDf6dwJjY_UAUMrfvO7ym6FLgip9pyfu40fYQjcRdHls8Y7VmbGxpXfHueY5NI7SI0/pub?output=csv";

    /* ================= DOM ================= */
    const featuredTitle = document.getElementById("featured-title");
    const featuredExcerpt = document.getElementById("featured-excerpt");
    const featuredCategory = document.getElementById("featured-category");
    const featuredImage = document.getElementById("featured-image");
    const recentList = document.getElementById("recent-list");

    const modal = document.getElementById("article-modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const modalContent = document.getElementById("modal-content");  

    /* ================= STATE ================= */
    let articles = [];
    let featured = null;

    /* ================= INIT ================= */
    fetchArticles();
    setupModal();

    /* ================= FETCH ================= */
    async function fetchArticles() {
        try {
            const res = await fetch(SHEET_URL);
            const csv = await res.text();
            articles = parseCSV(csv);

            if (!articles.length) throw new Error("No articles");

            featured = articles[0];
            renderFeatured();
            renderRecent();

        } catch (err) {
            console.error("Sheet error:", err);
            showError();
        }
    }

    /* ================= CSV PARSER ================= */
    function parseCSV(text) {
        const rows = text.split("\n").filter(r => r.trim() !== "");
        if (rows.length < 2) return [];

        const headers = rows[0].split(",").map(h => h.trim().toLowerCase());
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const values = parseLine(rows[i]);
            const obj = {};

            headers.forEach((h, idx) => {
                obj[h] = values[idx] || "";
            });

            if (obj.title) data.push(obj);
        }

        return data;
    }

    function parseLine(line) {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const next = line[i + 1];

            if (char === '"' && next === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map(v => v.trim());
    }

    /* ================= RENDER ================= */
    function renderFeatured() {
        featuredTitle.textContent = featured.title;
        featuredExcerpt.textContent = featured.excerpt;
        featuredCategory.textContent = featured.category;

        featuredImage.innerHTML = featured.imageurl
            ? `<img src="${featured.imageurl}" alt="${featured.title}" loading="lazy">`
            : `<div class="image-placeholder"></div>`;
    }

    function renderRecent() {
        recentList.innerHTML = "";

        articles.slice(1, 5).forEach((article, i) => {
            const el = document.createElement("div");
            el.className = "recent-item";
            el.onclick = () => openArticleModal(i + 1);


            el.innerHTML = `
                <div class="recent-text">
                    <h5>${article.title}</h5>
                    <p>${article.excerpt.substring(0, 90)}...</p>
                    <div class="recent-date">
                        ${formatDate(article.date)} • ${article.readtime}
                    </div>
                </div>
            `;
            recentList.appendChild(el);
        });
    }

    /* ================= MODAL ================= */
    window.openArticleModal = (type) => {
        const article = type === "featured" ? featured : articles[type];
        if (!article) return;

        modalContent.innerHTML = `
            <div class="modal-header">
                <span class="modal-category">${article.category}</span>
                <h2 class="modal-title">${article.title}</h2>
                <div class="modal-meta">
                    <span>${formatDate(article.date)}</span>
                    <span>•</span>
                    <span>${article.readtime}</span>
                    <span>•</span>
                    <span>Serendib Escape</span>
                </div>
            </div>

            <div class="modal-body">
                ${article.imageurl ? `<img src="${article.imageurl}" class="modal-image">` : ""}
                <div class="article-full-content">
                    ${article.full_content && article.full_content.trim() !== ""
                        ? article.full_content
                        : `<p>${article.excerpt}</p>`
                    }
                </div>
            </div>
        `;

        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    };

    function setupModal() {
        modalOverlay.onclick = closeModal;
        modalClose.onclick = closeModal;
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") closeModal();
        });
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    /* ================= HELPERS ================= */
    function formatDate(d) {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function showError() {
        featuredTitle.textContent = "Updates temporarily unavailable";
        featuredExcerpt.textContent = "Please check back shortly.";
    }
});
