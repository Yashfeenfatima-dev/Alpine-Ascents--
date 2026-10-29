(function () {
    const list = document.getElementById("checkItems");
    if (!list) return;

    const boxes = list.querySelectorAll('input[type="checkbox"]');
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");
    const reset = document.getElementById("resetChecklist");
    const KEY = "aa_checklist";

    try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
        boxes.forEach(function (box, i) { box.checked = saved[i] === true; });
    } catch (e) {}

    function update() {
        let done = 0;
        const state = [];
        boxes.forEach(function (box) {
            const li = box.closest("li");
            li.classList.toggle("done", box.checked);
            if (box.checked) done++;
            state.push(box.checked);
        });

        const total = boxes.length;
        fill.style.width = (done / total) * 100 + "%";
        text.textContent = done === total
            ? "All " + total + " complete. You are ready to go."
            : done + " of " + total + " complete";
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    boxes.forEach(function (box) {
        box.addEventListener("change", update);
    });

    reset.addEventListener("click", function () {
        boxes.forEach(function (box) { box.checked = false; });
        update();
    });

    update();
})();
