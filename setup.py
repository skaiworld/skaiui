import os
import shutil
import tarfile
import requests

version = 'v1.11.50'
element = f'https://github.com/vector-im/element-web/releases/download/{ version }/element-{ version }.tar.gz'

print( 'Downloading element' )
response = requests.get( element )
open( 'skaiui/www/element.tar.gz', 'wb' ).write( response.content )

print( 'Extracting element' )
tar = tarfile.open( 'skaiui/www/element.tar.gz' )
tar.extractall( path='skaiui/www' )
tar.close()

print( 'Cleaning up element' )
shutil.move( f'skaiui/www/element-{ version }', 'skaiui/www/element' )
os.remove( 'skaiui/www/element.tar.gz' )

print( 'Modifying element index.html base' )
with open( 'skaiui/www/element/index.html', 'r' ) as in_file:
    buf = in_file.readlines()

with open( 'skaiui/www/element/index.html', 'w' ) as out_file:
    for line in buf:
        if '<head>' in line:
            line = line + '    <base href="/element/" />\n'
        out_file.write(line)
