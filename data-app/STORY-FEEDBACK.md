# The Toughest Tour, v3: feedback sheet

Write your notes under **Feedback** for any step. Leave it empty if the step is fine.

**How to write a note:**
- Use one bullet per change.
- Start each bullet with what it affects: **Copy**, **Chart**, **Design**, **Mobile** or **Data**.
- Paste new wording straight in.
- To move, cut or merge a step, say so in its feedback, using the step ids in backticks.

Example:
> **Feedback**
> - Copy: change the heading to "It's 1919. This is a Tour."
> - Chart: make the dots bigger on mobile.

Preview it at:
`http://localhost:8000/Packages/com.tableau.mcp.the-toughest-tour-story/content/index.html?csv=/dev/data/the_toughest_tour.csv`

Numbers shown in *italics* come from the data and update each year by themselves. Everything else is fixed text.

---

## Colour concept: the jerseys (from the README)

Each wedge colour stands for one of the race's jerseys or awards:

| Wedge | Colour | Jersey / award | What it measures | Why it fits |
|---|---|---|---|---|
| Competition | Yellow | Yellow jersey, the race leader | Share of the race the winner did *not* lead | Who held yellow, and for how long |
| Elevation | Orange | Polka-dot jersey, King of the Mountains | Highest point of the race | The climbers' prize |
| Pace | Green | Green jersey, points / sprints | Winner's average speed | The speed prize |
| Abandons | Pink-red | Red number, the combativity award | Share of riders who quit | Fighting to survive |
| Distance | Blue | No jersey | Total length of the race | Deliberately outside the jersey system |

**What the v3 story does with this today: nothing.** The text names the colours ("Yellow is competition") but never says why. That leaves out the best memory aid the piece has: a cycling fan already knows yellow means the leader.

**Proposed edits:**
- **Chapter 2 (`d-wedge`, `b2`–`b5`):** introduce each wedge with its jersey. For example:
  - "Yellow, like the leader's jersey: how much of the race the winner did *not* lead."
  - "Orange stands in for the polka-dot climber's jersey: the highest point."
  - "Green, like the sprinters' jersey: the winner's speed."
  - "Pink-red, for the red number of the race's most combative rider: the riders who quit."
  - "Blue has no jersey: it's simply the distance."
- **Polka dots:** add a polka-dot texture to the elevation swatch, and to the elevation wedge while it's highlighted. It reinforces the jersey idea and gives a second cue beyond colour (the palette checker flagged low contrast for orange and yellow on paper).
- **Explore legend:** show a small jersey icon next to each factor name, drawn as our own simple shape, not official artwork.
- **Guard rail:** jerseys are mentioned and drawn generically only. No official jersey artwork, sponsor marks or A.S.O. logos, so the piece doesn't look affiliated.

**Feedback**
- 

---

## Whole piece

**Feedback**
- 

---

## Masthead

- **Kicker:** A data story · 1903–*2026*
- **Title:** The Toughest Tour
- **Standfirst:** Which Tour de France was the toughest? *113* races, five ways to suffer, one answer.
- **Art:** the 1919 wheel, drawn as a static decoration.
- **Other:** a "Scroll ↓" cue, and a "Skip to the explorer" link that appears on keyboard focus.

**Feedback**
- 

---

## Chart bar (above the chart, every step)

- **Route bar:** 1 Départ · 2 Read a wheel · 3 Five ways to suffer · 4 Classement · 5 Shape shift · 6 Your Tour. The current chapter fills as you scroll through it. On mobile only the current chapter's name shows.
- **Motion button:** turns animation on and off and remembers the choice. The system reduced-motion setting always wins.

**Feedback**
- 

---

## Chapter 1 · Départ

### `d-start`
- **Copy:** "1 · Départ" tag. **This is a Tour. It's 1919.** Seven months after the First World War, 69 riders leave Paris. Each dot is one of them.
- **Chart:**
  - a large "It's 1919" counter;
  - 69 white dots in a peloton on a road line;
  - the label "69 starters · one dot each".

**Feedback**
- 

