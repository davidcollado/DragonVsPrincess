var ctx;

ig.module('game.main').requires('impact.game', 'impact.font', 'game.levels.lvl_02', 'game.gamedata', 'game.gamepadSupport', 'game.entities.changer' /*'impact.debug.debug'*/ ).defines(function() {

  ig.gamedata = new ig.gamedata();

  Game = ig.Game.extend({
    gameState: 0,
    zoom: .5,
    playerLifeFont: new ig.Font('media/04b03.font.png'),
    counterFont: new ig.Font('media/goudy28.png'),
    font: new ig.Font('media/04b03.font.png'),
    healthBar: new ig.Image('media/healthbar.png'),
    title: new ig.Image('media/title.png'),
    gravity: 800,

    // Controller support
    controller1Present: false,
    controller2Present: false,
    controllerStatusText: new ig.Font('media/04b03.font.png'),

    // Controller support
    pressedX: false,
    enabledX: true,
    pressedO: false,
    enabledO: true,
    pressedSquare: false,
    enabledSquare: true,
    pressedTriangle: false,
    enabledTriangle: true,
    pressedLeft: false,
    pressedRight: false,
    pressedX_2: false,
    enabledX_2: true,
    pressedO_2: false,
    enabledO_2: true,
    pressedSquare_2: false,
    enabledSquare_2: true,
    pressedTriangle_2: false,
    enabledTriangle_2: true,
    pressedLeft_2: false,
    pressedRight_2: false,
    gamepadSupportInstance: null,

    // Support for change of character
    princess: null,
    dragon: null,

    gameTimer: null,
    spawnTimer: null,

    shakeAmplitude: 0,

    spawnChanceValue: 0.05,
    music: null,

    init: function() {
      ctx = ig.system.context;
      this.loadLevel(LevelLvl_02);

      // Music
      this.music = ig.music;
      this.music.volume = 0.6;
      this.music.play('game');
      this.music.loop = true;

      ig.input.bind(ig.KEY.SPACE, 'space');
      ig.input.bind(ig.KEY.UP_ARROW, 'jump2');
      ig.input.bind(ig.KEY.DOWN_ARROW, 'down2');
      ig.input.bind(ig.KEY.LEFT_ARROW, 'left2');
      ig.input.bind(ig.KEY.RIGHT_ARROW, 'right2');
      ig.input.bind(ig.KEY.M, 'attack2');

      ig.input.bind(ig.KEY.W, 'jump');
      ig.input.bind(ig.KEY.S, 'down');
      ig.input.bind(ig.KEY.A, 'left');
      ig.input.bind(ig.KEY.D, 'right');
      ig.input.bind(ig.KEY.Q, 'attack');
      ig.input.bind(ig.KEY.E, 'defend');

      ig.input.bind(ig.KEY.Z, 'zoomIn');
      ig.input.bind(ig.KEY.X, 'zoomOut');
      ig.input.bind(ig.KEY.P, 'change');

      ig.input.bind(ig.KEY.ESC, 'statistics');

      // Initialize Gamepad Support
      this.gamepadSupportInstance = new GamepadSupport();
      this.gamepadSupportInstance.game = ig.game;
      ig.system.clear('#fff');

      this.princess = this.getEntitiesByType(EntityPrincess)[0];
      this.dragon = this.getEntitiesByType(EntityDragon)[0];

      this.gameTimer = new ig.Timer();
      this.gameTimer.set(61);

      this.spawnChanceValue = 0.05;

      this.spawnTimer = new ig.Timer();
      // Warning Change back to 15
      this.spawnTimer.set(1);

      var spawnlocation = this.getEntitiesByType(EntitySpawnlocation)[0];

      spawnlocation.pos.x = (ig.system.width / 2) - 32;
      spawnlocation.pos.y = ig.system.height / 2;

    },

    checkIfSpawnChangeItem: function() {
      if (this.spawnTimer.delta() > 0) {
        var randomSpawn = Math.random();
        if (randomSpawn < this.spawnChanceValue) {
          // Spawn Changer
          var spawnlocation = this.getEntitiesByType(EntitySpawnlocation)[0];
          console.log("SpawnPosition x =" + spawnlocation.pos.x + " y = " + spawnlocation.pos.y);
          ig.game.spawnEntity(EntityChanger, spawnlocation.pos.x, spawnlocation.pos.y);
          console.log("Spawning Changer");
          this.spawnChanceValue = 0.05;
          this.spawnTimer.set(20);
        } else {
          this.spawnChanceValue += 0.01;
          this.spawnTimer.set(1);
          console.log("Setting Timer");
        }
      }
    },

    update: function() {
      this.parent();

      this.checkIfSpawnChangeItem();

      if (this.gameState == 0) {
        if (ig.input.pressed('space')) {
          this.gameState = 1;
          this.loadLevel(LevelLvl_02);
        }
      } else if (this.gameState == 1) {
        if (ig.input.pressed('change')) this.changePlayers();

        this.score++;
        //this.screenX=
        if (ig.input.state('zoomIn')) {
          this.zoom += 0.1;
        } else if (ig.input.state('zoomOut')) {
          this.zoom -= 0.1;
        }
      }

      if (this.gameTimer.delta() >= 0) {

        console.log("Partida acabada ");
        if (this.dragon.health < this.princess.health) {
          ig.gamedata.princessVictories += 1;
          if (this.princess.playerNumber === 1) ig.gamedata.player1Victories += 1;
          else ig.gamedata.player2Victories += 1;
        } else if (this.dragon.health > this.princess.health) {
          ig.gamedata.dragonVictories += 1;
          if (this.dragon.playerNumber === 1) ig.gamedata.player1Victories += 1;
          else ig.gamedata.player2Victories += 1;
        }

        ig.system.setGame(Game);
      }

      if (ig.input.pressed('statistics')) {
        ig.system.setGame(Statistics);
      }

    },

    draw: function() {
      this.parent();

      // Screen shake by translating context
      var ctx = ig.system.context;
      // translate the context if shakeAmplitude not null;
      if (this.shakeAmplitude) {
        ctx.save();
        ctx.translate(this.shakeAmplitude * (Math.random() - 0.5), this.shakeAmplitude * (Math.random() - 0.5));
      }

      this.parent();

      if (this.shakeAmplitude) {
        ctx.restore();
      }

      // Show Status of Controllers on-screen
      /*if (this.controller1Present === true) 
			this.controllerStatusText.draw("
        Controller 1 present ", 18, 30);
		else 
			this.controllerStatusText.draw("
        Controller 1 not present ", 18, 30);
		
		if (this.controller2Present === true) 
			this.controllerStatusText.draw("
        Controller 2 present ", 18, 40);
		else 
			this.controllerStatusText.draw("
        Controller 2 not present ", 18, 40);
*/

      var currentTime = (Math.abs(this.gameTimer.delta())).toInt().toString();

      this.counterFont.draw(currentTime, ig.system.width / 2 - this.counterFont.widthForString(currentTime) / 2 - 2, ig.system.height - 55);
      //console.log(currentTime);
      this.playerLifeFont.draw("Player 1", 24, ig.system.height - 50);
      this.playerLifeFont.draw("Player 2", ig.system.width - this.playerLifeFont.widthForString("Player 2") / 2 - 48, ig.system.height - 50);

      if (this.princess && this.dragon) {
        if (this.princess.playerNumber === 1) {
          this.playerLifeFont.draw("Princess", 24 + this.playerLifeFont.widthForString("Player 1") + 10, ig.system.height - 50);
          this.playerLifeFont.draw("Dragon", ig.system.width - this.playerLifeFont.widthForString("Player 2") / 2 - 48 - this.playerLifeFont.widthForString("Player 2") + -10, ig.system.height - 50);

          for (var i = 0; i < this.princess.health / 10; i++) {
            this.healthBar.drawTile(i * 16 + 24, ig.system.height - 40, 0, 16);
          }
          for (var i = 0; i < this.dragon.health / 10; i++) {
            this.healthBar.drawTile(ig.system.width - 48 - i * 16, ig.system.height - 40, 0, 16);
          }

        } else {
          this.playerLifeFont.draw("Dragon", 24 + this.playerLifeFont.widthForString("Player 1") + 10, ig.system.height - 50);
          this.playerLifeFont.draw("Princess", ig.system.width - this.playerLifeFont.widthForString("Player 2") / 2 - 48 - this.playerLifeFont.widthForString("Player 2") + -10, ig.system.height - 50);

          for (var i = 0; i < this.dragon.health / 10; i++) {
            this.healthBar.drawTile(i * 16 + 24, ig.system.height - 40, 0, 16);
          }
          for (var i = 0; i < this.princess.health / 10; i++) {
            this.healthBar.drawTile(ig.system.width - 48 - i * 16, ig.system.height - 40, 0, 16);
          }
        }
      }

      if (ig.input.pressed('space')) {
        this.getEntitiesByType(EntityPrincess)[0].receiveDamage(10);
      }

      // Show Status of Controllers on-screen
      if (this.controller1Present === true) this.controllerStatusText.draw("Controller 1 present ", 30, 30);
      else this.controllerStatusText.draw("Controller 1 not present ", 30, 30);

      if (this.controller2Present === true) this.controllerStatusText.draw("Controller 2 present ", 30, 40);
      else this.controllerStatusText.draw("Controller 2 not present ", 30, 40);

      this.controllerStatusText.draw("Press ESC to check statistics ", ig.system.width - this.playerLifeFont.widthForString("Press ESC to check statistics ") - 30, 30);
    },

    sleep: function(delay) {
      var start = performance.now();
      while (performance.now() < start + delay);
    },

    // Method to change the player controlled character
    changePlayers: function() {
      if (this.princess && this.dragon) {
        this.princess.flashPending = true;
        this.dragon.flashPending = true;

        var temp = this.princess.playerNumber;
        this.princess.playerNumber = this.dragon.playerNumber;
        this.dragon.playerNumber = temp;
        console.log("After change dragon = " + this.dragon.playerNumber + "princess = " + this.princess.playerNumber);
      }
    },
  });

  Menu = ig.Game.extend({
    gameState: 0,
    zoom: .5,
    font: new ig.Font('media/04b03.font.png'),
    pressStartFont: new ig.Font('media/Goudy28.png'),
    healthBar: new ig.Image('media/healthbar.png'),
    title: new ig.Image('media/title.png'),

    // Controller support
    controller1Present: false,
    controller2Present: false,
    controllerStatusText: new ig.Font('media/04b03.font.png'),

    // Controller support
    pressedX: false,
    enabledX: true,
    pressedO: false,
    enabledO: true,
    pressedSquare: false,
    enabledSquare: true,
    pressedTriangle: false,
    enabledTriangle: true,
    pressedLeft: false,
    pressedRight: false,
    pressedX_2: false,
    enabledX_2: true,
    pressedO_2: false,
    enabledO_2: true,
    pressedSquare_2: false,
    enabledSquare_2: true,
    pressedTriangle_2: false,
    enabledTriangle_2: true,
    pressedLeft_2: false,
    pressedRight_2: false,
    gamepadSupportInstance: null,

    // Support for change of character
    princess: null,
    dragon: null,

    shakeAmplitude: 0,
    music: null,

    // Pending image
    img: new ig.Image('media/intro.png'),

    init: function() {
      ctx = ig.system.context;
      // Music
      this.music = ig.music;
      this.music.add("media/sound/intro_03.*", 'intro');
      this.music.add("media/sound/music_v13.*", 'game');
      this.music.add("media/sound/end_01.*", 'end');
      this.music.volume = 0.6;
      this.music.play();

      ig.input.bind(ig.KEY.SPACE, 'space');
      ig.input.bind(ig.KEY.UP_ARROW, 'jump');
      ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
      ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
      ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
      ig.input.bind(ig.KEY.M, 'attack');

      ig.input.bind(ig.KEY.W, 'jump2');
      ig.input.bind(ig.KEY.S, 'down2');
      ig.input.bind(ig.KEY.A, 'left2');
      ig.input.bind(ig.KEY.D, 'right2');
      ig.input.bind(ig.KEY.Q, 'attack2');
      ig.input.bind(ig.KEY.E, 'defend2');

      ig.input.bind(ig.KEY.Z, 'zoomIn');
      ig.input.bind(ig.KEY.X, 'zoomOut');
      //ig.input.bind(ig.KEY.P, 'change');

      // Initialize Gamepad Support
      this.gamepadSupportInstance = new GamepadSupport();
      this.gamepadSupportInstance.game = ig.game;
    },

    update: function() {
      this.parent();

      if (ig.input.pressed('space') || this.pressedX === true || this.pressedX_2 === true) {
        ig.system.setGame(Game);
      }
    },

    draw: function() {
      this.parent();

      this.img.draw(0, 0);
      //this.font.draw("Main Menu ", 0, 0);
      //this.title.draw(320, 0);

      /*this.pressStartFont.draw("Press Space, X on the PlayStation Controller or A on the XBox Controller.", ig.system.width / 2 - this.pressStartFont.widthForString("Press Space, X on the PlayStation Controller or A on the XBox Controller.") / 2, ig.system.height / 3 + ig.system.height / 2);*/

      // Show Status of Controllers on-screen
      /*if (this.controller1Present === true) this.font.draw("Controller 1 present ", 0, 30);
      else this.font.draw("Controller 1 not present ", 18, 30);

      if (this.controller2Present === true) this.font.draw("Controller 2 present ", 0, 40);
      else this.font.draw("Controller 2 not present ", 18, 40);*/
    },

  });

  Statistics = ig.Game.extend({

    font: new ig.Font('media/04b03.font.png'),

    init: function() {
      ctx = ig.system.context;

      // Music
      this.music = ig.music;
      this.music.volume = 0.6;
      this.music.next();
      this.music.loop = true;

      ig.input.bind(ig.KEY.SPACE, 'start');
    },

    update: function() {
      this.parent();

      if (ig.input.pressed('start')) {
        ig.system.setGame(Game);
      }
    },

    draw: function() {
      this.parent();

      this.font.draw("Statistics ", 0, 0);

      this.font.draw("Matches won by Player 1 ",
      ig.system.width / 2 - this.font.widthForString("Matches won by Player 1 ") / 2, ig.system.height / 4);
      this.font.draw(ig.gamedata.player1Victories,
      ig.system.width / 2, ig.system.height / 4 + 20);

      this.font.draw("Matches won by Player 2 ",
      ig.system.width / 2 - this.font.widthForString("Matches won by Player 2 ") / 2, ig.system.height / 4 + 40);
      this.font.draw(ig.gamedata.player2Victories,
      ig.system.width / 2, ig.system.height / 4 + 60);

      this.font.draw("Matches won by Dragons ",
      ig.system.width / 2 - this.font.widthForString("Matches won by Dragons ") / 2, ig.system.height / 4 + 80);
      this.font.draw(ig.gamedata.dragonVictories,
      ig.system.width / 2, ig.system.height / 4 + 100);

      this.font.draw("Matches won by Princesses ",
      ig.system.width / 2 - this.font.widthForString("Matches won by Princesses ") / 2, ig.system.height / 4 + 120);
      this.font.draw(ig.gamedata.princessVictories,
      ig.system.width / 2, ig.system.height / 4 + 140);

      this.font.draw("Press Space to restart!",
      ig.system.width / 2 - this.font.widthForString("Press Space to restart!") / 2, ig.system.height / 4 + 180);

    },

  });

  ig.setNocache(true);
  ig.main('#canvas', Menu, 60, 1280, 640, 1);

});