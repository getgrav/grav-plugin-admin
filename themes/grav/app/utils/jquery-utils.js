import $ from 'jquery';

// jQuery no parents filter
$.expr[':']['noparents'] = $.expr.createPseudo((text) => (element) => $(element).parents(text).length < 1);
