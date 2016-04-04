import os.path
import codecs

path = os.path.realpath(__file__)
p, f = os.path.split(path)

# fi = open(p + '/all sky stars.txt', 'r')
# fo = open(p + '/stardata.js', 'w')

with codecs.open(p + '/all sky stars.txt', 'r', encoding='utf8') as fi:
    lines = fi.read()

lines = lines.splitlines()
# lines = [line for line in lines if line.strip()]


'''
stars = [
   [
      {name : "name", ra:[a,b,c], dec:[a,b,c], vmeg:0, ameg:0, dist:0},
   ],
];
'''

def writeLine (i, cons):
    # lines[i].replace('?', ' ')
    arg = lines[i].split("\t");
    if int(arg[0]) != cons:
        cons = int(arg[0])
        fo.write("],[")
    
    # ra & dec
    ra = arg[2].split()
    dec = arg[3].split()

    try:
        out = "{"
        out += "name: " + '"' + arg[1] + '", '
        out += "ra:[" + str(float(ra[0])) + ", "
        out += str(float(ra[1])) + ", "
        out += str(float(ra[2])) + "], "
        out += "dec:[" + str(float(dec[0])) + ", "
        out += str(float(dec[1])) + ", "
        out += str(float(dec[2])) + "], "
        out += "vmeg: " + str(float(arg[4])) + ", "
        out += "ameg: " + str(float(arg[5])) + ", "
        out += "dist: " + str(float(arg[6])) + "}, \n"
    except:
        print (lines[i])
    fo.write(out)
    return cons


index = 1
cons = 1

with codecs.open(p + '/stardata.js', 'w', encoding='utf8') as fo:
    fo.write('var stardata = [[\n')
    while (index < len(lines)):
        cons = writeLine (index, cons)
        index += 1

    fo.write(']];')

fi.close()
fo.close()

    