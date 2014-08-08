remoteVolume="//cpowell@fi--didewd1.dide.local/C\$/inetpub/"
localVolume="/Users/Chris/WD1"

if mount|grep $localVolume > /dev/null; then
    echo "Volume already mounted"
else
    mount -t smbfs $remoteVolume  $localVolume
fi

grunt build

git add dist && git commit -m "build"
git subtree split --prefix dist -b builds
git push deploy dist:dist

umount ~/WD1
