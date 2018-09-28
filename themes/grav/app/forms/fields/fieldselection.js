import $ from 'jquery';
// theFunction
function fieldSelection() {
    $('.fieldselection').each(function() {
        var theFieldselection = $(this);
        var theSelect = theFieldselection.find('.fieldselection__select');
        var theSelectParent = theSelect.closest('.fieldselection__item--theSelector');
        var theValue = theSelect.val();
        var theRefererPrefix = '.fieldselection__item--';
        var theReferer = theRefererPrefix + theValue;
        var theFieldToShow = theFieldselection.find(theReferer);
        // Exeption - no value as selected
        if (!theValue) { return; }
        // show the selected field
        theFieldToShow.addClass('fieldselection__item--show');
        // hide the select
        theSelectParent.removeClass('fieldselection__item--show');
    });
}
// theCaller
$(document).on('change', '.fieldselection__select', fieldSelection);
$(document).on('ready', fieldSelection);
