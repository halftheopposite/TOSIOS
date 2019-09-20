# TOSIOS (The Open-Source IO Shooter)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/halftheopposite/tosios/blob/master/LICENSE) [![](https://github.com/halftheopposite/tosios/workflows/Docker%20Publish/badge.svg)](https://hub.docker.com/r/halftheopposite/tosios)

The Open-Source IO Shooter is an open-source multiplayer game in the browser. It is meant to be hostable and playable by (almost) anyone. This is not an attempt at creating an outstanding gaming experience, but to create an easily understandable and modifiable multiplayer browser game.

![banner](images/banner.jpg "An in-game screenshot")

## 🕹️ Playing

The game principles are fairly easy to grasp:

1. Every player is positionned randomly on the map during the `lobby`.
2. When the `game` starts, each player must take down others.
3. There are some `potions` on the map that restore health.
4. The last one alive wins 🎉.

You can see a very small amount of gameplay below (the framerate of this GIF is low):

![banner](images/game.gif "An in-game animation")


**Movements**

* Move: <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd>.
* Aim: <kbd>Mouse</kbd>
* Shoot: <kbd>Left click</kbd>

## 🏗️ Building

You can build this game yourself easily if you are experienced with modern javascript development or Docker.

### Docker

Run `docker build -t tosios .`

### Local (Yarn is required)

Run `yarn && yarn build`

## 🚀 Running

### Docker Compose

The easiest way to run the game is to use the `docker-compose.yml` file with the following command `docker-compose up`.

### Docker

Run `docker run -d -p 3001:3001 [IMAGE_ID]`

The `-d` option will run the container in the background (recommended if you want to have access to your current terminal session).

The `-p` option will let you choose on which port the container will listen (e.g. the first `3001` will make it accessible to http://localhost:3001), and on which internal port must the server listen (e.g. the second `3001`).

The `[IMAGE_ID]` is easily discoverable by running `docker images` in the terminal.

### Local

Run `yarn serve` and the game will be available at http://localhost:3001.

**Tips**

If you want to **play with friends** at work or home, you can run 
the following command to get your local network IP: `ipconfig getifaddr en0` (ex: http://192.168.1.10:3001).

## 🔧 Development

To run the project in development mode you can run `yarn && yarn start` at the root of the project.

The development mode uses `hot-reloading`, meaning that changes (except for the `common` module) are live. Therefore the URL for testing is http://localhost:3000, as it points towards `create-react-app` development server.

If you encounter a **white screen** the first time you try to load the game, that's normal, just refresh the page. This is due to the order in which things are built at launch.

## Project architecture

This project is a monorepo (with the help of Yarn workspaces). It contains the following packages:

* `client` - A `Create React App` using `PIXI.js` and `Colyseus.js`.
* `server` - A `NodeJS` app using `Express` and `Colyseus`.
* `common` - A collection of constants and methods shared amongst `client` and `server`.

## Modding

### Maps

Maps are composed of `arrays` of `arrays` where each number greater than `0` represents a `wall` to which entities will collide.

When creating a map each number represents a specific wall sprite that will be drawn:
* `1` for a wall on the left
* `2` for a wall on the top
* `3` for a wall on the right
* `4` for a wall on the bottom
* `5` for a wall on the bottom-left (concave angle)
* `6` for a wall on the bottom-right (concave angle)
* `7` for a wall on the top-left (convexe angle)
* `8` for a wall on the bottom-right (convexe angle)

Examples:
```js
  [
    [1, 2, 2, 2, 2, 3],
    [1, 0, 0, 0, 0, 3],
    [1, 0, 7, 8, 0, 3],
    [1, 0, 4, 4, 0, 3],
    [1, 0, 0, 0, 0, 3],
    [5, 4, 4, 4, 4, 6],
  ]
```

## Roadmap (Q3 2019)

This is not an exhaustive, nor final, features list but it will give you a good indication on what I am working on:

* ~Let users select the number of players in a room.~
* ~Publish the docker image onto a registry and add a `docker-compose` file.~
* Add a playable demo website for anyone to test and play the game.
* Add mobile mode (updated GUI and virtual joysticks).
* Add visual feedback when a player gets hit.
* Add a Team Death Match mode.

## Special thanks

Thanks to [@endel](https://github.com/endel) for his fabulous work on [Colyseus](https://github.com/colyseus/colyseus) that made this game possible.

Thanks to the [PIXI.js](https://github.com/pixijs/pixi.js) team for their incredible library and up-to-date documentation. 

Thanks to [@pixel_poem](https://twitter.com/pixel_poem) for the art package he published on Itch.io which made this game looks cool instantly.

## Licenses

This project is under the MIT license.

The major libraries used in this project have the following licenses:

* Colyseus: [MIT](https://github.com/colyseus/colyseus/blob/master/LICENSE)
* PIXI.js: [MIT](https://github.com/pixijs/pixi.js/blob/dev/LICENSE)
* TOSIOS: [MIT](https://github.com/halftheopposite/tosios/blob/master/LICENSE)
