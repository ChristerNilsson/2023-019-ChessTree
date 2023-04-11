# läser pgn med scores
# bygger upp ett träd
# skapar databas.json utan att använda stockfish

import time
import json
import chess
import chess.pgn
import hashlib
import codecs

database = {}
tree = {}
count = {'a':0,'b':0}

def updateDB(fen,value):
	binary = fen.encode('ascii')
	m = hashlib.sha256()
	m.update(binary)
	hex = m.hexdigest()[0:12]
	base64 = codecs.encode(codecs.decode(hex, 'hex'), 'base64')
	base64 = base64.decode('ascii')[0:8]
	#print(str(value))
	if base64 not in database:
		s = str(value)
		if s[0]!='#': s=int(s)
		database[base64] = s

#	print('  '*(len(board.move_stack)-1), base64,value)
	# print(base64,value)

board = chess.Board()

def traverse(node,t,level=0):
	for variation in node.variations:
		key = variation.move.uci()
		board.push(variation.move)
		fen = board.fen(en_passant='fen')
		eval = variation.eval()
		if eval: eval = eval.white()
		if eval: updateDB(fen,eval)
		if key not in t:
			t[key] = {}
			count["a"] += 1
		count['b'] += 1
		traverse(variation,t[key],level+1)
		board.pop()

def readPGN(filename):
	pgn = open(filename)
	while True:
		game = chess.pgn.read_game(pgn)
		if game == None: break
		#print(game.headers["Result"])
		traverse(game,tree)

start = time.time()
readPGN("lichess_ChristerNilsson_2023-04-10.pgn")

with open("database.json","w") as f:
 	s = json.dumps(database)
 	f.write(s)

with open("tree.json","w") as f:
 	s = json.dumps(tree)
 	f.write(s)

print(count)
print(time.time()-start)
