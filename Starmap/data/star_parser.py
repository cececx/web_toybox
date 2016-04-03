import os.path

# get path
path = os.path.realpath(__file__)
p, f = os.path.split(path)

# open file
fi = open(p + '/scorpius.txt', 'r')
fo = open(p + '/scorpius_data.js', 'w')

# remove empty lines
lines = fi.read().splitlines()
lines = [line for line in lines if line.strip()]

def writeLine (i):
    # lines[i] = lines[i].replace("\t", " ");
    strs = lines[i].split();
    out = "[";
    for s in strs:
        out += str(float(s)) + ", "
    out += "],\n"
    fo.write(out)

# write file header
fo.write('var scorpius = [\n')

index = 0

while (index < len(lines)):
    writeLine (index)
    index += 1

fo.write('];')
fi.close()
fo.close()

    