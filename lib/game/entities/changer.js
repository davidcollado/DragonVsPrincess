ig.module('game.entities.changer')
.requires(
  'impact.entity', 
  'game.entities.base'
)
.defines(function() {
  
  EntityChanger = ig.Entity.extend({
    size: {
      x: 64,
      y: 92
    },
    
    offset: {
      x: 0,
      y: 0
    },
    
    collides: ig.Entity.COLLIDES.FIXED,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    lifeTimer: null,
    
    // Pending image
    animSheet: new ig.AnimationSheet('media/espejo.png', 64, 92),

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('moving', 0.2, [0,1]);
      this.changeSound = new ig.Sound('media/sound/change.*');
      this.changeSound.volume = 1;
      
      this.lifeTimer = new ig.Timer();
      this.lifeTimer.set(10);
    },
    
    update: function() {
      this.parent();
      if (this.lifeTimer.delta() > 0)
        this.kill();
    },

    check: function(other) {
      if (other instanceof EntityBase) {
        this.changeSound.play();
        ig.game.changePlayers();
        this.kill();
      }
    }
  });
  
});