function main() {
  var board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  
  var player = {
    turn: true, //Math.round(Math.random())<1 ? true: false,
    turnCount: 0,
    hideTitle: function() {
      $(".second").removeClass("hide");
    },
    isX: true,
    human: "x",
    comp: "o",
    hover: function() {
      let p = $(this).text().replace(/\s/g, "").toLowerCase();
      if (p === "x") {
        $(this).addClass("hoverX");
      } else if (p === "o") {
        $(this).addClass("hoverO");
        player.isX = false;
        player.human = "o";
        player.comp = "x";
      }
    },
    click: function() {
      if (player.isX) {
        $(".second").hide("explode", {}, "slow", function() {
          $("body").addClass("black");
          $(".game").removeClass("hide");
          $(".grid").addClass("whiteborder");
        });
      } else {
        $(".second").hide("explode", {}, "slow", function() {
          $("body").addClass("white");
          $(".game").removeClass("hide");
          $(".grid").addClass("blackborder");
        });
      }
    }
  };

  //click/hover handlers
  $(".title").hide(2000, player.hideTitle);

  $(".xorO .x").hover(player.hover, function() {
    $(this).removeClass("hoverX").removeClass("hoverO");
  });

  $(".xorO .x").on("click", player.click);

  //game logic
  var game = {
    playerText: function() {
      var htmlPerson = "<h1>Your turn</h1>";
      $(".player").html(htmlPerson);
    },
    compText: function() {
      var htmlComp = "<h1>Computer's turn</h1>";
      $(".player").html(htmlComp);
    },
    winText: function() {
      var winner = "<h1>You win!</h1>";
      $(".player").html(winner);
      $(".grid").off("click");
    },
    loseText: function() {
      var loser = "<h1>You lose!</h1>";
      $(".player").html(loser);
      $(".grid").off("click");
    },
    drawText: function() {
      var draw = "<h1>It's a draw</h1>";
      $(".player").html(draw);
      $(".grid").off("click");
    },
    boardUpdate: function(gi, p) {
      //p=player gi=grid index
      let xo = p.toUpperCase();
      let html = "<p class='center'>" + xo + "</p>";
      board[gi] = p;
      let elem = "#g" + gi;
      $(elem).html(html);
    },
    emptyIndexes: function(b) {
      return b.filter(function(val) {
        return val !== "x" && val !== "o";
      });
    },

    winning: function(b, p) {
      if (
        (b[0] == p && b[1] == p && b[2] == p) ||
        (b[3] == p && b[4] == p && b[5] == p) ||
        (b[6] == p && b[7] == p && b[8] == p) ||
        (b[0] == p && b[3] == p && b[6] == p) ||
        (b[1] == p && b[4] == p && b[7] == p) ||
        (b[2] == p && b[5] == p && b[8] == p) ||
        (b[0] == p && b[4] == p && b[8] == p) ||
        (b[2] == p && b[4] == p && b[6] == p)
      ) {
        return true;
      } else {
        return false;
      }
    },
    minimax: function(newBoard, plyr) {
      var availSpots = game.emptyIndexes(newBoard);

      if (game.winning(newBoard, plyr)) {
        return { score: 10 };
      } else if (game.winning(newBoard, player.human)) {
        return { score: -10 };
      } else if (availSpots.length === 0) {
        return { score: 0 };
      }
      //array to collect move objects
      var moves = [];

      for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        // set the empty spot to the current player
        newBoard[availSpots[i]] = plyr;
        /*collect the score resulted from calling minimax 
      on the opponent of the current player*/

        if (plyr == player.comp) {
          let result = game.minimax(newBoard, player.human);
          move.score = result.score;
        } else {
          let result = game.minimax(newBoard, player.comp);
          move.score = result.score;
        }
        // reset the spot to empty
        newBoard[availSpots[i]] = move.index;

        // push the object to the array
        moves.push(move);
      }
      var bestMove;
      if (plyr === player.comp) {
        var bestScore = -10000;
        for (var j = 0; j < moves.length; j++) {
          if (moves[j].score > bestScore) {
            bestScore = moves[j].score;
            bestMove = j;
          }
        }
      } else {
        // else loop over the moves and choose the move with the lowest score
        var bestScore = 10000;
        for (var k = 0; k < moves.length; k++) {
          if (moves[k].score < bestScore) {
            var bestScore = moves[k].score;
            bestMove = k;
          }
        }
      }

      // return the chosen move (object) from the moves array
      return moves[bestMove];
    },
    click: function() {
      let swtch = function() {
        var win = game.winning(board, player.human);
        if (win) {
          game.winText();
        } else if (!win && game.emptyIndexes(board) < 1) {
          game.drawText();
        } else {
          player.turn = false;
          game.compText();
          setTimeout(game.comp, 0);
        }
      };
      let gridIndex = Number(this.id.replace(/[g]/, ""));
      game.boardUpdate(gridIndex, player.human);
      setTimeout(swtch, 1000);
    },
    comp: function() {
      game.compText();
      let result = game.minimax(board, player.comp);
      game.boardUpdate(result.index, player.comp);
      let swtch = function() {
        if (game.winning(board, player.comp)) {
          game.loseText();
        } else if (game.emptyIndexes < 1) {
          game.drawText();
        } else {
          player.turn = true;
          game.playerText();
        }
        //$(".grid").on("click", game.click);
      };
      setTimeout(swtch, 1000);
    },
    initText: function() {
      player.turn ? game.playerText() : game.compText();
    },
    reset: function() {
      for (var x = 0; x < 9; x++) {
        var id = "#g" + x;
        console.log(id);
        $(id).empty();
      }
      board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      game.initText();
      player.turn = true;
      game.playerText();
      $(".grid").on("click", game.click);
    }
  };

  game.initText();
  if (player.turn) {
    $(".grid").on("click", game.click);
  } else {
    game.comp();
  }
  $("#reset").click(game.reset);
}

$(document).ready(main);


