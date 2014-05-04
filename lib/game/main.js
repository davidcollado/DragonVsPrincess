ig.module('game.main')
.requires(
'impact.game', 
'impact.font', 
'game.levels.lvl_02', 
'game.gamedata', 
'game.entities.changer' 
,'impact.debug.debug' 
)
.defines(function() {

  ig.gamedata = new ig.gamedata();
  
  Menu = ig.Game.extend({
  
    // Pending image
    img: new ig.Image('media/intro.png'),
  
    init: function() {
      // Music
      ig.music.add("media/sound/intro_03.*", 'intro');
      ig.music.add("media/sound/music_v13.*", 'game');
      ig.music.add("media/sound/end_01.*", 'end');
      ig.music.volume = 0.5;
      ig.music.loop = true;
      ig.music.play('intro');
  
      ig.input.bind(ig.KEY.SPACE, 'space');
    },
  
    update: function() {
      this.parent();
  
      if (ig.input.pressed('space')) {
        ig.system.setGame(Game);
      }
    },
  
    draw: function() {
      this.parent();
      this.img.draw(0, 0);
    }
  });
  
  Game = ig.Game.extend({

    // Fonts
    debugFont: new ig.Font('media/04b03.font.png'),
    playerLifeFont: new ig.Font('media/04b03.font.png'),
    counterFont: new ig.Font('media/goudy28.png'),

    // Images
    healthBar: new ig.Image('media/healthbar.png'),
    title: new ig.Image('media/title.png'),
    
    // Game gravity
    gravity: 800,

    // Support for change of character
    princess: null,
    dragon: null,
    
    // Timers
    gameTimer: null,
    spawnTimer: null,

    // Shake value
    shakeAmplitude: 0,

    spawnChanceValue: 0.05,

    init: function() {
      this.loadLevel(LevelLvl_02);

      // Music
      ig.music.volume = 0.5;
      ig.music.play('game');
      ig.music.loop = true;

      // Player 1 inputs
      ig.input.bind(ig.KEY.W, 'jump1');
      ig.input.bind(ig.KEY.S, 'down1');
      ig.input.bind(ig.KEY.A, 'left1');
      ig.input.bind(ig.KEY.D, 'right1');
      ig.input.bind(ig.KEY.T, 'attack1');
      
      // Player 2 inputs
      ig.input.bind(ig.KEY.UP_ARROW, 'jump2');
      ig.input.bind(ig.KEY.DOWN_ARROW, 'down2');
      ig.input.bind(ig.KEY.LEFT_ARROW, 'left2');
      ig.input.bind(ig.KEY.RIGHT_ARROW, 'right2');
      ig.input.bind(ig.KEY.M, 'attack2');

      // Debug command
      ig.input.bind(ig.KEY.P, 'change');

      // See stats
      ig.input.bind(ig.KEY.ESC, 'statistics');

      this.princess = this.getEntitiesByType(EntityPrincess)[0];
      this.dragon = this.getEntitiesByType(EntityDragon)[0];
      
      this.dragon.playerNumber = ig.gamedata.dragonPlayerNumber;
      this.princess.playerNumber = (this.dragon.playerNumber+1)%2;

      this.gameTimer = new ig.Timer(61);

      this.spawnChanceValue = 0.05;
      // Warning Change back to 15
      this.spawnTimer = new ig.Timer(15);

      // Set initial position
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
          ig.game.spawnEntity(EntityChanger, spawnlocation.pos.x, spawnlocation.pos.y);
          ig.log("Spawning Changer");
          this.spawnChanceValue = 0.05;
          this.spawnTimer.set(20);
        } else {
          this.spawnChanceValue += 0.01;
          this.spawnTimer.set(1);
          ig.log("Setting Timer");
        }
      }
    },

    update: function() {
      this.parent();

      this.checkIfSpawnChangeItem();

      // Only available in debug
      if (ig.input.pressed('change') && ig.debug) 
        this.changePlayers();

      if (this.gameTimer.delta() >= 0) {
        ig.log("Partida acabada ");
        this.updateGameData();
        ig.system.setGame(Game);
      }

      if (ig.input.pressed('statistics')) {
        ig.system.setGame(Statistics);
      }
    },
    
    updateGameData: function() {
      if (this.dragon.health < this.princess.health) {
        ig.gamedata.princessVictories += 1;
        
        if (this.princess.playerNumber === 0) 
          ig.gamedata.player1Victories += 1;
        else 
          ig.gamedata.player2Victories += 1;
      } else if (this.dragon.health > this.princess.health) {
        ig.gamedata.dragonVictories += 1;
        if (this.dragon.playerNumber === 0) 
          ig.gamedata.player1Victories += 1;
        else 
          ig.gamedata.player2Victories += 1;
      }
    },

    draw: function() {
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

      this.drawHUD();
      //this.drawDebugHUD();
    },
    
    drawHUD: function() {
      
      // Statistics
      this.playerLifeFont.draw("Press ESC to check statistics ", ig.system.width - 30, 30, ig.Font.ALIGN.RIGHT);
      // Draw timer
      var currentTime = (Math.abs(this.gameTimer.delta())).toInt().toString();
      this.counterFont.draw(currentTime, ig.system.width / 2 - 2, ig.system.height - 55, ig.Font.ALIGN.CENTER);
      
      // Draw HUD
      this.playerLifeFont.draw("Player 1", 24, ig.system.height - 50, ig.Font.ALIGN.LEFT);
      this.playerLifeFont.draw("Player 2", ig.system.width - 24, 
                                ig.system.height - 50, ig.Font.ALIGN.RIGHT);
      
      // Draw HUD continued
      if (this.princess && this.dragon) {
        if (this.princess.playerNumber === 0) {
          this.playerLifeFont.draw("Princess", 24 + this.playerLifeFont.widthForString("Player 1") + 10, ig.system.height - 50, ig.Font.ALIGN.LEFT);
          this.playerLifeFont.draw("Dragon", ig.system.width - this.playerLifeFont.widthForString("Player 2") - 24 -10, ig.system.height - 50, ig.Font.ALIGN.RIGHT);
      
          for (var i = 0; i < this.princess.health / 10; i++) {
            this.healthBar.drawTile(i * 16 + 24, ig.system.height - 40, 0, 16);
          }
          for (var i = 0; i < this.dragon.health / 10; i++) {
            this.healthBar.drawTile(ig.system.width - 40 - i * 16, ig.system.height - 40, 0, 16);
          }
      
        } else {
          this.playerLifeFont.draw("Dragon", 24 + this.playerLifeFont.widthForString("Player 1") + 10, ig.system.height - 50, ig.Font.ALIGN.LEFT);
          this.playerLifeFont.draw("Princess", ig.system.width - this.playerLifeFont.widthForString("Player 2") - 24 - 10, ig.system.height - 50, ig.Font.ALIGN.RIGHT);
      
          for (var i = 0; i < this.dragon.health / 10; i++) {
            this.healthBar.drawTile(i * 16 + 24, ig.system.height - 40, 0, 16);
          }
          for (var i = 0; i < this.princess.health / 10; i++) {
            this.healthBar.drawTile(ig.system.width - 40 - i * 16, ig.system.height - 40, 0, 16);
          }
        }
      }
    },
    
    drawDebugHUD: function() {
      this.debugFont.draw("Statistics ", 0, 0);
      this.debugFont.draw("Matches won by Player 1 ",ig.system.width / 2, ig.system.height / 4, ig.Font.ALIGN.CENTER);
      this.debugFont.draw(ig.gamedata.player1Victories, ig.system.width / 2, ig.system.height / 4 + 20, ig.Font.ALIGN.CENTER);
      this.debugFont.draw("Matches won by Player 2 ", ig.system.width / 2, ig.system.height / 4 + 40, ig.Font.ALIGN.CENTER);
      this.debugFont.draw(ig.gamedata.player2Victories, ig.system.width / 2, ig.system.height / 4 + 60, ig.Font.ALIGN.CENTER);
      this.debugFont.draw("Matches won by Dragons ", ig.system.width / 2, ig.system.height / 4 + 80, ig.Font.ALIGN.CENTER);
      this.debugFont.draw(ig.gamedata.dragonVictories, ig.system.width / 2, ig.system.height / 4 + 100, ig.Font.ALIGN.CENTER);
      this.debugFont.draw("Matches won by Princesses ", ig.system.width / 2, ig.system.height / 4 + 120, ig.Font.ALIGN.CENTER);
      this.debugFont.draw(ig.gamedata.princessVictories, ig.system.width / 2, ig.system.height / 4 + 140, ig.Font.ALIGN.CENTER);
      this.debugFont.draw("Press Space to restart!", ig.system.width / 2, ig.system.height / 4 + 180, ig.Font.ALIGN.CENTER);
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

        this.dragon.playerNumber = (this.dragon.playerNumber+1)%2;
        this.princess.playerNumber = (this.dragon.playerNumber+1)%2;
  
        // Update game data info
        ig.gamedata.dragonPlayerNumber = this.dragon.playerNumber;
        ig.log("After change dragon = " + this.dragon.playerNumber + "princess = " + this.princess.playerNumber);
      
        // Update controls
        this.dragon.updateCommands();
        this.princess.updateCommands();
      }
    }
  });

  Statistics = ig.Game.extend({
    font: new ig.Font('media/04b03.font.png'),

    init: function() {
      // Music
      ig.music.volume = 0.5;
      ig.music.play('end');
      ig.music.loop = true;

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
      this.font.draw("Matches won by Player 1 ",ig.system.width / 2, ig.system.height / 4, ig.Font.ALIGN.CENTER);
      this.font.draw(ig.gamedata.player1Victories, ig.system.width / 2, ig.system.height / 4 + 20, ig.Font.ALIGN.CENTER);
      this.font.draw("Matches won by Player 2 ", ig.system.width / 2, ig.system.height / 4 + 40, ig.Font.ALIGN.CENTER);
      this.font.draw(ig.gamedata.player2Victories, ig.system.width / 2, ig.system.height / 4 + 60, ig.Font.ALIGN.CENTER);
      this.font.draw("Matches won by Dragons ", ig.system.width / 2, ig.system.height / 4 + 80, ig.Font.ALIGN.CENTER);
      this.font.draw(ig.gamedata.dragonVictories, ig.system.width / 2, ig.system.height / 4 + 100, ig.Font.ALIGN.CENTER);
      this.font.draw("Matches won by Princesses ", ig.system.width / 2, ig.system.height / 4 + 120, ig.Font.ALIGN.CENTER);
      this.font.draw(ig.gamedata.princessVictories, ig.system.width / 2, ig.system.height / 4 + 140, ig.Font.ALIGN.CENTER);
      this.font.draw("Press Space to restart!", ig.system.width / 2, ig.system.height / 4 + 180, ig.Font.ALIGN.CENTER);
    }
  });

  ig.main('#canvas', Menu, 60, 1280, 640, 1);

});