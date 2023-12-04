import os
import shutil
import tarfile
import requests

version = 'v1.11.50'
element = f'https://github.com/vector-im/element-web/releases/download/{ version }/element-{ version }.tar.gz'

def add_element():
    print( 'Downloading element' )
    response = requests.get( element )
    open( 'www/element.tar.gz', 'wb' ).write( response.content )

    print( 'Extracting element' )
    tar = tarfile.open( 'www/element.tar.gz' )
    tar.extractall( path='www' )
    tar.close()

    print( 'Cleaning up element' )
    shutil.move( f'www/element-{ version }', 'www/element' )
    os.remove( 'www/element.tar.gz' )

    print( 'Setting up element' )
    shutil.copy( 'www/element/config.sample.json', 'www/element/config.json' )

    with open( 'www/element/index.html', 'r' ) as in_file:
        buf = in_file.readlines()

    with open( 'www/element/index.html', 'w' ) as out_file:
        for line in buf:
            if '<head>' in line:
                line = line + '    <base href="/element/" />\n'
            out_file.write(line)
