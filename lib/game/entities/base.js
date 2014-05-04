ig.module('game.entities.base')
.requires(
  'impact.entity',
  'game.entities.fireAttack',
  'game.entities.heartAttack'
  )
  .defines(function() {

  EntityBase = ig.Entity.extend({

    // Collision properties
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    size: {
      x: 26,
      y: 32
    },

    animSheet: new ig.AnimationSheet('media/dragon2.png', 64, 64),

    // Physics variables
    dir: 0,
    accelGround: 1200,
    accelAir: 600,
    jump: -800,
    maxVel: {
      x: 200,
      y: 500
    },
    friction: {
      x: 1000,
      y: 0
    },
    bounceBackValues: {
      x: 250,
      y: 75
    },
    bouncedBack: false,
    incomingFlip: false,
    
    // Status
    health: 100,
    killed: false,

    // Player number tracking
    playerNumber: 0,

    // Property to keep track of flip
    flip: false,

    // Flash management
    previousAnim: null,
    flashTimer: null,
    flashPending: false,
    flashDone: false,

    // Dead animation timer
    deadSeqTimer: null,
    
    leftCommand: '',
    rightCommand: '',
    jumpCommand: '',
    attackCommand: '',
    
    shaking: false,
    
    hurtSound: null,

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
      this.shakeTimer = new ig.Timer();
      
      this.leftCommand = 'left'+(this.playerNumber+1);
      ig.log('Command = '+this.leftCommand);
      this.rightCommand = 'right'+(this.playerNumber+1);
      this.jumpCommand = 'jump'+(this.playerNumber+1);
      this.attackCommand = 'attack'+(this.playerNumber+1);
    },
    
    updateCommands: function() {
      ig.log('Commands updated');
      this.leftCommand = 'left'+(this.playerNumber+1);
      this.rightCommand = 'right'+(this.playerNumber+1);
      this.jumpCommand = 'jump'+(this.playerNumber+1);
      this.attackCommand = 'attack'+(this.playerNumber+1);
    },

    receiveDamage: function(value) {
      this.currentAnim.alpha = 0.5;
      this.parent(value);
    },

    update: function() {
      this.parent();
      
      // Alpha back to 1
      if (this.currentAnim) 
        this.currentAnim.alpha = 1;

      // Run bounceback sequence. Tween implementation pending
      if (this.killed && this.bouncedBack === true) {
        if (this.deadSeqTimer.delta() > 0) {
          ig.log("Dead animation completed");
          ig.Timer.timeScale = 1;
          // Reinit game
          ig.game.updateGameData();
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

      // Flash sequence. Tween implementation pending
      if (this.flashPending === true) {
        this.previousAnim = this.currentAnim;
        if (this.playerNumber === 0) {
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
      
      this.updateMovement();
    },

    updateMovement: function() {
      if (this.killed === true)
        return;
      
      var accel = this.standing ? this.accelGround : this.accelAir;
      
      if (ig.input.state(this.leftCommand)) {
        this.accel.x = -accel;
        this.flip = true;
      } else if (ig.input.state(this.rightCommand)) {
        this.accel.x = accel;
        this.flip = false;
      } else {
        this.accel.x = 0;
      }
      this.currentAnim.flip.x = this.flip;
      
      if (this.standing && ig.input.pressed(this.jumpCommand)) {
        this.jumpSound.play();
        this.vel.y = this.jump;
      }
      
      if (ig.input.state(this.attackCommand)) {
        this.currentAnim = this.anims.attack;
        this.currentAnim.flip.x = this.flip;
        this.attackSound.play();
        ig.game.shakeAmplitude = Math.min(Math.max(ig.game.shakeAmplitude += 5, 0),5);
        this.shaking = true;
        for (var i = 0; i < 4; i++)
        {
          //Tweaking posiitons according to player (More elegant solution pending)
            if (this instanceof EntityDragon) {
              ig.game.spawnEntity(
                EntityFireAttack, 
                this.pos.x  + (this.flip? -this.size.x - 16 - Math.random() * 10: +this.size.x + Math.random() * 10), this.pos.y + (this.size.y/2 - this.offset.y) + 12, {
                'flip': this.flip,
                'typeOfAttack': (this instanceof EntityDragon? 0: 1)
              });
            }
            else {
              ig.game.spawnEntity(
                EntityHeartAttack, 
                this.pos.x  + (this.flip? -this.size.x - 16 - Math.random() * 10: +this.size.x - 4 + Math.random() * 10), this.pos.y + (this.size.y/2 - this.offset.y) + 12, {
                'flip': this.flip,
                'typeOfAttack': (this instanceof EntityDragon? 0: 1)
              });
            } 
        }
      
        if (this.flip) {
          if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + 4, this.pos.y)) 
            this.pos.x += 4;
        } else {
          if (!ig.game.collisionMap.getTile(this.pos.x - 4, this.pos.y)) 
            this.pos.x -= 4;
        }
      } else {
        if (this.shaking === true) {
          this.shaking = false;
          ig.game.shakeAmplitude = Math.max(ig.game.shakeAmplitude-=5, 0);
        }
      }
    },
  
    kill: function() {
      this.deadSeqTimer.set(0.07);
      this.currentAnim = this.anims.dead;
      ig.game.sleep(40);
      ig.Timer.timeScale = 0.1;
      ig.shakeAmplitude = 0;
      ig.log("Player killed");
      this.killed = true;
      this.bouncedBack = false;
      
      // Death particle explosion spawned
      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y);
    }
  });

  EntityDeathExplosion = ig.Entity.extend({
    lifetime: 1,
    callBack: null,
    particles: 5,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      for (var i = 0; i < this.particles; i++) {
        ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {
          colorOffset: settings.colorOffset ? settings.colorOffset : 0
        });
      }
      
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
    bounciness: 0,
    vel: {
      x: 100,
      y: 30
    },
    friction: {
      x: 100,
      y: 0
    },

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.A,
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
    },

    update: function() {
      // Make it juicy by not removing traces of 'war'
      if (this.standing === true) {
        this.bounciness = 0;
        this.checkAgainst = ig.Entity.TYPE.NONE;
        this.collides = ig.Entity.COLLIDES.NEVER;
        this.movable = false;
      } else {
        this.parent();
      }
    },
    
    check: function(other) {
      if (this.standing === true && other instanceof EntityDeathExplosionParticle && other.standing === true) {
        ig.log('Cleaning particles');
        this.kill();
      }
    }
  });
});