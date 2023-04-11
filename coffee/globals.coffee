import {ass,log,range,split,param,hexToBase64,spaceShip} from '../js/utils.js'
import {Button} from '../js/button.js'
import _ from 'https://cdn.skypack.dev/lodash'
import cryptoJs from 'https://cdn.skypack.dev/crypto-js'
import {download} from '../js/download.js'

export global = {

	#name : 'bishop',
	name : 'rousseau',

	version:'ver: B',
	board:null,
	child:0, # move under consideration
	children: [], # sorted list of [value,san,uci]
	SIZE:50, # of square
	pics:{}, # 12 pjäser
	data:null,
	buttons:[],
	database: {}, # fen => value
	currTree:0, # index till träden
	currNode:null, # pekar in i ett träd
	count: 0, # räknar antal nya drag i trädet
	stack:[] # innehåller aktuell gren
}

export coords = (uci) =>
	param.String uci
	c0 = "abcdefgh".indexOf uci[0]
	r0 = "12345678".indexOf uci[1]
	c1 = "abcdefgh".indexOf uci[2]
	r1 = "12345678".indexOf uci[3]
	param.Array [c0+8*r0, c1+8*r1]
ass [8,24], coords "a2a4"

export toUCI = ([from,to]) =>
	param.Integer from
	param.Integer to
	c0 = "abcdefgh"[from%8]
	r0 = "12345678"[from//8]
	c1 = "abcdefgh"[to%8]
	r1 = "12345678"[to//8]
	param.String c0+r0+c1+r1
ass "e2e4", toUCI [12,28]

export toObjectNotation = ([from,to]) =>
	param.Integer from
	param.Integer to
	uci = toUCI [from,to]
	from = uci.slice 0,2
	to = uci.slice 2,4
	param.Object {from, to}
ass {from:'e2', to:'e4'}, toObjectNotation [12,28]

export empty = (n) =>
	param.Integer n
	param.String (1+n//8).toString()

undo = => 
	if global.stack.length == 0 then return
	global.chess.undo()
	global.currNode = global.stack.pop()
	makeChildren()

export dumpState = =>
	console.log 'STATE ########'
	console.log '  stack',global.stack
	console.log '  currNode',global.currNode
	console.log '  history',global.chess.history()

export makeChildren = =>
	console.log 'makeChildren'
	keys = _.keys global.currNode
	global.children = []
	for i in range keys.length
		key = keys[i]
		pair = coords key
		global.chess.move toObjectNotation pair
		fen = global.chess.fen()
		san = _.last global.chess.history()
		base64 = hexToBase64(cryptoJs.SHA256(fen).toString()).slice 0,8
		value = if global.database[base64] == null then "?" else global.database[base64]
		global.children.push [value,san,key]
		console.log key, san, base64, value, fen
		global.chess.undo()
	global.children = sortera global.children
	if global.stack.length%%2==0 then global.children.reverse()
	global.child = 0
	console.log 'children',global.children

sortera = (arr) => # Hanterar ej mattar av olika längd. 
	# #1 och #2 ersätts båda med 9999
	# #-1 och #-2 ersätts båda med -9999
	# Bör: #1 > #2
	# Är: #1 == #2
	param.Array arr
	arr = _.map arr, ([a,b,c]) => 
		if typeof a=='number' then return [a,b,c]
		if a[1]=='-' then return [-9999,b,c] else return [9999,b,c]
	arr.sort (a,b) => spaceShip a[0],b[0]
ass [[2,"Nf3","g1f3"],[11,"e4","e2e4"]], sortera [[11,"e4","e2e4"],[2,"Nf3","g1f3"]]
ass [[-9999,"Nf3","g1f3"],[9999,"e4","e2e4"]], sortera [["#1","e4","e2e4"],["#-2","Nf3","g1f3"]]
ass [[-9999,"Nf3","g1f3"],[11,"e4","e2e4"]], sortera [[11,"e4","e2e4"],["#-2","Nf3","g1f3"]]

export loadTree = (delta) =>
	param.Test delta in [-1,0,1]
	global.currTree = (global.currTree+delta) %% _.size global.trees
	global.currNode = global.tree #.moves[""]
	global.stack = []
	makeChildren()

g = (item) =>
	# param.Integer item or param.String
	if "#-" in item then return -1000
	if "#" in item then return 1000
	param.Integer parseInt item

f = (arrScore,c) =>
	param.Array arrScore
	param.String c
	arrScore = _.map arrScore, (item) => g item
	a = _.min arrScore
	b = _.max arrScore
	c = g c
	d = _.max [Math.abs(a),Math.abs(b)]
	a = -d
	param.Number (c-a)/(2*d)
ass 0, f [-100,50],'-100'
ass 0.75, f [-100,50],'50'
ass 1, f [-100,50],'100'

link = => 'https://lichess.org/analysis/' + global.chess.fen()

export clickString = (key) =>
	param.String key
	if key == 'flip' then global.board.flip()
	else if key == 'link' then window.open link(), '_blank'
	else if key == 'up'   then global.child = (global.child+1) %% global.children.length
	else if key == 'down' then global.child = (global.child-1) %% global.children.length
	else if key == 'undo' then undo()
	else if key == 'left' then undo()
	else if key == 'right'
		[value,san,uci] = global.children[global.child]
		console.log 'move',[value,san,uci]
		global.chess.move san
		global.stack.push global.currNode
		global.currNode = global.currNode[uci]
		makeChildren()
	else if key == 'save' then download global.tree, global.name + '.json'
	else console.log 'unknown key in clickString',key
