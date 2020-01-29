import $ from 'jquery';

document.addEventListener('click', (event) => {
    if (document.querySelector('#pages-filters')) {
        return true;
    }

    const wrapper = event.target.closest('.checkboxes.indeterminate');

    if (wrapper) {
        event.preventDefault();
        const checkbox = wrapper.querySelector('input[type="checkbox"]:not([disabled])');
        const checkStatus = wrapper.dataset._checkStatus;
        wrapper.classList.remove('status-checked', 'status-unchecked', 'status-indeterminate');

        switch (checkStatus) {
            // checked, going indeterminate
            case '1':
                wrapper.dataset._checkStatus = '2';
                checkbox.indeterminate = true;
                checkbox.checked = false;
                checkbox.value = 0;
                wrapper.classList.add('status-indeterminate');
                break;

            // indeterminate, going unchecked
            case '2':
                wrapper.dataset._checkStatus = '0';
                checkbox.indeterminate = false;
                checkbox.checked = false;
                checkbox.value = '';
                wrapper.classList.add('status-unchecked');
                break;

            // unchecked, going checked
            case '0':
            default:
                wrapper.dataset._checkStatus = '1';
                checkbox.indeterminate = false;
                checkbox.checked = true;
                checkbox.value = 1;
                wrapper.classList.add('status-checked');
                break;
        }

        // const input = new CustomEvent('input', { detail: { target: checkbox }});
        // document.dispatchEvent(input);
        $(checkbox).trigger('input');
    }
});

(document.querySelectorAll('input[type="checkbox"][indeterminate="true"]') || []).forEach((input) => { input.indeterminate = true; });
