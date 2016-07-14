import $ from 'jquery';
import Sortable from 'sortablejs';
import PageFilters, { Instance as PageFiltersInstance } from './filter';
import './page';

// Pages Ordering
let Ordering = null;
let orderingElement = $('#ordering');
if (orderingElement.length) {
    Ordering = new Sortable(orderingElement.get(0), {
        filter: '.ignore',
        onUpdate: function(event) {
            let item = $(event.item);
            let index = orderingElement.children().index(item) + 1;
            $('[data-order]').val(index);
        }
    });
}

export default {
    Ordering,
    PageFilters: {
        PageFilters,
        Instance: PageFiltersInstance
    }
};
