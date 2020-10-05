# Tankr
Arcade Tank Game

[![Build Status](https://travis-ci.com/DankGamesStudios/Tankr.svg?branch=master)](https://travis-ci.com/DankGamesStudios/Tankr)

[Play the game](https://dankgamesstudios.github.io/Tankr/)

### Contributing

```bash
npm install
npm run-script server:dev
```
Then start playing or start writing code.


### Updating demo app
```bash
npm run-script build:dist
npm run-script deploy
```

### Docker

#### Build and Run

There are two docker versions: dev and production.

In order build and run the production docker, configure `constants.sh` and run:

```
bash build.sh
bash run.sh
```

In order build and run the development docker, configure `constants-dev.sh` and run:

```
bash build.sh dev
bash run.sh dev
```

#### Deploy

To push the docker to a hub, configure the constants file and run:

```
bash deploy.sh
```

Deploy also supports the `dev` for the first argument.

#### Reverse proxy with directory

If you want to deploy the app with a reverse proxy and point it to a directory,
you need to edit the webpack.dist.config.js file and add the `publicPath` for both
`output` and `devServer`. The path is the directory path. For example:
`local.dev/tankr` - `publicPath: '/tankr'`.

### Acknowledgments

Thanks to [www.kenney.nl](https://www.kenney.nl/) for public license assets!
