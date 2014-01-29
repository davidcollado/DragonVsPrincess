ig.module('game.entities.princess').requires('game.entities.base', 'game.entities.attack').defines(function() {
  EntityPrincess = EntityBase.extend({

    // Help to visualize the player in wm
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 0, 0.7)',

    // Collision properties
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.ACTIVE,

    size: {
      x: 26,
      y: 32
    },
    offset: {
      x: 24,
      y: 30
    },
    attackTimerMax: 1,
    attackTimer: this.attackTimerMax,
    // Dragon Animation Sheet
    animSheet: new ig.AnimationSheet('media/princess.png', 64, 64),
    jump: -1000,
    

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      //set up the sound
      this.jumpSound = new ig.Sound('media/sound/jump_princess.*');
      this.jumpSound.volume = 1;
      this.attackSound = new ig.Sound('media/sound/attack_princess.*');
      this.attackSound.volume = 1;
      this.deathPrincessSound = new ig.Sound('media/sound/death_princess.*');
      this.deathPrincessSound.volume = 1;

      this.flip = true;

    },

    update: function() {
      this.parent();
      
      if (this.killed === true)
      return;

      var accel = this.standing ? this.accelGround : this.accelAir;

      // Managing different controls
      if (this.playerNumber === 1) {
        if (ig.game.controller1Present) {
          //console.log("Princess Here1");
          if (ig.game.pressedLeft === true) {
            this.accel.x = -accel;
            this.flip = true;
          } else if (ig.game.pressedRight === true) {
            this.accel.x = accel;
            this.flip = false;
          } else {
            this.accel.x = 0;
          }

          // jump
          if (this.standing && ig.game.pressedX === true) {
            this.jumpSound.play();
            console.log("Princess Jump");
            this.vel.y = this.jump;
          }

          /*if (ig.game.pressedTriangle === true) {
            ig.game.pressedTriangle = false;
            ig.game.changePlayers();
          }*/
          if (ig.game.pressedSquare === true) {
            this.currentAnim = this.anims.attack;
            this.currentAnim.flip.x = this.flip;
            this.attackSound.play();
            ig.game.shakeAmplitude = Math.min(Math.max(ig.game.shakeAmplitude += 5, 0),7);
            /*if (this.attackTimer == this.attackTimerMax) {
              this.currentAnim = this.anims.attack;
              this.currentAnim.flip.x = this.flip;
              this.attackTimer = 0;
              console.log("asd" + this.dir);*/
              for (var i = 0; i < 4; i++)
              ig.game.spawnEntity(EntityAttack, this.pos.x + Math.random() * 10 + (this.flip? 12: 5), this.pos.y + Math.random() * 10 - 10, {
                'flip': this.flip,
                'type': 1
              });
            //}
            if (this.flip) {
              if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + 4, this.pos.y)) this.pos.x += 4;
            } else {
              if (!ig.game.collisionMap.getTile(this.pos.x - 4, this.pos.y)) this.pos.x -= 4;
            }
          } else {
            ig.game.shakeAmplitude = Math.max(ig.game.shakeAmplitude -= 5, 0);
          }

          // Commented until we add animations
          this.currentAnim.flip.x = this.flip;
        } else {

          if (ig.input.state('left')) {
            this.accel.x = -accel;
            this.flip = true;
          } else if (ig.input.state('right')) {
            this.accel.x = accel;
            this.flip = false;
          } else {
            this.accel.x = 0;
          }
          this.currentAnim.flip.x = this.flip;

          if (this.standing && ig.input.pressed('jump')) {
            this.jumpSound.play();
            this.vel.y = this.jump;
          }

          if (ig.input.state('attack')) {
            this.currentAnim = this.anims.attack;
            this.currentAnim.flip.x = this.flip;
            this.attackSound.play();
            console.log("Attacking");
            ig.game.shakeAmplitude = Math.min(Math.max(ig.game.shakeAmplitude += 5, 0),7);
            /*if (this.attackTimer == this.attackTimerMax) {
              this.currentAnim = this.anims.attack;
              this.currentAnim.flip.x = this.flip;
              this.attackTimer = 0;
              console.log("asd" + this.dir);*/
              for (var i = 0; i < 4; i++)
              ig.game.spawnEntity(EntityAttack, this.pos.x + Math.random() * 10 + (this.flip? 12: 5), this.pos.y + Math.random() * 10 - 10, {
                'flip': this.flip,
                'type': 1
              });
            //}
            if (this.flip) {
              if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + 4, this.pos.y)) this.pos.x += 4;
            } else {
              if (!ig.game.collisionMap.getTile(this.pos.x - 4, this.pos.y)) this.pos.x -= 4;
            }
          } else {
            ig.game.shakeAmplitude = Math.max(ig.game.shakeAmplitude -= 5, 0);
          }

          if (ig.input.pressed('defend')) {
            //console.log("defend");
          }
        }


      } else if (this.playerNumber === 2) {
        if (ig.game.controller2Present) {
          //console.log("Controller princess works Here2= " + this.playerNumber);
          if (ig.game.pressedLeft_2 === true) {
            this.accel.x = -accel;
            this.flip = true;
          } else if (ig.game.pressedRight_2 === true) {
            this.accel.x = accel;
            this.flip = false;
          } else {
            this.accel.x = 0;
          }

          // jump
          if (this.standing && ig.game.pressedX_2 === true) {
            this.jumpSound.play();
            console.log("Princess Jump");
            this.vel.y = this.jump;
          }

          /*if (ig.game.pressedTriangle_2 === true) {
            ig.game.pressedTriangle_2 = false;
            ig.game.changePlayers();
          }*/
          if (ig.game.pressedSquare_2 === true) {
            this.currentAnim = this.anims.attack;
            this.currentAnim.flip.x = this.flip;
            this.attackSound.play();
            ig.game.shakeAmplitude = Math.min(Math.max(ig.game.shakeAmplitude += 5, 0),7);
            /*if (this.attackTimer == this.attackTimerMax) {
              this.currentAnim = this.anims.attack;
              this.currentAnim.flip.x = this.flip;
              this.attackTimer = 0;
              console.log("asd" + this.dir);*/
              for (var i = 0; i < 4; i++)
              ig.game.spawnEntity(EntityAttack, this.pos.x + Math.random() * 10 + (this.flip? 12: 5), this.pos.y + Math.random() * 10 - 10, {
                'flip': this.flip,
                'type': 1
              });
            //}
            if (this.flip) {
              if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + 4, this.pos.y)) this.pos.x += 4;
            } else {
              if (!ig.game.collisionMap.getTile(this.pos.x - 4, this.pos.y)) this.pos.x -= 4;
            }
          } else {
            ig.game.shakeAmplitude = Math.max(ig.game.shakeAmplitude -= 5, 0);
          }

          // Commented until we add animations
          this.currentAnim.flip.x = this.flip;
        } else {
          if (ig.input.state('left2')) {
            this.accel.x = -accel;
            this.flip = true;
          } else if (ig.input.state('right2')) {
            this.accel.x = accel;
            this.flip = false;
          } else {
            this.accel.x = 0;
          }
          this.currentAnim.flip.x = this.flip;
          if (this.standing && ig.input.pressed('jump2')) {
            this.jumpSound.play();
            this.vel.y = this.jump;
          }

          /*if (ig.game.pressedTriangle === true) {
            ig.game.pressedTriangle = false;
            ig.game.changePlayers();
          }*/

          if (ig.input.state('attack2')) {
            this.currentAnim = this.anims.attack;
            this.currentAnim.flip.x = this.flip;
            this.attackSound.play();
            ig.game.shakeAmplitude = Math.min(Math.max(ig.game.shakeAmplitude += 5, 0),7);
            /*if (this.attackTimer == this.attackTimerMax) {
              this.currentAnim = this.anims.attack;
              this.currentAnim.flip.x = this.flip;
              this.attackTimer = 0;
              console.log("asd" + this.dir);*/
              for (var i = 0; i < 4; i++)
              ig.game.spawnEntity(EntityAttack, this.pos.x + Math.random() * 10 + (this.flip? 12: 5), this.pos.y + Math.random() * 10 - 10, {
                'flip': this.flip,
                'type': 1
              });
            //}
            if (this.flip) {
              if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + 4, this.pos.y)) this.pos.x += 4;
            } else {
              if (!ig.game.collisionMap.getTile(this.pos.x - 4, this.pos.y)) this.pos.x -= 4;
            }
          } else {
            ig.game.shakeAmplitude = Math.max(ig.game.shakeAmplitude -= 5, 0);
          }

          if (ig.input.pressed('defend2')) {
            //console.log("defend");
          }

        }

    }
      // Pending code when animations are finished
      // set the current animation, based on the player's speed 
      /*if (this.vel.y < 0 || this.vel.y > 0) {
        this.currentAnim = this.anims.jump;
      } else {
        this.currentAnim = this.anims.run;
      }*/
    },
    
    kill: function()
    {
      this.deathPrincessSound.play();
      this.parent();
    },

    draw: function() {
      this.parent();
    }
  });
});