/* global document, requestAnimationFrame, Reveal*/
;(function(Reveal){
	'use strict';

	function asArray(target) {
		return Array.prototype.slice.call(target);
	}

	function getTime() {
		return (new Date()).getTime();
	}

	function pad(n, width) {
		n = n.toString();
		return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
	}

	var Observable = function(){
		this.listeners = {};
	};
	Observable.prototype.on = function(event, callback){
		this.listeners[event] = this.listeners[event] || [];
		this.listeners[event].push(callback);
	};
	Observable.prototype.notify = function(event) {
		var args = Array.prototype.slice.call(arguments, 1);
		(this.listeners[event] || []).forEach(function(callback){
			callback.apply(this, args);
		}.bind(this));
	};

	var Timer = function(duration){
		Observable.call(this);
		this.duration = duration;
		this.startTime = 0;
		this.currentTime = 0;
	};
	Timer.prototype = Object.create(Observable.prototype);
	Timer.prototype.constructor = Timer;
	Timer.prototype.minutes = function(){
		return Math.floor(this.timeLeft() / (1000 * 60));
	};
	Timer.prototype.seconds = function(){
		return Math.floor(this.timeLeft() % (1000 * 60) / 1000);
	};
	Timer.prototype.milliseconds = function(){
		return Math.floor(this.timeLeft() % 1000);
	};
	Timer.prototype.timeLeft = function(){
		return Math.max(this.duration - this.elapsedTime(), 0);
	};
	Timer.prototype.elapsedTime = function(){
		return this.currentTime - this.startTime;
	};
	Timer.prototype.start = function(){
		var t = getTime();
		this.startTime = t;
		this.currentTime = t;
		this.notify('started');
	};
	Timer.prototype.tick = function(){
		this.currentTime = getTime();
		if (this.isFinished()) {
			this.notify('stopped');
		}
		this.notify('ticked');
	};
	Timer.prototype.isFinished = function(){
		return this.timeLeft() <= 0;
	};

	var TimerView = function(model, container) {
		this.model = model;
		this.container = container;
		this.update();
		this.model.on('ticked', this.update.bind(this));
	};
	TimerView.prototype.update = function(){
		[
			{ property: 'minutes', width: 0 },
			{ property: 'seconds', width: 2 },
			{ property: 'milliseconds', width: 3 }
		].forEach(function(interval){
			asArray(this.container.getElementsByClassName(interval.property)).forEach(
				function(elements){
					elements.innerText = pad(this.model[interval.property](), interval.width);
				}.bind(this)
			);
		}.bind(this));
	};

	Reveal.addEventListener('timer', function(){
		var timer = new Timer(3 * 60 * 1000);

		new TimerView(timer, document.getElementsByClassName('introduction')[0]);

		function tickTimer() {
			timer.tick();
			if (!timer.isFinished()) {
				requestAnimationFrame(tickTimer);
			}
		}

		function keyHandler(keyEvent) {
			switch(keyEvent.keyCode) {
			case 65: /* a */
				timer.start();
				tickTimer();
				break;
			default:
				break; /* do nothing */
			}
		}

		var body = document.getElementsByTagName('body')[0];
		body.addEventListener('keydown', keyHandler);
		timer.on('stopped', function(){
			body.removeEventListener('keydown', keyHandler);
		});
	});
})(Reveal);