### `d-out`
- **Copy:** Fifteen stages and 5,560 km later, **59 have quit**. Ten reach Paris. Belgian Firmin Lambot wins. *(note)* Pink means a rider who abandoned. It keeps that meaning for the whole story.
- **Media:** image slot `1919`.
- **Chart:**
  - 10 white dots ride on to a "Paris" flag, labelled "10 finished";
  - 59 dots turn pink and drop below the road, labelled "59 abandoned · 86%".

**Feedback**
- 

### `d-wedge`
- **Copy:** **59 riders become one wedge.** The riders who quit slide into the top of the wheel. That pink wedge always means abandons. In 1919 it is full: 86%, the most riders the Tour has ever lost.
- **Chart:**
  - the 59 pink dots pack into the abandons wedge of the 1919 wheel;
  - the other four wedges show as dotted outlines;
  - the 10 finishers fade out.

**Feedback**
- 

---

## Chapter 2 · Read a wheel

### `b2`
- **Copy:** "2 · Read a wheel" tag. **Second wedge: was it close?** Yellow is competition: how much of the race the winner did *not* lead. Lambot only took the lead on the second-to-last stage, so 1919's yellow wedge is almost full.
- **Chart:** the 1919 wheel with abandons and competition drawn. Each wedge is labelled with its name and value ("86% quit", "Led 2 of 15 stages"). The other wedges show as dotted outlines.

**Feedback**
- 

### `b3`
- **Copy:** **Third wedge: how high they climbed.** Orange is the highest point. In 1919 the race crossed the Galibier at 2,556 m, on unpaved roads: 91% of the way to the record.
- **Chart:** adds elevation, labelled "2,556 m".

**Feedback**
- 

### `b5`
- **Copy:** **Last two: speed and length.** Green is the winner's average speed, blue the total distance. Lambot averaged 24.1 km/h over 5,560 km. *(note)* Every wedge is scaled to its record. A wedge that reaches the tyre was the toughest Tour ever on that measure.
- **Chart:** the full 1919 wheel with all five labels.

**Feedback**
- 

### `compare`
- **Copy:** **Now compare *2026*.** Far fewer riders quit, and the route is much shorter. But look at the green wedge.
- **Media:** slot `intro`.
- **Chart:** the 1919 and *2026* wheels side by side.

**Feedback**
- 

---

## Chapter 3 · Five ways to suffer

### `distance`
- **Copy:** "3 · Five ways to suffer" tag. **1926, the longest.** Lucien Buysse's Tour covered 5,745 km (3,570 miles), almost double a modern route.
- **Media:** slot `1926`.
- **Chart:** 1926 next to *2026*, with distance highlighted.

**Feedback**
- 

### `elevation`
- **Copy:** **Up to 2,802 m.** The highest the Tour has climbed is the Cime de la Bonette in the Maritime Alps: first in 1962, then again in *1964, 1993, 2008 and 2024*.
- **Media:** slot `1962`.
- **Chart:** every Bonette year, with elevation highlighted.

**Feedback**
- 

### `competition`
- **Copy:** **Won on the final day.** After a second war gap, 1947 restarted with a thriller: Jean Robic only took the lead on the last stage. Jan Janssen did the same in 1968. Their yellow wedges are full.
- **Media:** slot `1968`.
- **Chart:** 1939, a dotted 1940–46 gap marked "Second World War", then 1947 and 1968, with competition highlighted.

**Feedback**
- 

### `merckx`
- **Copy:** **The Merckx years.** Eddy Merckx won in 1969–72 and 1974, leading most of the stages each time (20 of 23 in 1970), so his yellow wedges almost vanish. They grow again in 1975, when Bernard Thévenet beat him.
- **Media:** slot `merckx`.
- **Chart:** 1969–1975, with Merckx's wins in focus and competition highlighted.

**Feedback**
- 

### `pace`
- **Copy:** **Faster, not easier.** Green is the only wedge that keeps growing. Winners averaged about 25 kph in the 1900s. In 2005 Lance Armstrong's 41.7 kph set a record that was later voided. It has since been beaten: *2026 averaged 43.3 kph, the fastest Tour ever*.
- **Media:** slot `pace`.
- **Chart:** all 113 wheels by decade, with pace highlighted.

