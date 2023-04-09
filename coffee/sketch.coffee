import _           from 'https://cdn.skypack.dev/lodash'
import {ass,log,range} from '../js/utils.js'
import {Board} from '../js/board.js'
import {Button} from '../js/button.js'
import {clickString,fixSuper,global,loadTree} from '../js/globals.js'

SIZE = global.SIZE
released = true # prevention of touch bounce

window.preload = =>
	global.database = loadJSON './data/database.json'
	global.trees = loadJSON './data/trees.json'
	for letter in "rnbqkp"
		global.pics[letter] = loadImage './images/b' + letter + '.png'
	for letter in "RNBQKP"
		global.pics[letter] = loadImage './images/w' + letter.toLowerCase() + '.png'

window.setup = =>
	createCanvas SIZE*10.3, SIZE*11

	textAlign CENTER,CENTER
	rectMode CENTER

	global.board = new Board()

	#console.log global.trees
	global.chess = new Chess()
	loadTree 0
	
	xdraw()

xdraw = =>
	background 'gray'
	textSize SIZE
	global.board.draw()
	for button in global.buttons
		button.draw()

window.keyPressed = =>
	if key == 'ArrowRight'  then clickString 'next'
	if key == 'ArrowLeft' then clickString 'prev'
	if key == 'ArrowUp'  then clickString 'up'
	if key == 'ArrowDown' then clickString 'down'
	if key == ' ' then clickString 'flip'
	if key == 'Home' then clickString 'first'
	if key == 'End' then clickString 'last'
	if key == 'PageUp' then clickString 'pgup'
	if key == 'PageDown' then clickString 'pgdn'
	xdraw()
	return false

window.mousePressed = =>
	if not released then return
	released =false
	for button in global.buttons.concat global.board.buttons
		if button.inside mouseX,mouseY
			button.onclick()
			xdraw()
			return false

	for square in global.board.squares
		if square.inside mouseX,mouseY
			square.onclick()
			xdraw()
			return false

	false

window.mouseReleased = =>
	released = true
	false