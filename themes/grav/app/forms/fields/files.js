import $ from 'jquery';
import format from '../../utils/formatbytes';

$('body').on('change', '.form-input-file > input[type="file"]', (event) => {
    let input = event.target;
    let files = input.files;
    let container = $(input).next();

    if (files.length) {
        let html = '';
        html += `${files.length} file${files.length > 1 ? '(s)' : ''} selected`;
        html += '<ul>';
        for (let i = 0; i < files.length; i++) {
            html += `<li>${files[i].name} (${format(files[i].size, 2)})</li>`;
        }

        html += '</ul>';

        container.html(html);
    }
});
