require('dotenv').config();
const mongoose = require('mongoose');
const CourseData = require('./models/CourseData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thirannexus';

const seedData = [
  // ── BIOLOGY – Unit 1 ──────────────────────────────────────────────────────
  {
    className: 'Class 12',
    subjectName: 'Biology',
    unitNumber: 1,
    unitTitle: 'Reproduction in Organisms',
    content: {
      text: `
<h2>Unit 1: Reproduction in Organisms</h2>
<p>Reproduction is a fundamental characteristic of living organisms that ensures the continuity of species. It is defined as the biological process by which an organism gives rise to offspring similar to itself.</p>

<h3>Types of Reproduction</h3>
<h4>1. Asexual Reproduction</h4>
<p>In asexual reproduction, a single parent produces offspring without the formation of gametes. The offspring are genetically identical to the parent (clones).</p>
<ul>
  <li><strong>Binary Fission</strong> – The parent cell divides into two equal daughter cells (e.g., Amoeba, Bacteria).</li>
  <li><strong>Budding</strong> – A small outgrowth (bud) develops on the parent body and eventually detaches (e.g., Hydra, Yeast).</li>
  <li><strong>Fragmentation</strong> – The body breaks into fragments, each capable of growing into a new individual (e.g., Spirogyra).</li>
  <li><strong>Sporulation</strong> – Formation of spores that germinate under favorable conditions (e.g., Rhizopus).</li>
  <li><strong>Vegetative Propagation</strong> – New plants arise from vegetative parts like roots, stems, and leaves (e.g., Potato tubers, Ginger rhizomes).</li>
</ul>

<h4>2. Sexual Reproduction</h4>
<p>Sexual reproduction involves the fusion of male and female gametes to form a zygote. It introduces genetic variation and is the predominant mode in higher organisms.</p>
<ul>
  <li><strong>Pre-fertilisation events</strong> – Gametogenesis and Gamete transfer.</li>
  <li><strong>Fertilisation</strong> – Fusion of male and female gametes (Syngamy).</li>
  <li><strong>Post-fertilisation events</strong> – Zygote development and Embryogenesis.</li>
</ul>

<h3>Key Terms</h3>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:100%;">
  <tr style="background:#7c3aed;color:white;"><th>Term</th><th>Definition</th></tr>
  <tr><td>Gamete</td><td>A mature haploid reproductive cell (sperm or egg)</td></tr>
  <tr><td>Zygote</td><td>The fertilised egg (diploid) formed by fusion of two gametes</td></tr>
  <tr><td>Gametogenesis</td><td>The process of formation of gametes</td></tr>
  <tr><td>Embryogenesis</td><td>The development of the embryo from the zygote</td></tr>
  <tr><td>Clone</td><td>Organisms genetically identical to the parent</td></tr>
</table>

<h3>Life Span of Organisms</h3>
<p>The period from birth to natural death is called the <strong>life span</strong>. It varies greatly among organisms – Rice completes its life cycle in 3–4 months, while a Banyan tree may live for hundreds of years. Reproduction marks the end of a juvenile phase and the beginning of the reproductive phase.</p>
      `,
      videoUrl: 'https://www.youtube.com/embed/8mWbGkSNKVc',
      signLanguageVideoUrl: 'https://www.youtube.com/embed/R4Kq0-wjlUI',
      quiz: [
        {
          question: 'Which of the following is an example of asexual reproduction by budding?',
          options: ['Amoeba', 'Hydra', 'Spirogyra', 'Rhizopus'],
          correctAnswer: 1,
          explanation: 'Hydra reproduces by budding, where a small outgrowth forms on the parent body and detaches to form a new individual.'
        },
        {
          question: 'The fusion of male and female gametes is called:',
          options: ['Gametogenesis', 'Embryogenesis', 'Syngamy', 'Sporulation'],
          correctAnswer: 2,
          explanation: 'Syngamy refers to the fusion of male and female gametes to form a zygote.'
        },
        {
          question: 'Offspring produced by asexual reproduction are genetically:',
          options: ['Different from parent', 'Identical to parent (clones)', 'Half identical', 'Random'],
          correctAnswer: 1,
          explanation: 'Asexual reproduction involves only one parent; offspring are genetically identical clones.'
        },
        {
          question: 'Which plant part is used in vegetative propagation of Potato?',
          options: ['Root', 'Leaf', 'Tuber (modified stem)', 'Seed'],
          correctAnswer: 2,
          explanation: 'Potato tubers are modified underground stems that can sprout and grow into new plants.'
        },
        {
          question: 'The life span of Rice plant is approximately:',
          options: ['3–4 months', '1–2 years', '5–10 years', '100 years'],
          correctAnswer: 0,
          explanation: 'Rice completes its life cycle within 3–4 months under normal conditions.'
        }
      ]
    }
  },
  // ── BIOLOGY – Unit 2 ──────────────────────────────────────────────────────
  {
    className: 'Class 12',
    subjectName: 'Biology',
    unitNumber: 2,
    unitTitle: 'Sexual Reproduction in Flowering Plants',
    content: {
      text: `
<h2>Unit 2: Sexual Reproduction in Flowering Plants</h2>
<p>Flowering plants (Angiosperms) are the most evolved group of plants. They reproduce sexually through flowers, which are the reproductive organs.</p>

<h3>Structure of a Flower</h3>
<p>A typical flower has four whorls:</p>
<ul>
  <li><strong>Calyx</strong> – Outermost whorl made of Sepals (green, protect the bud).</li>
  <li><strong>Corolla</strong> – Made of Petals (colourful, attract pollinators).</li>
  <li><strong>Androecium</strong> – The male reproductive organ made of Stamens (Filament + Anther).</li>
  <li><strong>Gynoecium</strong> – The female reproductive organ made of Pistil/Carpel (Stigma + Style + Ovary).</li>
</ul>

<h3>Pollination</h3>
<p>Pollination is the transfer of pollen grains from the anther to the stigma of a flower.</p>
<ul>
  <li><strong>Self-pollination (Autogamy)</strong> – Pollen is transferred within the same flower.</li>
  <li><strong>Cross-pollination (Allogamy)</strong> – Pollen is transferred from one flower to another of a different plant.</li>
</ul>

<h4>Agents of Pollination</h4>
<ul>
  <li>Wind (Anemophily) – e.g., Maize, Wheat</li>
  <li>Water (Hydrophily) – e.g., Vallisneria</li>
  <li>Insects (Entomophily) – e.g., Salvia, Rose</li>
  <li>Birds (Ornithophily) – e.g., Strelitzia</li>
  <li>Bats (Chiropterophily) – e.g., Kigelia</li>
</ul>

<h3>Fertilisation in Angiosperms</h3>
<p>A unique feature of flowering plants is <strong>Double Fertilisation</strong>:</p>
<ol>
  <li>One male gamete fuses with the egg cell → forms the <strong>Zygote (2n)</strong>.</li>
  <li>The second male gamete fuses with the two polar nuclei → forms the <strong>Primary Endosperm Nucleus (3n)</strong>.</li>
</ol>
<p>This process is called <strong>Triple Fusion</strong> when the second gamete fuses with the secondary nucleus.</p>

<h3>Fruits and Seeds</h3>
<p>After fertilisation, the ovary develops into a <strong>Fruit</strong> and the ovule develops into a <strong>Seed</strong>. The seed contains the embryo that will give rise to the next generation.</p>
      `,
      videoUrl: 'https://www.youtube.com/embed/OGLA5aHYtqM',
      signLanguageVideoUrl: 'https://www.youtube.com/embed/6-8a7_pfh08',
      quiz: [
        {
          question: 'Which whorl of a flower contains the female reproductive organ?',
          options: ['Calyx', 'Corolla', 'Androecium', 'Gynoecium'],
          correctAnswer: 3,
          explanation: 'Gynoecium is the female reproductive whorl containing the Pistil (Stigma, Style, Ovary).'
        },
        {
          question: 'Transfer of pollen grains from the anther to the stigma is called:',
          options: ['Fertilisation', 'Pollination', 'Germination', 'Reproduction'],
          correctAnswer: 1,
          explanation: 'Pollination is the process of transfer of pollen grains from the anther to the stigma.'
        },
        {
          question: 'Double fertilisation is a characteristic feature of:',
          options: ['Gymnosperms', 'Bryophytes', 'Angiosperms', 'Pteridophytes'],
          correctAnswer: 2,
          explanation: 'Double fertilisation is unique to Angiosperms (flowering plants).'
        },
        {
          question: 'What is the ploidy level of the Primary Endosperm Nucleus formed after triple fusion?',
          options: ['Haploid (n)', 'Diploid (2n)', 'Triploid (3n)', 'Tetraploid (4n)'],
          correctAnswer: 2,
          explanation: 'The second male gamete (n) fuses with two polar nuclei (n+n), forming a triploid (3n) Primary Endosperm Nucleus.'
        },
        {
          question: 'Pollination by wind is called:',
          options: ['Hydrophily', 'Entomophily', 'Ornithophily', 'Anemophily'],
          correctAnswer: 3,
          explanation: 'Anemophily refers to pollination by wind. Examples include Maize and Wheat.'
        }
      ]
    }
  },

  // ── TAMIL – Unit 1 ────────────────────────────────────────────────────────
  {
    className: 'Class 12',
    subjectName: 'Tamil',
    unitNumber: 1,
    unitTitle: 'உரைநடை – இலக்கிய வரலாறு (Literary History)',
    content: {
      text: `
<h2>பாடம் 1: தமிழ் இலக்கிய வரலாறு</h2>
<p>தமிழ் மொழி உலகின் மிகவும் பழமையான மொழிகளில் ஒன்று. இது ஒரு செம்மொழி என்ற தகுதி பெற்றுள்ளது.</p>

<h3>சங்க இலக்கியம்</h3>
<p>சங்க காலம் என்பது கி.மு. 300 முதல் கி.பி. 300 வரை நீடித்த காலகட்டமாகும். இக்காலத்தில் தமிழ்ப் புலவர்கள் மன்னர்களின் அவைகளில் இயங்கினர்.</p>
<ul>
  <li><strong>எட்டுத்தொகை</strong> – 8 தொகுப்புகளாக உள்ள சங்க நூல்கள். அகம் மற்றும் புறம் என இரு வகை கவிதைகள் உள்ளன.</li>
  <li><strong>பத்துப்பாட்டு</strong> – 10 நீண்ட கவிதைகள் உள்ளன.</li>
  <li><strong>திருக்குறள்</strong> – திருவள்ளுவர் இயற்றிய இக்காலத்தின் மிகச் சிறந்த நூல். இது அறம், பொருள், இன்பம் என மூன்று பகுதிகளாகும்.</li>
</ul>

<h3>காப்பியங்கள்</h3>
<ul>
  <li><strong>சிலப்பதிகாரம்</strong> – இளங்கோவடிகள் இயற்றியது. கண்ணகி, கோவலன் கதை. ஐம்பெருங்காப்பியங்களில் முதல்வது.</li>
  <li><strong>மணிமேகலை</strong> – சீத்தலை சாத்தனார் இயற்றியது. சிலப்பதிகாரத்தின் தொடர்ச்சி.</li>
  <li><strong>சீவக சிந்தாமணி</strong> – திருத்தக்கத்தேவர் இயற்றியது.</li>
  <li><strong>வளையாபதி</strong> – இன்று கிடைக்கவில்லை.</li>
  <li><strong>குண்டலகேசி</strong> – நாகுத்தனார் இயற்றியது.</li>
</ul>

<h3>பக்தி இலக்கியம்</h3>
<p>கி.பி. 6 முதல் 9ஆம் நூற்றாண்டு வரை நீடித்த பக்தி இயக்கம் தமிழ் இலக்கியத்திற்கு புதிய வெண்ணெயை அளித்தது.</p>
<ul>
  <li><strong>நாலாயிர திவ்யப் பிரபந்தம்</strong> – 12 ஆழ்வார்களால் பாடப்பட்டது.</li>
  <li><strong>தேவாரம்</strong> – திருஞானசம்பந்தர், திருநாவுக்கரசர், சுந்தரர் ஆகியோரால் பாடப்பட்டது.</li>
  <li><strong>திருவாசகம்</strong> – மாணிக்கவாசகர் இயற்றியது.</li>
</ul>

<h3>இலக்கண நூல்கள்</h3>
<ul>
  <li><strong>தொல்காப்பியம்</strong> – தொல்காப்பியர் இயற்றிய மிகப் பழமையான தமிழ் இலக்கண நூல்.</li>
  <li><strong>நன்னூல்</strong> – பவணந்தி முனிவர் இயற்றியது (கி.பி. 13ஆம் நூற்றாண்டு).</li>
</ul>
      `,
      videoUrl: 'https://www.youtube.com/embed/qnKhJRkzXeQ',
      signLanguageVideoUrl: 'https://www.youtube.com/embed/zMbFJp6Wl0o',
      quiz: [
        {
          question: 'திருக்குறளை இயற்றியவர் யார்?',
          options: ['இளங்கோவடிகள்', 'திருவள்ளுவர்', 'சீத்தலை சாத்தனார்', 'மாணிக்கவாசகர்'],
          correctAnswer: 1,
          explanation: 'திருக்குறளை திருவள்ளுவர் இயற்றினார். இது அறம், பொருள், இன்பம் என மூன்று பகுதிகளாகும்.'
        },
        {
          question: 'சிலப்பதிகாரத்தை இயற்றியவர் யார்?',
          options: ['திருத்தக்கத்தேவர்', 'சுந்தரர்', 'இளங்கோவடிகள்', 'தொல்காப்பியர்'],
          correctAnswer: 2,
          explanation: 'சிலப்பதிகாரத்தை இளங்கோவடிகள் இயற்றினார். இது ஐம்பெருங்காப்பியங்களில் முதல்வது.'
        },
        {
          question: 'தமிழின் மிகப் பழமையான இலக்கண நூல் எது?',
          options: ['நன்னூல்', 'தேவாரம்', 'தொல்காப்பியம்', 'நாலாயிர திவ்யப் பிரபந்தம்'],
          correctAnswer: 2,
          explanation: 'தொல்காப்பியம் தமிழின் மிகப் பழமையான இலக்கண நூல். இதை தொல்காப்பியர் இயற்றினார்.'
        },
        {
          question: 'எட்டுத்தொகை மற்றும் பத்துப்பாட்டு எந்த காலத்தைச் சேர்ந்தது?',
          options: ['பக்தி காலம்', 'சங்க காலம்', 'காப்பிய காலம்', 'நவீன காலம்'],
          correctAnswer: 1,
          explanation: 'எட்டுத்தொகை மற்றும் பத்துப்பாட்டு சங்க காலத்தைச் (கி.மு. 300 – கி.பி. 300) சேர்ந்தவை.'
        },
        {
          question: 'நாலாயிர திவ்யப் பிரபந்தம் எத்தனை ஆழ்வார்களால் பாடப்பட்டது?',
          options: ['6', '9', '12', '18'],
          correctAnswer: 2,
          explanation: 'நாலாயிர திவ்யப் பிரபந்தம் 12 ஆழ்வார்களால் பாடப்பட்டது.'
        }
      ]
    }
  },

  // ── TAMIL – Unit 2 ────────────────────────────────────────────────────────
  {
    className: 'Class 12',
    subjectName: 'Tamil',
    unitNumber: 2,
    unitTitle: 'கவிதை – புரட்சிக்கவி (Revolutionary Poetry)',
    content: {
      text: `
<h2>பாடம் 2: புரட்சிக்கவி – பாரதிதாசன்</h2>
<p>பாரதிதாசன் (1891–1964) தமிழ்நாட்டின் புரட்சிக் கவிஞர் என்று போற்றப்படுகிறார். இவரது இயற்பெயர் சுப்புரத்தினம்.</p>

<h3>வாழ்க்கை வரலாறு</h3>
<p>பாரதிதாசன் புதுவையில் பிறந்தார். சுப்பிரமணிய பாரதியின் கவிதைகளால் ஈர்க்கப்பட்டு "பாரதிதாசன்" என்ற புனைப்பெயரை ஏற்றுக்கொண்டார். திராவிட இயக்கத்துடன் தொடர்புடையவர்.</p>

<h3>முக்கிய நூல்கள்</h3>
<ul>
  <li><strong>பாண்டியன் பரிசு</strong> – இவரது மிகப் புகழ்பெற்ற நூல்.</li>
  <li><strong>குடும்ப விளக்கு</strong> – பெண்ணுரிமை பற்றி பாடியது.</li>
  <li><strong>இசையமுது</strong></li>
  <li><strong>அழகின் சிரிப்பு</strong></li>
  <li><strong>தமிழச்சியின் கத்தி</strong></li>
</ul>

<h3>கவிதை சிறப்பியல்புகள்</h3>
<ul>
  <li>எளிய தமிழில் ஆழமான கருத்துகளை வெளிப்படுத்தினார்.</li>
  <li>சமூக சீர்திருத்தம், பெண்ணுரிமை, மூடநம்பிக்கை எதிர்ப்பு பற்றி பாடினார்.</li>
  <li>தமிழ் மொழி மீது அளவிலாப் பற்று வைத்திருந்தார்.</li>
  <li>"தமிழுக்கும் அமுதென்று பேர்!" என்ற பாடல் மிகவும் புகழ்பெற்றது.</li>
</ul>

<h3>பாரதிதாசன் கவிதையில் இருந்து</h3>
<blockquote style="border-left: 4px solid #7c3aed; padding: 12px 20px; background:#f5f3ff; border-radius: 4px;">
  <p><em>"யாமறிந்த மொழிகளிலே தமிழ்மொழி போல் இனிதாவது எங்கும் காணோம்"</em></p>
  <p style="text-align:right; color:#7c3aed;">– பாரதியார்</p>
</blockquote>

<h3>தேசிய விருதுகள்</h3>
<p>பாரதிதாசன் 1960ஆம் ஆண்டு <strong>சாகித்ய அகாதெமி விருது</strong> பெற்றார். தமிழக அரசு இவர் நினைவாக <strong>பாரதிதாசன் பல்கலைக்கழகம்</strong> திருச்சியில் நிறுவியுள்ளது.</p>
      `,
      videoUrl: 'https://www.youtube.com/embed/KMa9MRdIbCQ',
      signLanguageVideoUrl: 'https://www.youtube.com/embed/zMbFJp6Wl0o',
      quiz: [
        {
          question: 'பாரதிதாசனின் இயற்பெயர் என்ன?',
          options: ['சுப்பிரமணியன்', 'சுப்புரத்தினம்', 'இளங்கோ', 'வள்ளுவன்'],
          correctAnswer: 1,
          explanation: 'பாரதிதாசனின் இயற்பெயர் சுப்புரத்தினம். அவர் பாரதியாரால் ஈர்க்கப்பட்டு "பாரதிதாசன்" என்ற புனைப்பெயரை ஏற்றுக்கொண்டார்.'
        },
        {
          question: 'பாரதிதாசன் எந்த விருதைப் பெற்றார்?',
          options: ['ஞானபீடம்', 'சாகித்ய அகாதெமி', 'பத்மபூஷண்', 'கலைமாமணி'],
          correctAnswer: 1,
          explanation: 'பாரதிதாசன் 1960ஆம் ஆண்டு சாகித்ய அகாதெமி விருது பெற்றார்.'
        },
        {
          question: 'பாரதிதாசன் எந்த நகரில் பிறந்தார்?',
          options: ['சென்னை', 'மதுரை', 'புதுவை (புதுச்சேரி)', 'கோயம்புத்தூர்'],
          correctAnswer: 2,
          explanation: 'பாரதிதாசன் புதுவை (புதுச்சேரி) நகரில் பிறந்தார்.'
        },
        {
          question: 'பாரதிதாசன் பல்கலைக்கழகம் எங்கு உள்ளது?',
          options: ['சென்னை', 'திருச்சி', 'மதுரை', 'கோயம்புத்தூர்'],
          correctAnswer: 1,
          explanation: 'தமிழக அரசு திருச்சியில் பாரதிதாசன் பல்கலைக்கழகத்தை நிறுவியுள்ளது.'
        },
        {
          question: '"பாண்டியன் பரிசு" என்ற நூலை இயற்றியவர் யார்?',
          options: ['பாரதியார்', 'கண்ணதாசன்', 'பாரதிதாசன்', 'வைரமுத்து'],
          correctAnswer: 2,
          explanation: '"பாண்டியன் பரிசு" பாரதிதாசனின் மிகப் புகழ்பெற்ற நூல்.'
        }
      ]
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Remove existing Education2 data for Class 12
    await CourseData.deleteMany({ className: 'Class 12' });
    console.log('🗑️  Cleared old Class 12 data');

    await CourseData.insertMany(seedData);
    console.log(`✅ Seeded ${seedData.length} course units successfully`);
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();