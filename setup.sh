#!/bin/bash

version=v1.11.50
wpath=skaiui/www
eurl=https://github.com/vector-im/element-web/releases/download/$version/element-$version.tar.gz

if [ -d "$wpath/element" ]; then
  exit 0
fi

echo Downloading element from $eurl
cd $wpath
curl -OL $eurl

if ! [ -f "$wpath/element-$version.tar.gz" ]; then
  curl -OL $eurl
fi

echo 'Extracting element'
tar -xvzf element-$version.tar.gz

echo 'Cleaning up element'
mv element-$version element
rm -f element-$version.tar.gz

echo 'Setting up element'
cp element/config.sample.json element/config.json

sed -i 's|<head>|&\n    <base href="/element/" />|' element/index.html
