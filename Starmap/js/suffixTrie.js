// where is my private method QWQ

function TrieNode() {
    this.elem = [];
    this.child = [];
}


TrieNode.prototype = {
    constructor : TrieNode,
    addChild : function (value) {
        if (this.child[value])
            return this.child[value];
        var node = new TrieNode();
        this.child[value] = node;
        return node;
    },
    addElem : function (domNode) {
        this.elem.forEach( function(item) {
            if (item === domNode)
                return;
        });
        this.elem.push (domNode);
    }
}


function SuffixTrie() {
    this.root = new TrieNode();
}


SuffixTrie.prototype = {
    constructor : SuffixTrie,
    add : function (name, domNode) {
        // add single string into trie
        var addSuffix = function (r, suffix, dom) {
            var node = r;
            while (suffix.length > 0) {
                node = node.addChild(suffix[0]);
                suffix = suffix.substring(1);
            }
            node.addElem(dom);
        }
        // add all suffix
        for (var i=0; i<name.length; i++) {
            addSuffix(this.root, name.substring(i), domNode);
        }
    },
    get : function (input) {
        // find the last node in trie
        var node = this.root;
        while (node && input.length > 0) {
            node = node.child[input[0]];
            input = input.substring(1);
        }
        // input string remains --> input cannot match any node
        if (!node || input.length > 0)
            return [];
        // otherwise, dfs the remaining trie to find all matching results
        var dfs = function (trieNode) {
            var res = trieNode.elem;
            for (var i in trieNode.child)
                res = res.concat(dfs(trieNode.child[i]));
            return res;
        }
        return dfs(node);
    },
    print : function () {
        dfsPrint = function (n, str) {
            var size = 0;
            for (var key in n.child) {
                ++size;
                dfsPrint (n.child[key], str + key);
            }
            if (size == 0)
                console.log(str);
        }
        dfsPrint(this.root, "");
    }
}
