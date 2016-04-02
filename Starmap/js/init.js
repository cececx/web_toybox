function addDomNode (parent, type, name, alias) {
    // div
    var div = document.createElement("div");
    div.className = type + (type=="star" ? " list-folder close" : " list-folder");
    parent.appendChild(div);

    // span
    var span = document.createElement("span");
    span.className = "list-title";
    span.innerHTML = name;
    div.appendChild(span);
    span.addEventListener('click', function(event){ toggleFold(div) });

    if (!alias) return div;

    // alias
    var aspan = document.createElement("span");
    aspan.innerHTML = alias;
    span.appendChild(aspan);
    return div;
}

function addDomItem (parent, strings) {
    var div = document.createElement("div");
    div.className = "list-item";
    parent.appendChild(div);

    // add descriptions >w<
    strings.forEach( function(item){
        var span = document.createElement("span");
        span.innerHTML = item;
        div.appendChild(span);
    });
    return div;
}

var trie;
var menuRoot;
function init () {
    menuRoot = document.getElementById("list-container");
    trie = new SuffixTrie();
    // traverse data
    for (var season of data) {                        // traverse seasons
        var ss = addDomNode(menuRoot, "season", season.name.toUpperCase());
        for (var cons of season.cons) {               // travers constellations
            var c = addDomNode(ss, "constellation", cons.name, cons.alias.toUpperCase());
            trie.add(cons.name.toLowerCase(), c);     // add constellation name to trie
            for (var star of cons.stars) {            // travers stars
                var s = addDomNode(c, "star", star.name, star.alias);
                trie.add(star.name.toLowerCase(), s); // add star name to trie
                addDomItem(s, star.info);
            }
        }
    }

    // add listener to text input
    var input = document.getElementById("search");
    input.addEventListener('input', function(event){ search(input.value) });

    setupCanvas();
}
