import os.path
import codecs

path = os.path.realpath(__file__)
p, f = os.path.split(path)

# fi = open(p + '/cons', 'r')
# fo = open(p + '/cons.js', 'w')

with codecs.open(p + '/cons.txt', 'r', encoding='utf8') as fi:
    lines = fi.read()

lines = lines.splitlines()

'''
var constellations = {
   name1 : { name: "name", abr: "abr", title: "title", atti: "atti", season: "S" },
   ....
};
'''

def writeLine (i):
    arg = lines[i].split("\t");
    out = '{ name: "' + arg[0] + '", abr: "'
    out += arg[1] + '", title: "' + arg[3] + '", trans: "'
    out += arg[4] + '", atti: ' + arg[5] + ', season: "' + arg[7] + '" },\n'
    fo.write(out)


index = 0

with codecs.open(p + '/constellationdata.js', 'w', encoding='utf8') as fo:
    fo.write('var constellationData = [\n')
    while (index < len(lines)):
        writeLine (index)
        index += 1

    fo.write('];')

fi.close()
fo.close()

    