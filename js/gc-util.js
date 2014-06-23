/*
 * Utility functions which aren't really part of the application logic
 * but which we want to re-use several times.
 */

GC.Util = function(){};

// Check if a variable is empty
GC.Util.prototype.isEmpty = function(what){
    return what === undefined || what === null || what === '' || what === [];
};

// Returns a promise that instantly fulfills and returns the passed value
// Used when a function might return several possible values, including promises and non-promises
GC.Util.prototype.fakePromise = function(returnme){
    var def = $.Deferred();
    def.resolve(returnme);
    return def;
};

// Put the focus at the end of the existing contents of a text field
GC.Util.prototype.focusAtEnd = function(field){
    keywordTextBox = $(field)[0];
    var pos = keywordTextBox.value.length;
    if (keywordTextBox.setSelectionRange) {
        keywordTextBox.setSelectionRange(pos, pos);
    } else if (keywordTextBox.createTextRange) {
        var textRange = keywordTextBox.createTextRange();
        textRange.collapse(true);
        textRange.moveEnd("character", pos);
        textRange.moveStart("character", pos);
        textRange.select();
    }
    keywordTextBox.focus();
};
