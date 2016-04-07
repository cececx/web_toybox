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
var consmap = [];
function init () {
    menuRoot = document.getElementById("list-container");
    trie = new SuffixTrie();

    // add seasons
    var spring = addDomNode(menuRoot, "season", "SPRING");
    var summer = addDomNode(menuRoot, "season", "SUMMER");
    var autumn = addDomNode(menuRoot, "season", "AUTUMN");
    var winter = addDomNode(menuRoot, "season", "WINTER");
    var south = addDomNode(menuRoot, "season", "SOUTH SKY");

    // add constellations
    for (var cons of constellationData) {
        var season;
        switch(cons.season) {
            case "P": season = spring; break;
            case "S": season = summer; break;
            case "A": season = autumn; break;
            case "W": season = winter; break;
            default: season = south; break;
        }
        if (cons.atti < 20) season = south;
        var c = addDomNode(season, "constellation", cons.name, "THE " + cons.title.toUpperCase());
        trie.add(cons.name.toLowerCase(), c);
        trie.add(cons.trans.toLowerCase(), c);
        consmap[cons.name.replace(" ","").toLowerCase()] = c;
    }

    // add stars
    for (var star of starDetail) {
        if (!consmap[star.belongTo])
            console.log(star);
        else
            var s = addDomNode(consmap[star.belongTo], "star", star.name, star.trans);
        trie.add(star.name.toLowerCase(), s);
        trie.add(star.trans.toLowerCase(), s);
    }
    /*

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
    }*/

    // add listener to text input
    var input = document.getElementById("search");
    input.addEventListener('input', function(event){ search(input.value) });

    setupCanvas();
    window.onresize = function(event){ resetCanvas() };
}
