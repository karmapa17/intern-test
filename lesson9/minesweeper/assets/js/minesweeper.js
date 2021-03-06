(function() {

  var KEY_H = 72;

  var SCAN_COORDS = [
    {deltaX: -1, deltaY: -1},
    {deltaX: 0, deltaY: -1},
    {deltaX: 1, deltaY: -1},
    {deltaX: -1, deltaY: 0},
    {deltaX: 1, deltaY: 0},
    {deltaX: -1, deltaY: 1},
    {deltaX: 0, deltaY: 1},
    {deltaX: 1, deltaY: 1}
  ];

  function Cell(args) {
    this.x = args.x;
    this.y = args.y;
    this.flagged = false;
    this.isClicked = false;
    this.isMine = false;
    this.isStarted = false;
    this.timePadTimer = null;
    this.dom = args.dom;
  }

  Cell.prototype.styleClicked = function(areaMinesCount) {
    var target = this.dom;
    target.classList.add('pushed');
    if (areaMinesCount > 0) {
      target.classList.add('c' + areaMinesCount);
      target.textContent = areaMinesCount;
    }
  };

  Cell.prototype.toggleFlag = function() {
    var target = this.dom;
    if (this.flagged) {
      target.classList.add('flagged');
    }
    else {
      target.classList.remove('flagged');
    }
  };

  Cell.prototype.reset = function() {

    var target = this.dom;
    target.classList.remove('flagged');
    target.classList.remove('pushed');
    target.classList.remove('is-mine');
    target.classList.remove('c1');
    target.classList.remove('c2');
    target.classList.remove('c3');
    target.classList.remove('c4');
    target.classList.remove('c5');
    target.textContent = '';

    this.isClicked = false;
    this.flagged = false;
    this.isMine = false;
  };

  Cell.prototype.set = function(data) {
    var self = this;
    Object.keys(data).forEach(function(key) {
      var value = data[key];
      self[key] = value;
    });
  };

  function Mineweeper(args) {
    args = args || {};
    this.id = args.id;
    this.width = args.width || 8;
    this.height = args.height || 8;
    this.minesCount = args.minesCount || 10;
    this.cells = {};
    this.timeInSec = 0;
    this.isDisabled = false;
    this.flagCount = this.minesCount;

    this.isHackingMode = false;

    this.init(this.id);
  }

  Mineweeper.prototype.createScoreBoard = function() {

    var board = document.createElement('div');
    board.className = 'score-board';

    this.flagPad = document.createElement('span');
    this.facePad = document.createElement('span');
    this.timePad = document.createElement('span');

    this.facePad.addEventListener('click', this._handleFaceClick.bind(this), false);

    this.flagPad.setAttribute('data-flag-pad', true);
    this.flagPad.className = 'flag-pad';
    this.flagPad.textContent = this.minesCount;

    this.facePad.setAttribute('data-face-pad', true);
    this.facePad.className = 'face-pad';
    this.facePad.textContent = '^_^';

    this.timePad.setAttribute('data-time-pad', true);
    this.timePad.className = 'time-pad';
    this.timePad.textContent = this.timeInSec;

    board.appendChild(this.flagPad);
    board.appendChild(this.facePad);
    board.appendChild(this.timePad);

    return board;
  };

  Mineweeper.prototype.updateFlagPad = function() {
    console.log('called', this.flagCount);
    this.flagPad.textContent = this.flagCount;
  };

  Mineweeper.prototype.createRows = function() {
    var rows = [];
    for (var y = 0; y < this.height; y++) {
      var row = document.createElement('tr');
      for (var x = 0; x < this.width; x++) {
        var td = document.createElement('td');
        td.setAttribute('data-cell', true);
        td.setAttribute('data-x', x);
        td.setAttribute('data-y', y);
        this.setCell(x, y, {
          x: x,
          y: y,
          flagged: false,
          isClicked: false,
          isMine: false,
          dom: td
        });
        td.className = 'cell';
        row.appendChild(td);
      }
      rows.push(row);
    }
    return rows;
  };

  Mineweeper.prototype.setRandomMines = function() {
    var count = this.minesCount;
    var size = this.width * this.height;
    var keys = Object.keys(this.cells);

    while (count > 0) {
      var index = getRandomInt(0, size - 1);
      var key = keys[index];
      if (! this.cells[key].isMine) {
        this.cells[key].isMine = true;
        count--;
      }
    }
  };

  Mineweeper.prototype.checkMinesCount = function() {
    if (this.minesCount > ((this.width - 1) * (this.height - 1))) {
      throw 'Mines count ' + this.minesCount + ' is not allowed.';
    }
  };

  Mineweeper.prototype.init = function(id) {

    this.checkMinesCount();

    var div = document.getElementById(id);
    div.className = 'minesweeper';

    var table = document.createElement('table');
    table.className = 'table';

    var rows = this.createRows();

    rows.forEach(function(row) {
      table.appendChild(row);
    });

    div.appendChild(this.createScoreBoard());
    div.appendChild(table);

    table.addEventListener('click', this._handleTableClick.bind(this), false);
    table.addEventListener('contextmenu', this._handleTableRightClick.bind(this), false);

    this.setRandomMines();

    window.addEventListener("keydown", this._handleKeyDown.bind(this), false);
  };

  Mineweeper.prototype._handleKeyDown = function(event) {
    if (event.keyCode === KEY_H) {
      this.isHackingMode = ! this.isHackingMode;
      this.isHackingMode ? this.showMines() : this.hideMines();
    }
  };

  Mineweeper.prototype.showMines = function() {
    var cells = this.cells;
    Object.keys(cells)
      .forEach(function(key) {
        var row = cells[key];
        if (row.isMine) {
          row.dom.classList.add('is-mine');
          row.dom.classList.add('pushed');
        }
      });
  };

  Mineweeper.prototype.hideMines = function() {
    var cells = this.cells;
    Object.keys(cells)
      .forEach(function(key) {
        var row = cells[key];
        if (row.isMine) {
          row.dom.classList.remove('is-mine');
          row.dom.classList.remove('pushed');
        }
      });
  };

  Mineweeper.prototype.setCell = function(x, y, data) {
    return this.cells[x + ':' + y] = new Cell(data);
  };

  Mineweeper.prototype.getCell = function(x, y) {
    return this.cells[x + ':' + y];
  };

  Mineweeper.prototype.getAreaMinesCount = function(x, y) {
    return this.getSurroundedCells(x, y)
      .filter(function(cell) {
        return cell.isMine
      }).length;
  };

  Mineweeper.prototype.getSurroundedCells = function(targetX, targetY) {
    var self = this;
    return SCAN_COORDS.map(function(row) {
      var x = targetX + row.deltaX;
      var y = targetY + row.deltaY;
      return self.getCell(x, y);
    })
    .filter(function(cell) {
      return !! cell;
    })
    .filter(function(cell) {
      return ! cell.isClicked;
    });
  };

  Mineweeper.prototype.clearClickArea = function(x, y) {
    var self = this;
    var areaMinesCount = this.getAreaMinesCount(x, y);

    var clickedCell = this.getCell(x, y);
    clickedCell.isClicked = true;
    clickedCell.styleClicked(areaMinesCount);

    if (0 === areaMinesCount) {
      this.getSurroundedCells(x, y)
        .forEach(function(cell) {
          self.clearClickArea(cell.x, cell.y);
        });
    }
  };

  Mineweeper.prototype._handleTableClick = function(event, isRightClick) {

    var target = event.target;
    var isCell = !! target.getAttribute('data-cell');

    if (isCell) {
      this._handleCellClick(target, isRightClick);
    }
  };

  Mineweeper.prototype.reset = function() {
    var cells = this.cells;
    Object.keys(cells)
      .forEach(function(key) {
        cells[key].reset();
      });
    this.setRandomMines();
    this.stopTimePad();
    this.timeInSec = 0;
    this.isStarted = false;
    this.updateTimePad(this.timeInSec);
  };

  Mineweeper.prototype._handleFaceClick = function() {
    this.facePad.textContent = '^_^';
    this.isDisabled = false;
    this.reset();
  };

  Mineweeper.prototype._handleTableRightClick = function(event) {
    event.preventDefault();
    this._handleTableClick(event, true);
    return false;
  };

  Mineweeper.prototype.hasWinner = function() {
    var cells = this.cells;
    return Object.keys(cells).filter(function(key) {
      var cell = cells[key];
      return ! cell.isClicked;
    }).length === this.minesCount;
  };

  Mineweeper.prototype.win = function() {
    this.facePad.textContent = '\\ *()* /';
    this.isDisabled = true;
  };

  Mineweeper.prototype.lose = function() {
    this.facePad.textContent = 'x_x';
    this.isDisabled = true;
  };

  Mineweeper.prototype.updateTimePad = function(timeInSec) {
    this.timePad.textContent = timeInSec;
  };

  Mineweeper.prototype.stopTimePad = function() {
    clearInterval(this.timePadTimer);
  };

  Mineweeper.prototype._handleCellClick = function(target, markFlag) {

    if (this.isDisabled) {
      return;
    }

    if (! this.isStarted) {
      this.timePadTimer = setInterval(function() {
        this.updateTimePad(++this.timeInSec);
      }.bind(this), 1000);
    }

    this.isStarted = true;

    var x = parseInt(target.getAttribute('data-x'), 10);
    var y = parseInt(target.getAttribute('data-y'), 10);
    var cell = this.getCell(x, y);

    if (cell.flagged && (! markFlag)) {
      return;
    }

    if (markFlag && (! cell.isClicked)) {
      cell.flagged = ! cell.flagged;
      cell.toggleFlag();

      if (cell.flagged) {
        this.flagCount--;
      }
      else {
        this.flagCount++;
      }

      this.updateFlagPad();
      return;
    }

    if (cell.isMine) {
      this.showMines();
      this.lose();
      this.stopTimePad();
    }
    else {
      this.clearClickArea(x, y);
    }
    if (this.hasWinner()) {
      this.win();
      this.stopTimePad();
    }
  };

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

 // var m1 = new Mineweeper({id: 'm1'});

  var m1 = new Mineweeper({
    id: 'm1',
    width: 16,
    height: 16,
    minesCount: 40
  });

  /*var m1 = new Mineweeper({
    id: 'm1',
    width: 30,
    height: 16,
    minesCount: 99
  });*/

})();
