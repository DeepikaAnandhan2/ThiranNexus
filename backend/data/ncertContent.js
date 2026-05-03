// ─── NCERT Local Content Database ─────────────────────────
// Tamil Nadu aligned NCERT syllabus — Classes 6 to 10
// Organized by: class → subject → chapters with full content
// This ensures ALWAYS returns proper, organized content
// No API dependency — works offline too

const NCERT_CONTENT = {

  // ══════════════════════════════════════════════════════
  // CLASS 6
  // ══════════════════════════════════════════════════════
  '6': {
    Science: [
      {
        id: 'c6-sci-1',
        chapter: 1,
        title: 'Food: Where Does It Come From?',
        content: `Food comes from two main sources: plants and animals.

**Plant Sources of Food:**
- Fruits: mango, banana, orange, apple
- Vegetables: spinach, carrot, potato, tomato
- Cereals: wheat, rice, maize (grains we eat)
- Pulses: dal, beans, peas (seeds of legumes)
- Oils: from groundnut, coconut, mustard seeds

**Animal Sources of Food:**
- Milk and dairy: curd, butter, cheese, paneer
- Eggs: from hens, ducks
- Meat: chicken, fish, mutton
- Honey: made by bees

**Types of Animals based on Food:**
- Herbivores: eat only plants (cow, rabbit, deer)
- Carnivores: eat only animals (lion, tiger, eagle)
- Omnivores: eat both plants and animals (humans, crow, bear)

**Key Terms:**
- Ingredients: things used to prepare food
- Nutrients: substances in food that help our body
- Nectar: sweet juice in flowers that bees collect to make honey`,
        keyPoints: ['Plants are the main source of food', 'Animals that eat plants are herbivores', 'Honey is made by bees from nectar'],
        quiz: [
          { q: 'Which of these is a herbivore?', options: ['Lion', 'Cow', 'Crow', 'Bear'], answer: 'Cow' },
          { q: 'Honey is made by?', options: ['Ants', 'Butterflies', 'Bees', 'Wasps'], answer: 'Bees' },
          { q: 'Rice and wheat are called?', options: ['Pulses', 'Fruits', 'Cereals', 'Vegetables'], answer: 'Cereals' },
        ]
      },
      {
        id: 'c6-sci-2',
        chapter: 2,
        title: 'Components of Food',
        content: `Our food contains different nutrients that keep us healthy.

**Five Main Nutrients:**

1. **Carbohydrates** — give energy
   - Sources: rice, wheat, bread, potato, sugar
   - Test: Iodine turns blue-black when starch is present

2. **Proteins** — build and repair body
   - Sources: dal, egg, milk, meat, fish, soybean
   - Help in growth, especially for children

3. **Fats** — store energy, keep us warm
   - Sources: butter, ghee, oil, nuts
   - Too much fat is harmful

4. **Vitamins** — protect from diseases
   - Vitamin A: carrots, milk → good eyesight
   - Vitamin B: cereals → healthy nerves
   - Vitamin C: oranges, amla → fights infections
   - Vitamin D: sunlight, fish → strong bones

5. **Minerals** — for strong bones and blood
   - Iron: spinach, meat → makes blood
   - Calcium: milk, curd → strong bones
   - Iodine: seafood, iodized salt → thyroid health

**Balanced Diet:**
A meal that has all nutrients in correct amounts.

**Deficiency Diseases:**
- Lack of Vitamin C → Scurvy (bleeding gums)
- Lack of Vitamin D → Rickets (weak bones)
- Lack of Iron → Anaemia (weakness)
- Lack of Iodine → Goitre (swollen neck)`,
        keyPoints: ['Carbohydrates give energy', 'Proteins build body', 'Vitamins protect from disease', 'Balanced diet has all nutrients'],
        quiz: [
          { q: 'Which nutrient gives energy?', options: ['Protein', 'Vitamin', 'Carbohydrate', 'Mineral'], answer: 'Carbohydrate' },
          { q: 'Lack of Vitamin C causes?', options: ['Rickets', 'Scurvy', 'Goitre', 'Anaemia'], answer: 'Scurvy' },
          { q: 'Which food is rich in protein?', options: ['Rice', 'Oil', 'Dal', 'Sugar'], answer: 'Dal' },
        ]
      },
      {
        id: 'c6-sci-3',
        chapter: 7,
        title: 'Getting to Know Plants',
        content: `Plants have different parts, each with a special job.

**Parts of a Plant:**

1. **Root**
   - Holds plant in soil
   - Absorbs water and minerals
   - Types: Taproot (carrot, radish) and Fibrous root (wheat, grass)

2. **Stem**
   - Carries water and food
   - Supports leaves and flowers
   - Types: Weak (climbers like money plant), Strong (tree trunk)

3. **Leaf**
   - Makes food by photosynthesis
   - Has veins (carry water and food)
   - Has stomata (tiny pores for gas exchange)
   - Types: Simple (mango) and Compound (neem, rose)

4. **Flower**
   - For reproduction
   - Parts: Sepal (protects bud), Petal (attracts insects), Stamen (male part), Pistil (female part)

5. **Fruit**
   - Develops from flower after fertilization
   - Contains seeds

6. **Seed**
   - Grows into new plant
   - Has embryo (baby plant inside)

**Photosynthesis (simply):**
Plants use sunlight + water + CO₂ → make food (glucose) + release oxygen`,
        keyPoints: ['Roots absorb water', 'Leaves make food', 'Flowers help in reproduction'],
        quiz: [
          { q: 'Which part absorbs water from soil?', options: ['Leaf', 'Stem', 'Root', 'Flower'], answer: 'Root' },
          { q: 'Stomata are found on?', options: ['Roots', 'Stems', 'Leaves', 'Seeds'], answer: 'Leaves' },
          { q: 'Carrot is an example of?', options: ['Fibrous root', 'Taproot', 'Stem', 'Leaf'], answer: 'Taproot' },
        ]
      },
    ],
    Mathematics: [
      {
        id: 'c6-math-1',
        chapter: 1,
        title: 'Knowing Our Numbers',
        content: `Numbers help us count, measure, and compare things.

**Place Value System:**
- Ones, Tens, Hundreds, Thousands, Ten Thousands, Lakhs, Ten Lakhs, Crores

**Indian Number System:**
1,000 = One Thousand
10,000 = Ten Thousand
1,00,000 = One Lakh
10,00,000 = Ten Lakhs
1,00,00,000 = One Crore

**International Number System:**
1,000 = One Thousand
10,000 = Ten Thousand
100,000 = One Hundred Thousand
1,000,000 = One Million
1,000,000,000 = One Billion

**Comparing Numbers:**
- The number with more digits is greater
- If equal digits, compare from left

**Estimation:**
- Round off to nearest 10, 100, 1000
- 1-4 → round down, 5-9 → round up
- 567 → nearest 10 = 570, nearest 100 = 600

**Roman Numerals:**
I=1, V=5, X=10, L=50, C=100, D=500, M=1000
- IV = 4 (1 before 5), IX = 9, XL = 40, XC = 90`,
        keyPoints: ['Indian system uses lakhs and crores', 'International system uses millions', 'Estimation means finding approximate value'],
        quiz: [
          { q: '1,00,000 in words (Indian system)?', options: ['One Million', 'One Lakh', 'One Thousand', 'Ten Lakh'], answer: 'One Lakh' },
          { q: 'Round 567 to nearest 100?', options: ['500', '600', '570', '560'], answer: '600' },
          { q: 'Roman numeral for 9?', options: ['VIIII', 'IX', 'XI', 'IIX'], answer: 'IX' },
        ]
      },
      {
        id: 'c6-math-2',
        chapter: 2,
        title: 'Whole Numbers',
        content: `Whole numbers include zero and all natural numbers.

**Natural Numbers:** 1, 2, 3, 4, 5... (counting numbers)
**Whole Numbers:** 0, 1, 2, 3, 4, 5... (natural + zero)

**Properties of Whole Numbers:**

1. **Closure Property:** 
   - Addition: a + b is always a whole number ✅
   - Subtraction: 3 - 5 = -2 (NOT always whole) ❌

2. **Commutative Property:**
   - a + b = b + a ✅ (2 + 3 = 3 + 2)
   - a × b = b × a ✅

3. **Associative Property:**
   - (a + b) + c = a + (b + c) ✅

4. **Distributive Property:**
   - a × (b + c) = a×b + a×c

5. **Identity:**
   - Additive identity: 0 (a + 0 = a)
   - Multiplicative identity: 1 (a × 1 = a)

**Number Line:**
← 0 — 1 — 2 — 3 — 4 — 5 →
- Moving right = adding
- Moving left = subtracting`,
        keyPoints: ['Whole numbers start from 0', '0 is additive identity', '1 is multiplicative identity'],
        quiz: [
          { q: 'What is the additive identity?', options: ['1', '0', '2', '-1'], answer: '0' },
          { q: 'Is 3 - 5 a whole number?', options: ['Yes', 'No', 'Sometimes', 'Always'], answer: 'No' },
          { q: 'Natural numbers start from?', options: ['0', '1', '-1', '2'], answer: '1' },
        ]
      },
    ],
    English: [
      {
        id: 'c6-eng-1',
        chapter: 1,
        title: 'Noun — Types and Usage',
        content: `A noun is a word that names a person, place, thing, or idea.

**Types of Nouns:**

1. **Proper Noun** — specific name, always capitalized
   - Examples: Ravi, Chennai, India, Ganga, Monday
   - Names of people, cities, countries, rivers, days

2. **Common Noun** — general name, not capitalized
   - Examples: boy, city, river, dog, book

3. **Collective Noun** — name for a group
   - a flock of birds
   - a herd of cattle
   - a bunch of grapes
   - a swarm of bees
   - a team of players
   - a class of students

4. **Abstract Noun** — something we cannot see/touch
   - Examples: love, happiness, courage, beauty, knowledge, freedom

5. **Material Noun** — material/substance things are made of
   - Examples: gold, wood, iron, cotton, plastic

**Number:**
- Singular: one thing (book, child)
- Plural: more than one (books, children)

**Gender:**
- Masculine: boy, king, lion
- Feminine: girl, queen, lioness
- Common: doctor, teacher, student (both male/female)
- Neuter: table, stone (no gender)`,
        keyPoints: ['Proper nouns are always capitalized', 'Collective nouns name groups', 'Abstract nouns cannot be seen or touched'],
        quiz: [
          { q: '"Chennai" is what type of noun?', options: ['Common', 'Proper', 'Abstract', 'Collective'], answer: 'Proper' },
          { q: 'A group of bees is called?', options: ['Flock', 'Herd', 'Swarm', 'Pack'], answer: 'Swarm' },
          { q: '"Happiness" is what type of noun?', options: ['Material', 'Collective', 'Proper', 'Abstract'], answer: 'Abstract' },
        ]
      },
    ],
    'Social Science': [
      {
        id: 'c6-sst-1',
        chapter: 1,
        title: 'What, Where, How and When?',
        content: `History helps us understand the past and how our present came to be.

**Sources of History:**
We learn about the past from different sources:

1. **Manuscripts** — handwritten books on palm leaves or bark
   - Written in Sanskrit, Prakrit, Tamil, Persian
   - Found in temples, monasteries, libraries

2. **Inscriptions** — writing engraved on stone/metal
   - On pillars, rocks, walls, copper plates
   - Ashoka's edicts are famous inscriptions

3. **Archaeology** — study of objects from the past
   - Coins, tools, pottery, buildings
   - Archaeologists dig (excavation) to find these

4. **Oral Traditions** — songs, stories passed down
   - Folk songs, legends, epics

**Dates in History:**
- BC = Before Christ (counts backward: 200 BC → 100 BC → 0)
- AD = Anno Domini (After Christ: counts forward)
- BCE = Before Common Era (same as BC)
- CE = Common Era (same as AD)

**Tamil Nadu History:**
- Chennai (Madras) was established by British in 1639
- Sangam literature (2000+ years old) tells about ancient Tamil life
- Great kings: Chola, Chera, Pandya dynasties`,
        keyPoints: ['Manuscripts are handwritten old books', 'Inscriptions are writings on stone', 'BC counts backward, AD counts forward'],
        quiz: [
          { q: 'Ashoka\'s writings on rocks are called?', options: ['Manuscripts', 'Inscriptions', 'Coins', 'Maps'], answer: 'Inscriptions' },
          { q: 'BCE stands for?', options: ['Before Common Era', 'Before Christian Era', 'Both are correct', 'Neither'], answer: 'Both are correct' },
          { q: 'Study of objects from past is called?', options: ['History', 'Geography', 'Archaeology', 'Sociology'], answer: 'Archaeology' },
        ]
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CLASS 7
  // ══════════════════════════════════════════════════════
  '7': {
    Science: [
      {
        id: 'c7-sci-1',
        chapter: 1,
        title: 'Nutrition in Plants',
        content: `Plants prepare their own food — they are called autotrophs.

**Photosynthesis — How Plants Make Food:**

Ingredients needed:
- Sunlight (energy source)
- Water (from roots via stem)
- Carbon dioxide (from air through stomata)
- Chlorophyll (green pigment in leaves)

The equation:
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ (Glucose) + 6O₂

**Chlorophyll:**
- Green pigment found in chloroplasts
- Absorbs sunlight for photosynthesis
- Absent in white/yellow parts of leaves

**Stomata:**
- Tiny pores on leaf surface
- CO₂ enters, O₂ exits through stomata
- Open during day, close at night

**Other Modes of Nutrition in Plants:**

1. **Parasitic Plants** — depend on host for food
   - Cuscuta (Amarbel) — yellow thread-like plant wraps on host
   - Takes nutrients from host plant

2. **Insectivorous Plants** — trap and digest insects
   - Pitcher plant (Nepenthes) — insects fall into pitcher
   - Venus flytrap — leaves snap shut on insects
   - Grow in nitrogen-poor soil

3. **Symbiosis** — mutual benefit
   - Lichens: algae + fungi living together
   - Algae makes food, fungi provides shelter

**Saprophytes:**
- Feed on dead organic matter
- Examples: mushroom, bread mould`,
        keyPoints: ['Photosynthesis occurs in chloroplasts', 'Cuscuta is a parasitic plant', 'Pitcher plant traps insects for nitrogen'],
        quiz: [
          { q: 'Gas released during photosynthesis?', options: ['CO₂', 'N₂', 'O₂', 'H₂'], answer: 'O₂' },
          { q: 'Cuscuta is a type of?', options: ['Saprophyte', 'Parasite', 'Insectivore', 'Autotroph'], answer: 'Parasite' },
          { q: 'Chlorophyll is found in?', options: ['Roots', 'Stems', 'Chloroplasts', 'Mitochondria'], answer: 'Chloroplasts' },
        ]
      },
      {
        id: 'c7-sci-2',
        chapter: 3,
        title: 'Fibre to Fabric',
        content: `Fabrics are made from fibres — natural or synthetic.

**Natural Fibres:**

1. **Cotton**
   - From cotton plant (seed hair)
   - Tamil Nadu: Coimbatore, Tiruppur are major cotton centres
   - Cotton boll → ginning → spinning → weaving → fabric

2. **Jute**
   - From jute plant stem
   - Called "Golden Fibre"
   - West Bengal is top producer

3. **Wool**
   - From sheep (fleece)
   - Also from goat (cashmere), rabbit (angora)
   - Shearing → scouring → carding → spinning → weaving

4. **Silk**
   - From silkworm cocoon
   - Sericulture = silk farming
   - Silkworm: Egg → Caterpillar → Cocoon → Moth
   - India: Kanchipuram silk (Tamil Nadu) is world famous

**Synthetic Fibres:**
- Made from chemicals (petroleum-based)
- Examples: Nylon, Polyester, Acrylic, Rayon
- Advantages: Strong, cheap, easy to wash
- Disadvantage: Non-biodegradable, harmful to environment

**Weaving vs Knitting:**
- Weaving: two sets of threads (warp and weft) crossed
- Knitting: one thread looped over itself`,
        keyPoints: ['Kanchipuram silk is famous from Tamil Nadu', 'Silk comes from silkworm cocoons', 'Synthetic fibres are non-biodegradable'],
        quiz: [
          { q: 'Silk is obtained from?', options: ['Sheep', 'Silkworm', 'Cotton plant', 'Jute plant'], answer: 'Silkworm' },
          { q: 'Jute is called?', options: ['White Fibre', 'Silver Fibre', 'Golden Fibre', 'Brown Fibre'], answer: 'Golden Fibre' },
          { q: 'Kanchipuram is famous for?', options: ['Cotton', 'Jute', 'Wool', 'Silk'], answer: 'Silk' },
        ]
      },
    ],
    Mathematics: [
      {
        id: 'c7-math-1',
        chapter: 1,
        title: 'Integers',
        content: `Integers include positive numbers, negative numbers, and zero.

**Number Line:**
← -5 -4 -3 -2 -1  0  +1 +2 +3 +4 +5 →

**Rules for Addition:**
- Positive + Positive = Positive: 3 + 4 = 7
- Negative + Negative = Negative: (-3) + (-4) = -7
- Different signs: Subtract smaller from larger, take sign of larger
  (+5) + (-3) = +2
  (-7) + (+4) = -3

**Rules for Subtraction:**
- Change sign and add: a - b = a + (-b)
- 5 - (-3) = 5 + 3 = 8
- (-4) - 3 = (-4) + (-3) = -7

**Rules for Multiplication:**
- Positive × Positive = Positive
- Negative × Negative = Positive ← (important!)
- Positive × Negative = Negative
- (-3) × (-4) = +12
- (-3) × 4 = -12

**Rules for Division:**
- Same signs → Positive result
- Different signs → Negative result
- (-12) ÷ (-4) = +3
- 12 ÷ (-4) = -3

**Properties:**
- Closure: integers are closed under +, -, ×
- Commutative: a + b = b + a, a × b = b × a
- Associative for + and ×
- NOT commutative for division`,
        keyPoints: ['Negative × Negative = Positive', 'Change subtraction to addition of opposite', 'Integers are closed under addition and multiplication'],
        quiz: [
          { q: '(-3) × (-4) = ?', options: ['12', '-12', '7', '-7'], answer: '12' },
          { q: '5 - (-3) = ?', options: ['2', '8', '-8', '-2'], answer: '8' },
          { q: '(-15) ÷ 3 = ?', options: ['5', '-5', '45', '-45'], answer: '-5' },
        ]
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CLASS 8
  // ══════════════════════════════════════════════════════
  '8': {
    Science: [
      {
        id: 'c8-sci-1',
        chapter: 1,
        title: 'Crop Production and Management',
        content: `Agriculture is the practice of growing crops and rearing animals for food.

**Types of Crops by Season (Tamil Nadu):**

1. **Kharif Crops (June–November)**
   - Grown in rainy season
   - Examples: Paddy (rice), maize, soybean, groundnut, cotton
   - Tamil Nadu major crop: Paddy

2. **Rabi Crops (November–April)**
   - Grown in winter
   - Examples: Wheat, mustard, peas, gram
   - More common in North India

3. **Zaid Crops (April–June)**
   - Grown in summer with irrigation
   - Examples: watermelon, cucumber, bitter gourd

**Agricultural Practices:**

1. **Preparation of Soil**
   - Ploughing: loosens soil, helps roots grow, brings nutrients up
   - Levelling: flattens field, prevents water runoff

2. **Sowing**
   - Selecting good quality seeds
   - Tools: traditional funnel, seed drill (uniform depth)

3. **Adding Manure and Fertilizers**
   - Manure: natural (from animal dung/compost) — enriches soil
   - Fertilizers: chemical (urea, NPK) — provide specific nutrients
   - NPK: Nitrogen, Phosphorus, Potassium

4. **Irrigation**
   - Wells, canals, tanks, tube wells
   - Modern: Sprinkler and Drip irrigation (saves water)
   - Tamil Nadu: Major irrigation by Mettur dam (Cauvery river)

5. **Weeding**
   - Removing unwanted plants (weeds) that compete for nutrients
   - Weedicides (chemicals) or manual removal

6. **Harvesting**
   - Cutting ripe crops: sickle or combine harvester

7. **Storage**
   - Silos, granaries, godowns
   - Protected from moisture, pests, rats`,
        keyPoints: ['Paddy is major Kharif crop in Tamil Nadu', 'Drip irrigation saves water', 'NPK stands for Nitrogen, Phosphorus, Potassium'],
        quiz: [
          { q: 'Paddy is a which type of crop?', options: ['Rabi', 'Kharif', 'Zaid', 'Both Kharif and Rabi'], answer: 'Kharif' },
          { q: 'Drip irrigation is used to?', options: ['Increase crop yield', 'Save water', 'Remove weeds', 'Prepare soil'], answer: 'Save water' },
          { q: 'N in NPK fertilizer stands for?', options: ['Nickel', 'Nitrogen', 'Neon', 'Natrium'], answer: 'Nitrogen' },
        ]
      },
      {
        id: 'c8-sci-2',
        chapter: 3,
        title: 'Synthetic Fibres and Plastics',
        content: `Synthetic materials are made from chemicals derived from petroleum.

**Synthetic Fibres:**

1. **Rayon** (Artificial Silk)
   - Made from wood pulp (cellulose)
   - Looks like silk, cheaper
   - Used in sarees, curtains

2. **Nylon**
   - First fully synthetic fibre
   - Very strong, elastic, lustrous
   - Used in ropes, toothbrush bristles, stockings, parachutes

3. **Polyester**
   - Made from petroleum
   - Resists wrinkles, easy to wash, dries fast
   - PET (Polyethylene Terephthalate) used in bottles

4. **Acrylic**
   - Looks like wool but cheaper
   - Used in sweaters, blankets, shawls

**Properties of Synthetic Fibres:**
- Strong and durable
- Absorb less water → dry quickly
- Easy to maintain
- Resistant to moths and insects

**Disadvantage:**
- Non-biodegradable → causes pollution
- Melt on heating → dangerous if caught in fire

**Plastics:**
- Thermoplastics: can be remoulded on heating (PVC, polythene)
- Thermosetting plastics: once set, cannot be remoulded (Bakelite, melamine)

**Pollution by Plastics:**
- Choke drains, kill marine animals
- Tamil Nadu: banned single-use plastics since 2019
- 3R: Reduce, Reuse, Recycle`,
        keyPoints: ['Nylon was first fully synthetic fibre', 'Plastics are non-biodegradable', 'Tamil Nadu banned single-use plastics in 2019'],
        quiz: [
          { q: 'Which is called artificial silk?', options: ['Nylon', 'Polyester', 'Rayon', 'Acrylic'], answer: 'Rayon' },
          { q: 'PET bottles are made from?', options: ['Nylon', 'Polyester', 'Acrylic', 'Rayon'], answer: 'Polyester' },
          { q: 'Bakelite is a?', options: ['Thermoplastic', 'Thermosetting plastic', 'Natural fibre', 'Synthetic fibre'], answer: 'Thermosetting plastic' },
        ]
      },
      {
        id: 'c8-sci-3',
        chapter: 11,
        title: 'Force and Pressure',
        content: `A force is a push or pull that can change the state or shape of an object.

**What Force Can Do:**
- Make a resting object move
- Stop a moving object
- Change direction of motion
- Change shape of object

**Types of Forces:**

1. **Contact Forces** (objects must touch)
   - Muscular force: force by muscles (pushing, lifting)
   - Friction: force that opposes motion between surfaces
   - Normal force: perpendicular force from surface

2. **Non-contact Forces** (work at distance)
   - Magnetic force: attraction between magnet and iron
   - Electrostatic force: between charged objects
   - Gravitational force: attraction between any two masses

**Friction:**
- Opposes relative motion
- Causes heat (rubbing hands)
- Useful: walking, brakes, writing
- Harmful: wears out shoe soles, machine parts

**Pressure:**
Pressure = Force ÷ Area

- Same force on smaller area → more pressure
- Sharp knife cuts easily (small area → high pressure)
- Camel's flat feet → spreads weight → less pressure on sand
- School bag with broad straps → less pressure on shoulders

**Atmospheric Pressure:**
- Air has weight → exerts pressure on everything
- Decreases with altitude (less air above)
- 1 atmosphere = 101,325 Pa`,
        keyPoints: ['Pressure = Force ÷ Area', 'Friction opposes motion', 'Atmospheric pressure decreases with altitude'],
        quiz: [
          { q: 'Pressure formula is?', options: ['Force × Area', 'Force ÷ Area', 'Area ÷ Force', 'Force + Area'], answer: 'Force ÷ Area' },
          { q: 'Gravitational force is a?', options: ['Contact force', 'Non-contact force', 'Muscular force', 'Friction'], answer: 'Non-contact force' },
          { q: 'Friction is useful in?', options: ['Sliding on ice', 'Walking', 'Flying', 'Swimming'], answer: 'Walking' },
        ]
      },
      {
        id: 'c8-sci-4',
        chapter: 16,
        title: 'Light',
        content: `Light is a form of energy that helps us see objects.

**Properties of Light:**
- Travels in straight lines (rectilinear propagation)
- Travels at 3 × 10⁸ m/s (speed of light)
- Can travel through vacuum (no medium needed)

**Reflection of Light:**
- Light bounces back from a smooth surface
- Laws of Reflection:
  1. Angle of incidence = Angle of reflection
  2. Incident ray, reflected ray, and normal are in same plane

**Types of Mirrors:**

1. **Plane Mirror**
   - Image: Virtual, erect, same size, laterally inverted
   - Use: Looking glass, periscopes

2. **Concave Mirror**
   - Curved inward (cave shape)
   - Converges light (focuses it)
   - Use: Torch, dentist's mirror, solar cooker
   - Can form real or virtual images

3. **Convex Mirror**
   - Curved outward
   - Diverges light
   - Image: Always virtual, erect, diminished
   - Use: Rear-view mirror in vehicles (wide field of view)

**Refraction:**
- Bending of light when it passes from one medium to another
- Pencil looks bent in water (refraction)
- Lens in spectacles uses refraction

**Human Eye:**
- Pupil: controls light entering
- Lens: focuses image on retina
- Retina: receives image
- Optic nerve: sends signal to brain

**Defects of Vision:**
- Myopia (short sight): cannot see far → concave lens
- Hypermetropia (long sight): cannot see near → convex lens`,
        keyPoints: ['Light travels at 3×10⁸ m/s', 'Convex mirror used as rear-view mirror', 'Myopia is corrected by concave lens'],
        quiz: [
          { q: 'Rear-view mirrors in cars are?', options: ['Plane', 'Concave', 'Convex', 'Bifocal'], answer: 'Convex' },
          { q: 'Angle of incidence equals?', options: ['90°', 'Angle of refraction', 'Angle of reflection', '45°'], answer: 'Angle of reflection' },
          { q: 'Myopia is corrected by?', options: ['Convex lens', 'Concave lens', 'Plane glass', 'Bifocal lens'], answer: 'Concave lens' },
        ]
      },
    ],
    Mathematics: [
      {
        id: 'c8-math-1',
        chapter: 1,
        title: 'Rational Numbers',
        content: `Rational numbers are numbers that can be written as p/q where q ≠ 0.

**Examples of Rational Numbers:**
- 3/4, -5/7, 0, 1, -2, 0.5 (= 1/2), -1.25 (= -5/4)

**Properties:**

1. **Closure** — result is always a rational number:
   - Addition ✅, Subtraction ✅, Multiplication ✅
   - Division ✅ (except dividing by zero)

2. **Commutative:**
   - a + b = b + a ✅
   - a × b = b × a ✅
   - a - b ≠ b - a ❌ (not commutative)

3. **Associative:**
   - (a + b) + c = a + (b + c) ✅
   - (a × b) × c = a × (b × c) ✅

4. **Distributive:**
   - a × (b + c) = (a × b) + (a × c)

5. **Identities:**
   - Additive identity: 0
   - Multiplicative identity: 1

6. **Inverse:**
   - Additive inverse of 3/4 is -3/4 (sum = 0)
   - Multiplicative inverse of 3/4 is 4/3 (product = 1)

**Operations:**
Addition: 1/3 + 1/4 = 4/12 + 3/12 = 7/12 (find LCM)
Multiplication: 2/3 × 3/4 = 6/12 = 1/2
Division: 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6

**Rational Numbers on Number Line:**
Every rational number has a unique position on the number line
Between any two rational numbers, there are infinite rational numbers`,
        keyPoints: ['p/q form where q ≠ 0', 'Additive identity is 0', 'Multiplicative inverse of p/q is q/p'],
        quiz: [
          { q: 'Multiplicative inverse of 3/4?', options: ['4/3', '-3/4', '3/4', '-4/3'], answer: '4/3' },
          { q: '1/3 + 1/4 = ?', options: ['2/7', '7/12', '5/12', '1/6'], answer: '7/12' },
          { q: 'Additive identity for rational numbers?', options: ['1', '-1', '0', '1/2'], answer: '0' },
        ]
      },
    ],
    'Social Science': [
      {
        id: 'c8-sst-1',
        chapter: 1,
        title: 'How, When and Where — Modern India',
        content: `Modern Indian history begins around 1750 when British started gaining control.

**British Rule in India:**
- 1600: British East India Company formed
- 1757: Battle of Plassey — British defeated Nawab of Bengal
- 1764: Battle of Buxar — British gained firm control
- 1857: First War of Independence (Sepoy Mutiny)
- 1858: British Crown took direct control from Company
- 1947: India got independence on August 15

**Administrative Changes under British:**

1. **Revenue System:**
   - Permanent Settlement (1793) in Bengal — land revenue fixed
   - Ryotwari system in Madras (Tamil Nadu) — farmers paid directly

2. **Transportation:**
   - Railways introduced in 1853 (Mumbai to Thane)
   - Connected India for trade and military movement
   - Tamil Nadu: Chennai Central is one of oldest stations

3. **Communication:**
   - Telegraph introduced
   - English education spread

**Nationalism:**
- Indians started demanding freedom
- Congress formed 1885
- Freedom movements: Non-cooperation (1920), Quit India (1942)

**Tamil Nadu Freedom Fighters:**
- V.O. Chidambaram Pillai — anti-British shipping company
- Subramania Bharati — poet and freedom fighter
- Periyar E.V. Ramasamy — social reform leader`,
        keyPoints: ['Battle of Plassey in 1757', 'First railways in 1853', 'Tamil Nadu used Ryotwari system'],
        quiz: [
          { q: 'Battle of Plassey was in?', options: ['1600', '1757', '1857', '1947'], answer: '1757' },
          { q: 'First railway in India ran between?', options: ['Delhi-Agra', 'Chennai-Bengaluru', 'Mumbai-Thane', 'Kolkata-Delhi'], answer: 'Mumbai-Thane' },
          { q: 'Subramania Bharati was a?', options: ['Politician', 'Poet and freedom fighter', 'Scientist', 'Soldier'], answer: 'Poet and freedom fighter' },
        ]
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CLASS 9
  // ══════════════════════════════════════════════════════
  '9': {
    Science: [
      {
        id: 'c9-sci-1',
        chapter: 1,
        title: 'Matter in Our Surroundings',
        content: `Matter is anything that has mass and occupies space.

**States of Matter:**

1. **Solid**
   - Definite shape and volume
   - Particles closely packed, strong intermolecular forces
   - Particles vibrate but don't move freely
   - Examples: ice, iron, wood, stone

2. **Liquid**
   - Definite volume, no definite shape
   - Particles less tightly packed than solid
   - Can flow, takes shape of container
   - Examples: water, milk, juice, mercury

3. **Gas**
   - No definite shape or volume
   - Particles far apart, weak forces
   - Can be compressed easily
   - Examples: air, steam, LPG

**Changes of State:**
- Melting (Solid → Liquid): ice melts at 0°C
- Boiling/Evaporation (Liquid → Gas): water boils at 100°C
- Condensation (Gas → Liquid): steam → water
- Freezing (Liquid → Solid): water → ice
- Sublimation (Solid → Gas directly): dry ice (CO₂), camphor, naphthalene

**Latent Heat:**
- Heat absorbed during state change WITHOUT temperature change
- Latent heat of fusion: heat to melt 1 kg solid at melting point
- Latent heat of vaporisation: heat to vaporise 1 kg liquid at boiling point

**Effect of Pressure:**
- Increasing pressure: gas → liquid (LPG in cylinder is under pressure)
- High pressure + low temperature → gases liquefy

**Plasma and BEC:**
- Plasma: 4th state — ionised gas at very high temperature (sun, stars, neon signs)
- Bose-Einstein Condensate (BEC): 5th state — at near absolute zero (-273.15°C)`,
        keyPoints: ['Sublimation: solid directly becomes gas', 'LPG is stored as liquid under pressure', 'Plasma is the 4th state of matter'],
        quiz: [
          { q: 'Camphor undergoes?', options: ['Melting', 'Boiling', 'Sublimation', 'Condensation'], answer: 'Sublimation' },
          { q: 'Water boils at?', options: ['0°C', '100°C', '37°C', '273°C'], answer: '100°C' },
          { q: 'Plasma is?', options: ['1st state', '2nd state', '3rd state', '4th state'], answer: '4th state' },
        ]
      },
      {
        id: 'c9-sci-2',
        chapter: 8,
        title: 'Motion',
        content: `Motion is the change in position of an object with time.

**Key Terms:**

- **Distance**: Total path length covered (scalar — only magnitude)
- **Displacement**: Shortest path from initial to final position (vector — has direction)
- **Speed**: Distance / Time (scalar)
- **Velocity**: Displacement / Time (vector)
- **Acceleration**: Rate of change of velocity = (v - u) / t

**Uniform and Non-uniform Motion:**
- Uniform: Equal distances in equal time intervals (constant velocity)
- Non-uniform: Unequal distances (varying velocity)

**Equations of Motion:**
(u = initial velocity, v = final velocity, a = acceleration, t = time, s = displacement)

1. **v = u + at**
2. **s = ut + ½at²**
3. **v² = u² + 2as**

**Graphs:**
- Distance-Time graph: Slope = Speed
  - Straight line = uniform motion
  - Curved line = non-uniform motion
- Velocity-Time graph: Slope = Acceleration
  - Area under graph = Distance

**Circular Motion:**
- Object moves in circle with constant speed but changing direction
- Speed is constant but velocity changes (direction changes)
- Hence it is accelerated motion (centripetal acceleration)

**Example Problems:**
A car starts from rest (u=0) and reaches 60 m/s in 10s.
- Acceleration = (60-0)/10 = 6 m/s²
- Distance = 0×10 + ½×6×100 = 300 m`,
        keyPoints: ['v = u + at is first equation of motion', 'Area under v-t graph = distance', 'Circular motion has changing velocity'],
        quiz: [
          { q: 'What is slope of distance-time graph?', options: ['Acceleration', 'Speed', 'Displacement', 'Force'], answer: 'Speed' },
          { q: 'First equation of motion is?', options: ['v² = u² + 2as', 's = ut + ½at²', 'v = u + at', 'F = ma'], answer: 'v = u + at' },
          { q: 'Velocity is?', options: ['Scalar', 'Vector', 'Both', 'Neither'], answer: 'Vector' },
        ]
      },
      {
        id: 'c9-sci-3',
        chapter: 9,
        title: 'Force and Laws of Motion',
        content: `Force is a push or pull that changes state of rest or motion.

**Newton's Three Laws of Motion:**

**First Law (Law of Inertia):**
"An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force."

- Inertia = tendency to resist change
- More mass = more inertia
- Examples:
  - Passengers jerk forward when bus stops suddenly
  - Tablecloth pulled quickly — dishes stay in place
  - Dust from carpet when beaten

**Second Law:**
F = ma (Force = mass × acceleration)
- SI unit of force: Newton (N) = kg⋅m/s²
- More force → more acceleration (same mass)
- More mass → less acceleration (same force)

**Third Law:**
"For every action, there is an equal and opposite reaction."
- Forces act on DIFFERENT objects
- Examples:
  - Walking: foot pushes ground backward → ground pushes foot forward
  - Rocket: gas pushed down → rocket goes up
  - Swimming: hands push water back → person moves forward
  - Recoil of gun: bullet goes forward → gun recoils backward

**Momentum:**
p = m × v (mass × velocity)
- SI unit: kg⋅m/s
- Law of Conservation of Momentum:
  In the absence of external force, total momentum remains constant

**Example:**
Rifle (mass 5 kg) fires bullet (mass 10 g = 0.01 kg) at 500 m/s
Using conservation of momentum:
0 = 0.01 × 500 + 5 × v
v = -1 m/s (rifle recoils at 1 m/s backward)`,
        keyPoints: ['F = ma is Newton\'s Second Law', 'Momentum = mass × velocity', 'Third law: equal and opposite reaction'],
        quiz: [
          { q: 'SI unit of force is?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton' },
          { q: 'Rocket works on Newton\'s?', options: ['First law', 'Second law', 'Third law', 'Law of gravity'], answer: 'Third law' },
          { q: 'Momentum = ?', options: ['mass + velocity', 'mass × velocity', 'mass ÷ velocity', 'force × time'], answer: 'mass × velocity' },
        ]
      },
    ],
    Mathematics: [
      {
        id: 'c9-math-1',
        chapter: 1,
        title: 'Number Systems',
        content: `Numbers are classified into different types based on their properties.

**Types of Numbers:**

1. **Natural Numbers (N)**: 1, 2, 3, 4, ...
   - Counting numbers
   - Start from 1

2. **Whole Numbers (W)**: 0, 1, 2, 3, ...
   - Natural numbers + 0

3. **Integers (Z)**: ..., -3, -2, -1, 0, 1, 2, 3, ...
   - Positive and negative whole numbers

4. **Rational Numbers (Q)**: p/q where p,q are integers and q≠0
   - Examples: 1/2, -3/4, 0.5, 0.333...
   - Decimal form: terminating or recurring
   - 1/4 = 0.25 (terminating)
   - 1/3 = 0.333... (recurring)

5. **Irrational Numbers**: Cannot be written as p/q
   - Examples: √2, √3, √5, π, e
   - Non-terminating, non-recurring decimals
   - √2 = 1.41421356...
   - π = 3.14159265...

6. **Real Numbers (R)**: Rational + Irrational
   - Every point on number line is a real number
   - N ⊂ W ⊂ Z ⊂ Q ⊂ R

**Operations on Real Numbers:**
- √a × √b = √(ab)
- √a ÷ √b = √(a/b)
- (√a)² = a

**Rationalisation:**
To remove surd from denominator:
1/(√2) = (√2)/(√2 × √2) = √2/2

**Laws of Exponents:**
- aᵐ × aⁿ = aᵐ⁺ⁿ
- aᵐ ÷ aⁿ = aᵐ⁻ⁿ
- (aᵐ)ⁿ = aᵐⁿ
- a⁰ = 1
- a⁻ⁿ = 1/aⁿ`,
        keyPoints: ['Irrational numbers cannot be written as p/q', 'π and √2 are irrational', 'Every rational has terminating or recurring decimal'],
        quiz: [
          { q: '√2 is?', options: ['Rational', 'Irrational', 'Integer', 'Natural number'], answer: 'Irrational' },
          { q: '1/3 in decimal is?', options: ['0.3', '0.33', '0.333...', '3.0'], answer: '0.333...' },
          { q: 'a⁰ = ?', options: ['0', '1', 'a', 'Undefined'], answer: '1' },
        ]
      },
    ],
    'Social Science': [
      {
        id: 'c9-sst-1',
        chapter: 1,
        title: 'The French Revolution',
        content: `The French Revolution (1789) was a turning point in world history that ended monarchy and established democratic ideals.

**Background — The Old Regime:**
- Society divided into Three Estates:
  1. First Estate: Clergy (church)
  2. Second Estate: Nobility
  3. Third Estate: Common people (97% of population) — paid all taxes

**Causes of Revolution:**

1. **Social:** Inequality — clergy and nobles had privileges, peasants had none
2. **Political:** Weak king Louis XVI, absolute monarchy
3. **Economic:** France in debt, poor harvests → bread prices rose
4. **Intellectual:** Ideas of Rousseau and Voltaire — freedom and equality

**Key Events:**

- **May 1789:** Estates-General meeting — Third Estate walked out
- **June 1789:** National Assembly formed — Tennis Court Oath taken
- **July 14, 1789:** Bastille stormed — symbolic start of Revolution
- **1789:** Declaration of Rights of Man — "Liberty, Equality, Fraternity"
- **1792:** France became Republic, Louis XVI arrested
- **1793:** Reign of Terror — Robespierre's radical phase, mass executions
- **1799:** Napoleon Bonaparte took power
- **1804:** Napoleon crowned Emperor

**Impact:**
- End of feudalism in France
- Rights of citizens declared
- Spread democratic ideas across Europe and the world
- Inspired Indian freedom movement

**Tamil Nadu Connection:**
- French had settlement at Pondicherry (now Puducherry)
- French influence visible in Pondicherry architecture today`,
        keyPoints: ['Bastille stormed on July 14, 1789', '"Liberty, Equality, Fraternity" is French motto', 'Pondicherry was French settlement in Tamil Nadu'],
        quiz: [
          { q: 'Bastille was stormed on?', options: ['July 4, 1776', 'July 14, 1789', 'August 15, 1947', 'June 21, 1793'], answer: 'July 14, 1789' },
          { q: 'French national motto is?', options: ['Democracy, Republic, Nationalism', 'Liberty, Equality, Fraternity', 'Faith, Hope, Charity', 'Peace, Justice, Freedom'], answer: 'Liberty, Equality, Fraternity' },
          { q: 'French settlement in Tamil Nadu was?', options: ['Chennai', 'Madurai', 'Pondicherry', 'Coimbatore'], answer: 'Pondicherry' },
        ]
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CLASS 10
  // ══════════════════════════════════════════════════════
  '10': {
    Science: [
      {
        id: 'c10-sci-1',
        chapter: 1,
        title: 'Chemical Reactions and Equations',
        content: `A chemical reaction involves breaking and forming chemical bonds.

**Chemical Equation:**
Word equation: Magnesium + Oxygen → Magnesium Oxide
Symbol equation: 2Mg + O₂ → 2MgO (balanced)

**Balancing Equations:**
Law of Conservation of Mass — atoms cannot be created or destroyed
- Count atoms on both sides
- Add coefficients to balance

**Types of Chemical Reactions:**

1. **Combination Reaction:**
   A + B → AB
   CaO + H₂O → Ca(OH)₂ (calcium oxide + water → calcium hydroxide)
   Exothermic (releases heat)

2. **Decomposition Reaction:**
   AB → A + B
   2H₂O → 2H₂ + O₂ (electrolysis of water)
   CaCO₃ → CaO + CO₂ (heating limestone)
   Types: Thermal, Electrolytic, Photolytic

3. **Displacement Reaction:**
   More reactive metal displaces less reactive
   Fe + CuSO₄ → FeSO₄ + Cu (iron more reactive than copper)
   Zn + H₂SO₄ → ZnSO₄ + H₂

4. **Double Displacement (Precipitation):**
   AB + CD → AD + CB
   Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl (BaSO₄ is white precipitate)

5. **Redox Reactions:**
   - Oxidation: loss of electrons (or gain of oxygen)
   - Reduction: gain of electrons (or loss of oxygen)
   - They always occur together (one oxidizes, other reduces)

**Corrosion:**
- Rusting of iron: Fe + O₂ + H₂O → Fe₂O₃.xH₂O
- Prevention: painting, galvanizing, alloying

**Rancidity:**
- Fats and oils oxidize → bad smell (rancid)
- Prevention: antioxidants, vacuum packing, nitrogen atmosphere`,
        keyPoints: ['Balancing uses Law of Conservation of Mass', 'Redox reactions always occur together', 'Rusting is corrosion of iron'],
        quiz: [
          { q: 'Type of reaction: CaCO₃ → CaO + CO₂ ?', options: ['Combination', 'Decomposition', 'Displacement', 'Redox'], answer: 'Decomposition' },
          { q: 'Rusting of iron is?', options: ['Rancidity', 'Corrosion', 'Decomposition', 'Displacement'], answer: 'Corrosion' },
          { q: 'Oxidation means?', options: ['Gain of electrons', 'Loss of electrons', 'Gain of protons', 'Loss of protons'], answer: 'Loss of electrons' },
        ]
      },
      {
        id: 'c10-sci-2',
        chapter: 12,
        title: 'Electricity',
        content: `Electricity is the flow of electric charges through a conductor.

**Key Terms:**

- **Electric Charge**: Property of particles (positive/negative), unit: Coulomb (C)
- **Electric Current**: Flow of charges, I = Q/t, unit: Ampere (A)
- **Electric Potential**: Work done to bring unit charge from infinity, unit: Volt (V)
- **Potential Difference**: V = W/Q, measured by Voltmeter

**Ohm's Law:**
V = IR (Voltage = Current × Resistance)
- Valid when temperature is constant
- Resistance unit: Ohm (Ω)

**Resistance Depends on:**
R = ρl/A
- ρ (resistivity): property of material
- l: length (longer → more resistance)
- A: cross-sectional area (thicker → less resistance)
- Temperature (higher temp → more resistance for metals)

**Resistors in Series:**
- Same current through all
- R_total = R₁ + R₂ + R₃
- Voltage divides

**Resistors in Parallel:**
- Same voltage across all
- 1/R_total = 1/R₁ + 1/R₂ + 1/R₃
- Current divides
- R_total is LESS than smallest individual resistance

**Electric Power:**
P = VI = I²R = V²/R
Unit: Watt (W)
1 kWh = 1 unit of electricity = 3.6 × 10⁶ J

**Heating Effect of Current (Joule's Law):**
H = I²Rt
- Used in: electric heater, toaster, iron, bulb filament

**Tamil Nadu Electricity:**
- TANGEDCO (Tamil Nadu Generation and Distribution Corporation)
- Major power plants: Neyveli thermal, Kudankulam nuclear`,
        keyPoints: ['V = IR is Ohm\'s Law', 'In parallel, voltage is same across all', '1 kWh = 1 unit of electricity'],
        quiz: [
          { q: 'Ohm\'s Law formula?', options: ['V = IR', 'I = VR', 'R = VI', 'P = VI'], answer: 'V = IR' },
          { q: 'In series circuit, what is same?', options: ['Voltage', 'Current', 'Resistance', 'Power'], answer: 'Current' },
          { q: 'Unit of electric power?', options: ['Joule', 'Ohm', 'Watt', 'Ampere'], answer: 'Watt' },
        ]
      },
    ],
    Mathematics: [
      {
        id: 'c10-math-1',
        chapter: 1,
        title: 'Real Numbers',
        content: `Real numbers include all rational and irrational numbers.

**Euclid's Division Algorithm:**
For any two positive integers a and b:
a = bq + r, where 0 ≤ r < b

Used to find HCF:
Example: HCF of 135 and 225
225 = 135 × 1 + 90
135 = 90 × 1 + 45
90 = 45 × 2 + 0
So HCF = 45 ✓

**Fundamental Theorem of Arithmetic:**
Every integer greater than 1 can be expressed as a unique product of prime numbers.
Example: 120 = 2³ × 3 × 5

**HCF and LCM using Prime Factorisation:**
HCF = product of smallest power of common prime factors
LCM = product of greatest power of all prime factors
HCF × LCM = Product of two numbers

**Irrational Numbers:**
Proof that √2 is irrational:
(Proof by contradiction)
Assume √2 = p/q (in lowest terms)
Then 2 = p²/q² → p² = 2q²
So p is even → p = 2m
Then 4m² = 2q² → q² = 2m²
So q is also even → contradiction (p and q should have no common factor)
Therefore √2 is irrational ✓

**Decimal Representation:**
- Rational: terminating or recurring decimals
  - 7/8 = 0.875 (terminating — denominator has only 2 and 5 as factors)
  - 1/6 = 0.1666... (recurring)
- Irrational: non-terminating, non-recurring`,
        keyPoints: ['HCF × LCM = product of two numbers', '√2 is irrational (proven by contradiction)', 'Terminating decimal has 2 and 5 only in denominator'],
        quiz: [
          { q: 'HCF × LCM of two numbers = ?', options: ['Sum of numbers', 'Product of numbers', 'Difference of numbers', 'Square of numbers'], answer: 'Product of numbers' },
          { q: 'Which decimal is terminating?', options: ['1/3', '1/7', '7/8', '5/6'], answer: '7/8' },
          { q: '√2 is?', options: ['Rational', 'Irrational', 'Integer', 'Natural'], answer: 'Irrational' },
        ]
      },
      {
        id: 'c10-math-2',
        chapter: 3,
        title: 'Pair of Linear Equations in Two Variables',
        content: `A linear equation in two variables: ax + by + c = 0

**Graphical Representation:**
Every linear equation represents a straight line on a graph.

**Types of Solutions:**
- Intersecting lines: Unique solution (consistent)
- Parallel lines: No solution (inconsistent)  
- Coincident lines: Infinite solutions (dependent)

**Condition:**
For a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0:
- Unique solution: a₁/a₂ ≠ b₁/b₂
- No solution: a₁/a₂ = b₁/b₂ ≠ c₁/c₂
- Infinite solutions: a₁/a₂ = b₁/b₂ = c₁/c₂

**Methods of Solution:**

1. **Substitution Method:**
   From one equation, express x in terms of y
   Substitute in second equation → solve for y → find x

2. **Elimination Method:**
   Multiply equations to make coefficient of one variable equal
   Subtract to eliminate that variable → solve remaining

3. **Cross Multiplication Method:**
   x/(b₁c₂-b₂c₁) = y/(c₁a₂-c₂a₁) = 1/(a₁b₂-a₂b₁)

**Example (Elimination):**
2x + 3y = 7 ... (1)
4x - y = 1  ... (2)
Multiply (2) by 3: 12x - 3y = 3 ... (3)
Add (1) and (3): 14x = 10, x = 5/7
Substitute: 2(5/7) + 3y = 7 → y = 39/21 = 13/7`,
        keyPoints: ['Intersecting lines give unique solution', 'Parallel lines give no solution', 'Elimination method makes one variable disappear'],
        quiz: [
          { q: 'Parallel lines give?', options: ['Unique solution', 'No solution', 'Infinite solutions', 'Two solutions'], answer: 'No solution' },
          { q: 'Coincident lines give?', options: ['Unique solution', 'No solution', 'Infinite solutions', 'Two solutions'], answer: 'Infinite solutions' },
          { q: 'Linear equation in two variables represents?', options: ['A point', 'A straight line', 'A curve', 'A circle'], answer: 'A straight line' },
        ]
      },
    ],
    'Social Science': [
      {
        id: 'c10-sst-1',
        chapter: 1,
        title: 'The Rise of Nationalism in Europe',
        content: `Nationalism is the feeling of pride and loyalty towards one's nation.

**Meaning of Nationalism:**
Before 19th century, Europe was divided into many kingdoms.
People identified with their ruler/religion, not with a 'nation.'
Nationalism changed this — people felt they belonged to a nation with common language, culture, and history.

**French Revolution and Nationalism:**
- First spread idea of liberty and democracy
- Napoleon's armies carried revolutionary ideas across Europe
- Inspired people to overthrow old regimes

**Romantic Nationalism:**
- Artists, poets expressed national feelings through culture
- German composer Beethoven, Polish poet Mickiewicz
- Folk songs, stories, myths — created sense of shared identity

**Unification of Germany (1866-71):**
- Prussia's chancellor Bismarck used "Blood and Iron" policy
- Three wars: against Denmark, Austria, France
- 1871: German Empire proclaimed at Versailles
- Kaiser Wilhelm I became Emperor

**Unification of Italy:**
- Three heroes: Mazzini (Young Italy movement), Garibaldi (Red Shirts army), Cavour (diplomat)
- 1861: Kingdom of Italy formed
- 1870: Rome became capital

**Balkans — Cause of WWI:**
- Ottoman Empire weakening — Balkan nations wanted independence
- Russia and Austria-Hungary competed for influence
- Serbia's nationalism → assassination of Archduke Franz Ferdinand → World War I

**Key Terms:**
- Nation-state: a country where people share common identity
- Self-determination: right of people to choose their own government
- Nationalism: loyalty to one's nation`,
        keyPoints: ['Napoleon spread revolutionary ideas', 'Bismarck unified Germany', 'Balkans conflict led to WWI'],
        quiz: [
          { q: 'Bismarck\'s policy was called?', options: ['Blood and Iron', 'Divide and Rule', 'Salt and Sword', 'Fire and Fury'], answer: 'Blood and Iron' },
          { q: 'Who led the Red Shirts in Italy?', options: ['Mazzini', 'Garibaldi', 'Cavour', 'Napoleon'], answer: 'Garibaldi' },
          { q: 'German Empire proclaimed in?', options: ['1848', '1861', '1871', '1914'], answer: '1871' },
        ]
      },
    ],
  },
}

// ── Get chapters for a class and subject ──────────────────
const getChapters = (grade, subject) => {
  const classData = NCERT_CONTENT[String(grade)]
  if (!classData) return []
  const subjectData = classData[subject]
  if (!subjectData) return []
  return subjectData.map(ch => ({
    id:       ch.id,
    chapter:  ch.chapter,
    title:    ch.title,
    preview:  ch.content.slice(0, 120) + '...',
    hasQuiz:  ch.quiz?.length > 0,
  }))
}

// ── Get full chapter content ───────────────────────────────
const getChapterContent = (contentId) => {
  for (const grade of Object.keys(NCERT_CONTENT)) {
    const classData = NCERT_CONTENT[grade]
    for (const subject of Object.keys(classData)) {
      const chapter = classData[subject].find(ch => ch.id === contentId)
      if (chapter) return { ...chapter, grade: `Class ${grade}`, subject }
    }
  }
  return null
}

// ── Get available subjects for a class ───────────────────
const getSubjectsForClass = (grade) => {
  const classData = NCERT_CONTENT[String(grade)]
  if (!classData) return []
  return Object.keys(classData).map(subject => ({
    subject,
    chapterCount: classData[subject].length,
  }))
}

const SUPPORTED_GRADES   = Object.keys(NCERT_CONTENT)
const SUPPORTED_SUBJECTS = ['Science', 'Mathematics', 'English', 'Social Science', 'Hindi', 'Physics', 'Chemistry', 'Biology']

module.exports = {
  NCERT_CONTENT,
  getChapters,
  getChapterContent,
  getSubjectsForClass,
  SUPPORTED_GRADES,
  SUPPORTED_SUBJECTS,
}