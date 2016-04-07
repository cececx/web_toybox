import os.path
import codecs

path = os.path.realpath(__file__)
p, f = os.path.split(path)

# fi = open(p + '/cons', 'r')
# fo = open(p + '/cons.js', 'w')

with codecs.open(p + '/stardetail.txt', 'r', encoding='utf8') as fi:
    lines = fi.read()

lines = lines.splitlines()

'''
var starDetails = [
   { belongTo: "cons", name: "name", abr: "abr", trans: "trans" },
   ....
];
'''

def writeLine (i):
    arg = lines[i].split("\t");
    out = '{ belongTo: "' + arg[0].replace(" ", "").lower() + '", '
    if arg[1] == "N/A":
        arg[1] = arg[2] + " " + arg[0]
    out += 'name: "' + arg[1] + '", abr: "' + arg[2] + '", trans: "' + arg[3] + '"},\n';
    fo.write(out)


index = 0

with codecs.open(p + '/stardetails.js', 'w', encoding='utf8') as fo:
    fo.write('var starDetail = [\n')
    while (index < len(lines)):
        writeLine (index)
        index += 1

    fo.write('];')

fi.close()
fo.close()

    