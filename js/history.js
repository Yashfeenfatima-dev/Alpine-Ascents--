(function () {
    const buttons = document.querySelectorAll('.era-btn');
    const items = document.querySelectorAll('.timeline-item');
    const empty = document.getElementById('timelineEmpty');

    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const era = btn.dataset.era;
            let shown = 0;

            buttons.forEach(function (b) {
                const isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', String(isActive));
            });

            items.forEach(function (item) {
                item.hidden = era !== 'all' && item.dataset.era !== era;
                if (!item.hidden) {
                    shown++;
                    item.style.animation = 'none';
                    void item.offsetWidth;
                    item.style.animation = '';
                }
            });

            if (empty) empty.hidden = shown !== 0;
        });
    });
})();
