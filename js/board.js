// Generated by CoffeeScript 2.5.1
var SIZE,
  modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
  indexOf = [].indexOf;

import _ from 'https://cdn.skypack.dev/lodash';

import {
  ass,
  lerp,
  param,
  range,
  hexToBase64
} from '../js/utils.js';

import cryptoJs from 'https://cdn.skypack.dev/crypto-js';

import {
  Square
} from '../js/square.js';

import {
  Button
} from '../js/button.js';

import {
  coords,
  clickString,
  getMove,
  global,
  loadTree,
  toObjectNotation,
  toUCI
} from '../js/globals.js';

import {
  dumpState
} from '../js/globals.js';

SIZE = global.SIZE;

export var Board = (function() {
  var calcBar;

  class Board {
    constructor() {
      var i, k, len, ref, x0, x1, x2, x3;
      this.click = this.click.bind(this);
      // gå igenom nodens barn och visa dem i en sorterad lista
      this.showChildren = this.showChildren.bind(this);
      this.draw = this.draw.bind(this);
      this.littera = this.littera.bind(this);
      this.flip = this.flip.bind(this);
      this.squares = [];
      this.clickedSquares = [];
      this.pieces = "";
      this.flipped = false;
      ref = range(64);
      for (k = 0, len = ref.length; k < len; k++) {
        i = ref[k];
        ((i) => {
          return this.squares.push(new Square(i, () => {
            return this.click(i);
          }));
        })(i);
      }
      this.buttons = [];
      x0 = 1.5;
      x1 = 3.5;
      x2 = 5.5;
      x3 = 7.5;
      this.buttons.push(new Button(x0 * SIZE, 9.5 * SIZE, 'undo', () => {
        return clickString('undo');
      }));
      this.buttons.push(new Button(x1 * SIZE, 9.5 * SIZE, 'flip', () => {
        return clickString('flip');
      }));
      this.buttons.push(new Button(x2 * SIZE, 9.5 * SIZE, 'link', () => {
        return clickString('link');
      }));
      this.buttons.push(new Button(x3 * SIZE, 9.5 * SIZE, 'save', () => {
        return clickString('save');
      }));
    }

    click(i) {
      var col, color, move, row, sq, uci;
      col = modulo(i, 8);
      row = 7 - Math.floor(i / 8);
      sq = global.chess.board()[row][col];
      color = "wb"[modulo(global.chess.history().length, 2)];
      if (this.clickedSquares.length === 0) {
        if (sq !== null && sq.color === color) {
          return this.clickedSquares.push(i);
        }
      } else {
        if (i === this.clickedSquares[0]) {
          return this.clickedSquares = [];
        } else {
          this.clickedSquares.push(i);
          move = toObjectNotation(this.clickedSquares);
          uci = toUCI(this.clickedSquares);
          if (global.chess.move(move)) { // accepera draget
            global.stack.push(global.currNode);
            if (indexOf.call(global.currNode, uci) < 0) {
              global.currNode[uci] = {};
              global.count++;
            }
            //console.log 'download',global.tree
            //download global.tree,'tree.json'
            global.currNode = global.currNode[uci];
          }
          return this.clickedSquares = [];
        }
      }
    }

    showChildren() {
      var base64, fen, i, k, key, keys, len, pair, ref, san, value;
      keys = _.keys(global.currNode);
      push();
      noStroke();
      textAlign(LEFT, CENTER);
      fill('white');
      ref = range(keys.length);
      for (k = 0, len = ref.length; k < len; k++) {
        i = ref[k];
        key = keys[i];
        pair = coords(key);
        global.chess.move(toObjectNotation(pair));
        fen = global.chess.fen();
        // console.log key,pair,toObjectNotation pair
        //san = global.chess.san toObjectNotation pair
        san = _.last(global.chess.history());
        base64 = hexToBase64(cryptoJs.SHA256(fen).toString()).slice(0, 8);
        value = global.database[base64] || "?";
        // console.log key, san, base64, value, fen
        text(san + ": " + value, 8.7 * SIZE, 1 * SIZE + i * 0.5 * SIZE);
        global.chess.undo();
      }
      return pop();
    }

    draw() {
      var button, i, j, k, l, len, len1, len2, m, piece, ref, ref1, ref2, score;
      this.buttons[3].text = global.count > 0 ? 'save ' + global.count : "";
      ref = this.buttons;
      for (k = 0, len = ref.length; k < len; k++) {
        button = ref[k];
        button.draw();
      }
      if (!global.tree) {
        return;
      }
      fill('white');
      textSize(SIZE * 0.3);
      push();
      textAlign(LEFT, CENTER);
      text(global.trees[0].name, 0.05 * SIZE, 0.3 * SIZE);
      pop();
      ref1 = range(8);
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        i = ref1[l];
        ref2 = range(8);
        for (m = 0, len2 = ref2.length; m < len2; m++) {
          j = ref2[m];
          piece = global.chess.board()[7 - i][j];
          this.squares[i * 8 + j].draw(piece, this.flipped, i * 8 + j === this.clickedSquares[0]);
        }
      }
      stroke('black');
      noFill();
      rect(SIZE * 4.5, SIZE * 4.5, SIZE * 8, SIZE * 8);
      this.littera();
      push();
      textAlign(CENTER, CENTER);
      if (global.index > 0) {
        text('move: ' + (1 + Math.floor(global.index / 2)) + "BW"[global.index % 2] + " of " + (1 + Math.floor(global.moves.length / 2)), 4.5 * SIZE, 10 * SIZE);
      }
      if (global.index === 0) {
        score = '0';
      }
      text(global.version, 7.5 * SIZE, 10 * SIZE);
      textAlign(RIGHT, CENTER);
      fill('white');
      text(score, 10.1 * SIZE, 0.3 * SIZE);
      pop();
      this.drawBars(score);
      return this.showChildren();
    }

    littera() {
      var digits, i, k, len, letters, ref, results;
      noStroke();
      fill('black');
      textSize(SIZE * 0.3);
      letters = this.flipped ? "hgfedcba" : "abcdefgh";
      digits = this.flipped ? "12345678" : "87654321";
      ref = range(8);
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        i = ref[k];
        text(letters[i], SIZE * (i + 1), SIZE * 8.8);
        results.push(text(digits[i], SIZE * 0.15, SIZE * (i + 1)));
      }
      return results;
    }

    flip() {
      return this.flipped = !this.flipped;
    }

    drawBars(score) {
      var h, w, x;
      param.String(score);
      stroke('black');
      h = calcBar(score);
      push();
      if (this.flipped) {
        translate(0, SIZE * 9);
        scale(1, -1);
      }
      rectMode(CORNER);
      noStroke();
      x = 0.35 * SIZE;
      w = 0.10 * SIZE;
      fill('black');
      rect(x, 0.5 * SIZE, w, SIZE * 4);
      fill('white');
      rect(x, 4.5 * SIZE, w, SIZE * 4);
      if (h > 0) {
        fill('white');
        rect(x, 4.5 * SIZE - h, w, h);
      } else {
        fill('black');
        rect(x, 4.5 * SIZE, w, -h);
      }
      return pop();
    }

  };

  calcBar = (score) => {
    var LIMIT, d, res;
    param.String(score);
    LIMIT = 2000;
    if (score[0] === '#') {
      d = LIMIT;
    } else {
      d = Math.abs(score);
    }
    if (d > LIMIT) {
      d = LIMIT;
    }
    res = lerp(0, 4 * SIZE, d / LIMIT);
    if (indexOf.call(score, "-") >= 0) {
      res = -res;
    }
    return param.Integer(Math.round(res));
  };

  ass(4 * SIZE, calcBar("2100"));

  ass(4 * SIZE, calcBar("2000"));

  ass(2 * SIZE, calcBar("1000"));

  ass(SIZE, calcBar("500"));

  ass(0, calcBar("1"));

  ass(-SIZE, calcBar("-500"));

  ass(-4 * SIZE, calcBar("#-1"));

  return Board;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9hcmQuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZVxcYm9hcmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFBLElBQUE7RUFBQTs7O0FBQUEsT0FBTyxDQUFQLE1BQUE7O0FBQ0EsT0FBQTtFQUFRLEdBQVI7RUFBWSxJQUFaO0VBQWlCLEtBQWpCO0VBQXVCLEtBQXZCO0VBQTZCLFdBQTdCO0NBQUEsTUFBQTs7QUFDQSxPQUFPLFFBQVAsTUFBQTs7QUFDQSxPQUFBO0VBQVEsTUFBUjtDQUFBLE1BQUE7O0FBQ0EsT0FBQTtFQUFRLE1BQVI7Q0FBQSxNQUFBOztBQUNBLE9BQUE7RUFBUSxNQUFSO0VBQWUsV0FBZjtFQUEyQixPQUEzQjtFQUFtQyxNQUFuQztFQUEwQyxRQUExQztFQUFtRCxnQkFBbkQ7RUFBb0UsS0FBcEU7Q0FBQSxNQUFBOztBQUNBLE9BQUE7RUFBUSxTQUFSO0NBQUEsTUFBQTs7QUFFQSxJQUFBLEdBQU8sTUFBTSxDQUFDOztBQUVkLE9BQUEsSUFBYTs7O0VBQU4sTUFBQSxNQUFBO0lBQ04sV0FBYSxDQUFBLENBQUE7QUFDZCxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQTtVQWlCQyxDQUFBLFlBQUEsQ0FBQSxpQkFqQkQ7O1VBMkNDLENBQUEsbUJBQUEsQ0FBQTtVQXFCQSxDQUFBLFdBQUEsQ0FBQTtVQTRDQSxDQUFBLGNBQUEsQ0FBQTtVQVdBLENBQUEsV0FBQSxDQUFBO01BdkhDLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVztBQUNYO01BQUEsS0FBQSxxQ0FBQTs7UUFDSSxDQUFBLENBQUMsQ0FBRCxDQUFBLEdBQUE7aUJBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQUEsQ0FBQSxHQUFBO21CQUFHLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUDtVQUFILENBQWQsQ0FBZDtRQUFQLENBQUEsRUFBQztNQURMO01BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLEVBQUEsR0FBSztNQUNMLEVBQUEsR0FBSztNQUNMLEVBQUEsR0FBSztNQUNMLEVBQUEsR0FBSztNQUNMLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUksTUFBSixDQUFXLEVBQUEsR0FBRyxJQUFkLEVBQW9CLEdBQUEsR0FBSSxJQUF4QixFQUE4QixNQUE5QixFQUFzQyxDQUFBLENBQUEsR0FBQTtlQUFHLFdBQUEsQ0FBWSxNQUFaO01BQUgsQ0FBdEMsQ0FBZDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUksTUFBSixDQUFXLEVBQUEsR0FBRyxJQUFkLEVBQW9CLEdBQUEsR0FBSSxJQUF4QixFQUE4QixNQUE5QixFQUFzQyxDQUFBLENBQUEsR0FBQTtlQUFHLFdBQUEsQ0FBWSxNQUFaO01BQUgsQ0FBdEMsQ0FBZDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUksTUFBSixDQUFXLEVBQUEsR0FBRyxJQUFkLEVBQW9CLEdBQUEsR0FBSSxJQUF4QixFQUE4QixNQUE5QixFQUFzQyxDQUFBLENBQUEsR0FBQTtlQUFHLFdBQUEsQ0FBWSxNQUFaO01BQUgsQ0FBdEMsQ0FBZDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUksTUFBSixDQUFXLEVBQUEsR0FBRyxJQUFkLEVBQW9CLEdBQUEsR0FBSSxJQUF4QixFQUE4QixNQUE5QixFQUFzQyxDQUFBLENBQUEsR0FBQTtlQUFHLFdBQUEsQ0FBWSxNQUFaO01BQUgsQ0FBdEMsQ0FBZDtJQWhCWTs7SUFrQmIsS0FBUSxDQUFDLENBQUQsQ0FBQTtBQUNULFVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQTtNQUFFLEdBQUEsVUFBTSxHQUFLO01BQ1gsR0FBQSxHQUFNLENBQUEsY0FBRSxJQUFLO01BQ2IsRUFBQSxHQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQW9CLENBQUMsR0FBRCxDQUFLLENBQUMsR0FBRDtNQUM5QixLQUFBLEdBQVEsSUFBSSxRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBYixDQUFBLENBQXNCLENBQUMsUUFBVSxFQUFsQztNQUVaLElBQUcsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixLQUEwQixDQUE3QjtRQUNDLElBQUcsRUFBQSxLQUFNLElBQU4sSUFBZSxFQUFFLENBQUMsS0FBSCxLQUFZLEtBQTlCO2lCQUF5QyxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLENBQXJCLEVBQXpDO1NBREQ7T0FBQSxNQUFBO1FBR0MsSUFBRyxDQUFBLEtBQUssSUFBQyxDQUFBLGNBQWMsQ0FBQyxDQUFELENBQXZCO2lCQUNDLElBQUMsQ0FBQSxjQUFELEdBQWtCLEdBRG5CO1NBQUEsTUFBQTtVQUdDLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsQ0FBckI7VUFDQSxJQUFBLEdBQU8sZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLGNBQWxCO1VBQ1AsR0FBQSxHQUFNLEtBQUEsQ0FBTSxJQUFDLENBQUEsY0FBUDtVQUNOLElBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBQUg7WUFDQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQWIsQ0FBa0IsTUFBTSxDQUFDLFFBQXpCO1lBQ0EsaUJBQWMsTUFBTSxDQUFDLFVBQWxCLFFBQUg7Y0FDQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUQsQ0FBZixHQUF1QixDQUFBO2NBQ3ZCLE1BQU0sQ0FBQyxLQUFQLEdBRkQ7YUFETDs7O1lBTUssTUFBTSxDQUFDLFFBQVAsR0FBa0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFELEVBUGxDOztpQkFRQSxJQUFDLENBQUEsY0FBRCxHQUFrQixHQWRuQjtTQUhEOztJQU5POztJQTBCUixZQUFlLENBQUEsQ0FBQTtBQUNoQixVQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQTtNQUFFLElBQUEsR0FBTyxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxRQUFkO01BQ1AsSUFBQSxDQUFBO01BQ0EsUUFBQSxDQUFBO01BQ0EsU0FBQSxDQUFVLElBQVYsRUFBZSxNQUFmO01BQ0EsSUFBQSxDQUFLLE9BQUw7QUFDQTtNQUFBLEtBQUEscUNBQUE7O1FBQ0MsR0FBQSxHQUFNLElBQUksQ0FBQyxDQUFEO1FBQ1YsSUFBQSxHQUFPLE1BQUEsQ0FBTyxHQUFQO1FBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFiLENBQWtCLGdCQUFBLENBQWlCLElBQWpCLENBQWxCO1FBQ0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixDQUFBLEVBSFQ7OztRQU1HLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBYixDQUFBLENBQVA7UUFDTixNQUFBLEdBQVMsV0FBQSxDQUFZLFFBQVEsQ0FBQyxNQUFULENBQWdCLEdBQWhCLENBQW9CLENBQUMsUUFBckIsQ0FBQSxDQUFaLENBQTRDLENBQUMsS0FBN0MsQ0FBbUQsQ0FBbkQsRUFBcUQsQ0FBckQ7UUFDVCxLQUFBLEdBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFELENBQWYsSUFBMkIsSUFSdEM7O1FBVUcsSUFBQSxDQUFLLEdBQUEsR0FBSyxJQUFMLEdBQVksS0FBakIsRUFBd0IsR0FBQSxHQUFJLElBQTVCLEVBQWtDLENBQUEsR0FBRSxJQUFGLEdBQVMsQ0FBQSxHQUFFLEdBQUYsR0FBTSxJQUFqRDtRQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBYixDQUFBO01BWkQ7YUFhQSxHQUFBLENBQUE7SUFuQmM7O0lBcUJmLElBQU8sQ0FBQSxDQUFBO0FBRVIsVUFBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUE7TUFBRSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQUQsQ0FBRyxDQUFDLElBQVosR0FBc0IsTUFBTSxDQUFDLEtBQVAsR0FBYSxDQUFoQixHQUF1QixPQUFBLEdBQVUsTUFBTSxDQUFDLEtBQXhDLEdBQW1EO0FBRXRFO01BQUEsS0FBQSxxQ0FBQTs7UUFDQyxNQUFNLENBQUMsSUFBUCxDQUFBO01BREQ7TUFHQSxJQUFHLENBQUksTUFBTSxDQUFDLElBQWQ7QUFBd0IsZUFBeEI7O01BRUEsSUFBQSxDQUFLLE9BQUw7TUFDQSxRQUFBLENBQVMsSUFBQSxHQUFLLEdBQWQ7TUFFQSxJQUFBLENBQUE7TUFDQSxTQUFBLENBQVUsSUFBVixFQUFlLE1BQWY7TUFDQSxJQUFBLENBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFELENBQUcsQ0FBQyxJQUFyQixFQUEwQixJQUFBLEdBQUssSUFBL0IsRUFBcUMsR0FBQSxHQUFJLElBQXpDO01BQ0EsR0FBQSxDQUFBO0FBRUE7TUFBQSxLQUFBLHdDQUFBOztBQUNDO1FBQUEsS0FBQSx3Q0FBQTs7VUFDQyxLQUFBLEdBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLENBQUEsQ0FBb0IsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFLLENBQUMsQ0FBRDtVQUNqQyxJQUFDLENBQUEsT0FBTyxDQUFDLENBQUEsR0FBRSxDQUFGLEdBQUksQ0FBTCxDQUFPLENBQUMsSUFBaEIsQ0FBcUIsS0FBckIsRUFBNEIsSUFBQyxDQUFBLE9BQTdCLEVBQXNDLENBQUEsR0FBRSxDQUFGLEdBQUksQ0FBSixLQUFPLElBQUMsQ0FBQSxjQUFjLENBQUMsQ0FBRCxDQUE1RDtRQUZEO01BREQ7TUFLQSxNQUFBLENBQU8sT0FBUDtNQUNBLE1BQUEsQ0FBQTtNQUNBLElBQUEsQ0FBSyxJQUFBLEdBQUssR0FBVixFQUFjLElBQUEsR0FBSyxHQUFuQixFQUF1QixJQUFBLEdBQUssQ0FBNUIsRUFBOEIsSUFBQSxHQUFLLENBQW5DO01BRUEsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUVBLElBQUEsQ0FBQTtNQUNBLFNBQUEsQ0FBVSxNQUFWLEVBQWlCLE1BQWpCO01BQ0EsSUFBRyxNQUFNLENBQUMsS0FBUCxHQUFlLENBQWxCO1FBQ0MsSUFBQSxDQUFLLFFBQUEsR0FBVyxDQUFDLENBQUEsY0FBRSxNQUFNLENBQUMsUUFBTyxFQUFqQixDQUFYLEdBQWlDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBUCxHQUFhLENBQWQsQ0FBckMsR0FBdUQsTUFBdkQsR0FBK0QsQ0FBQyxDQUFBLGNBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFRLEVBQXhCLENBQXBFLEVBQWdHLEdBQUEsR0FBSSxJQUFwRyxFQUEwRyxFQUFBLEdBQUcsSUFBN0csRUFERDs7TUFFQSxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWMsQ0FBakI7UUFDQyxLQUFBLEdBQVEsSUFEVDs7TUFHQSxJQUFBLENBQUssTUFBTSxDQUFDLE9BQVosRUFBcUIsR0FBQSxHQUFJLElBQXpCLEVBQStCLEVBQUEsR0FBRyxJQUFsQztNQUNBLFNBQUEsQ0FBVSxLQUFWLEVBQWdCLE1BQWhCO01BQ0EsSUFBQSxDQUFLLE9BQUw7TUFDQSxJQUFBLENBQUssS0FBTCxFQUFZLElBQUEsR0FBSyxJQUFqQixFQUF1QixHQUFBLEdBQUksSUFBM0I7TUFFQSxHQUFBLENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVY7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBMUNNOztJQTRDUCxPQUFVLENBQUEsQ0FBQTtBQUNYLFVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUE7TUFBRSxRQUFBLENBQUE7TUFDQSxJQUFBLENBQUssT0FBTDtNQUNBLFFBQUEsQ0FBUyxJQUFBLEdBQUssR0FBZDtNQUNBLE9BQUEsR0FBYSxJQUFDLENBQUEsT0FBSixHQUFpQixVQUFqQixHQUFpQztNQUMzQyxNQUFBLEdBQVksSUFBQyxDQUFBLE9BQUosR0FBa0IsVUFBbEIsR0FBa0M7QUFFM0M7QUFBQTtNQUFBLEtBQUEscUNBQUE7O1FBQ0MsSUFBQSxDQUFLLE9BQU8sQ0FBQyxDQUFELENBQVosRUFBZ0IsSUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBckIsRUFBMkIsSUFBQSxHQUFLLEdBQWhDO3FCQUNBLElBQUEsQ0FBSyxNQUFNLENBQUMsQ0FBRCxDQUFYLEVBQWUsSUFBQSxHQUFLLElBQXBCLEVBQXlCLElBQUEsR0FBSyxDQUFDLENBQUEsR0FBRSxDQUFILENBQTlCO01BRkQsQ0FBQTs7SUFQUzs7SUFXVixJQUFPLENBQUEsQ0FBQTthQUFHLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBSSxJQUFDLENBQUE7SUFBbkI7O0lBRVAsUUFBVyxDQUFDLEtBQUQsQ0FBQTtBQUNaLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtNQUFFLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBYjtNQUNBLE1BQUEsQ0FBTyxPQUFQO01BQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxLQUFSO01BQ0osSUFBQSxDQUFBO01BQ0EsSUFBRyxJQUFDLENBQUEsT0FBSjtRQUNDLFNBQUEsQ0FBVSxDQUFWLEVBQWEsSUFBQSxHQUFLLENBQWxCO1FBQ0EsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFDLENBQVYsRUFGRDs7TUFHQSxRQUFBLENBQVMsTUFBVDtNQUNBLFFBQUEsQ0FBQTtNQUNBLENBQUEsR0FBSSxJQUFBLEdBQU87TUFDWCxDQUFBLEdBQUksSUFBQSxHQUFPO01BQ1gsSUFBQSxDQUFLLE9BQUw7TUFDQSxJQUFBLENBQUssQ0FBTCxFQUFRLEdBQUEsR0FBSSxJQUFaLEVBQWtCLENBQWxCLEVBQXFCLElBQUEsR0FBTyxDQUE1QjtNQUNBLElBQUEsQ0FBSyxPQUFMO01BQ0EsSUFBQSxDQUFLLENBQUwsRUFBUSxHQUFBLEdBQUksSUFBWixFQUFrQixDQUFsQixFQUFxQixJQUFBLEdBQU8sQ0FBNUI7TUFDQSxJQUFHLENBQUEsR0FBSSxDQUFQO1FBQ0MsSUFBQSxDQUFLLE9BQUw7UUFDQSxJQUFBLENBQUssQ0FBTCxFQUFRLEdBQUEsR0FBSSxJQUFKLEdBQVcsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFGRDtPQUFBLE1BQUE7UUFJQyxJQUFBLENBQUssT0FBTDtRQUNBLElBQUEsQ0FBSyxDQUFMLEVBQVEsR0FBQSxHQUFJLElBQVosRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBQyxDQUF0QixFQUxEOzthQU1BLEdBQUEsQ0FBQTtJQXRCVTs7RUEzSEw7O0VBbUpOLE9BQUEsR0FBVSxDQUFDLEtBQUQsQ0FBQSxHQUFBO0FBQ1gsUUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBO0lBQUUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFiO0lBQ0EsS0FBQSxHQUFRO0lBQ1IsSUFBRyxLQUFLLENBQUMsQ0FBRCxDQUFMLEtBQVUsR0FBYjtNQUFzQixDQUFBLEdBQUksTUFBMUI7S0FBQSxNQUFBO01BQ0ssQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxFQURUOztJQUVBLElBQUcsQ0FBQSxHQUFFLEtBQUw7TUFBZ0IsQ0FBQSxHQUFJLE1BQXBCOztJQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQUEsR0FBRSxJQUFWLEVBQWdCLENBQUEsR0FBRSxLQUFsQjtJQUNOLGlCQUFVLE9BQVAsU0FBSDtNQUFxQixHQUFBLEdBQU0sQ0FBQyxJQUE1Qjs7V0FDQSxLQUFLLENBQUMsT0FBTixDQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFkO0VBUlM7O0VBU1YsR0FBQSxDQUFJLENBQUEsR0FBRSxJQUFOLEVBQVcsT0FBQSxDQUFRLE1BQVIsQ0FBWDs7RUFDQSxHQUFBLENBQUksQ0FBQSxHQUFFLElBQU4sRUFBVyxPQUFBLENBQVEsTUFBUixDQUFYOztFQUNBLEdBQUEsQ0FBSSxDQUFBLEdBQUUsSUFBTixFQUFXLE9BQUEsQ0FBUSxNQUFSLENBQVg7O0VBQ0EsR0FBQSxDQUFJLElBQUosRUFBUyxPQUFBLENBQVEsS0FBUixDQUFUOztFQUNBLEdBQUEsQ0FBSSxDQUFKLEVBQU0sT0FBQSxDQUFRLEdBQVIsQ0FBTjs7RUFDQSxHQUFBLENBQUksQ0FBQyxJQUFMLEVBQVUsT0FBQSxDQUFRLE1BQVIsQ0FBVjs7RUFDQSxHQUFBLENBQUksQ0FBQyxDQUFELEdBQUcsSUFBUCxFQUFZLE9BQUEsQ0FBUSxLQUFSLENBQVoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdodHRwczovL2Nkbi5za3lwYWNrLmRldi9sb2Rhc2gnXHJcbmltcG9ydCB7YXNzLGxlcnAscGFyYW0scmFuZ2UsaGV4VG9CYXNlNjR9IGZyb20gJy4uL2pzL3V0aWxzLmpzJ1xyXG5pbXBvcnQgY3J5cHRvSnMgZnJvbSAnaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvY3J5cHRvLWpzJ1xyXG5pbXBvcnQge1NxdWFyZX0gZnJvbSAnLi4vanMvc3F1YXJlLmpzJ1xyXG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnLi4vanMvYnV0dG9uLmpzJ1xyXG5pbXBvcnQge2Nvb3JkcyxjbGlja1N0cmluZyxnZXRNb3ZlLGdsb2JhbCxsb2FkVHJlZSx0b09iamVjdE5vdGF0aW9uLHRvVUNJfSBmcm9tICcuLi9qcy9nbG9iYWxzLmpzJ1xyXG5pbXBvcnQge2R1bXBTdGF0ZX0gZnJvbSAnLi4vanMvZ2xvYmFscy5qcydcclxuXHJcblNJWkUgPSBnbG9iYWwuU0laRVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvYXJkXHJcblx0Y29uc3RydWN0b3I6IC0+XHJcblx0XHRAc3F1YXJlcyA9IFtdXHJcblx0XHRAY2xpY2tlZFNxdWFyZXMgPSBbXVxyXG5cdFx0QHBpZWNlcyA9IFwiXCJcclxuXHRcdEBmbGlwcGVkID0gZmFsc2VcclxuXHRcdGZvciBpIGluIHJhbmdlIDY0XHJcblx0XHRcdGRvIChpKSA9PiBAc3F1YXJlcy5wdXNoIG5ldyBTcXVhcmUgaSwgPT4gQGNsaWNrIGlcclxuXHJcblx0XHRAYnV0dG9ucyA9IFtdXHJcblx0XHR4MCA9IDEuNVxyXG5cdFx0eDEgPSAzLjVcclxuXHRcdHgyID0gNS41XHJcblx0XHR4MyA9IDcuNVxyXG5cdFx0QGJ1dHRvbnMucHVzaCBuZXcgQnV0dG9uIHgwKlNJWkUsIDkuNSpTSVpFLCAndW5kbycsID0+IGNsaWNrU3RyaW5nICd1bmRvJ1xyXG5cdFx0QGJ1dHRvbnMucHVzaCBuZXcgQnV0dG9uIHgxKlNJWkUsIDkuNSpTSVpFLCAnZmxpcCcsID0+IGNsaWNrU3RyaW5nICdmbGlwJ1xyXG5cdFx0QGJ1dHRvbnMucHVzaCBuZXcgQnV0dG9uIHgyKlNJWkUsIDkuNSpTSVpFLCAnbGluaycsID0+IGNsaWNrU3RyaW5nICdsaW5rJ1xyXG5cdFx0QGJ1dHRvbnMucHVzaCBuZXcgQnV0dG9uIHgzKlNJWkUsIDkuNSpTSVpFLCAnc2F2ZScsID0+IGNsaWNrU3RyaW5nICdzYXZlJ1xyXG5cclxuXHRjbGljayA6IChpKSA9PlxyXG5cdFx0Y29sID0gaSAlJSA4XHJcblx0XHRyb3cgPSA3LWkgLy8gOFxyXG5cdFx0c3EgPSBnbG9iYWwuY2hlc3MuYm9hcmQoKVtyb3ddW2NvbF1cclxuXHRcdGNvbG9yID0gXCJ3YlwiW2dsb2JhbC5jaGVzcy5oaXN0b3J5KCkubGVuZ3RoICUlIDJdICMgZsO2cnbDpG50YWQgZsOkcmcgcMOlIHBqw6RzZW5cclxuXHJcblx0XHRpZiBAY2xpY2tlZFNxdWFyZXMubGVuZ3RoID09IDBcclxuXHRcdFx0aWYgc3EgIT0gbnVsbCBhbmQgc3EuY29sb3IgPT0gY29sb3IgdGhlbiBAY2xpY2tlZFNxdWFyZXMucHVzaCBpXHJcblx0XHRlbHNlXHJcblx0XHRcdGlmIGkgPT0gQGNsaWNrZWRTcXVhcmVzWzBdXHJcblx0XHRcdFx0QGNsaWNrZWRTcXVhcmVzID0gW11cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBjbGlja2VkU3F1YXJlcy5wdXNoIGlcclxuXHRcdFx0XHRtb3ZlID0gdG9PYmplY3ROb3RhdGlvbiBAY2xpY2tlZFNxdWFyZXNcclxuXHRcdFx0XHR1Y2kgPSB0b1VDSSBAY2xpY2tlZFNxdWFyZXNcclxuXHRcdFx0XHRpZiBnbG9iYWwuY2hlc3MubW92ZSBtb3ZlICMgYWNjZXBlcmEgZHJhZ2V0XHJcblx0XHRcdFx0XHRnbG9iYWwuc3RhY2sucHVzaCBnbG9iYWwuY3Vyck5vZGVcclxuXHRcdFx0XHRcdGlmIHVjaSBub3QgaW4gZ2xvYmFsLmN1cnJOb2RlXHJcblx0XHRcdFx0XHRcdGdsb2JhbC5jdXJyTm9kZVt1Y2ldID0ge31cclxuXHRcdFx0XHRcdFx0Z2xvYmFsLmNvdW50KytcclxuXHRcdFx0XHRcdFx0I2NvbnNvbGUubG9nICdkb3dubG9hZCcsZ2xvYmFsLnRyZWVcclxuXHRcdFx0XHRcdFx0I2Rvd25sb2FkIGdsb2JhbC50cmVlLCd0cmVlLmpzb24nXHJcblx0XHRcdFx0XHRnbG9iYWwuY3Vyck5vZGUgPSBnbG9iYWwuY3Vyck5vZGVbdWNpXVxyXG5cdFx0XHRcdEBjbGlja2VkU3F1YXJlcyA9IFtdXHJcblxyXG4jIGfDpSBpZ2Vub20gbm9kZW5zIGJhcm4gb2NoIHZpc2EgZGVtIGkgZW4gc29ydGVyYWQgbGlzdGFcclxuXHRzaG93Q2hpbGRyZW4gOiA9PlxyXG5cdFx0a2V5cyA9IF8ua2V5cyBnbG9iYWwuY3Vyck5vZGVcclxuXHRcdHB1c2goKVxyXG5cdFx0bm9TdHJva2UoKVxyXG5cdFx0dGV4dEFsaWduIExFRlQsQ0VOVEVSXHJcblx0XHRmaWxsICd3aGl0ZSdcclxuXHRcdGZvciBpIGluIHJhbmdlIGtleXMubGVuZ3RoXHJcblx0XHRcdGtleSA9IGtleXNbaV1cclxuXHRcdFx0cGFpciA9IGNvb3JkcyBrZXlcclxuXHRcdFx0Z2xvYmFsLmNoZXNzLm1vdmUgdG9PYmplY3ROb3RhdGlvbiBwYWlyXHJcblx0XHRcdGZlbiA9IGdsb2JhbC5jaGVzcy5mZW4oKVxyXG5cdFx0XHQjIGNvbnNvbGUubG9nIGtleSxwYWlyLHRvT2JqZWN0Tm90YXRpb24gcGFpclxyXG5cdFx0XHQjc2FuID0gZ2xvYmFsLmNoZXNzLnNhbiB0b09iamVjdE5vdGF0aW9uIHBhaXJcclxuXHRcdFx0c2FuID0gXy5sYXN0IGdsb2JhbC5jaGVzcy5oaXN0b3J5KClcclxuXHRcdFx0YmFzZTY0ID0gaGV4VG9CYXNlNjQoY3J5cHRvSnMuU0hBMjU2KGZlbikudG9TdHJpbmcoKSkuc2xpY2UgMCw4XHJcblx0XHRcdHZhbHVlID0gZ2xvYmFsLmRhdGFiYXNlW2Jhc2U2NF0gb3IgXCI/XCJcclxuXHRcdFx0IyBjb25zb2xlLmxvZyBrZXksIHNhbiwgYmFzZTY0LCB2YWx1ZSwgZmVuXHJcblx0XHRcdHRleHQgc2FuKyBcIjogXCIgKyB2YWx1ZSwgOC43KlNJWkUsIDEqU0laRSArIGkqMC41KlNJWkVcclxuXHRcdFx0Z2xvYmFsLmNoZXNzLnVuZG8oKVxyXG5cdFx0cG9wKClcclxuXHJcblx0ZHJhdyA6ID0+XHJcblxyXG5cdFx0QGJ1dHRvbnNbM10udGV4dCA9IGlmIGdsb2JhbC5jb3VudD4wIHRoZW4gJ3NhdmUgJyArIGdsb2JhbC5jb3VudCBlbHNlIFwiXCJcclxuXHJcblx0XHRmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcblx0XHRcdGJ1dHRvbi5kcmF3KClcclxuXHJcblx0XHRpZiBub3QgZ2xvYmFsLnRyZWUgdGhlbiByZXR1cm5cclxuXHJcblx0XHRmaWxsICd3aGl0ZSdcclxuXHRcdHRleHRTaXplIFNJWkUqMC4zXHJcblxyXG5cdFx0cHVzaCgpXHJcblx0XHR0ZXh0QWxpZ24gTEVGVCxDRU5URVJcclxuXHRcdHRleHQgZ2xvYmFsLnRyZWVzWzBdLm5hbWUsMC4wNSpTSVpFLCAwLjMqU0laRVxyXG5cdFx0cG9wKClcclxuXHJcblx0XHRmb3IgaSBpbiByYW5nZSA4XHJcblx0XHRcdGZvciBqIGluIHJhbmdlIDhcclxuXHRcdFx0XHRwaWVjZSA9IGdsb2JhbC5jaGVzcy5ib2FyZCgpWzctaV1bal0gIyB7c3F1YXJlLCB0eXBlLCBjb2xvcn1cclxuXHRcdFx0XHRAc3F1YXJlc1tpKjgral0uZHJhdyBwaWVjZSwgQGZsaXBwZWQsIGkqOCtqPT1AY2xpY2tlZFNxdWFyZXNbMF1cclxuXHJcblx0XHRzdHJva2UgJ2JsYWNrJ1xyXG5cdFx0bm9GaWxsKClcclxuXHRcdHJlY3QgU0laRSo0LjUsU0laRSo0LjUsU0laRSo4LFNJWkUqOFxyXG5cclxuXHRcdEBsaXR0ZXJhKClcclxuXHJcblx0XHRwdXNoKClcclxuXHRcdHRleHRBbGlnbiBDRU5URVIsQ0VOVEVSXHJcblx0XHRpZiBnbG9iYWwuaW5kZXggPiAwXHJcblx0XHRcdHRleHQgJ21vdmU6ICcgKyAoMStnbG9iYWwuaW5kZXgvLzIpICsgXCJCV1wiW2dsb2JhbC5pbmRleCUyXSsgXCIgb2YgXCIrICgxK2dsb2JhbC5tb3Zlcy5sZW5ndGgvLzIpLCA0LjUqU0laRSwgMTAqU0laRVxyXG5cdFx0aWYgZ2xvYmFsLmluZGV4PT0wXHJcblx0XHRcdHNjb3JlID0gJzAnXHJcblxyXG5cdFx0dGV4dCBnbG9iYWwudmVyc2lvbiwgNy41KlNJWkUsIDEwKlNJWkVcclxuXHRcdHRleHRBbGlnbiBSSUdIVCxDRU5URVJcclxuXHRcdGZpbGwgJ3doaXRlJ1xyXG5cdFx0dGV4dCBzY29yZSwgMTAuMSpTSVpFLCAwLjMqU0laRVxyXG5cclxuXHRcdHBvcCgpXHJcblx0XHRAZHJhd0JhcnMgc2NvcmVcclxuXHRcdEBzaG93Q2hpbGRyZW4oKVxyXG5cclxuXHRsaXR0ZXJhIDogPT5cclxuXHRcdG5vU3Ryb2tlKClcclxuXHRcdGZpbGwgJ2JsYWNrJ1xyXG5cdFx0dGV4dFNpemUgU0laRSowLjNcclxuXHRcdGxldHRlcnMgPSBpZiBAZmxpcHBlZCB0aGVuIFwiaGdmZWRjYmFcIiBlbHNlIFwiYWJjZGVmZ2hcIlxyXG5cdFx0ZGlnaXRzID0gaWYgQGZsaXBwZWQgdGhlbiAgXCIxMjM0NTY3OFwiIGVsc2UgXCI4NzY1NDMyMVwiXHJcblxyXG5cdFx0Zm9yIGkgaW4gcmFuZ2UgOFxyXG5cdFx0XHR0ZXh0IGxldHRlcnNbaV0sU0laRSooaSsxKSxTSVpFKjguOFxyXG5cdFx0XHR0ZXh0IGRpZ2l0c1tpXSxTSVpFKjAuMTUsU0laRSooaSsxKVxyXG5cclxuXHRmbGlwIDogPT4gQGZsaXBwZWQgPSBub3QgQGZsaXBwZWRcclxuXHJcblx0ZHJhd0JhcnMgOiAoc2NvcmUpIC0+XHJcblx0XHRwYXJhbS5TdHJpbmcgc2NvcmVcclxuXHRcdHN0cm9rZSAnYmxhY2snIFxyXG5cdFx0aCA9IGNhbGNCYXIgc2NvcmVcclxuXHRcdHB1c2goKVxyXG5cdFx0aWYgQGZsaXBwZWRcclxuXHRcdFx0dHJhbnNsYXRlIDAsIFNJWkUqOVxyXG5cdFx0XHRzY2FsZSAxLCAtMVxyXG5cdFx0cmVjdE1vZGUgQ09STkVSXHJcblx0XHRub1N0cm9rZSgpXHJcblx0XHR4ID0gMC4zNSAqIFNJWkVcclxuXHRcdHcgPSAwLjEwICogU0laRVxyXG5cdFx0ZmlsbCAnYmxhY2snXHJcblx0XHRyZWN0IHgsIDAuNSpTSVpFLCB3LCBTSVpFICogNFxyXG5cdFx0ZmlsbCAnd2hpdGUnXHJcblx0XHRyZWN0IHgsIDQuNSpTSVpFLCB3LCBTSVpFICogNFxyXG5cdFx0aWYgaCA+IDBcclxuXHRcdFx0ZmlsbCAnd2hpdGUnXHJcblx0XHRcdHJlY3QgeCwgNC41KlNJWkUgLSBoLCB3LCBoXHJcblx0XHRlbHNlXHJcblx0XHRcdGZpbGwgJ2JsYWNrJ1xyXG5cdFx0XHRyZWN0IHgsIDQuNSpTSVpFLCB3LCAtaFxyXG5cdFx0cG9wKClcclxuXHJcblx0Y2FsY0JhciA9IChzY29yZSkgPT5cclxuXHRcdHBhcmFtLlN0cmluZyBzY29yZVxyXG5cdFx0TElNSVQgPSAyMDAwXHJcblx0XHRpZiBzY29yZVswXT09JyMnIHRoZW4gZCA9IExJTUlUXHJcblx0XHRlbHNlIGQgPSBNYXRoLmFicyBzY29yZVxyXG5cdFx0aWYgZD5MSU1JVCB0aGVuIGQgPSBMSU1JVFxyXG5cdFx0cmVzID0gbGVycCAwLCA0KlNJWkUsIGQvTElNSVRcclxuXHRcdGlmIFwiLVwiIGluIHNjb3JlIHRoZW4gcmVzID0gLXJlc1xyXG5cdFx0cGFyYW0uSW50ZWdlciBNYXRoLnJvdW5kIHJlc1xyXG5cdGFzcyA0KlNJWkUsY2FsY0JhciBcIjIxMDBcIlxyXG5cdGFzcyA0KlNJWkUsY2FsY0JhciBcIjIwMDBcIlxyXG5cdGFzcyAyKlNJWkUsY2FsY0JhciBcIjEwMDBcIlxyXG5cdGFzcyBTSVpFLGNhbGNCYXIgXCI1MDBcIlxyXG5cdGFzcyAwLGNhbGNCYXIgXCIxXCJcclxuXHRhc3MgLVNJWkUsY2FsY0JhciBcIi01MDBcIlxyXG5cdGFzcyAtNCpTSVpFLGNhbGNCYXIgXCIjLTFcIlxyXG4iXX0=
//# sourceURL=c:\github\2023-019-ChessTree\coffee\board.coffee