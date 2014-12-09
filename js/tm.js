/*global document, Reveal, tm*/
;(function(Reveal, tm){
	'use strict';
	Reveal.addEventListener('turing-machine', function(){
		var word = 'IIII';
		var rulebook = {
			's': {
				'I' : { nextState: 's', write: 'I', move: 'R' },
				'_' : { nextState: 't', write: 'I', move: 'L' }
			},
			't': {
				'I' : { nextState: 't', write: 'I', move: 'L' },
				'_' : { nextState: 'u', write: '_', move: 'R' }
			},
			'u': {

			}

		};

		var startState = 's';
		var machine = new tm.Machine(word, rulebook, startState, {
			blank: '_'
		});
		var borderCells = 5;
		new tm.MachineView('turing-machine', machine, {
			borderCells: borderCells, delay: 500
		});
		var tape = document.querySelector('.tape');
		var tapeWidth = tape.offsetWidth;
		var cells = tape.querySelectorAll('.cell');
		var cellSize = (tapeWidth-1)/cells.length - 2;
		for (var index = 0; index < cells.length; index++){
			var cell = cells[index];
			cell.style.width = cellSize + 'px';
			cell.style.height = cellSize + 'px';
			cell.style.fontSize = '' + 0.8*cellSize + 'px';
		}
	});
})(Reveal, tm);
