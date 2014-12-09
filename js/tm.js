/*global document, Reveal, tm*/
;(function(Reveal, tm){
	'use strict';
	Reveal.addEventListener('turing-machine', function(){
		var word = 'II';
		var rulebook = {
			's1' : {
				'I' : { nextState : 's1', write: 'I', move: 'R' },
				'' : { nextState : 's2', write: 'I', move: 'L' }
			},
			's2' : {
				'I' : { nextState : 's2', write: 'I', move: 'L' },
				'' : { nextState : 's1', write: '', move: 'R' }
			}
		};
		var startState = 's1';
		var machine = new tm.Machine(word, rulebook, startState);
		var borderCells = 5;
		new tm.MachineView('turing-machine', machine, { borderCells: borderCells, delay: 500 });
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
