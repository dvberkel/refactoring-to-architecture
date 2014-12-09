/*global window*/
window.Observable = (function(){
	'use strict';

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

	return Observable;
})();
