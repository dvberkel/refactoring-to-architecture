/* global document, AudioContext, XMLHttpRequest, requestAnimationFrame, Reveal*/
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

	var AudioData = function(){
		Observable.call(this);
		this.isLoaded = false;
		this.buffer = null;
	};
	AudioData.prototype = Object.create(Observable.prototype);
	AudioData.prototype.constructor = AudioData;
	AudioData.prototype.setBuffer = function(buffer){
		this.isLoaded = true;
		this.buffer = buffer;
		this.notify('loaded');
	};

	var powerStarData = new AudioData();
	(function loadPowerStar() {
		var context = new AudioContext();
		var request = new XMLHttpRequest();
		request.open('GET', 'audio/power_star.mp3', true);
		request.responseType = 'arraybuffer';

		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				powerStarData.setBuffer(buffer);
			}, function(error){
				throw error;
			});
		};
		request.send();
	})();

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

	var Player = function(audioData){
		this.audioData = audioData;
		if (this.audioData.isLoaded) {
			this.createSource();
		} else {
			this.audioData.on('loaded', this.createSource.bind(this));
		}
	};
	Player.prototype.createSource = function(){
		var context = new AudioContext();
		this.source = context.createBufferSource();
		this.source.loop = true;
		this.source.buffer = this.audioData.buffer;
		this.source.connect(context.destination);
	};
	Player.prototype.start = function(){
		this.source.start(0);
	};
	Player.prototype.stop = function(){
		this.source.stop();
	};

	var timer;
	function tickTimer() {
		timer.tick();
		if (!timer.isFinished()) {
			requestAnimationFrame(tickTimer);
		}
	}

	var player;
	var keyHandler = (function(){
		var alreadyHandled = false;
		return function(keyEvent) {
			switch(keyEvent.keyCode) {
			case 65: /* a */
				if (!alreadyHandled) {
					alreadyHandled = true;
					timer.start();
					tickTimer();
					player.start();
				}
				break;
			default:
				break; /* do nothing */
			}
		};
	})();
	Reveal.addEventListener('timer', function(){
		if (!timer) {
			player = new Player(powerStarData);
			timer = new Timer(3 * 60 * 1000);

			new TimerView(timer, document.getElementsByClassName('introduction')[0]);

			var body = document.getElementsByTagName('body')[0];
			body.addEventListener('keydown', keyHandler);
			timer.on('stopped', function(){
				body.removeEventListener('keydown', keyHandler);
			});
			timer.on('stopped', player.stop.bind(player));
		}
	});
})(Reveal);
