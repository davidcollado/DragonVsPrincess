ig.module('game.entities.princess').requires('game.entities.base').defines(function() {
  EntityPrincess = EntityBase.extend({

    // Princess Animation Sheet
    animSheet: new ig.AnimationSheet('media/princess.png', 64, 64),
    
    size: {
      x: 16,
      y: 32
    },
    offset: {
      x: 24,
      y: 30
    },

    jump: -1000,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      //set up the sound
      this.jumpSound = new ig.Sound('media/sound/jump_princess.*');
      this.jumpSound.volume = 0.3;
      this.attackSound = new ig.Sound('media/sound/attack_princess.*');
      this.attackSound.volume = 0.2;
      this.deathPrincessSound = new ig.Sound('media/sound/death_princess.*');
      this.deathPrincessSound.volume = 1;
      
      this.hurtSound = new ig.Sound('media/sound/dany_princess.*');
      this.hurtSound.volume = 0.4;

      this.flip = true;
    },

    update: function() {
      this.parent();
    },
    
    kill: function() {
      this.deathPrincessSound.play();
      this.parent();
    }
  });
});