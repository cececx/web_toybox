import os.path

# get path
path = os.path.realpath(__file__)
p, f = os.path.split(path)

# open file
fi = open(p + '/data.txt', 'r')
fo = open(p + '/data.xml', 'w')

# remove empty lines
lines = fi.read().splitlines()
lines = [line for line in lines if line.strip()]

# constellation
def writeConstel (i):
    fo.write('<constellation>\n')
    fo.write('    <name>' + lines[i] + '</name>\n')
    fo.write('    <data>\n')
    fo.write('        <alias>' + lines[i+1] + '</alias>\n')
    fo.write('        <month>' + lines[i+2] + '</month>\n')
    fo.write('    </data>\n')

# star
def writeStar (i):
    fo.write('    <star>\n')
    fo.write('        <name>' + lines[i] + '</name>\n')
    fo.write('        <info>\n')
    fo.write('            <alias>' + lines[i+1] + '</alias>\n')
    fo.write('            <trans>' + lines[i+2] + '</trans>\n')
    fo.write('            <type>'  + lines[i+3] + '</type>\n')
    fo.write('            <size>'  + lines[i+4] + '</size>\n')
    fo.write('            <rank>'  + lines[i+5] + '</rank>\n')
    fo.write('        </info>\n')
    fo.write('        <magnitude>' + lines[i+6] + '</magnitude>\n')
    ra = lines[i+7].split()
    dec = lines[i+8].split()
    fo.write('        <ra><h>'  + ra[0]  + '</h><m>' + ra[1]  + '</m><s>' + ra[2]  + '</s></ra>\n')
    fo.write('        <dec><d>' + dec[0] + '</d><m>' + dec[1] + '</m><s>' + dec[2] + '</s></dic>\n')
    fo.write('    </star>\n')

# write file header
fo.write('<?xml version="1.0" encoding="UTF-8"?>\n')
fo.write('<sky>\n')

index = 0

while (index < len(lines)):
    if lines[index] == '[constellation]':
        writeConstel(index+1)
        index += 4
    elif lines[index] == '[star]':
        writeStar(index+1)
        index += 10
    elif lines[index] == '[end]':
        fo.write('</constellation>\n')
        index += 1
    else:
        index += 1

fo.write('</sky>\n')
fi.close()
fo.close()

    