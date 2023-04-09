import _ from 'https://cdn.skypack.dev/lodash'
import {ass,lerp,param,range,hexToBase64} from '../js/utils.js'
import cryptoJs from 'https://cdn.skypack.dev/crypto-js'
import {Square} from '../js/square.js'
import {Button} from '../js/button.js'
import {coords,clickString,getMove,global,loadTree,toObjectNotation,toUCI} from '../js/globals.js'
import {dumpState} from '../js/globals.js'

SIZE = global.SIZE

export class Board
	constructor: ->
		@squares = []
		@clickedSquares = []
		@pieces = ""
		@flipped = false
		for i in range 64
			do (i) => @squares.push new Square i, => @click i

		@buttons = []
		x0 = 1.5
		x1 = 3.5
		x2 = 5.5
		x3 = 7.5
		@buttons.push new Button x0*SIZE, 9.5*SIZE, 'undo', => clickString 'undo'
		@buttons.push new Button x1*SIZE, 9.5*SIZE, 'flip', => clickString 'flip'
		@buttons.push new Button x2*SIZE, 9.5*SIZE, 'link', => clickString 'link'
		@buttons.push new Button x3*SIZE, 9.5*SIZE, 'save', => clickString 'save'

	click : (i) =>
		col = i %% 8
		row = 7-i // 8
		sq = global.chess.board()[row][col]
		color = "wb"[global.chess.history().length %% 2] # förväntad färg på pjäsen

		if @clickedSquares.length == 0
			if sq != null and sq.color == color then @clickedSquares.push i
		else
			if i == @clickedSquares[0]
				@clickedSquares = []
			else
				@clickedSquares.push i
				move = toObjectNotation @clickedSquares
				uci = toUCI @clickedSquares
				if global.chess.move move # accepera draget
					global.stack.push global.currNode
					if uci not in global.currNode
						global.currNode[uci] = {}
						global.count++
						#console.log 'download',global.tree
						#download global.tree,'tree.json'
					global.currNode = global.currNode[uci]
				@clickedSquares = []

# gå igenom nodens barn och visa dem i en sorterad lista
	showChildren : =>
		keys = _.keys global.currNode
		push()
		noStroke()
		textAlign LEFT,CENTER
		fill 'white'
		for i in range keys.length
			key = keys[i]
			pair = coords key
			global.chess.move toObjectNotation pair
			fen = global.chess.fen()
			# console.log key,pair,toObjectNotation pair
			#san = global.chess.san toObjectNotation pair
			san = _.last global.chess.history()
			base64 = hexToBase64(cryptoJs.SHA256(fen).toString()).slice 0,8
			value = global.database[base64] or "?"
			# console.log key, san, base64, value, fen
			text san+ ": " + value, 8.7*SIZE, 1*SIZE + i*0.5*SIZE
			global.chess.undo()
		pop()

	draw : =>

		@buttons[3].text = if global.count>0 then 'save ' + global.count else ""

		for button in @buttons
			button.draw()

		if not global.tree then return

		fill 'white'
		textSize SIZE*0.3

		push()
		textAlign LEFT,CENTER
		text global.trees[0].name,0.05*SIZE, 0.3*SIZE
		pop()

		for i in range 8
			for j in range 8
				piece = global.chess.board()[7-i][j] # {square, type, color}
				@squares[i*8+j].draw piece, @flipped, i*8+j==@clickedSquares[0]

		stroke 'black'
		noFill()
		rect SIZE*4.5,SIZE*4.5,SIZE*8,SIZE*8

		@littera()

		push()
		textAlign CENTER,CENTER
		if global.index > 0
			text 'move: ' + (1+global.index//2) + "BW"[global.index%2]+ " of "+ (1+global.moves.length//2), 4.5*SIZE, 10*SIZE
		if global.index==0
			score = '0'

		text global.version, 7.5*SIZE, 10*SIZE
		textAlign RIGHT,CENTER
		fill 'white'
		text score, 10.1*SIZE, 0.3*SIZE

		pop()
		@drawBars score
		@showChildren()

	littera : =>
		noStroke()
		fill 'black'
		textSize SIZE*0.3
		letters = if @flipped then "hgfedcba" else "abcdefgh"
		digits = if @flipped then  "12345678" else "87654321"

		for i in range 8
			text letters[i],SIZE*(i+1),SIZE*8.8
			text digits[i],SIZE*0.15,SIZE*(i+1)

	flip : => @flipped = not @flipped

	drawBars : (score) ->
		param.String score
		stroke 'black' 
		h = calcBar score
		push()
		if @flipped
			translate 0, SIZE*9
			scale 1, -1
		rectMode CORNER
		noStroke()
		x = 0.35 * SIZE
		w = 0.10 * SIZE
		fill 'black'
		rect x, 0.5*SIZE, w, SIZE * 4
		fill 'white'
		rect x, 4.5*SIZE, w, SIZE * 4
		if h > 0
			fill 'white'
			rect x, 4.5*SIZE - h, w, h
		else
			fill 'black'
			rect x, 4.5*SIZE, w, -h
		pop()

	calcBar = (score) =>
		param.String score
		LIMIT = 2000
		if score[0]=='#' then d = LIMIT
		else d = Math.abs score
		if d>LIMIT then d = LIMIT
		res = lerp 0, 4*SIZE, d/LIMIT
		if "-" in score then res = -res
		param.Integer Math.round res
	ass 4*SIZE,calcBar "2100"
	ass 4*SIZE,calcBar "2000"
	ass 2*SIZE,calcBar "1000"
	ass SIZE,calcBar "500"
	ass 0,calcBar "1"
	ass -SIZE,calcBar "-500"
	ass -4*SIZE,calcBar "#-1"
