(function() {

  var TYPE_ALL = 'all';
  var TYPE_ACTIVE = 'active';
  var TYPE_COMPLETED = 'completed';

  function Store(id) {
    this.id = id;
  }

  Store.prototype.set = function(prop, value) {
    localStorage.setItem(prop, JSON.stringify(value));
  };

  Store.prototype.get = function(prop) {
    return JSON.parse(localStorage.getItem(prop));
  };

  function Todo(args) {
    args = args || {};

    this.id = args.id;
    this.store = new Store(this.id);
    this.todos = this.store.get('todos') || [];
    this.filter = TYPE_ALL;

    this.init(this.id);
  }

  Todo.prototype.init = function(id) {
    this.form = document.getElementById('form');
    this.form.addEventListener('submit', this._handleFormSubmit.bind(this), false);
    this.input = form.querySelector('[data-input]');
    this.box = form.querySelector('[data-box]');

    this.buttonAll = form.querySelector('[data-button-all]');
    this.buttonActive = form.querySelector('[data-button-active]');
    this.buttonCompleted = form.querySelector('[data-button-completed]');
    this.buttonClearCompleted = form.querySelector('[data-button-clear-completed]');

    this.filterButtons = [this.buttonAll, this.buttonActive, this.buttonCompleted];

    this.buttonAll.addEventListener('click', this._handleButtonAllClick.bind(this), false);
    this.buttonActive.addEventListener('click', this._handleButtonActiveClick.bind(this), false);
    this.buttonCompleted.addEventListener('click', this._handleButtonCompletedClick.bind(this), false);
    this.buttonClearCompleted.addEventListener('click', this._handleButtonClearCompletedClick.bind(this), false);

    this.renderRows();
    this.updateFilterButtons();
  };

  Todo.prototype.addTodo = function(text) {
    this.todos.unshift({
      id: getRandomInt(1, 999999),
      text: text,
      completed: false
    });
    this.store.set('todos', this.todos);
  };

  Todo.prototype.createTodoDiv = function(row) {

    var div = document.createElement('div');

    div.classList.add('todo');

    if (row.completed) {
      div.classList.add('completed');
    }

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = row.completed;

    checkbox.addEventListener('click', this._handleCheckboxClick.bind(this, row.id, checkbox), false);

    var span = document.createElement('span');
    span.classList.add('text');
    span.textContent = row.text;
    span.setAttribute('title', row.text);

    var button = document.createElement('a');
    button.classList.add('button-delete');
    button.textContent = '✖';
    button.href = '';

    div.appendChild(checkbox);
    div.appendChild(span);
    div.appendChild(button);

    button.addEventListener('click', this._handleDeleteButtonClick.bind(this, row.id, div), false);

    return div;
  };

  Todo.prototype.clearRows = function() {
    var box = this.box;
    while (box.firstChild) {
      box.removeChild(box.firstChild);
    }
  };

  Todo.prototype.renderRows = function() {
    var self = this;
    self.clearRows();

    this.todos.forEach(function(todo) {

      function appendDiv() {
        var todoDiv = self.createTodoDiv(todo);
        self.box.appendChild(todoDiv);
      }

      if (TYPE_ALL == self.filter) {
        appendDiv();
      }
      else if ((TYPE_ACTIVE === self.filter) && (! todo.completed)) {
        appendDiv();
      }
      else if ((TYPE_COMPLETED === self.filter) && todo.completed) {
        appendDiv();
      }

    });
  };

  Todo.prototype._handleFormSubmit = function(event) {

    event.preventDefault();
    event.stopPropagation();

    var input = this.input;
    var value = input.value;

    if (! value) {
      return false;
    }

    this.addTodo(value);
    this.renderRows();
    input.value = '';
  };

  Todo.prototype.deleteRowById = function(id) {
    this.todos = this.todos.filter(function(todo) {
      return todo.id !== id;
    });
    this.store.set('todos', this.todos);
  };

  Todo.prototype._handleDeleteButtonClick = function(id, div, event) {
    event.preventDefault();
    this.deleteRowById(id);
    this.renderRows();
  };

  Todo.prototype.setDataById = function(id, data) {
    var todo = this.todos.find(function(todo) {
      return todo.id === id;
    });
    Object.assign(todo, data);
  };

  Todo.prototype._handleCheckboxClick = function(id, checkbox, event) {
    this.setDataById(id, {completed: checkbox.checked});

    var div = checkbox.parentElement;
    checkbox.checked ? div.classList.add('completed') : div.classList.remove('completed');
  };

  Todo.prototype.updateFilterButtons = function() {
    this.filterButtons.forEach(function(button) {
      button.classList.remove('active');
    });
    var index = [TYPE_ALL, TYPE_ACTIVE, TYPE_COMPLETED].indexOf(this.filter);
    var activeButton = this.filterButtons[index];
    activeButton.classList.add('active');
  };

  Todo.prototype._handleButtonAllClick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.filter = TYPE_ALL;
    this.renderRows();
    this.updateFilterButtons();
  };

  Todo.prototype._handleButtonActiveClick = function(event) {
    this.filter = TYPE_ACTIVE;
    this.renderRows();
    this.updateFilterButtons();
  };

  Todo.prototype._handleButtonCompletedClick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.filter = TYPE_COMPLETED;
    this.renderRows();
    this.updateFilterButtons();
  };

  Todo.prototype._handleButtonClearCompletedClick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.todos = this.todos.filter(function(todo) {
      return ! todo.completed;
    });
    this.store.set('todos', this.todos);
    this.renderRows();
  };

  var t = new Todo({id: 'form'});

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
