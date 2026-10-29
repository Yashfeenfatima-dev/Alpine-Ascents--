document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".adventure-card");
    var emptyMessage = document.getElementById("filterEmpty");

    function applyFilter(type) {
        var visible = 0;

        cards.forEach(function (card) {
            var show = type === "all" || card.dataset.type === type;
            card.hidden = !show;
            if (show) {
                card.classList.add("visible");
                visible++;
            }
        });

        buttons.forEach(function (btn) {
            var isActive = btn.dataset.filter === type;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });

        if (emptyMessage) {
            emptyMessage.hidden = visible !== 0;
        }
    }

    buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            applyFilter(btn.dataset.filter);
        });
    });

    var rows = document.querySelectorAll(".levels-table tbody tr");
    rows.forEach(function (row) {
        row.addEventListener("click", function () {
            var already = row.classList.contains("selected");
            rows.forEach(function (r) {
                r.classList.remove("selected");
            });
            if (!already) {
                row.classList.add("selected");
            }
        });
    });
});
