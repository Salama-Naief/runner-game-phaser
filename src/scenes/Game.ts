import Phaser from "phaser";
import AnimationKeys from "~/consts/AnimationKeys";
import MouseState from "~/consts/MouseState";
import SceneKeys from "~/consts/SceneKeys";
import TextureKeys from "~/consts/TextureKeys";
import LaserObstacle from "~/game/LaserObstacle";
import RocketMouse from "~/game/RocketMouse";
export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }
  private background!: Phaser.GameObjects.TileSprite;
  private mouseHouse!: Phaser.GameObjects.Image;
  private window1!: Phaser.GameObjects.Image;
  private window2!: Phaser.GameObjects.Image;
  private bookcase1!: Phaser.GameObjects.Image;
  private bookcase2!: Phaser.GameObjects.Image;
  private laserObstacle!: LaserObstacle;
  private mouse!: RocketMouse;

  private coins!: Phaser.Physics.Arcade.StaticGroup;

  private scoreLabel!: Phaser.GameObjects.Text;
  private score = 0;

  init() {
    this.score = 0;
  }

  create() {
    const width = window.innerWidth; //this.scale.width;
    const height = window.innerHeight; // this.scale.height;
    this.background = this.add
      .tileSprite(0, 0, width, height, TextureKeys.Background)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.background.scaleY = 1.2;

    //add windows to mouse house
    this.window1 = this.add.image(
      Phaser.Math.Between(900, 1300),
      200,
      TextureKeys.Window1
    );

    this.window2 = this.add.image(
      Phaser.Math.Between(1600, 2000),
      200,
      TextureKeys.Window2
    );

    //add mouse hole
    this.mouseHouse = this.add.image(
      Phaser.Math.Between(900, 1500), // x value
      501, // y value
      TextureKeys.MouseHole
    );
    //add Bookcase
    this.bookcase1 = this.add
      .image(
        Phaser.Math.Between(2200, 2700), // x value
        580, // y value
        TextureKeys.Bookcase1
      )
      .setOrigin(0.5, 1);

    this.bookcase2 = this.add
      .image(
        Phaser.Math.Between(2900, 3400), // x value
        580, // y value
        TextureKeys.Bookcase2
      )
      .setOrigin(0.5, 1);

    this.laserObstacle = new LaserObstacle(this, 900, 100);
    this.add.existing(this.laserObstacle);

    //add coin group
    this.coins = this.physics.add.staticGroup();
    this.spawnCoins();

    // add rocket mouse
    this.mouse = new RocketMouse(this, width, height - 30);
    this.add.existing(this.mouse);

    const body = this.mouse.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setVelocity(200);
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height - 30);
    this.cameras.main.startFollow(this.mouse);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

    this.physics.add.overlap(
      this.laserObstacle,
      this.mouse,
      this.handleOverlapLaser,
      undefined,
      this
    );

    // create overlap detection
    this.physics.add.overlap(
      this.coins,
      this.mouse,
      this.handleCollectCoin,
      undefined,
      this
    );

    // score text
    this.scoreLabel = this.add
      .text(10, 10, `Score: ${this.score}`, {
        fontSize: "24px",
        color: "#080808",
        backgroundColor: "#F8E71C",
        shadow: { fill: true, blur: 0, offsetY: 0 },
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
      })
      .setScrollFactor(0);
  }

  update(t: number, dt: number) {
    //update moust house postion
    this.wrapMouseHole();
    //update windows
    this.wrapWindows();
    //update bookcase
    this.wrapBookcases();
    this.wrapLaserObstacle();
    // scroll the background
    this.background.setTilePosition(this.cameras.main.scrollX);
  }

  private handleCollectCoin(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    // obj2 will be the coin
    const coin = obj2 as Phaser.Physics.Arcade.Sprite;
    // use the group to hide it
    this.coins.killAndHide(coin);
    // and turn off the physics body
    coin.body.enable = false;
    console.log(this.mouse.isDead());
    if (!this.mouse.isDead()) {
      this.score++;
      this.scoreLabel.text = `Score: ${this.score}`;
    }
  }
  private wrapMouseHole(): void {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;
    if (this.mouseHouse.width + this.mouseHouse.x < scrollX) {
      this.mouseHouse.x = Phaser.Math.Between(
        rightEdge + 100,
        rightEdge + 1000
      );
    }
  }

  private wrapWindows() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // multiply by 2 to add some more padding
    let width = this.window1.width * 2;
    if (this.window1.x + width < scrollX) {
      this.window1.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 800
      );
    }

    width = this.window2.width;
    if (this.window2.x + width < scrollX) {
      this.window2.x = Phaser.Math.Between(
        this.window1.x + width,
        this.window1.x + width + 800
      );
    }
  }

  private wrapBookcases() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // multiply by 2 to add some more padding
    let width = this.bookcase1.width * 2;
    if (this.bookcase1.x + width < scrollX) {
      this.bookcase1.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 800
      );
    }

    width = this.bookcase2.width;
    if (this.bookcase2.x + width < scrollX) {
      this.bookcase2.x = Phaser.Math.Between(
        this.bookcase1.x + width,
        this.bookcase1.x + width + 800
      );
      // call spawnCoins()
      this.spawnCoins();
    }
  }
  private wrapLaserObstacle(): void {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = this.scale.width + scrollX;

    const width = this.laserObstacle.width;

    // body variable with specific physics body type
    const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody;

    if (this.laserObstacle.x + width < scrollX) {
      this.laserObstacle.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 1000
      );
      this.laserObstacle.y = Phaser.Math.Between(0, 300);
      body.position.x = this.laserObstacle.x + body.offset.x;
      body.position.y = this.laserObstacle.y;
    }
  }

  //over lap between mouse and laser
  private handleOverlapLaser(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    console.log("overlap!");
    this.mouse.kill();
  }

  private spawnCoins() {
    // make sure all coins are inactive and hidden
    this.coins.children.each((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      this.coins.killAndHide(coin);
      coin.body.enable = false;
    });

    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // start at 100 pixels past the right side of the screen
    let x = rightEdge + 100;
    // random number from 1 - 20
    const numCoins = Phaser.Math.Between(1, 20);
    // the coins based on random number
    for (let i = 0; i < numCoins; ++i) {
      const coin = this.coins.get(
        x,
        Phaser.Math.Between(100, this.scale.height - 100),
        TextureKeys.Coin
      ) as Phaser.Physics.Arcade.Sprite;
      // make sure coin is active and visible
      coin.setVisible(true);
      coin.setActive(true);
      // enable and adjust physics body to be a circle
      const body = coin.body as Phaser.Physics.Arcade.StaticBody;
      body.setCircle(body.width * 0.5);
      body.enable = true;
      // update the body x, y position from the GameObject
      body.updateFromGameObject();

      // move x a random amount
      x += coin.width * 1.5;
    }
  }
}
