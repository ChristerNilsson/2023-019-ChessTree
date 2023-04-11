import {ass,log,range,split,param,hexToBase64} from '../js/utils.js'
import {Button} from '../js/button.js'
import _ from 'https://cdn.skypack.dev/lodash'
import cryptoJs from 'https://cdn.skypack.dev/crypto-js'
import {download} from '../js/download.js'

export global = {
	version:'ver: B',
	name : 'bishop', # rousseau
	board:null,
	index:0,
	SIZE:50, # of square
	pics:{}, # 12 pjäser
	moves:[],
	data:null,
	buttons:[],
	database: {},
	currTree:0, # index till träden
	currNode:null, # pekar in i ett träd
	count: 0, # räknar antal nya drag i trädet
	stack:[]
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

pgup = => loadTree 1
pgdn = => loadTree -1
undo = => 
	global.chess.undo()
	global.currNode = global.stack.pop()
	# dumpState()

export dumpState = =>
	console.log 'STATE ########'
	console.log '  stack',global.stack
	console.log '  currNode',global.currNode
	console.log '  history',global.chess.history()

export loadTree = (delta) =>
	param.Test delta in [-1,0,1]
	global.currTree = (global.currTree+delta) %% _.size global.trees
	# console.log global.currTree

	# keys = _.keys global.trees
	# global.name = keys[global.currTree]
	# global.tree = global.trees[global.name]
	# console.log global.name
	# console.log global.tree

	global.currNode = global.tree #.moves[""]
	global.stack = [] #.push global.currNode
	#dumpState()

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
	else if key == 'up'   then fixSuper -1
	else if key == 'down' then fixSuper 1
	else if key == 'pgup' then pgup()
	else if key == 'pgdn' then pgdn()
	else if key == 'undo' then undo()
	else if key == 'save' then download global.tree, global.name + '.json'
	else console.log 'unknown key in clickString',key

export getMove = (index) =>
	param.Test -1 <= index <= global.moves.length
	if index==-1
		param.Object {score:'', uci:'', san:'', superiors:[], superiorsSan:[]}
	else
		param.Object global.moves[index]
