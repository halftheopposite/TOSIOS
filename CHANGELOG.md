# Changelog

All notable changes to this project will be documented in this file.

## 0.16.0 - 2022/03/12

- Use esbuild to build the client and server.
- Use prettier for linting.
- Fix blurry textures for players, props, and monsters.

## 0.15.0

- Migrate Colyseus to 0.14.0.
- Replace browser crosshair with a friendlier one.
- Add first sound effects for explosions.

## 0.14.0

- Big refactoring of the project to remove dependencies from the React (+HUD) and the Game itself.
- More generic approach to manipulate and render entities on the client side.
- Add particle effects to players walking and projectiles' trails.
- Add drop shadows for props, monsters, and players.
- Add more depth to a player weapon by deciding when it should be drawn before or behind.

TODO:

- Migrate Colyseus
- Move the "Game" fields into a "Match" class
- Fix player colors in teams
- Remove bullet color

## 0.13.0

- Implement a new HUD using React for a more flexible UI and development.

## 0.12.0

- Implement a new game menu and leaderboard using React.

## 0.11.0

- Add some flying monsters that target, follow, and attack users.
- Add visual debug mode with bounding boxes and circles.
- Refactor game state into a Finite State Machine.
- Fix shooting of bullets happening on the client-side but not on the server-side.

## 0.10.0

- Add "team death match" mode.

## 0.9.2

- Bug fixes.

## 0.9.1

- Bug fixes.

## 0.9.0

- Create a TMX (Tile Map Editor) parser and renderer for maps.

## 0.8.0

- Add players spawner (ladders) instead of randomized position on the map.
- Fix rooms listing on mobile.

## 0.7.2

- Bug fixes.

## 0.7.1

- Bug fixes.

## 0.7.0

- Better adaptation of the HUD on mobiles.
- Display opponents lives.

## 0.6.0

- Add r-trees for walls collisions on the client and server sides to improve performances.

## 0.5.0

- Add client-side prediction for bullets spawn (results in smoother bullets animations and more accurate collisions).
- Refactor inputs handlers for greater flexibility in keys mapping.

## 0.4.0

- Add a leaderboard for players to see their rank and kills.
- Split sprites, entities and hud elements in different folders.
- Create AnchorContainer which is a PIXI container using the anchor/pivot system.
- Add new assets to represents keyboard keys

## 0.3.0

- Polishe animations for weapons, players and bullets.
- Add animated map sprites.

## 0.2.0

- Migrate colyseus to 0.11.x.
- Add joysticks on mobile.
- Adapt HUD on mobile.

## 0.1.0

- Initial release.
