import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaGraduationCap,
  FaBook,
  FaPlay,
  FaQuestionCircle,
  FaHands,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaRedo,
  FaSyncAlt,
  FaSearch,
  FaLightbulb,
  FaAdjust,
  FaFont,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaVideo
} from 'react-icons/fa';

import TTSReader from '../components/education/TTSReader';
import '../styles/Education2.css';
import { useAuth } from '../context/AuthContext';

import SignAvatarPlayer from './SignAvatarPlayer';
import { resolveSignStrategy } from './SignAnimationController';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://thirannexus.onrender.com';
const API = `${BASE_URL}/api/education2`;
const WAPI = `${BASE_URL}/api/word`;

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Video links configuration preserved from original implementation
const VIDEO_RESOURCES = {
  reproduction: {
    standard: 'https://www.youtube.com/embed/uLXz1PLgCGg',
    sign: 'https://www.youtube.com/embed/Y3iiYuKTJkw'
  },
  unit2: {
    standard: 'https://www.youtube.com/embed/6UXGobXdZGA',
    sign: 'https://www.youtube.com/embed/lW8hbdNGhBE'
  },
  tamilUnit2: {
    standard: 'https://www.youtube.com/embed/kZcq-xP8RNs',
    sign: 'https://www.youtube.com/embed/kZcq-xP8RNs'
  }
};

