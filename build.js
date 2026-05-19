// remove-html.js
document.addEventListener("DOMContentLoaded", function () {
  // 1. Redirect .html URLs to clean URLs
  if (window.location.pathname.endsWith(".html")) {
    const cleanUrl = window.location.pathname.replace(/\.html$/, "");
    window.history.replaceState(null, "", cleanUrl);
  }

  // 2. Automatically fix all internal links
  document.querySelectorAll("a[href$='.html']").forEach(function (link) {
    link.href = link.href.replace(/\.html$/, "");
  });

  // 3. Optional: Redirect hardcoded .html links
  document.querySelectorAll("a").forEach(function (link) {
    if (link.href.includes(".html")) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = link.href.replace(/\.html$/, "");
      });
    }
  });
});
