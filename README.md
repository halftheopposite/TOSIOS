# tosios

The Open-Source IO Shooter is an open-source multiplayer game in the browser. It is meant to be hostable and playable by (almost) anyone. This is not an attempt at creating an outstanding gaming experience, but to create an easily understandable and modifiable multiplayer browser game.

## Building

**Docker**

Run `docker build -t tosios .`

**Local (Yarn is required)**

Run `yarn && yarn build`

## Running

**Docker**

Run `docker run -d -p 3001:3001 [IMAGE_ID]`

The `-d` option will run the container in the background (recommended if you want to have access to your current terminal session).

The `-p` option will let you choose on which port the container will listen (e.g. the first `3001` will make it accessible to `http://localhost:3001`), and on which internal port must the server listen (e.g. the second `3001`).

The `[IMAGE_ID]` is easily discoverable by running `docker images` in the terminal.

**Local**

Run `yarn serve`.

**Tips**

To get your local IP you can run `ipconfig getifaddr en0`.

## Project architecture

This project is a monorepo (with the help of Yarn workspaces). It contains the following packages:

* `client` - A `Create React App` using `PIXI.js` and `Colyseus.js`.
* `server` - An `Express` app using `Colyseus`.
* `common` - A collection of constants and methods shared amongst `client` and `server`.

### Maps

TODO

### Props

TODO

## Modding

TODO

## Special thanks

Thanks to [@endel](https://github.com/endel) for his fabulous work on [Colyseus](https://github.com/colyseus/colyseus) that made this game possible.

Thanks to the [PIXI.js](https://github.com/pixijs/pixi.js) team for their incredible library and up-to-date documentation. 

Thanks to [@pixel_poem](https://twitter.com/pixel_poem) for the art package he published on Itch.io which made this game looks cool instantly.

## Licenses

This project is under the MIT license.

The major libraries used in this project have the following licenses:

* Colyseus: [MIT](https://github.com/colyseus/colyseus/blob/master/LICENSE)
* PIXI.js: [MIT](https://github.com/pixijs/pixi.js/blob/dev/LICENSE)
