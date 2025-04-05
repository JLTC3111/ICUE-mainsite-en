function loadPage(page) {
    fetch(`${page}.html`)
      .then(response => response.text())
      .then(html => {
        document.getElementById('content').innerHTML = html;
        window.history.pushState({}, '', `${page}.html`);
      })
      .catch(err => {
        document.getElementById('content').innerHTML = '<h1>Page not found</h1>';
      });
  }
  