document.addEventListener("DOMContentLoaded", function () {
  // 1. If the current URL has ".html", remove it
  if (window.location.pathname.endsWith(".html")) {
    const cleanUrl = window.location.pathname.replace(/\.html$/, "");
    window.history.replaceState(null, "", cleanUrl);
  }

  // 2. Fix all internal links to remove ".html"
  document.querySelectorAll("a[href$='.html']").forEach(function (link) {
    link.href = link.href.replace(/\.html$/, "");
  });
});