// Subject metadata for badges & visual presentation
const SUBJECT_META = {
  Biology: { emoji: '🧬', label: 'Biology', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  Tamil:   { emoji: '📜', label: 'Tamil',   color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  Physics: { emoji: '⚡', label: 'Physics', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  Chemistry: { emoji: '🧪', label: 'Chemistry', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  Mathematics: { emoji: '📐', label: 'Mathematics', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' }
};

// Curated authentic course fallback data matching backend seedEducation2.js
// Guarantees zero downtime if Render backend is sleeping or spinning up
const FALLBACK_COURSE_DATA = {
  'Class 12': {
    subjects: ['Biology', 'Tamil'],
    units: {
      Biology: [
        {
          _id: 'bio-unit-1',
          unitNumber: 1,
          unitTitle: 'Reproduction in Organisms',
          content: {
            text: `
<h2>Unit 1: Reproduction in Organisms</h2>
<p>Reproduction is a fundamental biological process that ensures the continuity of living species from one generation to the next. Through reproduction, an organism gives rise to offspring similar to itself.</p>

<h3>Types of Reproduction</h3>
<h4>1. Asexual Reproduction</h4>
<p>In asexual reproduction, a single parent produces offspring without the fusion of gametes. The offspring are genetically and morphologically identical to the parent and are known as <strong>clones</strong>.</p>
<ul>
  <li><strong>Binary Fission:</strong> The parent cell divides into two equal daughter cells (e.g., Amoeba, Bacteria).</li>
  <li><strong>Budding:</strong> A small outgrowth develops on the parent body and separates into a new individual (e.g., Hydra, Yeast).</li>
  <li><strong>Fragmentation:</strong> The parent organism breaks into distinct fragments, each growing into a complete individual (e.g., Spirogyra).</li>
  <li><strong>Sporulation:</strong> Formation of specialized spores that survive harsh conditions and germinate when favorable (e.g., Rhizopus).</li>
  <li><strong>Vegetative Propagation:</strong> New plants arise from vegetative structures such as roots, stems, and leaves (e.g., Potato tubers, Ginger rhizomes, Bryophyllum leaves).</li>
</ul>

<h4>2. Sexual Reproduction</h4>
<p>Sexual reproduction involves the formation and fusion of male and female gametes to produce a diploid zygote. This introduces genetic variation and evolutionary adaptability.</p>
<ul>
  <li><strong>Pre-fertilisation events:</strong> Gametogenesis (formation of gametes) and gamete transfer.</li>
  <li><strong>Fertilisation:</strong> The fusion of haploid male and female gametes, also known as syngamy.</li>
  <li><strong>Post-fertilisation events:</strong> Zygote formation and embryogenesis (development of the embryo).</li>
</ul>

<h3>Key Terms & Definitions</h3>
<table>
  <thead>
    <tr><th>Scientific Term</th><th>Definition</th></tr>
  </thead>
  <tbody>
    <tr><td>Gamete</td><td>A mature haploid reproductive cell (sperm or egg).</td></tr>
    <tr><td>Zygote</td><td>The diploid cell resulting from the fusion of male and female gametes.</td></tr>
    <tr><td>Gametogenesis</td><td>The biological process of forming male and female gametes.</td></tr>
    <tr><td>Embryogenesis</td><td>The developmental stages of an embryo from a fertilized zygote.</td></tr>
    <tr><td>Clone</td><td>Individual organisms that are morphologically and genetically identical.</td></tr>
  </tbody>
</table>

<blockquote>
  <p>💡 <strong>Key Takeaway:</strong> Life span is the period from birth to natural death. While single-celled organisms like Amoeba have no natural death due to continuous binary fission, higher multicellular organisms exhibit distinct juvenile, reproductive, and senescent phases.</p>
</blockquote>
`,
            videoUrl: 'https://www.youtube.com/embed/8mWbGkSNKVc',
            signLanguageVideoUrl: 'https://www.youtube.com/embed/R4Kq0-wjlUI',
            quiz: [
              {
                question: 'Which of the following organisms reproduces by budding?',
                options: ['Amoeba', 'Hydra', 'Spirogyra', 'Rhizopus'],
                correctAnswer: 1,
                explanation: 'Hydra reproduces by budding, where a small bud grows on the body and detaches as a new organism.'
              },
              {
                question: 'The fusion of male and female gametes is called:',
                options: ['Gametogenesis', 'Embryogenesis', 'Syngamy', 'Sporulation'],
                correctAnswer: 2,
                explanation: 'Syngamy (fertilisation) refers to the fusion of male and female gametes to produce a zygote.'
              },
              {
                question: 'Offspring produced by asexual reproduction are genetically:',
                options: ['Different from parent', 'Identical to parent (clones)', 'Half identical', 'Randomly varied'],
                correctAnswer: 1,
                explanation: 'Asexual reproduction involves mitosis from a single parent, yielding genetically identical clones.'
              },
              {
                question: 'Which plant part is used in vegetative propagation of Potato?',
                options: ['Root', 'Leaf', 'Tuber (modified stem)', 'Seed'],
                correctAnswer: 2,
                explanation: 'Potato tubers are underground modified stems possessing eye buds that grow into new plants.'
              },
              {
                question: 'The life span of a typical Rice plant is approximately:',
                options: ['3–4 months', '1–2 years', '5–10 years', '100 years'],
                correctAnswer: 0,
                explanation: 'Rice is an annual crop that completes its vegetative and reproductive life cycle in 3–4 months.'
              }
            ]
          }
        },
        {
          _id: 'bio-unit-2',
          unitNumber: 2,
          unitTitle: 'Sexual Reproduction in Flowering Plants',
          content: {
            text: `
<h2>Unit 2: Sexual Reproduction in Flowering Plants</h2>
<p>Flowering plants (Angiosperms) represent the most evolved group of the plant kingdom. The flower is the specialized reproductive organ that facilitates sexual reproduction.</p>

<h3>Structure of a Flower</h3>
<p>A typical angiosperm flower comprises four whorls arranged on the thalamus:</p>
<ul>
  <li><strong>Calyx:</strong> Outermost whorl of sepals (generally green, protective in bud stage).</li>
  <li><strong>Corolla:</strong> Whorl of petals (brightly colored, attracting pollinating agents).</li>
  <li><strong>Androecium:</strong> Male reproductive organ composed of stamens (filament and anther).</li>
  <li><strong>Gynoecium:</strong> Female reproductive organ composed of carpels or pistil (stigma, style, and ovary).</li>
</ul>

<h3>Pollination Mechanisms</h3>
<p>Pollination is the transfer of pollen grains from the anther to the receptive stigma of a flower.</p>
<ul>
  <li><strong>Autogamy (Self-pollination):</strong> Transfer of pollen grains from anther to stigma within the same flower.</li>
  <li><strong>Allogamy (Cross-pollination):</strong> Transfer of pollen grains between flowers of different plants, maximizing genetic diversity.</li>
</ul>

<h4>Common Pollination Agents</h4>
<ul>
  <li><strong>Wind (Anemophily):</strong> Maize, grasses, wheat (lightweight pollen grains).</li>
  <li><strong>Water (Hydrophily):</strong> Vallisneria, Hydrilla.</li>
  <li><strong>Insects (Entomophily):</strong> Rose, Salvia (sticky pollen with nectar guides).</li>
  <li><strong>Birds (Ornithophily):</strong> Silk cotton, Hummingbird-visited blossoms.</li>
</ul>

<h3>Double Fertilisation in Angiosperms</h3>
<p>Angiosperms display a unique hallmark known as <strong>Double Fertilisation</strong>:</p>
<ol>
  <li>One haploid male gamete fuses with the egg cell to form the diploid <strong>Zygote (2n)</strong>.</li>
  <li>The second haploid male gamete fuses with the two polar nuclei in the central cell to produce the triploid <strong>Primary Endosperm Nucleus (3n)</strong>. This second fusion is termed <strong>Triple Fusion</strong>.</li>
</ol>

<blockquote>
  <p>🌱 <strong>Seed and Fruit Development:</strong> Following fertilisation, the ovule matures into a resistant seed, while the surrounding ovary develops into the fruit.</p>
</blockquote>
`,
            videoUrl: 'https://www.youtube.com/embed/OGLA5aHYtqM',
            signLanguageVideoUrl: 'https://www.youtube.com/embed/6-8a7_pfh08',
            quiz: [
              {
                question: 'Which whorl of a flower contains the female reproductive organ?',
                options: ['Calyx', 'Corolla', 'Androecium', 'Gynoecium'],
                correctAnswer: 3,
                explanation: 'The Gynoecium (pistil) is the female reproductive whorl consisting of the stigma, style, and ovary.'
              },
              {
                question: 'Transfer of pollen grains from the anther to the stigma is called:',
                options: ['Fertilisation', 'Pollination', 'Germination', 'Reproduction'],
                correctAnswer: 1,
                explanation: 'Pollination is the transfer of pollen grains from the male anther to the female stigma.'
              },
              {
                question: 'Double fertilisation is a characteristic feature unique to:',
                options: ['Gymnosperms', 'Bryophytes', 'Angiosperms', 'Pteridophytes'],
                correctAnswer: 2,
                explanation: 'Double fertilisation is an evolutionary feature found exclusively in Angiosperms (flowering plants).'
              },
              {
                question: 'What is the ploidy level of the Primary Endosperm Nucleus?',
                options: ['Haploid (n)', 'Diploid (2n)', 'Triploid (3n)', 'Tetraploid (4n)'],
                correctAnswer: 2,
                explanation: 'Triple fusion joins one haploid male gamete with two polar nuclei, creating a triploid (3n) endosperm nucleus.'
              },
              {
                question: 'Pollination mediated by wind is scientifically termed:',
                options: ['Hydrophily', 'Entomophily', 'Ornithophily', 'Anemophily'],
                correctAnswer: 3,
                explanation: 'Anemophily refers specifically to wind pollination, common in cereal crops and grasses.'
              }
            ]
          }
        }
      ],
      Tamil: [
        {
          _id: 'tamil-unit-1',
          unitNumber: 1,
          unitTitle: 'உரைநடை – இலக்கிய வரலாறு (Literary History)',
          content: {
            text: `
<h2>பாடம் 1: தமிழ் இலக்கிய வரலாறு</h2>
<p>தமிழ் மொழி உலகின் மிகத் தொன்மையான செம்மொழிகளில் தலையாயது. இரண்டாயிரத்திற்கும் மேற்பட்ட ஆண்டுகால இலக்கியப் பாரம்பரியம் கொண்டது.</p>

<h3>சங்க இலக்கியம்</h3>
<p>சங்க காலம் என்பது கி.மு. 300 முதல் கி.பி. 300 வரையிலான பொற்காலமாகும். இக்காலத்து இலக்கியங்கள் அகம் மற்றும் புறம் என இரு பிரிவுகளாகப் பகுக்கப்பட்டுள்ளன.</p>
<ul>
  <li><strong>எட்டுத்தொகை:</strong> நற்றிணை, குறுந்தொகை, ஐங்குறுநூறு, பதிற்றுப்பத்து, பரிபாடல், கலித்தொகை, அகநானூறு, புறநானூறு.</li>
  <li><strong>பத்துப்பாட்டு:</strong> திருமுருகாற்றுப்படை, பொருநராற்றுப்படை, சிறுபாணாற்றுப்படை, பெரும்பாணாற்றுப்படை, முல்லைப்பாட்டு, மதுரைக்காஞ்சி, நெடுநல்வாடை, குறிஞ்சிப்பாட்டு, பட்டினப்பாலை, மலைபடுகடாம்.</li>
  <li><strong>திருக்குறள்:</strong> திருவள்ளுவர் அருளிய உலகப் பொதுமறை. அறம், பொருள், இன்பம் என முப்பாலாக 1330 குறள்களைக் கொண்டது.</li>
</ul>

<h3>ஐம்பெருங்காப்பியங்கள்</h3>
<ul>
  <li><strong>சிலப்பதிகாரம்:</strong> இளங்கோவடிகள் இயற்றியது; கண்ணகி மற்றும் கோவலனின் வரலாற்றைக் கூறும் முதற்காப்பியம்.</li>
  <li><strong>மணிமேகலை:</strong> சீத்தலை சாத்தனார் இயற்றிய பௌத்தக் காப்பியம்.</li>
  <li><strong>சீவக சிந்தாமணி:</strong> திருத்தக்கத்தேவர் இயற்றிய சமணக் காப்பியம்.</li>
  <li><strong>வளையாபதி:</strong> செய்யுள்கள் சில மட்டுமே கிடைத்துள்ள காப்பியம்.</li>
  <li><strong>குண்டலகேசி:</strong> நாதகுத்தனார் இயற்றியது.</li>
</ul>

<blockquote>
  <p>📜 <strong>இலக்கணச் சிறப்பு:</strong> தமிழின் மிகத் தொன்மையான முழுமையான இலக்கண நூல் தொல்காப்பியமாகும். இதனை இயற்றியவர் தொல்காப்பியர் ஆவார்.</p>
</blockquote>
`,
            videoUrl: 'https://www.youtube.com/embed/qnKhJRkzXeQ',
            signLanguageVideoUrl: 'https://www.youtube.com/embed/zMbFJp6Wl0o',
            quiz: [
              {
                question: 'திருக்குறளை இயற்றிய பெருந்தகை யார்?',
                options: ['இளங்கோவடிகள்', 'திருவள்ளுவர்', 'சீத்தலை சாத்தனார்', 'கம்பர்'],
                correctAnswer: 1,
                explanation: 'திருக்குறளை இயற்றியவர் திருவள்ளுவர் ஆவார். இது 133 அதிகாரங்களில் 1330 குறள்களைக் கொண்டது.'
              },
              {
                question: 'சிலப்பதிகாரத்தை இயற்றிய ஆசிரியர் யார்?',
                options: ['திருத்தக்கத்தேவர்', 'சுந்தரர்', 'இளங்கோவடிகள்', 'தொல்காப்பியர்'],
                correctAnswer: 2,
                explanation: 'ஐம்பெருங்காப்பியங்களில் முதலாவதான சிலப்பதிகாரத்தை இளங்கோவடிகள் இயற்றினார்.'
              },
              {
                question: 'தமிழின் மிகத் தொன்மையான இலக்கண நூல் எது?',
                options: ['நன்னூல்', 'தேவாரம்', 'தொல்காப்பியம்', 'வீரசோழியம்'],
                correctAnswer: 2,
                explanation: 'தொல்காப்பியம் தமிழின் முதல் மற்றும் மிகத் தொன்மையான இலக்கண நூல் ஆகும்.'
              },
              {
                question: 'எட்டுத்தொகை நூல்கள் எந்த காலத்தைச் சேர்ந்தவை?',
                options: ['பக்தி காலம்', 'சங்க காலம்', 'காப்பிய காலம்', 'நவீன காலம்'],
                correctAnswer: 1,
                explanation: 'எட்டுத்தொகை மற்றும் பத்துப்பாட்டு சங்க கால இலக்கியங்கள் ஆகும்.'
              },
              {
                question: 'திருக்குறளில் உள்ள மொத்தப் பாக்களின் எண்ணிக்கை எவ்வளவு?',
                options: ['1000', '1200', '1330', '1500'],
                correctAnswer: 2,
                explanation: 'திருக்குறள் 133 அதிகாரங்களையும் 1330 அருங்குறள்களையும் கொண்டுள்ளது.'
              }
            ]
          }
        },
        {
          _id: 'tamil-unit-2',
          unitNumber: 2,
          unitTitle: 'கவிதை – புரட்சிக்கவி (Revolutionary Poetry)',
          content: {
            text: `
<h2>பாடம் 2: புரட்சிக்கவி – பாரதிதாசன்</h2>
<p>பாரதிதாசன் (1891–1964) தமிழ்நாட்டின் புரட்சிக் கவிஞர், பாவேந்தர் என்று போற்றப்படுகிறார். அவரது இயற்பெயர் கனக சுப்புரத்தினம்.</p>

<h3>வாழ்க்கைக் குறிப்பு</h3>
<p>பாரதிதாசன் புதுச்சேரியில் பிறந்தார். மகாகவி சுப்பிரமணிய பாரதியாரின் மீது கொண்ட அளப்பரிய பற்றின் காரணமாகத் தம் பெயரை "பாரதிதாசன்" என மாற்றிக்கொண்டார். தமிழ்ச் சமூக சீர்திருத்தம் மற்றும் பெண்ணுரிமையை உரக்கப் பாடியவர்.</p>

<h3>முக்கிய படைப்புகள்</h3>
<ul>
  <li><strong>பாண்டியன் பரிசு:</strong> காப்பியச் சுவை மிகுந்த புகழ்பெற்ற நூல்.</li>
  <li><strong>குடும்ப விளக்கு:</strong> இல்லற மாண்பையும் பெண் கல்வியையும் போற்றும் நூல்.</li>
  <li><strong>இருண்ட வீடு:</strong> கல்வி இல்லா வீட்டின் அவலத்தைச் சித்தரிக்கும் படைப்பு.</li>
  <li><strong>அழகின் சிரிப்பு:</strong> இயற்கையின் எழிலைப் பாடும் கவிதைத் தொகுப்பு.</li>
  <li><strong>தமிழுக்கும் அமுதென்று பேர்:</strong> உலகத் தமிழர்களின் நாவில் ஒலிக்கும் புகழ்பெற்ற பாடல்.</li>
</ul>

<blockquote>
  <p>🌟 <strong>விருது:</strong> பாரதிதாசனின் 'பிசிராந்தையார்' நாடக நூலுக்கு 1969-இல் சாகித்திய அகாதெமி விருது வழங்கப்பட்டது. தமிழக அரசு திருச்சிராப்பள்ளியில் இவரது பெயரில் பல்கலைக்கழகம் அமைத்துள்ளது.</p>
</blockquote>
`,
            videoUrl: 'https://www.youtube.com/embed/KMa9MRdIbCQ',
            signLanguageVideoUrl: 'https://www.youtube.com/embed/zMbFJp6Wl0o',
            quiz: [
              {
                question: 'பாரதிதாசனின் இயற்பெயர் என்ன?',
                options: ['சுப்பிரமணியன்', 'கனக சுப்புரத்தினம்', 'இளங்கோ', 'வள்ளுவன்'],
                correctAnswer: 1,
                explanation: 'பாரதிதாசனின் இயற்பெயர் கனக சுப்புரத்தினம் ஆகும்.'
              },
              {
                question: 'பாரதிதாசன் எந்த நகரில் பிறந்தார்?',
                options: ['சென்னை', 'மதுரை', 'புதுச்சேரி', 'திருச்சி'],
                correctAnswer: 2,
                explanation: 'பாரதிதாசன் புதுச்சேரியில் (புதுவை) 1891-இல் பிறந்தார்.'
              },
              {
                question: '"பாண்டியன் பரிசு" என்ற நூலின் ஆசிரியர் யார்?',
                options: ['பாரதியார்', 'பாரதிதாசன்', 'கண்ணதாசன்', 'வாலி'],
                correctAnswer: 1,
                explanation: '"பாண்டியன் பரிசு" பாவேந்தர் பாரதிதாசனின் இணையற்ற காப்பிய நூலாகும்.'
              },
              {
                question: 'பாரதிதாசன் பல்கலைக்கழகம் தமிழகத்தில் எங்கு அமைந்துள்ளது?',
                options: ['சென்னை', 'திருச்சிராப்பள்ளி', 'மதுரை', 'கோவை'],
                correctAnswer: 1,
                explanation: 'தமிழக அரசு திருச்சிராப்பள்ளியில் பாரதிதாசன் பல்கலைக்கழகத்தை நிறுவியுள்ளது.'
              },
              {
                question: 'பாரதிதாசனுக்கு வழங்கப்பட்ட சிறப்புப் பட்டம் எது?',
                options: ['கவிமணி', 'புரட்சிக் கவிஞர் / பாவேந்தர்', 'மகாகவி', 'சொல்லின் செல்வர்'],
                correctAnswer: 1,
                explanation: 'பாரதிதாசன் புரட்சிக் கவிஞர் மற்றும் பாவேந்தர் என்று அன்போடு போற்றப்படுகிறார்.'
              }
            ]
          }
        }
      ]
    }
  }
};

// ══════════════════════════════════════════════════════════════
// WORD EXPLANATION POPUP
// ══════════════════════════════════════════════════════════════
function ExplanationPopup({ data, onDismiss }) {
  const [activeTab, setActiveTab] = useState('definition');
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!data) return;
    setActiveTab('definition');
    setImgError(false);
    prevFocus.current = document.activeElement;
    setTimeout(() => closeRef.current?.focus(), 50);
    timerRef.current = setTimeout(handleDismiss, 40000);
    return () => clearTimeout(timerRef.current);
  }, [data]);

  function handleDismiss() {
    clearTimeout(timerRef.current);
    prevFocus.current?.focus();
    onDismiss();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') handleDismiss();
  }

  if (!data) return null;

  const accent = data.color || '#7c3aed';
  const levelLabel = { easy: 'Basic', medium: 'Intermediate', hard: 'Advanced' }[data.level] || 'Intermediate';

  const strategy = resolveSignStrategy(data.word, data);
  const isSpell = strategy.strategy === 'spell';
  const tokens = isSpell ? (data.word || '').split('') : (strategy.glossTokens || [data.word.toUpperCase()]);

  const tabs = [
    { key: 'definition', label: '📖 Definition' },
    { key: 'spelling', label: '🔤 Spelling' },
    { key: 'diagram', label: '✨ Visual' },
    data.videoUrl ? { key: 'video', label: '🎬 Video' } : null,
    { key: 'isl', label: '🤟 ISL Sign' },
  ].filter(Boolean);

  return (
    <div className="sl-popup-overlay" onClick={handleDismiss} role="presentation">
      <div
        className="sl-popup"
        style={{ '--sl-popup-accent': accent }}
        role="dialog"
        aria-modal="true"
        aria-label={`Word explanation: ${data.word}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="sl-popup__strip" style={{ background: accent }} aria-hidden="true" />

        <div className="sl-popup__header">
          <div className="sl-popup__badges" aria-hidden="true">
            <span className="sl-popup__badge" style={{ background: accent + '25', color: accent }}>
              {data.subject || 'general'}
            </span>
            <span className="sl-popup__badge sl-popup__badge--level">{levelLabel}</span>
          </div>
          <button ref={closeRef} className="sl-popup__close" onClick={handleDismiss} aria-label="Close word explanation">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <h2 className="sl-popup__word">{data.word}</h2>

        <div className="sl-popup__tabs" role="tablist" aria-label="Explanation sections">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              className="sl-popup__tab"
              role="tab"
              aria-selected={activeTab === t.key}
              aria-controls={`popup-panel-${t.key}`}
              id={`popup-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') setActiveTab(tabs[(i + 1) % tabs.length].key);
                if (e.key === 'ArrowLeft') setActiveTab(tabs[(i - 1 + tabs.length) % tabs.length].key);
              }}
              tabIndex={activeTab === t.key ? 0 : -1}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sl-popup__body">
          {activeTab === 'definition' && (
            <div id="popup-panel-definition" role="tabpanel" aria-labelledby="popup-tab-definition">
              {data.simplifiedDefinition && (
                <div
                  style={{
                    marginBottom: 14,
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px 14px',
                    borderRadius: 10,
                    borderLeft: `3px solid ${accent}`,
                  }}
                >
                  <span style={{ fontSize: 11, color: '#a78bfa', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    SIMPLE EXPLANATION
                  </span>
                  <p className="sl-popup__def-text" style={{ fontSize: 15, color: '#fff', fontWeight: 600, margin: 0 }}>
                    {data.simplifiedDefinition}
                  </p>
                </div>
              )}
              <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                FULL DEFINITION
              </span>
              <p className="sl-popup__def-text">{data.definition}</p>
              {data.example && (
                <div className="sl-popup__example">
                  <span className="sl-popup__example-label">EXAMPLE USAGE</span>
                  <p className="sl-popup__example-text">"{data.example}"</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'spelling' && (
            <div id="popup-panel-spelling" role="tabpanel" aria-labelledby="popup-tab-spelling">
              <div className="sl-avatar-gloss-bar">
                <span className="sl-avatar-gloss-label">{isSpell ? 'Fingerspelling' : 'ISL Gloss'}</span>
                <div className="sl-avatar-gloss-list" aria-hidden="true">
                  {tokens.map((token, idx) => (
                    <span
                      key={idx}
                      className="sl-avatar-gloss-item"
                      style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.12)', fontSize: '18px', color: '#fff' }}
                    >
                      {token.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagram' && (
            <div id="popup-panel-diagram" role="tabpanel" aria-labelledby="popup-tab-diagram">
              {data.animationUrl && !imgError ? (
                <div style={{ textAlign: 'center', background: '#09090b', borderRadius: '12px', padding: '12px' }}>
                  <img
                    src={data.animationUrl}
                    alt={`Visual representation of ${data.word}`}
                    className="sl-popup__image"
                    onError={() => setImgError(true)}
                  />
                  <p className="sl-popup__caption">Visual: {data.word}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '26px' }}>🔍</span>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#fff' }}>No exact local diagram found.</p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(data.word)}&tbm=isch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      Search Google Images for "{data.word}" →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div id="popup-panel-video" role="tabpanel" aria-labelledby="popup-tab-video">
              {data.videoUrl ? (
                <div className="sl-popup__media">
                  <button
                    className="sl-popup__watch-btn"
                    onClick={() => window.open(data.videoUrl, '_blank', 'noopener,noreferrer')}
                    aria-label={`Watch ${data.word} video on YouTube`}
                  >
                    ▶ Watch Video Lesson on YouTube
                  </button>
                </div>
              ) : (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.word + ' lesson')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  ▶ Search YouTube for "{data.word}" lesson
                </a>
              )}
            </div>
          )}

          {activeTab === 'isl' && (
            <div id="popup-panel-isl" role="tabpanel" aria-labelledby="popup-tab-isl">
              {data.islSignVideoUrl || data.directSignUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '100%', position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                    <iframe
                      src={data.islSignVideoUrl || data.directSignUrl}
                      title={`ISL video for ${data.word}`}
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, textAlign: 'center' }}>Official Indian Sign Language (ISL) Video</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '26px' }}>🤟</span>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#fff' }}>No official ISL video found for this word.</p>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.word + ' Indian Sign Language')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      Search YouTube for ISL Sign →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="sl-popup__hint" aria-hidden="true">Auto-closes in 40s · Press Esc to dismiss</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WORD CLICKABLE TEXT (Preserving Tap-to-Learn)
// ══════════════════════════════════════════════════════════════
function WordClickableText({ html, onWordClick }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html || '<p>Content coming soon.</p>';

    const STOP_WORDS = new Set([
      'the', 'and', 'is', 'was', 'of', 'to', 'a', 'in', 'on', 'for', 'it', 'with', 'as', 'by',
      'that', 'this', 'an', 'are', 'at', 'be', 'from', 'or', 'which', 'you', 'your', 'can',
      'not', 'will', 'has', 'have', 'but', 'all', 'any', 'we', 'they', 'their'
    ]);

    const cleanup = [];

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!/[a-zA-Z]/.test(text)) return;

        const fragment = document.createDocumentFragment();
        const tokens = text.split(/([a-zA-Z]+)/);
        let hasWord = false;

        tokens.forEach((token) => {
          if (/^[a-zA-Z]+$/.test(token)) {
            hasWord = true;
            const cleanWord = token.toLowerCase();

            if (!STOP_WORDS.has(cleanWord) && cleanWord.length > 2) {
              const span = document.createElement('span');
              span.textContent = token;
              span.className = 'sl-clickable-term';
              span.setAttribute('role', 'button');
              span.setAttribute('tabIndex', '0');
              span.setAttribute('title', `Click to explore meaning and ISL sign for "${token}"`);

              const handler = (e) => {
                e.stopPropagation();
                onWordClick(cleanWord);
              };

              const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handler(e);
                }
              };

              span.addEventListener('click', handler);
              span.addEventListener('keydown', keyHandler);
              cleanup.push(() => {
                span.removeEventListener('click', handler);
                span.removeEventListener('keydown', keyHandler);
              });
              fragment.appendChild(span);
            } else {
              fragment.appendChild(document.createTextNode(token));
            }
          } else {
            fragment.appendChild(document.createTextNode(token));
          }
        });

        if (hasWord && node.parentNode) {
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
          Array.from(node.childNodes).forEach(processNode);
        }
      }
    }

    Array.from(el.childNodes).forEach(processNode);

    return () => cleanup.forEach((fn) => fn());
  }, [html, onWordClick]);

  return (
    <article
      ref={ref}
      className="sl-text-content"
      aria-label="Lesson textbook content"
      dangerouslySetInnerHTML={{ __html: html || '<p>Content coming soon.</p>' }}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// AVATAR BUDDY (Quiz Feedback)
// ══════════════════════════════════════════════════════════════
function Avatar({ state }) {
  const map = {
    idle: { emoji: '😊', msg: 'Ready to learn!' },
    correct: { emoji: '🎉', msg: 'Outstanding! Keep going!' },
    wrong: { emoji: '💪', msg: "Great effort! Learn and retry." },
    thinking: { emoji: '🤔', msg: 'Analyzing answer...' }
  };
  const { emoji, msg } = map[state] || map.idle;

  return (
    <div className="sl-buddy-avatar" aria-hidden="true">
      <span className="sl-buddy-avatar__face" role="img" aria-label={msg}>
        {emoji}
      </span>
      <p className="sl-buddy-avatar__msg">{msg}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// QUIZ TAB
// ══════════════════════════════════════════════════════════════
function QuizTab({ quiz }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [avatarState, setAvatar] = useState('idle');
  const [showExplain, setExplain] = useState(false);

  const liveRef = useRef(null);
  const nextRef = useRef(null);

  const q = quiz && quiz.length > 0 ? quiz[current] : null;

  function announce(msg) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setAvatar('thinking');

    setTimeout(() => {
      const correct = idx === q.correctAnswer;
      if (correct) {
        setScore((s) => s + 1);
        setAvatar('correct');
      } else {
        setAvatar('wrong');
      }
      setExplain(true);
      announce(correct ? 'Correct answer!' : `Incorrect. The correct answer is option ${['A', 'B', 'C', 'D'][q.correctAnswer]}.`);
      setTimeout(() => nextRef.current?.focus(), 100);
    }, 450);
  }

  function handleNext() {
    if (current + 1 < quiz.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAvatar('idle');
      setExplain(false);
      announce(`Question ${current + 2} of ${quiz.length}`);
    } else {
      setDone(true);
      announce(`Quiz complete. Final score: ${score} out of ${quiz.length}.`);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setAvatar('idle');
    setExplain(false);
    announce('Quiz restarted.');
  }

  if (!quiz || quiz.length === 0) {
    return (
      <div className="sl-empty-state" role="status">
        <span className="sl-empty-art" aria-hidden="true">🧩</span>
        <h3>No Quiz Questions Available</h3>
        <p>Quiz assessments are currently being prepared for this unit.</p>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    const msg =
      pct === 100
        ? '🏆 Flawless performance! Perfect mastery!'
        : pct >= 80
        ? '⭐ Excellent grasp of this topic!'
        : pct >= 60
        ? '👍 Solid effort! Review key points to strengthen mastery.'
        : '📚 Good practice! Revisit the lesson guide and test again.';

    return (
      <div className="sl-quiz-results-card" role="region" aria-label="Quiz completion results">
        <div ref={liveRef} role="status" aria-live="polite" style={srOnly} />
        <Avatar state={pct >= 60 ? 'correct' : 'wrong'} />
        <h3 className="sl-section-title" style={{ marginTop: '1rem' }}>Unit Quiz Completed!</h3>
        <div className="sl-quiz-results-score" aria-label={`Score: ${score} out of ${quiz.length}`}>
          {score} / {quiz.length}
        </div>
        <div className="sl-quiz-progress-track" style={{ maxWidth: '20rem', margin: '1rem auto' }}>
          <div className="sl-quiz-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="sl-quiz-results-sub">{msg}</p>
        <button type="button" className="sl-btn sl-btn--fetch" onClick={handleRestart}>
          <FaRedo aria-hidden="true" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  const pct = Math.round(((current + 1) / quiz.length) * 100);

  return (
    <div className="sl-quiz-wrap" role="form" aria-label="Interactive assessment quiz">
      <div ref={liveRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} />

      <div className="sl-quiz-header">
        <span>Question {current + 1} of {quiz.length}</span>
        <span className="sl-quiz-score-pill">Score: {score}</span>
      </div>

      <div className="sl-quiz-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="sl-quiz-progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="sl-quiz-layout">
        <div aria-hidden="true">
          <Avatar state={avatarState} />
        </div>

        <div className="sl-quiz-question-card">
          <h3 className="sl-quiz-question-title" id={`quiz-q-${current}`}>
            {q.question}
          </h3>

          <div className="sl-quiz-options-list" role="group" aria-labelledby={`quiz-q-${current}`}>
            {q.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isCorrect = idx === q.correctAnswer;
              const isSelected = idx === selected;

              let btnCls = 'sl-quiz-option-btn';
              if (selected !== null) {
                if (isCorrect) btnCls += ' sl-quiz-option-btn--correct';
                else if (isSelected) btnCls += ' sl-quiz-option-btn--wrong';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={btnCls}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  aria-label={`Option ${letter}: ${opt}`}
                >
                  <span className="sl-quiz-option-letter" aria-hidden="true">{letter}</span>
                  <span>
                    {opt}
                    {selected !== null && isCorrect && ' ✔'}
                    {selected !== null && isSelected && !isCorrect && ' ✘'}
                  </span>
                </button>
              );
            })}
          </div>

          {showExplain && q.explanation && (
            <div
              className={`sl-quiz-explanation ${
                selected === q.correctAnswer ? 'sl-quiz-explanation--good' : 'sl-quiz-explanation--bad'
              }`}
              role="alert"
            >
              <strong>{selected === q.correctAnswer ? '✅ Correct!' : '❌ Explanation:'}</strong>
              <p style={{ margin: '4px 0 0 0' }}>{q.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              ref={nextRef}
              type="button"
              className="sl-quiz-next-btn"
              onClick={handleNext}
            >
              {current + 1 < quiz.length ? 'Next Question →' : 'View Results 🎯'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// VIDEO TAB
// ══════════════════════════════════════════════════════════════
function VideoTab({ videoUrl, signUrl, unitTitle, subjectName, unitNumber }) {
  const [mode, setMode] = useState('standard');

  let mappedStandard = videoUrl;
  let mappedSign = signUrl;

  const isTamil = subjectName?.toLowerCase().includes('tamil');
  const isUnit2 = Number(unitNumber) === 2 || unitTitle?.toLowerCase().includes('unit 2');
  const isReproduction = unitTitle?.toLowerCase().includes('reproduction');

  if (isTamil && isUnit2) {
    mappedStandard = VIDEO_RESOURCES.tamilUnit2.standard;
    mappedSign = VIDEO_RESOURCES.tamilUnit2.sign;
  } else if (isUnit2) {
    mappedStandard = VIDEO_RESOURCES.unit2.standard;
    mappedSign = VIDEO_RESOURCES.unit2.sign;
  } else if (isReproduction) {
    mappedStandard = VIDEO_RESOURCES.reproduction.standard;
    mappedSign = VIDEO_RESOURCES.reproduction.sign;
  }

  const url = mode === 'sign' ? mappedSign : mappedStandard;

  return (
    <div className="sl-video-section" role="region" aria-label="Lesson video classroom">
      <div className="sl-video-mode-toggle" role="group" aria-label="Video presentation type">
        <button
          type="button"
          className="sl-video-toggle-btn"
          aria-pressed={mode === 'standard'}
          onClick={() => setMode('standard')}
        >
          <FaVideo aria-hidden="true" />
          <span>Standard Video</span>
        </button>
        <button
          type="button"
          className="sl-video-toggle-btn"
          aria-pressed={mode === 'sign'}
          onClick={() => setMode('sign')}
        >
          <FaHands aria-hidden="true" />
          <span>Sign Language (ISL)</span>
        </button>
      </div>

      <div className="sl-video-player-card">
        <div className="sl-video-aspect-wrap">
          {url ? (
            <iframe
              key={url}
              src={url}
              title={mode === 'sign' ? 'Sign Language Lesson Video' : 'Lesson Video'}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="sl-video-iframe"
            />
          ) : (
            <div className="sl-video-fallback-box">
              <span style={{ fontSize: '3rem' }}>🎥</span>
              <p style={{ margin: 0 }}>Video lesson stream unavailable.</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  (unitTitle || 'lesson') + (mode === 'sign' ? ' Indian Sign Language' : ' lesson')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sl-btn sl-btn--fetch"
                style={{ marginTop: '10px' }}
              >
                Search YouTube for {mode === 'sign' ? 'ISL' : ''} Lesson →
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="sl-video-notice-pill">
        <FaInfoCircle aria-hidden="true" />
        <span>Closed captions available. Toggle using YouTube player controls or press <kbd>C</kbd>.</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ACCESSIBILITY TOOLBAR
// ══════════════════════════════════════════════════════════════
function A11yToolbar({ highContrast, setHighContrast, largeText, setLargeText }) {
  return (
    <aside className="sl-a11y-bar" aria-label="Visual accessibility options">
      <div className="sl-a11y-inner">
        <div className="sl-a11y-group">
          <span className="sl-a11y-label">Display Comfort:</span>
          <button
            type="button"
            className="sl-a11y-btn"
            aria-pressed={highContrast}
            onClick={() => setHighContrast((v) => !v)}
            title="Toggle high-contrast black and yellow view"
          >
            <FaAdjust aria-hidden="true" />
            <span>High Contrast</span>
          </button>
          <button
            type="button"
            className="sl-a11y-btn"
            aria-pressed={largeText}
            onClick={() => setLargeText((v) => !v)}
            title="Toggle larger typography scale"
          >
            <FaFont aria-hidden="true" />
            <span>Large Text</span>
          </button>
        </div>

        <div className="sl-a11y-meta">
          <span>🤟 ISL Included</span>
          <span>·</span>
          <span>🔊 Screen Reader & Audio Aloud Ready</span>
        </div>
      </div>
    </aside>
  );
}

const TABS = [
  { id: 'text', label: 'Lesson Guide', icon: <FaBook /> },
  { id: 'video', label: 'Video & ISL', icon: <FaPlay /> },
  { id: 'quiz', label: 'Interactive Quiz', icon: <FaQuestionCircle /> }
];

// ══════════════════════════════════════════════════════════════
// MAIN SMARTLEARN COMPONENT (Education2)
// ══════════════════════════════════════════════════════════════
export default function Education2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // Class & subject states
  const [selectedClass, setSelectedClass] = useState('Class 12');
  const [classError, setClassError] = useState('');
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);

  // Units & lesson content states
  const [units, setUnits] = useState([]);
  const [activeUnit, setActiveUnit] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [fetchError, setFetchError] = useState('');

  // Word popup state
  const [popupData, setPopupData] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);

  const contentRef = useRef(null);
  const statusRef = useRef(null);

  function announce(msg) {
    if (statusRef.current) statusRef.current.textContent = msg;
  }

  // Word tap-to-learn lookup handler
  const handleWordClick = useCallback(
    async (word) => {
      if (!word || popupLoading) return;
      if (!/^[a-zA-Z]+$/.test(word) || word.length < 3) return;

      setPopupLoading(true);
      announce(`Looking up meaning for ${word}`);

      try {
        const { data } = await axios.get(
          `${WAPI}/${encodeURIComponent(word.toLowerCase())}?subject=${encodeURIComponent(activeSubject || 'general')}`
        );
        setPopupData(data);
      } catch (e) {
        // Fallback for word dictionary
        setPopupData({
          word,
          subject: activeSubject || 'general',
          definition: `Educational terminology used in ${activeSubject || 'general'} studies.`,
          simplifiedDefinition: `A key concept in this chapter.`,
          level: 'medium',
        });
      } finally {
        setPopupLoading(false);
      }
    },
    [popupLoading, activeSubject]
  );

  // Fetch subjects for chosen class
  const handleFetch = useCallback(async (targetClass = selectedClass) => {
    if (!targetClass) {
      setClassError('Please select a class before fetching.');
      return;
    }

    setClassError('');
    setLoading(true);
    setFetchError('');

    try {
      const { data } = await axios.get(`${API}/subjects`, {
        params: { className: targetClass },
        timeout: 4000
      });

      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
      } else {
        // Fallback to local curated subjects
        setSubjects(FALLBACK_COURSE_DATA[targetClass]?.subjects || ['Biology', 'Tamil']);
      }

      setFetched(true);
      announce(`Loaded subjects for ${targetClass}.`);
    } catch (err) {
      // Graceful fallback to local seed data
      const localSubs = FALLBACK_COURSE_DATA[targetClass]?.subjects || ['Biology', 'Tamil'];
      setSubjects(localSubs);
      setFetched(true);
      announce(`Loaded offline subject catalog.`);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  // Select subject and load units
  const handleSubject = useCallback(async (subj) => {
    setActiveSubject(subj);
    setActiveUnit(null);
    setUnitData(null);
    setFetchError('');

    try {
      const { data } = await axios.get(`${API}/units`, {
        params: { className: selectedClass, subjectName: subj },
        timeout: 4000
      });

      if (data.units && data.units.length > 0) {
        setUnits(data.units);
      } else {
        const localUnits = FALLBACK_COURSE_DATA[selectedClass]?.units[subj] || [];
        setUnits(localUnits);
      }
      announce(`Loaded units for ${subj}.`);
    } catch {
      const localUnits = FALLBACK_COURSE_DATA[selectedClass]?.units[subj] || [];
      setUnits(localUnits);
      announce(`Loaded units from course catalog.`);
    }
  }, [selectedClass]);

  // Select unit and load content
  const handleUnit = useCallback(async (unit) => {
    setActiveUnit(unit._id);
    setActiveTab('text');
    setUnitLoading(true);
    setFetchError('');

    try {
      const { data } = await axios.get(`${API}/content/${unit._id}`, { timeout: 4000 });
      setUnitData(data);
      announce(`Unit ${data.unitNumber}: ${data.unitTitle} loaded.`);
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      // Fallback: check if unit already has content or find in local catalog
      if (unit.content) {
        setUnitData(unit);
      } else {
        const match = FALLBACK_COURSE_DATA[selectedClass]?.units[activeSubject]?.find(
          (u) => u._id === unit._id || u.unitNumber === unit.unitNumber
        );
        if (match) {
          setUnitData(match);
        }
      }
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally {
      setUnitLoading(false);
    }
  }, [selectedClass, activeSubject]);

  // Auto-fetch Class 12 on mount, or respect navigation state from Dashboard
  useEffect(() => {
    handleFetch('Class 12');
  }, [handleFetch]);

  // Listen to incoming route state (e.g. from Dashboard click: state: { subject: 'Biology' })
  useEffect(() => {
    if (location.state?.subject && subjects.length > 0) {
      const targetSubj = location.state.subject;
      if (subjects.includes(targetSubj)) {
        handleSubject(targetSubj);
      }
    }
  }, [location.state, subjects, handleSubject]);

  const activeMeta = activeSubject ? (SUBJECT_META[activeSubject] || { emoji: '📘', label: activeSubject }) : null;
  const pageClasses = ['sl-page', highContrast ? 'high-contrast' : '', largeText ? 'large-text' : ''].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      <a href="#sl-main-content" className="sl-skip-link">Skip directly to lesson content</a>
      <div ref={statusRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} />

      {/* Word Lookup Toast */}
      {popupLoading && (
        <div className="sl-word-toast" role="status" aria-live="polite">
          <div className="sl-spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden="true" />
          <span>Looking up definition...</span>
        </div>
      )}

      {/* Word Explanation Modal */}
      {popupData && <ExplanationPopup data={popupData} onDismiss={() => setPopupData(null)} />}

      {/* Modern Dashboard Header */}
      <header className="sl-header-hero" role="banner">
        <div className="sl-header-inner">
          <div className="sl-header__brand">
            <span className="sl-badge-pill">
              <FaGraduationCap aria-hidden="true" /> SmartLearn Inclusive E-Learning
            </span>
            <h1 className="sl-header__logo">
              <span className="sl-header__logo-gradient">ThiranNexus</span> Education
            </h1>
            <p className="sl-header__tagline">
              Interactive digital lessons featuring integrated Indian Sign Language (ISL), audio read-aloud, and adaptive assessments.
            </p>
          </div>

          {/* Class Selector Bar */}
          <div className="sl-class-bar" role="search" aria-label="Class and curriculum selection">
            <div className="sl-class-select-wrap">
              <label htmlFor="classSelector" className="sl-class-label">Grade / Class:</label>
              <select
                id="classSelector"
                className="sl-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setFetched(false);
                  setSubjects([]);
                  setActiveSubject(null);
                  setUnits([]);
                  setActiveUnit(null);
                  setUnitData(null);
                }}
              >
                <option value="Class 12">Class 12 (Higher Secondary)</option>
                <option value="Class 10">Class 10 (Secondary)</option>
              </select>
            </div>

            <button
              type="button"
              className="sl-btn sl-btn--fetch"
              onClick={() => handleFetch(selectedClass)}
              disabled={loading}
              aria-busy={loading}
            >
              <FaSyncAlt className={loading ? 'fa-spin' : ''} aria-hidden="true" />
              <span>{loading ? 'Loading Catalog...' : 'Fetch Contents'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Accessibility Toolbar */}
      <A11yToolbar
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        largeText={largeText}
        setLargeText={setLargeText}
      />

      {/* Main Content Area */}
      <main id="sl-main-content" className="sl-main" tabIndex={-1}>
        {fetchError && (
          <div className="sl-quiz-explanation sl-quiz-explanation--bad" role="alert">
            {fetchError}
          </div>
        )}

        {/* ── Choose a Subject ── */}
        {fetched && subjects.length > 0 && (
          <section className="sl-section" aria-label="Available academic subjects">
            <div className="sl-section-header">
              <h2 className="sl-section-title">1. Choose a Subject</h2>
              <p className="sl-section-sub">Select your subject to explore units, textbook explanations, and videos.</p>
            </div>

            <div className="sl-subjects__grid" role="list">
              {subjects.map((subj) => {
                const meta = SUBJECT_META[subj] || { emoji: '📘', label: subj };
                const isSelected = activeSubject === subj;

                return (
                  <button
                    key={subj}
                    type="button"
                    className="sl-subject-card"
                    role="listitem"
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => handleSubject(subj)}
                  >
                    <div className="sl-subject-card__icon-wrap" aria-hidden="true">
                      {meta.emoji}
                    </div>
                    <h3 className="sl-subject-card__title">{meta.label}</h3>
                    <span className="sl-subject-card__units-count">Class 12 Syllabus</span>
                    {isSelected && (
                      <span className="sl-subject-card__indicator" aria-hidden="true">
                        <FaCheckCircle /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Units Grid (Card Replacement) ── */}
        {activeSubject && units.length > 0 && (
          <section className="sl-units-container" aria-label={`Units in ${activeSubject}`}>
            <div className="sl-section-header">
              <h2 className="sl-section-title">
                <span aria-hidden="true">{activeMeta?.emoji} </span>
                {activeSubject} — Chapter Units
              </h2>
              <p className="sl-section-sub">
                Select any unit card to open its digital textbook, video explanation, and quiz.
              </p>
            </div>

            <div className="sl-units-grid" role="list">
              {units.map((unit) => {
                const isCurrent = activeUnit === unit._id;

                return (
                  <div
                    key={unit._id}
                    className="sl-lesson-card"
                    role="listitem"
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => handleUnit(unit)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleUnit(unit);
                      }
                    }}
                  >
                    <div>
                      <div className="sl-lesson-card__header">
                        <span className="sl-lesson-card__unit-tag">
                          Unit {unit.unitNumber}
                        </span>
                        {isCurrent && (
                          <span className="sl-lesson-card__active-badge" aria-hidden="true">
                            <FaCheckCircle /> Selected
                          </span>
                        )}
                      </div>

                      <h3 className="sl-lesson-card__title">
                        {unit.unitTitle}
                      </h3>

                      <div className="sl-lesson-card__features" aria-label="Available formats">
                        <span className="sl-feature-pill">
                          <FaBook aria-hidden="true" /> Digital Guide
                        </span>
                        <span className="sl-feature-pill">
                          <FaPlay aria-hidden="true" /> Video
                        </span>
                        <span className="sl-feature-pill">
                          <FaHands aria-hidden="true" /> ISL Sign
                        </span>
                        <span className="sl-feature-pill">
                          <FaQuestionCircle aria-hidden="true" /> Quiz
                        </span>
                      </div>
                    </div>

                    <div className="sl-lesson-card__footer">
                      <span>{isCurrent ? 'Currently Viewing' : 'Start Learning'}</span>
                      <span className="sl-lesson-card__cta" aria-hidden="true">
                        Open Unit <FaArrowRight />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Unit Loading Spinner ── */}
        {unitLoading && (
          <div className="sl-loading-box" role="status" aria-live="polite">
            <div className="sl-spinner-ring" aria-hidden="true" />
            <p>Loading digital lesson materials...</p>
          </div>
        )}

        {/* ── Digital Textbook Content Viewer ── */}
        {unitData && !unitLoading && (
          <section
            ref={contentRef}
            className="sl-content-viewer"
            aria-label={`Unit ${unitData.unitNumber}: ${unitData.unitTitle}`}
          >
            {/* Viewer Topbar */}
            <div className="sl-viewer-topbar">
              <div>
                <div className="sl-viewer-breadcrumbs">
                  {activeSubject} · Unit {unitData.unitNumber}
                </div>
                <h2 className="sl-viewer-title">
                  {unitData.unitTitle}
                </h2>
              </div>

              {/* Format Tabs Switcher */}
              <div className="sl-content-tabs" role="tablist" aria-label="Lesson content format">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    className="sl-content-tab"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') {
                        const next = TABS[(i + 1) % TABS.length].id;
                        setActiveTab(next);
                        document.getElementById(`tab-${next}`)?.focus();
                      }
                      if (e.key === 'ArrowLeft') {
                        const prev = TABS[(i - 1 + TABS.length) % TABS.length].id;
                        setActiveTab(prev);
                        document.getElementById(`tab-${prev}`)?.focus();
                      }
                    }}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Viewer Body */}
            <div className="sl-viewer-body">
              {/* Text Reader Tab */}
              {activeTab === 'text' && (
                <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" tabIndex={0}>
                  {/* High-priority robust Text-to-Speech Controller */}
                  <TTSReader
                    text={unitData?.content?.text || 'Content coming soon.'}
                    title={unitData?.unitTitle}
                    language={activeSubject?.toLowerCase().includes('tamil') ? 'ta-IN' : 'en-IN'}
                  />

                  {/* Tap-to-Learn Hint */}
                  <div className="sl-click-hint-banner" role="status">
                    <FaLightbulb aria-hidden="true" />
                    <span>
                      <strong>Interactive Learning:</strong> Tap or click any highlighted word in the textbook to explore its definition, spelling, and Indian Sign Language (ISL) video!
                    </span>
                  </div>

                  {/* Formatted Text with Clickable Words */}
                  <WordClickableText
                    html={unitData?.content?.text}
                    onWordClick={handleWordClick}
                  />
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && (
                <div id="panel-video" role="tabpanel" aria-labelledby="tab-video" tabIndex={0}>
                  <VideoTab
                    videoUrl={unitData?.content?.videoUrl}
                    signUrl={unitData?.content?.signLanguageVideoUrl}
                    unitTitle={unitData?.unitTitle}
                    subjectName={activeSubject}
                    unitNumber={unitData?.unitNumber}
                  />
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === 'quiz' && (
                <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz" tabIndex={0}>
                  <QuizTab quiz={unitData?.content?.quiz || []} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Empty Welcome State ── */}
        {!fetched && !loading && (
          <div className="sl-empty-state" role="region" aria-label="SmartLearn welcome overview">
            <span className="sl-empty-art" aria-hidden="true">🎓</span>
            <h3>Welcome to SmartLearn</h3>
            <p>
              Choose your grade and click <strong>Fetch Contents</strong> above to begin interactive lessons, sign-language videos, and practice quizzes.
            </p>
            <div className="sl-empty-pills" aria-label="Key features included">
              <span className="sl-empty-pill">🤟 Official ISL Videos</span>
              <span className="sl-empty-pill">🔊 Clear Read-Aloud Audio</span>
              <span className="sl-empty-pill">💡 Interactive Tap-to-Learn Terms</span>
              <span className="sl-empty-pill">🧩 Immediate Quiz Feedback</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}