import $ from 'jquery';
import Selectize from 'selectize';

Selectize.define('option_click', function(options) {
    const self = this;
    const setup = self.setup;
    this.setup = function() {
        setup.apply(self, arguments);
        let clicking = false;

        // Detect click on a .clickable
        self.$dropdown_content.on('mousedown click', function(e) {
            const target = $(e.target);
            if (target.hasClass('clickable') || target.closest('.clickable').length) {
                if (e.type === 'mousedown') {
                    clicking = true;
                    self.isFocused = false; // awful hack to defuse the document mousedown listener
                } else {
                    self.isFocused = true;
                    setTimeout(function() {
                        clicking = false; // wait until blur has been preempted
                    });
                }
            } else { // cleanup in case user right-clicked or dragged off the element
                clicking = false;
                self.isFocused = true;
            }
        });

        // Intercept default handlers
        self.$dropdown.off('mousedown click', '[data-selectable]').on('mousedown click', '[data-selectable]', function() {
            if (!clicking) {
                return self.onOptionSelect.apply(self, arguments);
            }
        });
        self.$control_input.off('blur').on('blur', function() {
            if (!clicking) {
                return self.onBlur.apply(self, arguments);
            }
        });
    };
});
