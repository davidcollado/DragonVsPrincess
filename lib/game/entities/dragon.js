ig.module('game.entities.dragon')
.requires(
  'game.entities.base'
)
.defines(function() {
  EntityDragon = EntityBase.extend({

    // Dragon Animation Sheet
    animSheet: new ig.AnimationSheet('media/dragon2.png', 64, 64),

    // Define collision box for dragon
    size: {
      x: 26,
      y: 32
    },
    offset: {
      x: 24,
      y: 30
    },
    
    jump: -1000,
    
    flip: false,
    
    init: function(x, y, settings) {
      this.parent(x, y, settings);
      
      //set up the sound
      this.jumpSound = new ig.Sound('media/sound/jump_drac.*');
      this.jumpSound.volume = 0.3;
      this.attackSound = new ig.Sound('media/sound/attack_drac.*');
      this.attackSound.volume = 0.5;
      this.deathDragonSound = new ig.Sound('media/sound/death_dragon.*');
      this.deathDragonSound.volume = 1;
      
      this.hurtSound = new ig.Sound('media/sound/dany_drac.*');
      this.hurtSound.volume = 0.2;
    },

    update: function() {
      this.parent();
    },
    
    kill: function() {
      this.deathDragonSound.play();
      this.parent();
    }
    
  });
});