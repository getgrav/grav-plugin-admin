(function () {
    var input = document.getElementById('config-search-input');
    var clearBtn = document.getElementById('config-search-clear');
    if (!input || !clearBtn) return;

    var form = document.getElementById('blueprints');
    if (!form) return;

    var debounceTimer;

    function normalize(text) {
        return text.toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function clearState() {
        form.querySelectorAll('.form-field.grid.search-highlight').forEach(function (el) {
            el.classList.remove('search-highlight');
        });
        form.querySelectorAll('.search-count-badge').forEach(function (el) {
            el.remove();
        });
        form.querySelectorAll('.tab__link.search-no-match').forEach(function (el) {
            el.classList.remove('search-no-match');
        });
        form.querySelectorAll('.block.search-hidden').forEach(function (el) {
            el.classList.remove('search-hidden');
        });
    }

    function matchFields(container, query) {
        var count = 0;
        container.querySelectorAll('.form-field.grid').forEach(function (field) {
            var label = field.querySelector('.form-label');
            if (label && normalize(label.textContent).indexOf(query) !== -1) {
                field.classList.add('search-highlight');
                count++;
            }
        });
        return count;
    }

    function searchTabbed(container, query) {
        var tabLinks = container.querySelectorAll('.tabs-nav .tab__link');
        var firstMatch = null;

        tabLinks.forEach(function (link) {
            var tabId = link.getAttribute('data-tabid');
            var content = tabId ? document.getElementById(tabId) : null;
            if (!content) return;

            var count = matchFields(content, query);

            if (count > 0) {
                link.classList.remove('search-no-match');
                var span = link.querySelector('span');
                if (span) {
                    var badge = document.createElement('span');
                    badge.className = 'search-count-badge';
                    badge.textContent = count;
                    span.appendChild(badge);
                }
                if (!firstMatch) firstMatch = link;
            } else {
                link.classList.add('search-no-match');
            }
        });

        // Auto-switch if active tab has no matches
        if (firstMatch) {
            var active = container.querySelector('.tabs-nav .tab__link.active');
            if (!active || active.classList.contains('search-no-match')) {
                firstMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        }
    }

    function searchFlat(query) {
        form.querySelectorAll('.block.block-section').forEach(function (block) {
            var count = matchFields(block, query);
            if (count === 0) {
                block.classList.add('search-hidden');
            }
        });
    }

    function runSearch(rawQuery) {
        clearState();

        var query = normalize(rawQuery);
        if (!query) return;

        var sideTabs = form.querySelector('.form-tabs.side-tabs');
        if (sideTabs) {
            searchTabbed(sideTabs, query);
        } else {
            searchFlat(query);
        }
    }

    input.addEventListener('input', function () {
        var val = this.value;
        clearBtn.style.display = val ? 'inline-flex' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () { runSearch(val); }, 200);
    });

    clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.style.display = 'none';
        runSearch('');
        input.focus();
    });
}());
