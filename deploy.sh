#!/bin/bash
PROJECT='discord-bot'

ROOT_USER=root

HOST=134.209.85.102
USER=sandervspl
PORT=5000
INSTANCES=1

APP_ENV=production

#Don't touch this
ENV=PROD

#!/bin/bash

if [ -z "$PM2_CONFIG_NAME" ]; then
    PM2_CONFIG_NAME=pm2-config.json
fi

PDIR=/var/api/$PROJECT
FILENAME=build.tar.gz
c='\033[1m'
nc='\033[0m'
red='\033[1;31m'

echo -e "🚀 $c Deploying $PROJECT for PROD $nc"

#Check with user for version
git fetch --tags
BUMP=false
VERSION=$(git describe --abbrev=0 --tags)

if [ "$1" = "1" ]; then
    BUMP=major;
elif [ "$1" = "2" ]; then
    BUMP=minor;
elif [ "$1" = "3" ]; then
    BUMP=patch;
elif [ "$1" = "4" ]; then
    BUMP=false;
else
    echo "Current version is: $VERSION - Do you want to update?"
    options=("Major" "Minor" "Patch" "Continue")
    select opt in "${options[@]}"
    do
        case $opt in
            "Major") BUMP=major; break;;
            "Minor" ) BUMP=minor; break;;
            "Patch" ) BUMP=patch; break;;
            * ) break;;
        esac
    done
fi

if [ "$BUMP" != false ]; then
    #Checks if there are no changes when you want to create a tag
    HAS_CHANGES=false
    git diff-index --quiet HEAD -- || HAS_CHANGES=true;

    if [ "$HAS_CHANGES" = true ]; then
        echo "Commit your changes first";
        exit;
    fi
    npm version $BUMP;
    echo -e "💎 $c Updated version $nc"
    git push --tags
fi

VERSION=$(git describe --abbrev=0 --tags)

#Creating project build
echo -e "🛠 $c Creating project build $nc"
APP_ENV=$APP_ENV npm run build

#Create PM2 config file
echo -e "⚡️ $c Generating PM2 server file $nc"
sed "s/NAME/$PROJECT/g; s/port/$PORT/g; s/app_env/$APP_ENV/g; s/PROJECT/$PROJECT-$VERSION/g; s/INSTANCES/$INSTANCES/g"  ./pm2-config-template.json > $PM2_CONFIG_NAME

#Build tar and copy to server
echo -e "🚚 $c Copying files to server $nc"
tar -czf $FILENAME ./dist ./static ./package.json ./package-lock.json ./tsconfig-paths-bootstrap.js ./tsconfig.json ./$PM2_CONFIG_NAME ./.env
scp -r ./$FILENAME $USER@$HOST:~
rm ./$FILENAME
rm ./$PM2_CONFIG_NAME

echo -e "🔑 $c Connecting to $HOST $nc"
#Set-up new files, install packages and run server
ssh $USER@$HOST << EOF
    echo -e "🐶 $c Initializing server $nc"
    rm -rf $PDIR*
    mkdir -p $PDIR-$VERSION;
    chown $USER:$USER $PDIR-$VERSION;
    chown $USER:$USER /var/api;
    mv ~/$FILENAME $PDIR-$VERSION;
    su - $USER;
    echo -e "👀 $c Extracting files $nc"
    tar -zxvf $PDIR-$VERSION/$FILENAME -C $PDIR-$VERSION;
    rm $PDIR-$VERSION/$FILENAME;
    echo -e "⚡️ $c Installing packages $nc"
    . /home/sandervspl/.nvm/nvm.sh;
    npm install --production --prefix $PDIR-$VERSION;
    echo -e "🏡 $c Starting server $nc"
    pm2 del $PROJECT
    pm2 start $PDIR-$VERSION/$PM2_CONFIG_NAME
EOF
    # ln -n -f -s $PDIR-$VERSION $PDIR;

if [ $? -eq 0 ]; then
  echo -e "🤘 $c Successfully deployed $PROJECT $VERSION on $HOST $nc"
else
  echo -e "❌ $red Deploy failed for $PROJECT $VERSION on $HOST $nc"
fi