**Feedback**
- 

---

## Chapter 4 · Classement

### `rank`
- **Copy:** "4 · Classement" tag. ***1919* was the toughest Tour.** Average the five wedges and *1919* scores ***87***, first of *113*. *1922 (81) and 1949 (80)* come next. *(note)* The wheels just slid from year order into rank order: each one is the same wheel as before. The score is the plain average of the five scaled factors (see Methods).
- **Chart:**
  - all wheels re-sort into rank order, read left to right;
  - the top 3 are in focus and the rest faded;
  - labels: "#1 1919", "#2", "#3" and "#113 1903".

**Feedback**
- 

### `rank-last`
- **Copy:** **And the easiest? The very first.** *1903* had six stages, stayed low, and Maurice Garin led from start to finish. It scores ***44***, last of *113*.
- **Chart:** the same ranked grid, with #1 and #113 in focus.

**Feedback**
- 

---

## Chapter 5 · Shape shift

### `eras`
- **Copy:** "5 · Shape shift" tag. **The Tour never got easier.**
  - Average the wheels in each era and the overall score barely moves: ***67, 68, 64***.
  - What moves is the shape. Before the Second World War the pain was in getting to Paris: abandons scored *72*. Since 1990 it is in speed: pace scores *93*, abandons only *28*.
  - Hardship did not go away. It went round the wheel.
- **Chart:** three average wheels labelled Survive (1903–1939), Race (1947–1989) and Speed (1990–*2026*). Each shows its score, plus its abandons and pace values.

**Feedback**
- 

---

## Chapter 6 · Your Tour

### `you`
- **Copy:** "6 · Your Tour" tag. **Find your Tour.** A number box labelled "The year you were born", set to 1990 by default.
- **Generated sentence:** e.g. "Greg LeMond won in 1990. It ranks #44 of 113 for toughness, scoring 69. Its biggest wedge is competition (led 2 of 21 stages)."
  - For a war year: "No Tour in 1942: the race stopped for the war. The next one was 1947. …"
- **Chart:** the chosen year's wheel with all five value labels.

**Feedback**
- 

### `explore`
- **Copy:** **Explore every Tour.** All *113* editions. The gaps are the two World Wars. Tap or hover a wheel, or tab into the grid and use the arrow keys, for its numbers.
- **Controls:** a Year / Toughness switch, which re-sorts the grid.
- **Chart:**
  - all 113 wheels by decade, or by rank;
  - a tooltip shows the year, its rank, and the five data sentences;
  - arrow keys move between years.

**Feedback**
- 

---

## Appendix

- **Data table** (collapsed): year, pace, distance, abandons %, highest point, % of stages the winner led, score, rank.
- **Methods:** Each factor is scaled 0–100 against its record, so the toughest Tour on that measure scores 100. Competition is the share of stages the eventual winner did not lead. A Tour's toughness score is the plain average of its five scaled factors, weighted equally. The era wheels average every Tour in 1903–1939, 1947–1989 and 1990 onwards.
- **Download the data (CSV)** button.
- **Sources:** Data: letour.fr, Kaggle, Wikipedia, compiled by Will Sutton. Not affiliated with the Tour de France or A.S.O.
- **Media credits:** filled automatically from `media/media.json`.

**Feedback**
- 

---

## Media: what we have, and how it fits the story

**What's in the repo today: no story media.**
- All 7 slots in `media/media.json` are placeholders (the striped "image slot" boxes).
- The `figma/` files are the 2021 Tableau dashboard's overlays: text saved as images in Open Sans, plus the background. They don't suit this page: the text in them isn't real text (so screen readers can't read it), and the type doesn't match the new design.
- One owned asset is worth reusing: **`Tour de France.png`, the original 2021 Viz of the Day**. It belongs in the appendix as "Where this started", linking to Tableau Public. It credits the original and gives the reader somewhere to go next.

**The rule I applied (from the playbook):** use photos only where they act as proof, show a person, or show a place. Steps where the chart itself is the point (the wedge build, the ranking, the eras, Your Tour) get no media, so nothing competes with the wheel.

