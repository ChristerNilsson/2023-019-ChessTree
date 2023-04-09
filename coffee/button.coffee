import {getMove,global} from '../js/globals.js'
import {param,range} from '../js/utils.js'

export class Button
	constructor: (@x,@y,@text,@onclick) ->
		param.Compact "NNSF",arguments
		# param.Number @x
		# param.Number @y
		# param.String @text
		# param.Function @onclick
		@w = 1.7 * global.SIZE
		@h = 0.7 * global.SIZE
		@bg = 'lightgray'
		@fg = 'black'
		@align = CENTER
		# @drawStar = false
		# @bar = null

	# star : (c1, c2, x, y, r2, n) =>
	# 	param.String c1
	# 	param.String c2
	# 	param.Number x
	# 	param.Number y
	# 	param.Number r2
	# 	param.Integer n
	# 	r1 = 0.385*r2
	# 	fill c2
	# 	ellipse x,y,2*r2
	# 	fill c1
	# 	angleMode DEGREES
	# 	a = 180 / n
	# 	beginShape()
	# 	for i in range 2*n
	# 		if i%2==0 then r=r1 else r=r2
	# 		sx = x + r * cos i*a+90
	# 		sy = y + r * sin i*a+90
	# 		vertex sx, sy
	# 	endShape CLOSE

	draw : =>
		# move = getMove global.index-1
		# if global.superIndex == 0
		# 	txt = move.san
		# else
		# 	txt = move.superiorsSan[global.superIndex-1]
		noStroke()
		fill @bg
		rect @x,@y,@w,@h*0.65

		if @align==LEFT then x=@x-0.45*@w else x=@x
		# if @text == txt then fill 'red' else fill @fg
		fill @fg
		push()
		textSize 0.4*global.SIZE
		textAlign @align
		noStroke()
		text @text, x,@y+0.05*global.SIZE
		pop()
		# if @drawStar then @star "white","green", @x+0.5*global.SIZE, @y, 0.15*global.SIZE, 5
		# if @bar != null then @drawBar()

	# drawBar : =>
	# 	push()
	# 	rectMode CORNER
	# 	noStroke()
	# 	fill 'black'
	# 	rect @x-@w/2,@y+0.35*@h,@w,0.1*@h
	# 	fill 'white'
	# 	rect @x-@w/2,@y+0.35*@h,@w*@bar,0.1*@h
	# 	pop()

	inside : (x,y) =>
		param.Number x
		param.Number y
		param.Boolean @x-@w/2 < x < @x+@w/2 and @y-@h/2 < y < @y+@h/2
