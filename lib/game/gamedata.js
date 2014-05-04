ig.module('game.gamedata')
.defines(function() {
  
  GameData = ig.gamedata = ig.Class.extend({
    player1Victories: 0,
    player2Victories: 0,
    dragonVictories: 0,
    princessVictories: 0,
    dragonPlayerNumber: 0 
  });
  
});