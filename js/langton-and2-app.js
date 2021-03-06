/*global document, requestAnimationFrame, Reveal, iska*/
;(function(Reveal, ns){
	'use strict';

	var board = new ns.Board();
	board.register(ns.Position.at(0,0));
	[
		[8, 9, /*16, 17*/],
		[5, 6, 7, 8, 13, 14, 15, 16],
		[4, 6, 7, 8, 12, 14, 15, 16],
		[4, 5, 10, 12, 13, 18],
		[4, 11, 12, 18],
		[0, 1, 2, 3, 6, 14, 17, 27, 28, 29, 30, 31, 32],
		[6, 14, 16, 26, 33],
		[6, 14, 16, 25, 34],
		[6, 8, 9, 10, 11, 14, 16, 25, 32, 33, 35],
		[6, 8, 11, 14, 16, 25, 31, 33],
		[7, 9, 11, 15, 17, 25, 31, 32, 33, 34],
		[5, 6, 9, 10, 12, 13, 14, 17, 18, 19, 20, 25, 31, 32, 34],
		[5, 11, 21, 25, 31, 32, 33],
		[5, 12, 19, 21, 25, 31, 32],
		[5, 13, 18, 21, 22, 23, 25],
		[5, 14, 15, 16, 17, 24, 25],
		[5, 6, 7, 22, 24, 25],
		[8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 25],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10],
		[9, 10]
	].map(function(row, index){
		return row.map(function(column){ return [column, index]; });
	}).reduce(function(acc, points){ return acc.concat(points); }, []
	).forEach(function(p){
		board.changeColorAt(ns.Position.at(p[0],p[1]));
	});

	var langton;
	var started = false;
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
				if (!started) {
					started = true;
					tick();
				} else {
					shouldContinue = false;
					var body = document.getElementsByTagName('body')[0];
					body.removeEventListener('keydown', keyHandler);
				}
				break;
			default:
				break; /* do nothing */
			}
		};
	})();
	Reveal.addEventListener('langton-and2', function(){
		if (!langton) {
			var langtonContainer = document.getElementById('langtons-and2');

			var ant = new ns.Ant(ns.Direction.EAST, ns.Position.at(-1, 5));

			langton = new ns.Langton(ant, board);
			new ns.LangtonView(langton, langtonContainer);

			var body = document.getElementsByTagName('body')[0];
			body.addEventListener('keydown', keyHandler);
		}
	});
})(Reveal, iska);
