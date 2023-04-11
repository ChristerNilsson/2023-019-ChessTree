from stockfish import Stockfish # https://pypi.org/project/stockfish/
import time
import json
import chess
import chess.pgn
from os import scandir
import hashlib
import codecs

DEPTH = 16

board = None
analys = {}
plies = []

# def dump(objs):
# 	print()
# 	for obj in objs: print(obj)

# def pretty(move):
# 	z = chess.Move.from_uci(move["Move"])
# 	return board.san(z)

# count = 0
# start = time.time()

# def get_superiors(children,move):
# 	count = len(children)
# 	score = "-999999"
# 	for i in range(len(children)):
# 		child = children[i]
# 		if child["Move"] == move:
# 			count = i
# 			score = cp_or_mate(child)
# 			break
# 	uci = [child["Move"] for child in children[0:count]]
# 	san = [pretty(child) for child in children[0:count]]
# 	scores = [str(cp_or_mate(child)) for child in children[0:count]]
# 	if score == "-999999":
# 		score =scores[-1]
# 	return [uci, san, scores, score]

def cp_or_mate(child):
	if child["Centipawn"] != None: return str(child["Centipawn"])
	if child["Mate"]      != None: return "#" + str(child["Mate"])
	return 'bomb'

# def convertFilename(filename):
# 	if 'lichess_pgn' in filename:
# 		datum = filename[12:22]
# 		players = filename[23:-9]
# 		return datum.replace('.','-') + "_" + players
# 	else:
# 		datum = filename[-10:]
# 		players = filename[0:-11]
# 		return datum.replace('.','-') + "_" + players

# def process(filenames):
# 	engine = Stockfish(path="stockfish15/stockfish-windows-2022-x86-64-modern")
# 	engine.set_depth(DEPTH)

# 	def makeJSON(filename):
# 		global board
# 		global analys
# 		global plies

# 		start = time.time()

# 		analys = {}
# 		plies = []

# 		pgn = "data/" + filename +".pgn"
# 		with open(pgn) as f:
# 			game = chess.pgn.read_game(f)
# 		board = game.board()
# 		moves = [str(move) for move in game.mainline_moves()]
# 		print(len(moves)/2,'moves in',filename,' ',end="")

# 		san = str(game.mainline_moves()).split(" ")
# 		san = [item for item in san if '.' not in item]

# 		if 'Site' in game.headers: link = game.headers['Site']
# 		if 'Link' in game.headers: link = game.headers['Link']

# 		board = game.board()
# 		for i in range(len(moves)):
# 			ply = moves[i]
# 			engine.set_position(moves[:i])
# 			children = engine.get_top_moves(20)
# 			[superiors, superiorsSan, scores, score] = get_superiors(children,ply)
# 			superiors = " ".join(superiors)
# 			superiorsSan = " ".join(superiorsSan)
# 			scores = " ".join(scores)

# 			#if i%2==0: print()
# 			#print(1+i//2, score, san[i], superiorsSan)
# 			print('.',end="")

# 			drag = chess.Move.from_uci(ply)
# 			board.push(drag)
# 			plies.append([1+i//2, score, san[i], superiorsSan, ply, superiors, scores])

# 		print(board.fen())
# 		analys['depth'] = DEPTH
# 		analys['link'] = link
# 		analys['cpu'] = round(time.time()-start,3)
# 		analys['plies'] = plies

# 		with open("data/" + filename + ".json","w") as f:
# 			s = json.dumps(analys)
# 			s = s.replace(', [',',\n[')
# 			s = s.replace('[[','[\n[')
# 			f.write(s)

# 		print(' ',analys['cpu'])

# 	for filename in filenames:
# 		makeJSON(filename)
# 		print(filename)

		#print("cpu:",analys['cpu'])

def getFilenames(root):
	pgn = set()
	json = set()
	for name in [f for f in scandir(root)]:
		namn = name.name
		if namn == "partier.json": continue
		if ".pgn" in namn: pgn.add(namn.replace('.pgn',''))
		elif ".json" in namn: json.add(namn.replace('.json',''))
		else: print("*** Ignored file:" + namn)
	return [pgn,json]

def updateDB(fen,key):
	binary = fen.encode('ascii')
	m = hashlib.sha256()
	m.update(binary)
	hex = m.hexdigest()[0:12]
	base64 = codecs.encode(codecs.decode(hex, 'hex'), 'base64')
	base64 = base64.decode('ascii')[0:8]
	if base64 in database:
		value = database[base64]
	else:
		engine.set_position(board.move_stack)
		value = engine.get_evaluation()
		value = value['value']
		database[base64] = value
	print('  '*(len(board.move_stack)-1), key,base64,value)

def traverse(tree):
	if tree == None: return
	for key in tree:
		move = chess.Move.from_uci(key)
		board.push(move)
		fen = board.fen(en_passant = 'fen')
		updateDB(fen,key)
		traverse(tree[key])
		board.pop()

def readTree(filename):
	global board
	start = time.time()
	with open("data/" + filename + ".json", "r") as g:
		tree = json.load(g)
		board = chess.Board()

		traverse(tree)
	print("Ready!", 1000*(time.time() - start))

engine = Stockfish(path="stockfish15/stockfish-windows-2022-x86-64-modern")
engine.set_depth(DEPTH)

with open("data/database.json", "r") as f:
	database = json.load(f)

readTree("bishop")

with open("data/database.json","w") as f:
	s = json.dumps(database)
	f.write(s)
