(function () {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    const success = document.getElementById('fbSuccess');
    const message = document.getElementById('fbMessage');
    const count = document.getElementById('fbCount');
    const STORAGE_KEY = 'alpineAscentsFeedback';

    message.addEventListener('input', () => { count.textContent = message.value.length; });

    function setError(id, text) {
        const el = document.getElementById(id);
        el.textContent = text;
        const field = el.closest('.fb-field');
        if (field) field.classList.toggle('invalid', Boolean(text));
        return !text;
    }

    function validate() {
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const topic = form.topic.value;
        const rating = form.querySelector('input[name="rating"]:checked');
        const text = message.value.trim();

        const results = [
            setError('fbNameError', name.length < 2 ? 'Enter your name.' : ''),
            setError('fbEmailError', email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : ''),
            setError('fbTopicError', !topic ? 'Choose a topic.' : ''),
            setError('fbRatingError', !rating ? 'Select a star rating.' : ''),
            setError('fbMessageError', text.length < 10 ? 'Write at least 10 characters.' : '')
        ];
        return results.every(Boolean);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate()) {
            const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const entry = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            topic: form.topic.value,
            rating: Number(form.querySelector('input[name="rating"]:checked').value),
            message: message.value.trim(),
            mayContact: form.reply.checked,
            date: new Date().toISOString()
        };
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            all.push(entry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch (err) {}

        document.getElementById('fbThanksName').textContent = entry.name.split(' ')[0];
        form.hidden = true;
        success.hidden = false;
        success.focus();
    });

    document.getElementById('fbAgain').addEventListener('click', function () {
        form.reset();
        count.textContent = '0';
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        success.hidden = true;
        form.hidden = false;
        form.name.focus();
    });
})();