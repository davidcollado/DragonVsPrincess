/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 */
ig.module('game.gamepadSupport').requires('impact.game').defines(function() {
  GamepadSupport = ig.Class.extend({
    // A number of typical buttons recognized by Gamepad API and mapped to
    // standard controls. Any extraneous buttons will have larger indexes.
    TYPICAL_BUTTON_COUNT: 16,

    // A number of typical axes recognized by Gamepad API and mapped to
    // standard controls. Any extraneous buttons will have larger indexes.
    TYPICAL_AXIS_COUNT: 4,

    // Whether we’re requestAnimationFrameing like it’s 1999.
    ticking: false,

    // The canonical list of attached gamepads, without “holes” (always
    // starting at [0]) and unified between Firefox and Chrome.
    gamepads: [],

    // Remembers the connected gamepads at the last check; used in Chrome
    // to figure out when gamepads get connected or disconnected, since no
    // events are fired.
    prevRawGamepadTypes: [],

    // Previous timestamps for gamepad state; used in Chrome to not bother with
    // analyzing the polled data if nothing changed (timestamp is the same
    // as last time).
    prevTimestamps: [],

    game: null,
    /**
     * Initialize support for Gamepad API.
     */
    init: function(gameInstance) {
      // As of writing, it seems impossible to detect Gamepad API support
      // in Firefox, hence we need to hardcode it in the third clause.
      // (The preceding two clauses are for Chrome.)
      var gamepadSupportAvailable = !! navigator.webkitGetGamepads || !! navigator.webkitGamepads || (navigator.userAgent.indexOf('Firefox/') != -1);

      if (!gamepadSupportAvailable) {
        // It doesn’t seem Gamepad API is available – show a message telling
        // the visitor about it.
        //console.log("Gamepad not supported");
        if (this.game) {
          this.game.controller1Text = "Gamepads not supported";
          this.game.controller2Text = "";

        }
        // Call ig.system to show not supported
      } else {
        // Firefox supports the connect/disconnect event, so we attach event
        // handlers to those.
        window.addEventListener('MozGamepadConnected',
        this.onGamepadConnect, false);
        window.addEventListener('MozGamepadDisconnected',
        this.onGamepadDisconnect, false);

        // Since Chrome only supports polling, we initiate polling loop straight
        // away. For Firefox, we will only do it if we get a connect event.
        if ( !! navigator.webkitGamepads || !! navigator.webkitGetGamepads) {
          this.startPolling();
        }
      }
    },

    /**
     * React to the gamepad being connected. Today, this will only be executed
     * on Firefox.
     */
    onGamepadConnect: function(event) {
      // Add the new gamepad on the list of gamepads to look after.
      this.gamepads.push(event.gamepad);

      // Ask the tester to update the screen to show more gamepads.
      console.log("Gamepad Connected");
      if (this.game) this.game.controllerText = "Gamepad Connected";
      // Call ig.system to show Gamepad conected

      // Start the polling loop to monitor button changes.
      this.startPolling();
    },

    // This will only be executed on Firefox.
    onGamepadDisconnect: function(event) {
      // Remove the gamepad from the list of gamepads to monitor.
      for (var i in this.gamepads) {
        if (this.gamepads[i].index == event.gamepad.index) {
          this.gamepads.splice(i, 1);
          break;
        }
      }

      // If no gamepads are left, stop the polling loop.
      if (this.gamepads.length == 0) {
        this.stopPolling();
      }

      // Ask the tester to update the screen to remove the gamepad.
      console.log("Gamepad Disconnected");
      if (this.game) this.game.controllerText = "Gamepad Disconnected";
      // Call ig.system to show Gamepad disconnected
    },

    /**
     * Starts a polling loop to check for gamepad state.
     */
    startPolling: function() {
      // Don’t accidentally start a second loop, man.
      if (!this.ticking) {
        this.ticking = true;
        this.tick();
      }
    },

    /**
     * Stops a polling loop by setting a flag which will prevent the next
     * requestAnimationFrame() from being scheduled.
     */
    stopPolling: function() {
      this.ticking = false;
    },

    /**
     * A function called with each requestAnimationFrame(). Polls the gamepad
     * status and schedules another poll.
     */
    tick: function() {
      this.pollStatus();
      this.scheduleNextTick();
    },

    scheduleNextTick: function() {
      // Only schedule the next frame if we haven’t decided to stop via
      // stopPolling() before.
      if (this.ticking) {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(this.tick.bind(this));
        } else if (window.mozRequestAnimationFrame) {
          window.mozRequestAnimationFrame(this.tick.bind(this));
        } else if (window.webkitRequestAnimationFrame) {
          window.webkitRequestAnimationFrame(this.tick.bind(this));
        }
        // Note lack of setTimeout since all the browsers that support
        // Gamepad API are already supporting requestAnimationFrame().
      }
    },

    /**
     * Checks for the gamepad status. Monitors the necessary data and notices
     * the differences from previous state (buttons for Chrome/Firefox,
     * new connects/disconnects for Chrome). If differences are noticed, asks
     * to update the display accordingly. Should run as close to 60 frames per
     * second as possible.
     */
    pollStatus: function() {
      // Poll to see if gamepads are connected or disconnected. Necessary
      // only on Chrome.
      /*this.pollGamepads();
      
      for (var i in this.gamepads) {
        var gamepad = this.gamepads[i];
      
        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // This is only supported by Chrome right now, so the first check
        // makes sure we’re not doing anything if the timestamps are empty
        // or undefined.
        if (gamepad.timestamp &&
            (gamepad.timestamp == this.prevTimestamps[i])) {
          continue;
        }
        this.prevTimestamps[i] = gamepad.timestamp;
      
        if (i === 0)
          this.updateDisplay(i);
      }*/

      // Poll to see if gamepads are connected or disconnected. Necessary
      // only on Chrome.
      var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

      this.gamepads = [];
      if (gamepad) {
        this.gamepads.push(gamepad);
        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // This is only supported by Chrome right now, so the first check
        // makes sure we’re not doing anything if the timestamps are empty
        // or undefined.
        if (gamepad.timestamp && (gamepad.timestamp == this.prevTimestamps[0])) {
          return;
        }
        this.prevTimestamps[0] = gamepad.timestamp;

        //console.log("Updated gamepad ");
        this.updateDisplay(0);
      } else {
        //console.log("Gamepad not found");
        if (this.game) this.game.controller1Text = "Gamepad2 Not Found";
        return;
      }

      gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[1];

      if (gamepad) {
        this.gamepads.push(gamepad);
        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // This is only supported by Chrome right now, so the first check
        // makes sure we’re not doing anything if the timestamps are empty
        // or undefined.
        if (gamepad.timestamp && (gamepad.timestamp == this.prevTimestamps[0])) {
          return;
        }
        this.prevTimestamps[0] = gamepad.timestamp;

        //console.log("Updated gamepad ");
        this.updateDisplay(1);
      } else {
        //console.log("Gamepad1 not found");
        if (this.game) this.game.controller2Text = "Gamepad2 Not Found";
        return;
      }
    },

    // This function is called only on Chrome, which does not yet support
    // connection/disconnection events, but requires you to monitor
    // an array for changes.
    pollGamepads: function() {

      // Get the array of gamepads – the first method (function call)
      // is the most modern one, the second is there for compatibility with
      // slightly older versions of Chrome, but it shouldn’t be necessary
      // for long.
      var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;

      if (rawGamepads) {
        //console.log("AAAAAAHHH");
        // We don’t want to use rawGamepads coming straight from the browser,
        // since it can have “holes” (e.g. if you plug two gamepads, and then
        // unplug the first one, the remaining one will be at index [1]).
        this.gamepads = [];

        // We only refresh the display when we detect some gamepads are new
        // or removed; we do it by comparing raw gamepad table entries to
        // “undefined.”
        var gamepadsChanged = false;

        for (var i = 0; i < rawGamepads.length; i++) {
          if (typeof rawGamepads[i] != this.prevRawGamepadTypes[i]) {
            gamepadsChanged = true;
            this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
          }

          if (rawGamepads[i]) {
            //console.log("Added pad = " + i);
            this.gamepads.push(rawGamepads[i]);
            //console.log("Gamepad Updated");
            // Call ig.system to show Gamepad update
            if (i === 0) {
              //console.log("controller1 present");
              if (this.game) this.game.controller1Present = true;
            } else if (i === 1) {
              //console.log("controller2 present");
              if (this.game) this.game.controller2Present = true;
            }
          }
        }

        // Ask the tester to refresh the visual representations of gamepads
        // on the screen.
        if (gamepadsChanged) {
          //tester.updateGamepads(gamepadSupport.gamepads);
        }
      }
    },

    /*
      // Get the array of gamepads – the first method (function call)
      // is the most modern one, the second is there for compatibility with
      // slightly older versions of Chrome, but it shouldn’t be necessary
      // for long.
      var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;

      if (rawGamepads) {
        // We don’t want to use rawGamepads coming straight from the browser,
        // since it can have “holes” (e.g. if you plug two gamepads, and then
        // unplug the first one, the remaining one will be at index [1]).
        this.gamepads = [];

        // We only refresh the display when we detect some gamepads are new
        // or removed; we do it by comparing raw gamepad table entries to
        // “undefined.”
        var gamepadsChanged = false;

        for (var i = 0; i < rawGamepads.length; i++) {
          if (typeof rawGamepads[i] != this.prevRawGamepadTypes[i]) {
            gamepadsChanged = true;
            this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
          }

          if (rawGamepads[i]) {
            this.gamepads.push(rawGamepads[i]);
          }
        }

        // Ask the tester to refresh the visual representations of gamepads
        // on the screen.
        if (gamepadsChanged) {
          //tester.updateGamepads(gamepadSupport.gamepads);
        }
      }
    },*/

    // How “deep” does an analogue button need to be depressed to consider it
    // a button down.
    ANALOGUE_BUTTON_THRESHOLD_HIGH: 0.8,
    ANALOGUE_BUTTON_THRESHOLD_LOW: 0.0,
    DPAD_PRESSED: 1,

    // Call the tester with new state and ask it to update the visual
    // representation of a given gamepad.
    updateDisplay: function(gamepadId) {
      if (this.game) {
        // Call ig.system to show Gamepad update
        if (gamepadId === 0) {
          if (this.game) this.game.controller1Present = true;

          var gamepad = this.gamepads[gamepadId];
          //console.log("updateDisplay gamepad 0");

          // X Button
          if (gamepad.buttons[0] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledX === true) {
              this.game.enabledX = false;
              this.game.pressedX = true;
              //console.log("Button 0 pressed! and meaning" + this.game.pressedX);
            }
          } else {
            this.game.pressedX = false;
            if (gamepad.buttons[0] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledX = true;
            }
          }

          // O Button
          if (gamepad.buttons[1] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledO === true) {
              this.game.enabledO = false;
              this.game.pressedO = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedX);
            }
          } else {
            this.game.pressedO = false;
            if (gamepad.buttons[1] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledO = true;
            }
          }

          // Square Button
          if (gamepad.buttons[2] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledSquare === true) {
              this.game.enabledSquare = false;
              this.game.pressedSquare = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedX);
            }
          } else {
            this.game.pressedSquare = false;
            if (gamepad.buttons[2] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledSquare = true;
            }
          }

          // Triangle Button
          if (gamepad.buttons[3] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledTriangle === true) {
              this.game.enabledTriangle = false;
              this.game.pressedTriangle = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedX);
            }
          } else {
            //this.game.pressedTriangle = false;
            if (gamepad.buttons[3] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledTriangle = true;
            }
          }

          // Left D-Pad
          if (gamepad.buttons[14] >= this.DPAD_PRESSED) {
            //console.log("Left D-Pad" + gamepad.buttons[14]);
            this.game.pressedLeft = true;
          } else {
            this.game.pressedLeft = false;
          }
          // Right D-Pad
          if (gamepad.buttons[15] >= this.DPAD_PRESSED) {
            //console.log("Right D-Pad" + gamepad.buttons[15]);
            this.game.pressedRight = true;
          } else {
            this.game.pressedRight = false;
          }
        } else if (gamepadId === 1) {
          if (this.game) this.game.controller2Present = true;
          var gamepad = this.gamepads[gamepadId];
          //console.log("updateDisplay gamepad 1 = "+gamepadId);
          
          //console.log("status X = "+gamepad.buttons[0]);
          // X Button
          if (gamepad.buttons[0] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledX_2 === true) {
              this.game.enabledX_2 = false;
              this.game.pressedX_2 = true;
              //console.log("Button 0 pressed! and meaning" + this.game.pressedX_2);
            }
          } else {
            this.game.pressedX_2 = false;
            if (gamepad.buttons[0] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledX_2 = true;
            }
          }
          
          // O Button
          if (gamepad.buttons[1] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledO_2 === true) {
              this.game.enabledO_2 = false;
              this.game.pressedO_2 = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedO_2);
            }
          } else {
            this.game.pressedO_2 = false;
            if (gamepad.buttons[1] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledO_2 = true;
            }
          }
          
          // Square Button
          if (gamepad.buttons[2] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledSquare_2 === true) {
              this.game.enabledSquare_2 = false;
              this.game.pressedSquare_2 = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedSquare_2);
            }
          } else {
            this.game.pressedSquare_2 = false;
            if (gamepad.buttons[2] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledSquare_2 = true;
            }
          }
          
          // Triangle Button
          if (gamepad.buttons[3] >= this.ANALOGUE_BUTTON_THRESHOLD_HIGH) {
            if (this.game.enabledTriangle_2 === true) {
              this.game.enabledTriangle_2 = false;
              this.game.pressedTriangle_2 = true;
              //console.log("Button 2 pressed! and meaning" + this.game.pressedTriangle_2);
            }
          } else {
            //this.game.pressedTriangle = false;
            if (gamepad.buttons[3] <= this.ANALOGUE_BUTTON_THRESHOLD_LOW) {
              this.game.enabledTriangle_2 = true;
            }
          }
          
          // Left D-Pad
          if (gamepad.buttons[14] >= this.DPAD_PRESSED) {
            //console.log("Left D-Pad" + gamepad.buttons[14]);
            this.game.pressedLeft_2 = true;
          } else {
            this.game.pressedLeft_2 = false;
          }
          // Right D-Pad
          if (gamepad.buttons[15] >= this.DPAD_PRESSED) {
            //console.log("Right D-Pad" + gamepad.buttons[15]);
            this.game.pressedRight_2 = true;
          } else {
            this.game.pressedRight_2 = false;
          }
        }
      }
    }
  });
});