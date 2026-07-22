document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll("[data-gs-doc-link]"));
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.find((item) => item.getAttribute("href") === `#${entry.target.id}`);
        if (link) link.classList.toggle("is-current", entry.isIntersecting);
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
});
