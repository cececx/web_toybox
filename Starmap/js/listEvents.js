// add class to element
function addClass (elem, cName) {
    if (elem.className === undefined)
        return;
    var names = elem.className.split(" ");
    for (var i in names) {
        if (names[i] == cName)
            return
    }
    names.push(cName);
    elem.className = names.join(" ");
}

// remove class from element
function removeClass (elem, cName) {
    if (elem.className === undefined)
        return;
    var names = elem.className.split(" ");
    for (var i in names) {
        if (names[i] == cName)
            names.splice(i, 1);
    }
    elem.className = names.join(" ");
}

// return if element has the class
function hasClass (elem, cName) {
    if (elem.className === undefined)
        return;
    var names = elem.className.split(" ");
    for (var i in names) {
        if (names[i] == cName)
            return true;
    }
    return false;
}

// toggle 233
function toggleFold (elem) {
    if (hasClass(elem, "close"))
        unfold (elem);
    else
        fold (elem);
}

// when fold, fold all of its children
function fold (elem) {
    if (hasClass(elem, "close"))
        return;
    addClass(elem, "close");
    var child = elem.querySelectorAll("div");
    for(var i in child) {
        addClass(child[i], "close");
    }
}

// when unfold, fold all its siblings, unless this is a season node
function unfold (elem) {
    if (!hasClass(elem, "close"))
        return;
    if (hasClass(elem, "season")) {
        removeClass(elem, "close");
        return;
    }
    // find all siblings
    var node = elem.parentNode.firstChild.nextSibling;
    for (; node; node = node.nextSibling)
        addClass(node, "close");
    removeClass(elem, "close");
}

// searching
function search (input) {
    if (input=="") {
        resetMenu();
    }
    hideAllMenu();
    var elems = trie.get(input.toLowerCase());
    for (var i in elems) {
        showMenuNode(elems[i]);
    }
}

// reset menu folding status
function resetMenu() {
    var divs = menuRoot.querySelectorAll("div");
    for (var i in divs) {
        removeClass(divs[i], "hide");
        if (hasClass(divs[i], "star"))
            addClass(divs[i], "closs");
        else
            removeClass(divs[i], "closs");
    }
}

// hide all
function hideAllMenu() {
    var divs = menuRoot.querySelectorAll("div");
    for (var i in divs) {
        removeClass(divs[i], "close");
        addClass(divs[i], "hide");
    }
}

// show node
function showMenuNode(element) {
    var elem = element;
    while (elem != menuRoot) {
        removeClass(elem, "hide");
        elem = elem.parentNode;
    }
}
