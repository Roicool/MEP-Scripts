(function () {
  'use strict';

  function init() {
    var wrapper = document.querySelector('.w-pagination-wrapper');
    if (!wrapper) return;

    var totalEl = wrapper.querySelector('.pagination-total-pages');
    var totalPages = totalEl
      ? parseInt(totalEl.textContent, 10)
      : parseInt(wrapper.getAttribute('data-total-pages'), 10);
    if (!totalPages || totalPages < 2) return;

    var prevLink = wrapper.querySelector('.w-pagination-previous');
    var nextLink = wrapper.querySelector('.w-pagination-next');

    var pageParam = getPageParam(prevLink, nextLink);
    if (!pageParam) return;

    var currentPage = getCurrentPage();

    var container = document.createElement('div');
    container.className = 'pagination-numbers';

    for (var i = 1; i <= totalPages; i++) {
      var a = document.createElement('a');
      a.href = buildUrl(pageParam, i);
      a.textContent = String(i);
      a.className = 'pagination-number' + (i === currentPage ? ' is-active' : '');
      container.appendChild(a);
    }

    if (nextLink) {
      wrapper.insertBefore(container, nextLink);
    } else {
      wrapper.appendChild(container);
    }
  }

  function getCurrentPage() {
    var m = window.location.search.match(/_page=(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  function getPageParam(prevLink, nextLink) {
    var links = [nextLink, prevLink];
    for (var i = 0; i < links.length; i++) {
      if (!links[i]) continue;
      var href = links[i].getAttribute('href') || '';
      var m = href.match(/[?&]([^=&]+_page)=\d+/);
      if (m) return m[1];
    }
    return null;
  }

  function buildUrl(paramKey, pageNum) {
    var path = window.location.pathname;
    var search = window.location.search;

    if (pageNum === 1) {
      var cleaned = search.replace(/([?&])[^=&]+_page=\d+(&?)/, function (_, pre, post) {
        return post ? pre : '';
      });
      return path + (cleaned === '?' ? '' : cleaned);
    }

    if (/_page=\d+/.test(search)) {
      return path + search.replace(/[^=&]+_page=\d+/, paramKey + '=' + pageNum);
    }

    return path + (search ? search + '&' : '?') + paramKey + '=' + pageNum;
  }

  window.addEventListener('load', init);
})();
