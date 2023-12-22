import Phaser from "phaser";

import HelloWorldScene from "./scenes/HelloWorldScene";
import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";
import GameOver from "./scenes/GameOver";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: true,
    },
  },
  scene: [Preloader, Game, GameOver],
};

export default new Phaser.Game(config);
