/*global document, requestAnimationFrame, Reveal, iska*/
;(function(Reveal, ns){
	'use strict';
	var langton;
	var shouldContinue = true;
	function tick(){
		langton.tick();
		if (shouldContinue) {
			requestAnimationFrame(tick);
		}
	}
	var keyHandler = (function(){
		return function(keyEvent) {
			switch(keyEvent.keyCode) {
			case 65: /* a */
				shouldContinue = false;
				var body = document.getElementsByTagName('body')[0];
				body.removeEventListener('keydown', keyHandler);
				break;
			default:
				break; /* do nothing */
			}
		};
	})();
	Reveal.addEventListener('langton', function(){
		if (!langton) {
			var langtonContainer = document.getElementById('langtons-ant');

			var ant = new ns.Ant(ns.Direction.NORTH, ns.Position.at(0, 0));
			var board = new ns.Board();

			langton = new ns.Langton(ant, board);
			new ns.LangtonView(langton, langtonContainer);

			tick();

			var body = document.getElementsByTagName('body')[0];
			body.addEventListener('keydown', keyHandler);
		}
	});
})(Reveal, iska);
