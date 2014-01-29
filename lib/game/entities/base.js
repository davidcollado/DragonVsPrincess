ig.module('game.entities.base').requires('impact.entity').defines(function() {

  EntityBase = ig.Entity.extend({

    size: {
      x: 64,
      y: 64
    },

    animSheet: new ig.AnimationSheet('media/dragon2.png', 64, 64),

    dir: 0,
    xVel: 0,
    xVelMax: 0,
    yVel: 0,
    yvelMax: 0,
    accelGround: 1200,
    accelAir: 600,
    jump: -800,
    gravA: 10,
    maxVel: {
      x: 200,
      y: 500
    },
    friction: {
      x: 1000,
      y: 0
    },
    //minBounceVelocity:100,
    health: 100,
    killed: false,
    bounceBackValues: {
      x: 250,
      y: 75
    },
    bouncedBack: false,
    incomingFlip: false,

    // Player number tracking
    playerNumber: 0,

    // Property to keep track of flip
    flip: false,

    // Flash management
    previousAnim: null,
    flashTimer: null,
    flashPending: false,
    flashDone: false,

    deadSeqTimer: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      //this.addAnim('idle', 0.3, [0]);
      this.addAnim('walk', 0.3, [0, 1]);

      this.addAnim('attack', 0.3, [2]);
      this.addAnim('dead', 0.3, [3]);
      this.addAnim('jump', 0.3, [4]);
      this.addAnim('flashBlue', 0.3, [5]);
      this.addAnim('flashRed', 0.3, [6]);

      this.flashTimer = new ig.Timer();
      this.deadSeqTimer = new ig.Timer();
    },

    receiveDamage: function(value) {
      this.currentAnim.alpha = 0.5;
      this.parent(value);
    },

    update: function() {
      this.parent();
      if (this.currentAnim) this.currentAnim.alpha = 1;

      if (this.killed && this.bouncedBack === true) {
        //this.makeInvalid();
        console.log("Here1");
        if (this.deadSeqTimer.delta() > 0) {
          console.log("Here2");
          ig.Timer.timeScale = 1;
          ig.system.setGame(Game);
        }
      } else if (this.killed) {
        if (this.incomingFlip) {
          this.vel.x = -this.bounceBackValues.x;
        } else {
          this.vel.x = this.bounceBackValues.x;
        }
        this.vel.y = this.bounceBackValues.y;
        this.accel.x = 0;
        this.accel.y = 0;

        this.bouncedBack = true;
      }

      if (this.flashPending === true) {
        this.previousAnim = this.currentAnim;
        if (this.playerNumber === 1) {
          this.currentAnim = this.anims.flashBlue;
        } else {
          this.currentAnim = this.anims.flashRed;
        }
        this.flashTimer.set(0.05);
        this.flashPending = false;
        this.flashDone = true;
      } else if (this.flashDone === true && this.flashTimer.delta() > 0) {
        this.flashDone = false;
        this.currentAnim = this.previousAnim;
      } else if (this.killed === false) {
        if (this.vel.y < 0 || this.vel.y > 0) {
          this.currentAnim = this.anims.jump;
        } else {
          this.currentAnim = this.anims.walk;
        }
      }
    },

    makeInvalid: function() {
      //this.currentAnim = this.anims.dead;
      this.currentAnim = this.anims.idle;
      if (this.flip) {
        this.currentAnim.pivot = {
          x: this.size.x / 2,
          y: 9
        };
        this.currentAnim.angle = Math.PI / 2;
        this.offset = {
          x: 0,
          y: 10
        };
      } else {
        this.currentAnim.pivot = {
          x: this.size.x / 2,
          y: 18
        };
        this.currentAnim.angle = -Math.PI / 2;
        this.offset = {
          x: -20,
          y: 5
        };
      }
    },

    sleep: function(delay) {
      var start = performance.now();
      while (performance.now() < start + delay);
    },

    kill: function() {
      this.deadSeqTimer.set(0.07);
      this.currentAnim = this.anims.dead;
      this.sleep(40);
      ig.Timer.timeScale = 0.1;
      ig.shakeAmplitude = 0;
      console.log("DAAAAAAAAAAAAAA");
      //TODO SOUND
      this.killed = true;
      this.bouncedBack = false;

      if (this instanceof EntityDragon) {
        ig.gamedata.princessVictories += 1;
        if (this.playerNumber === 1) ig.gamedata.player2Victories += 1;
        else ig.gamedata.player1Victories += 1;
      } else if (this instanceof EntityPrincess) {
        ig.gamedata.dragonVictories += 1;
        if (this.playerNumber === 1) ig.gamedata.player2Victories += 1;
        else ig.gamedata.player1Victories += 1;
      }

      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y);
    }
  });

  EntityDeathExplosion = ig.Entity.extend({
    lifetime: 1,
    callBack: null,
    particles: 5,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      for (var i = 0; i < this.particles; i++)
      ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {
        colorOffset: settings.colorOffset ? settings.colorOffset : 0
      });
      this.idleTimer = new ig.Timer();
    },

    update: function() {
      if (this.idleTimer.delta() > this.lifetime) {
        this.kill();
        if (this.callBack) this.callBack();
        return;
      }
    }
  });

  EntityDeathExplosionParticle = ig.Entity.extend({

    size: {
      x: 2,
      y: 2
    },
    maxVel: {
      x: 160,
      y: 200
    },
    lifetime: 2,
    fadetime: 1,
    bounciness: 0,
    vel: {
      x: 100,
      y: 30
    },
    friction: {
      x: 100,
      y: 0
    },

    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    colorOffset: 0,
    totalColors: 7,
    animSheet: new ig.AnimationSheet('media/blood.png', 2, 2),

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      var frameID = Math.round(Math.random() * this.totalColors) + (this.colorOffset * (this.totalColors + 1));
      this.addAnim('idle', 0.2, [frameID]);
      this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
      this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
      this.idleTimer = new ig.Timer();
    },

    update: function() {
      // Make it juicy by not removing traces of 'war'

      if (this.standing === true) {
        /*console.log("Here");
		var traceResult = ig.game.collisionMap.trace(this.pos.x, this.pos.y, 1, 10, 1, 1);
		if (traceResult.collision.x === true || traceResult.collision.y === true) {
		  console.log("Not there");*/
        this.bounciness = 0;
        this.checkAgainst = ig.Entity.TYPE.NONE;
        this.collides = ig.Entity.COLLIDES.NEVER;
        this.movable = false;
        //}
      } else {
        this.parent();
      }
    }
  });
});