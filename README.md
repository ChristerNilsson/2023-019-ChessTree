# 2023-019-ChessTree

database.json innehåller värdet av ett antal ställningar.
Man når en ställning genom att söka på sha256 av fen för ställningen.

Övriga json-filer innehåller ett naket spelöppningsträd.
Python-programmet går igenom nya/ändrade träd och uppdaterar database.json
genom att anropa stockfish för utvärdering.

# webapplikation

Denna låter användare traska runt i ett träd. Finns utvärdering visas den.
Dragen är sorterade i fallande styrka.
Ett bräde visar aktuell ställning.
Om man navigerar till okänd terräng, kommer trädet att utvidgas och sparas via download.
Då pythonprogrammet upptäcker de nya dragen, kommer dessas värden att beräknas och lagras i database.json.

# todo

* Löv ska kunna deletas.