**Status: done.** The first-choice file for each step is now in `content/media/` (1280 px thumbnails from Commons, 2.5 MB in total). Every licence was checked against the Commons API at download. `media.json` holds each photo's alt text, caption and TASL credit, and the video slots are now stills. To swap a photo, change its `src` and `credit` in `media.json`.

**Candidates found on Wikimedia Commons.** Every file is public domain, CC0 or CC BY/BY-SA. Each photo is served locally, so the Tableau sandbox never has to fetch anything.

| Step | Story beat | Recommended file (Commons) | Licence · credit | Why it fits |
|---|---|---|---|---|
| `d-out` | "Ten reach Paris." | **1919 final sprint, Parc des Princes**: `Parc des Princes, 27-7-19, arrivée du Tour de France, en tête (Jean) Alavoine (Luigi Natale) Lucotti (Honoré) Barthélémy - btv1b53018231q.jpg` · alt: `Lambot-Tour1919.jpg` (Lambot, portrait) | Public domain · Agence Rol, Gallica/BnF | Three of the ten survivors on the dots' finish line: the people behind the dots |
| `compare` | "Now compare 2026" | `Stage 20 Tour de France 2024 Col de la Couillole 11.jpg` | CC BY-SA 4.0 · kallerna | Modern crowds and a modern race next to 1919's empty roads |
| `distance` | 1926, the longest | `Tour de France cycliste - étape Bayonne-Luchon - Lucien Buysse dans le col de l'Aubisque - btv1b9025664d.jpg` · alt: `14-7-26, Tour de France, la montée du col d'Allos` | Public domain · Meurisse / Rol, BnF | The winner, alone on a dirt mountain road: what 5,745 km looked like |
| `elevation` | Up to 2,802 m | `Cime de la Bonette dans le parc du Mercantour.jpg` (no 1962 race photo exists on Commons) | CC BY-SA 4.0 · JCosson | Shows the place itself, the highest road the Tour has used |
| `competition` | Won on the final day | `Jan Janssen winnaar van de Tour de France 1968, Bestanddeelnr 135-0699.jpg` · alt: `Jean Robic, winnaar van de Tour de France 1947, Bestanddeelnr 902-2745.jpg` | CC0 · Anefo / Nationaal Archief | One of the two final-day winners named in the text |
| `merckx` | The Merckx years | `Stage 2, 1971 Tour de France.jpg` (Merckx leading, Mulhouse–Strasbourg) | CC0 · Anefo / Nationaal Archief | Merckx at the front, matching "leading most of the stages" |
| `pace` | Faster, not easier | `Tadej Pogačar at 2026 Tour de France (Stage 21).jpg` · alt (landscape): `Tadej Pogacar and his team in front of the peloton during Simacourbe climb of Tour de France 2024 stage 13.jpg` | CC BY-SA 4.0 · Kiril Simeonovski / Hugo LUC | The rider and the year of the fastest Tour on record. The yellow jersey in it also ties to the colour concept |

**Gaps and decisions for you:**
- **Video: I recommend dropping it.** Both video slots (`intro`, `pace`) were set up for YouTube.
  - The Tableau sandbox blocks outside requests, so a YouTube embed fails there unless YouTube is allowed in the extension manifest.
  - I couldn't confirm that the British Pathé or official Tour channel videos allow embedding, and A.S.O. files copyright claims against fan uploads.
  - The stills above do the job. A video could come back later for the blog version only.
- **Chapter 1 has no photo of riders abandoning.** None from the 1900s–1920s turned up. The dots carry that beat, so it doesn't need a picture.
- **Elevation has no 1962 race photo**, only the place today. That's fine for "where", but say if you'd rather use a historic climb, e.g. the 1926 Col d'Allos shot.
- **CC BY-SA files need credits in the TASL form** (title, author, source, licence). `media.json` already builds the credits list from those fields.
- **Page weight:** 7 JPEGs at 1600 px add about 1.5–2 MB, and they only load when scrolled to.

**Feedback**
- 
