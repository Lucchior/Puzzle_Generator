# Come funziona la geometria delle linguette

Questo documento spiega l'algoritmo in `js/geometry.js` per chi vuole
capirlo a fondo o contribuire. Non è necessario leggerlo per usare il
tool — solo per modificarne la logica in sicurezza.

## L'idea di base

Ogni linguetta (il "dentino" che incastra due pezzi) è disegnata come
**tre curve di Bézier cubiche consecutive** lungo il lato di una cella
della griglia. Le tre curve collegano 10 punti, chiamati nel codice
`p0`...`p9`:

```
lato della cella:  |←───────────────── 1.0 ─────────────────→|

  p0 ── p1                                           p8 ── p9
    (collo)  ╲                                   ╱  (collo)
              ╲                                 ╱
               p2 ── p3         p6 ── p7
                       ╲       ╱
                        ╲     ╱
                         p4 ── p5
                     (il "fungo": qui il pezzo
                      si incastra in quello adiacente)
```

- **p0 → p1 → p2 → p3**: prima curva, il collo di entrata (esce dritto
  dal bordo della cella e comincia a curvare verso il fungo)
- **p3 → p4 → p5 → p6**: seconda curva, il "fungo" vero e proprio (la
  parte larga che blocca meccanicamente il pezzo incastrato)
- **p6 → p7 → p8 → p9**: terza curva, il collo di uscita (simmetrica
  alla prima, torna dritta verso il lato della cella successiva)

## Le due funzioni di coordinate: `l()` e `w()`

Per ogni punto, il codice non lavora in coordinate SVG assolute ma in
due assi più comodi:

- **`l(v)`** = posizione **lungo** il lato della cella, da `0.0`
  (inizio cella) a `1.0` (fine cella). Es. `l(0.5)` è il centro esatto
  del lato.
- **`w(v)`** = scostamento **perpendicolare** al lato — quanto il punto
  si allontana dal lato dritto, verso l'interno o l'esterno della cella
  (è questo scostamento che disegna il "fungo").

`sl()`/`sw()` calcolano le dimensioni di una cella (lunghezza lato e
"profondità" disponibile per il fungo) dividendo le dimensioni totali
del puzzle per il numero di colonne/righe. `vertical` decide se stiamo
disegnando linee orizzontali o verticali, scambiando semplicemente quale
asse è "lungo" e quale è "largo".

## I parametri che il maker controlla

| Simbolo nel codice | Controllo nell'UI | Effetto |
|---|---|---|
| `t` (= tabSize / 200) | "Dimensione linguetta" | quanto sporge il fungo dal lato |
| `j` (= jitter / 100) | "Irregolarità" | ampiezza massima delle variazioni casuali `a,b,c,d,e` |
| seed | "Seed — forma casuale" | inizializza il generatore pseudo-casuale (`js/random.js`) |

## Le variabili casuali `a, b, c, d, e` e il `flip`

Ad ogni linguetta, 5 numeri pseudo-casuali (`a,b,c,d,e`, tutti nel range
`[-j, j]`) vengono generati da `PZRandom.createRng(seed)` e usati per
spostare leggermente i punti di controllo, così le linguette non sono
tutte identiche pur restando riproducibili a parità di seed.

`flip` alterna il verso in cui sporge il fungo (a volte verso un lato
della cella, a volte verso l'altro): senza questa alternanza tutti i
pezzi di una riga/colonna incastrerebbero nello stesso verso, il che va
bene meccanicamente ma renderebbe il pattern visivamente più ripetitivo.

## Perché `generateHorizontal()` deve essere chiamata prima di `generateVertical()`

Le due funzioni condividono **la stessa istanza** del generatore
pseudo-casuale (`rng`), passata esplicitamente da chi le chiama (vedi
`js/app.js`). La sequenza di numeri casuali continua da dove l'ha
lasciata `generateHorizontal()`: è così che, a parità di seed, l'intero
pattern del puzzle (linguette orizzontali + verticali insieme) risulta
unico e riproducibile.

**Se inverti l'ordine delle due chiamate, o ne crei una con un `rng`
nuovo invece di riusare quello passato, il pattern generato cambierà**
anche a parità di seed — è esattamente questo comportamento che
`test/geometry.test.js` protegge con i suoi test "golden value".

## Dove guardare per modificare l'algoritmo

- `js/random.js` — il generatore pseudo-casuale seedato (`createRng`)
- `js/geometry.js` — le funzioni `p0l()`...`p9w()`, `generateHorizontal()`,
  `generateVertical()`, più `rect()`/`border()`/`marginOutline()`/`marginSolid()`
  per il bordo esterno e il margine
- `test/geometry.test.js` — i test che si romperanno (di proposito) se
  cambi il comportamento dell'algoritmo
