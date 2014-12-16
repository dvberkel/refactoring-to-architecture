/*global document, Reveal, Observable, iska:true*/
iska = (function(Reveal, Observable){
	'use strict';

	function extend(){
		var result = {};
		Array.prototype.slice.call(arguments).forEach(function(hash){
			for (var key in hash) {
				if (!result[key]) {
					result[key] = hash[key];
				}
			}
		});
		return result;
	}

	var Position = function(x, y) {
		this.x = x;
		this.y = y;
	};
	Position.prototype.relative = function(dx, dy) {
		var x = this.x + dx;
		var y = this.y + dy;
		return new Position(x,y);
	};
	Position.prototype.toString = function(){
		return this.x + ',' + this.y;
	};
	Position.cache = {};
	Position.at = function(x, y){
		Position.cache[x] = Position.cache[x] || {};
		Position.cache[x][y] = Position.cache[x][y] || new Position(x,y);
		return Position.cache[x][y];
	};
	Position.fromDescription = function(description){
		var coordinates = description.split(',').map(function(value){
			return Number.parseInt(value);
		});
		return Position.at(coordinates[0], coordinates[1]);
	};

	var Direction = function(dx, dy){
		this.dx = dx;
		this.dy = dy;
	};
	Direction.prototype.moveFrom = function(position){
		return position.relative(this.dx, this.dy);
	};
	Direction.prototype.turnLeft = function(){
		return Direction.heading(-this.dy, this.dx);
	};
	Direction.prototype.turnRight = function(){
		return Direction.heading(this.dy, -this.dx);
	};
	Direction.cache = {};
	Direction.heading = function(dx, dy){
		Direction.cache[dx] = Direction.cache[dx] || {};
		Direction.cache[dx][dy] = Direction.cache[dx][dy] || new Direction(dx, dy);
		return Direction.cache[dx][dy];
	};
	Direction.NORTH = Direction.heading(0, 1);
	Direction.EAST = Direction.heading(1, 0);
	Direction.SOUTH = Direction.heading(0, -1);
	Direction.WEST = Direction.heading(-1, 0);

	var Ant = function(direction, position){
		this.direction = direction;
		this.position = position;
	};
	Ant.prototype.move = function(){
		this.position = this.direction.moveFrom(this.position);
	};
	Ant.prototype.turn = function(color){
		switch(color) {
		case Color.WHITE:
			this.direction = this.direction.turnRight();
			break;
		case Color.BLACK:
			this.direction = this.direction.turnLeft();
			break;
		}
	};

	var Color = function(name) {
		this.name = name;
	};
	Color.WHITE = new Color('white');
	Color.BLACK = new Color('black');

	var Board = function() {
		this.cache = {};
	};
	Board.prototype.register = function(position){
		this.colorAt(position);
	};
	Board.prototype.colorAt = function(position){
		if (!this.cache[position]) {
			this.cache[position] = Color.WHITE;
		}
		return this.cache[position];
	};
	Board.prototype.changeColorAt = function(position){
		var color = this.colorAt(position);
		var nextColor;
		switch(color){
		case Color.WHITE:
			nextColor = Color.BLACK;
			break;
		case Color.BLACK:
			nextColor = Color.WHITE;
			break;
		}
		this.cache[position] = nextColor;
	};
	Board.prototype.forEach = function(callback) {
		for (var position in this.cache) {
			callback(Position.fromDescription(position), this.cache[position]);
		}
	};
	Board.prototype.reduce = function(callback, initial) {
		var result = initial;
		this.forEach(function(position, color){
			result = callback(result, position, color);
		});
		return result;
	};
	Board.prototype.getBoundingBox = function(){
		return this.reduce(function(bbox, position/*, color */){
			return {
				lx: Math.min(bbox.lx, position.x),
				ly: Math.min(bbox.ly, position.y),
				ux: Math.max(bbox.ux, position.x),
				uy: Math.max(bbox.uy, position.y)
			};
		}, {
			lx: Infinity,
			ly: Infinity,
			ux: -Infinity,
			uy: -Infinity
		});
	};

	var Langton = function(ant, board){
		Observable.call(this);
		this.ant = ant;
		this.board = board;
		this.board.register(ant.position);
	};
	Langton.prototype = Object.create(Observable.prototype);
	Langton.prototype.constructor = Langton;
	Langton.prototype.tick = function(){
		var position = this.ant.position;
		this.ant.move();
		this.board.changeColorAt(position);
		var color = this.board.colorAt(this.ant.position);
		this.ant.turn(color);

		this.notify('ticked');
	};

	var LangtonView = function(model, container, options){
		this.model = model;
		this.container = container;
		this.options = extend(options || {}, { width: 480, height: 480 });
		this.update();
		this.model.on('ticked', this.update.bind(this));
	};
	LangtonView.prototype.update = function(){
		var context = this.getContext();
		context.fillStyle = Color.WHITE.name;
		context.fillRect(0, 0, this.options.width, this.options.height);
		var bbox = this.model.board.getBoundingBox();
		var xs = bbox.ux - bbox.lx;
		var ys = bbox.uy - bbox.ly;
		var width = Math.max(xs, ys) + 1;
		var sw = this.options.width / width;
		this.model.board.forEach(function(position, color){
			context.fillStyle = color.name;
			context.fillRect(
				sw * (position.x - bbox.lx), sw * (position.y - bbox.ly),
				sw * 1, sw * 1
			);
		});
		context.fillStyle = 'rgba(255,0,0,0.5)';
		context.fillRect(sw * -bbox.lx, sw * -bbox.ly, sw, sw);
		context.fillStyle = 'rgba(0,255,0,0.5)';
		var antPosition = this.model.ant.position;
		context.fillRect(
				sw * (antPosition.x - bbox.lx), sw * (antPosition.y - bbox.ly),
				sw * 1, sw * 1
		);
	};
	LangtonView.prototype.getContext = function(){
		if (!this.context){
			this.context = this.getCanvas().getContext('2d');
		}
		return this.context;
	};
	LangtonView.prototype.getCanvas = function(){
		if (!this.canvas){
			this.canvas = document.createElement('canvas');
			this.canvas.width = this.options.width;
			this.canvas.height = this.options.height;
			this.container.appendChild(this.canvas);
		}
		return this.canvas;
	};

	return {
		Ant: Ant,
		Board: Board,
		Langton: Langton,
		LangtonView: LangtonView,
		Direction: Direction,
		Position: Position
	};
})(Reveal, Observable);
