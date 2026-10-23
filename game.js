/**
 * 🌿 숲속 두더지 잡기 - Game Engine & Web Audio Synthesizer
 */

// ==========================================
// 1. 게임 데이터 & 설정
// ==========================================
const GAME_CONFIG = {
  duration: 30, // 30초
  totalHoles: 25, // 5x5 그리드
  minPopInterval: 450,
  maxPopInterval: 750,
  minMoleStay: 850,
  maxMoleStay: 1350,
  maxConcurrentMoles: 3
};

// 두더지 5종류 스펙
const MOLE_TYPES = {
  normal: {
    id: 'normal',
    name: '일반 두더지',
    score: 10,
    weight: 38, // 출현 확률
    soundType: 'pop',
    particleColors: ['#8d5b36', '#c49a6c', '#6db33f']
  },
  beige: {
    id: 'beige',
    name: '베이지 두더지',
    score: 15,
    weight: 26,
    soundType: 'cute',
    particleColors: ['#f5deb3', '#ffb6c1', '#ffe4b5']
  },
  mushroom: {
    id: 'mushroom',
    name: '버섯 두더지',
    score: 20,
    weight: 18,
    soundType: 'boing',
    particleColors: ['#ff4d4d', '#ffffff', '#ff9999']
  },
  flower: {
    id: 'flower',
    name: '꽃 두더지',
    score: 25,
    weight: 13,
    soundType: 'chime',
    particleColors: ['#ff69b4', '#ffff66', '#7cd968']
  },
  golden: {
    id: 'golden',
    name: '황금 두더지',
    score: 50,
    weight: 5, // 희귀
    soundType: 'fanfare',
    particleColors: ['#ffd700', '#fff59d', '#ffab00', '#ffffff']
  }
};

// ==========================================
// 2. 귀여운 두더지 SVG 생성기
// ==========================================
function getMoleSVG(type, state = 'normal') {
  const isHit = state === 'hit';

  switch (type) {
    case 'beige':
      return `
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
          <!-- 귀 -->
          <circle cx="28" cy="28" r="12" fill="#E8CDA0" />
          <circle cx="28" cy="28" r="7" fill="#FFAAA6" />
          <circle cx="72" cy="28" r="12" fill="#E8CDA0" />
          <circle cx="72" cy="28" r="7" fill="#FFAAA6" />
          <!-- 몸통 -->
          <path d="M 20 110 C 18 45, 82 45, 80 110 Z" fill="#F5DEB3" />
          <!-- 배 -->
          <ellipse cx="50" cy="95" rx="20" ry="14" fill="#FFF8DC" />
          <!-- 볼터치 -->
          <ellipse cx="30" cy="62" rx="7" ry="5" fill="#FFB6C1" opacity="0.85" />
          <ellipse cx="70" cy="62" rx="7" ry="5" fill="#FFB6C1" opacity="0.85" />
          <!-- 눈 -->
          ${isHit ? `
            <path d="M 32 50 Q 37 45 42 50" stroke="#4A3525" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 58 50 Q 63 45 68 50" stroke="#4A3525" stroke-width="3" fill="none" stroke-linecap="round"/>
          ` : `
            <path d="M 32 50 Q 37 43 42 50" stroke="#4A3525" stroke-width="3.2" fill="none" stroke-linecap="round"/>
            <path d="M 58 50 Q 63 43 68 50" stroke="#4A3525" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          `}
          <!-- 코와 주둥이 -->
          <ellipse cx="50" cy="56" rx="8" ry="6" fill="#FFA07A" />
          <circle cx="48" cy="54" r="2" fill="#FFFFFF" opacity="0.8" />
          <!-- 입 -->
          ${isHit ? `
            <circle cx="50" cy="67" r="4" fill="#8B4513" />
          ` : `
            <path d="M 45 62 Q 50 68 55 62" stroke="#4A3525" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          `}
          <!-- 앞발 -->
          <ellipse cx="28" cy="85" rx="7" ry="5" fill="#E8CDA0" />
          <ellipse cx="72" cy="85" rx="7" ry="5" fill="#E8CDA0" />
        </svg>
      `;

    case 'mushroom':
      return `
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
          <!-- 귀 -->
          <circle cx="26" cy="36" r="11" fill="#7A4B29" />
          <circle cx="26" cy="36" r="6" fill="#E8967D" />
          <circle cx="74" cy="36" r="11" fill="#7A4B29" />
          <circle cx="74" cy="36" r="6" fill="#E8967D" />
          <!-- 몸통 -->
          <path d="M 20 110 C 18 50, 82 50, 80 110 Z" fill="#8D5B36" />
          <!-- 배 -->
          <ellipse cx="50" cy="95" rx="20" ry="14" fill="#D9A982" />
          <!-- 버섯 모자 -->
          <path d="M 16 38 C 16 12, 84 12, 84 38 C 84 42, 16 42, 16 38 Z" fill="#E53935" />
          <!-- 버섯 흰 점들 -->
          <circle cx="34" cy="26" r="5" fill="#FFFFFF" />
          <circle cx="52" cy="19" r="6" fill="#FFFFFF" />
          <circle cx="68" cy="28" r="4.5" fill="#FFFFFF" />
          <!-- 눈 -->
          ${isHit ? `
            <text x="32" y="58" font-size="13" font-family="sans-serif" font-weight="bold" fill="#2B1911">x</text>
            <text x="58" y="58" font-size="13" font-family="sans-serif" font-weight="bold" fill="#2B1911">x</text>
          ` : `
            <circle cx="36" cy="54" r="4.5" fill="#2B1911" />
            <circle cx="35" cy="52" r="1.5" fill="#FFFFFF" />
            <circle cx="64" cy="54" r="4.5" fill="#2B1911" />
            <circle cx="63" cy="52" r="1.5" fill="#FFFFFF" />
          `}
          <!-- 볼터치 -->
          <circle cx="29" cy="62" r="5" fill="#FF8A80" opacity="0.8" />
          <circle cx="71" cy="62" r="5" fill="#FF8A80" opacity="0.8" />
          <!-- 코 -->
          <ellipse cx="50" cy="60" rx="7.5" ry="5.5" fill="#FF8A80" />
          <circle cx="48" cy="58" r="1.8" fill="#FFFFFF" opacity="0.9" />
          <!-- 입 -->
          <path d="M 46 66 Q 50 71 54 66" stroke="#2B1911" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 앞발 -->
          <ellipse cx="26" cy="88" rx="7" ry="5" fill="#7A4B29" />
          <ellipse cx="74" cy="88" rx="7" ry="5" fill="#7A4B29" />
        </svg>
      `;

    case 'flower':
      return `
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
          <!-- 귀 -->
          <circle cx="26" cy="30" r="11" fill="#7B4E2B" />
          <circle cx="26" cy="30" r="6" fill="#FFAAA6" />
          <circle cx="74" cy="30" r="11" fill="#7B4E2B" />
          <circle cx="74" cy="30" r="6" fill="#FFAAA6" />
          <!-- 몸통 -->
          <path d="M 20 110 C 18 45, 82 45, 80 110 Z" fill="#9C6644" />
          <!-- 배 -->
          <ellipse cx="50" cy="95" rx="20" ry="14" fill="#DDB892" />
          <!-- 머리 위 꽃 장식 -->
          <g transform="translate(62, 22)">
            <ellipse cx="-4" cy="4" rx="6" ry="3" fill="#4CAF50" transform="rotate(-30)" />
            <!-- 꽃잎 5장 -->
            <circle cx="0" cy="-7" r="4.5" fill="#FF69B4" />
            <circle cx="6.5" cy="-2" r="4.5" fill="#FF69B4" />
            <circle cx="4" cy="6" r="4.5" fill="#FF69B4" />
            <circle cx="-4" cy="6" r="4.5" fill="#FF69B4" />
            <circle cx="-6.5" cy="-2" r="4.5" fill="#FF69B4" />
            <!-- 꽃 심 -->
            <circle cx="0" cy="0" r="4" fill="#FFEB3B" />
          </g>
          <!-- 눈 (초롱초롱) -->
          ${isHit ? `
            <path d="M 32 50 Q 37 45 42 50" stroke="#2B1911" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 58 50 Q 63 45 68 50" stroke="#2B1911" stroke-width="3" fill="none" stroke-linecap="round"/>
          ` : `
            <circle cx="36" cy="52" r="5" fill="#2B1911" />
            <circle cx="34.5" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="38" cy="54" r="1" fill="#FFFFFF" />
            <!-- 윙크 또는 초롱초롱 -->
            <path d="M 58 52 Q 63 46 68 52" stroke="#2B1911" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          `}
          <!-- 볼터치 -->
          <ellipse cx="28" cy="60" rx="6" ry="4" fill="#FF80AB" opacity="0.8" />
          <ellipse cx="72" cy="60" rx="6" ry="4" fill="#FF80AB" opacity="0.8" />
          <!-- 코 -->
          <ellipse cx="50" cy="58" rx="7.5" ry="5.5" fill="#FF80AB" />
          <circle cx="48" cy="56" r="1.8" fill="#FFFFFF" opacity="0.9" />
          <!-- 입 -->
          <path d="M 45 64 Q 50 70 55 64" stroke="#2B1911" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 앞발 -->
          <ellipse cx="26" cy="86" rx="7" ry="5" fill="#7B4E2B" />
          <ellipse cx="74" cy="86" rx="7" ry="5" fill="#7B4E2B" />
        </svg>
      `;

    case 'golden':
      return `
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF59D" />
              <stop offset="50%" stop-color="#FFD700" />
              <stop offset="100%" stop-color="#FF8F00" />
            </linearGradient>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFF176" />
              <stop offset="100%" stop-color="#F57F17" />
            </linearGradient>
          </defs>
          <!-- 귀 -->
          <circle cx="26" cy="30" r="12" fill="#E6A100" />
          <circle cx="26" cy="30" r="7" fill="#FFE57F" />
          <circle cx="74" cy="30" r="12" fill="#E6A100" />
          <circle cx="74" cy="30" r="7" fill="#FFE57F" />
          <!-- 몸통 -->
          <path d="M 20 110 C 18 45, 82 45, 80 110 Z" fill="url(#goldGrad)" stroke="#FFA000" stroke-width="2" />
          <!-- 배 -->
          <ellipse cx="50" cy="95" rx="20" ry="14" fill="#FFFDE7" opacity="0.9" />
          <!-- 작은 왕관 -->
          <polygon points="40,24 45,15 50,22 55,15 60,24" fill="url(#crownGrad)" stroke="#E65100" stroke-width="1.5" />
          <circle cx="45" cy="15" r="1.8" fill="#FF1744" />
          <circle cx="55" cy="15" r="1.8" fill="#2979FF" />
          <circle cx="50" cy="22" r="1.5" fill="#00E676" />
          <!-- 반짝이 별 장식 -->
          <path d="M 22 45 L 24 48 L 27 48 L 25 50 L 26 53 L 23 51 L 20 53 L 21 50 L 19 48 L 22 48 Z" fill="#FFFFFF" opacity="0.9" />
          <path d="M 76 45 L 78 48 L 81 48 L 79 50 L 80 53 L 77 51 L 74 53 L 75 50 L 73 48 L 76 48 Z" fill="#FFFFFF" opacity="0.9" />
          <!-- 눈 -->
          ${isHit ? `
            <text x="31" y="58" font-size="14" font-family="sans-serif" font-weight="bold" fill="#4E342E">★</text>
            <text x="57" y="58" font-size="14" font-family="sans-serif" font-weight="bold" fill="#4E342E">★</text>
          ` : `
            <circle cx="36" cy="52" r="5" fill="#3E2723" />
            <circle cx="34.5" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="64" cy="52" r="5" fill="#3E2723" />
            <circle cx="62.5" cy="50" r="2" fill="#FFFFFF" />
          `}
          <!-- 볼터치 -->
          <ellipse cx="28" cy="62" rx="7" ry="4" fill="#FFB300" opacity="0.8" />
          <ellipse cx="72" cy="62" rx="7" ry="4" fill="#FFB300" opacity="0.8" />
          <!-- 코 -->
          <ellipse cx="50" cy="58" rx="8" ry="6" fill="#FF6F00" />
          <circle cx="48" cy="56" r="2" fill="#FFFFFF" opacity="0.9" />
          <!-- 입 -->
          <path d="M 44 65 Q 50 72 56 65" stroke="#3E2723" stroke-width="2.8" fill="none" stroke-linecap="round"/>
          <!-- 앞발 -->
          <ellipse cx="26" cy="86" rx="7" ry="5" fill="#E6A100" />
          <ellipse cx="74" cy="86" rx="7" ry="5" fill="#E6A100" />
        </svg>
      `;

    case 'normal':
    default:
      return `
        <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
          <!-- 귀 -->
          <circle cx="26" cy="30" r="11" fill="#6D4323" />
          <circle cx="26" cy="30" r="6" fill="#FFAAA6" />
          <circle cx="74" cy="30" r="11" fill="#6D4323" />
          <circle cx="74" cy="30" r="6" fill="#FFAAA6" />
          <!-- 몸통 -->
          <path d="M 20 110 C 18 45, 82 45, 80 110 Z" fill="#845028" />
          <!-- 배 -->
          <ellipse cx="50" cy="95" rx="20" ry="14" fill="#C49A6C" />
          <!-- 눈 -->
          ${isHit ? `
            <path d="M 32 50 Q 37 45 42 50" stroke="#2B1911" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 58 50 Q 63 45 68 50" stroke="#2B1911" stroke-width="3" fill="none" stroke-linecap="round"/>
          ` : `
            <circle cx="36" cy="52" r="5" fill="#2B1911" />
            <circle cx="34.5" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="64" cy="52" r="5" fill="#2B1911" />
            <circle cx="62.5" cy="50" r="2" fill="#FFFFFF" />
          `}
          <!-- 볼터치 -->
          <ellipse cx="28" cy="62" rx="6" ry="4" fill="#FF8A80" opacity="0.65" />
          <ellipse cx="72" cy="62" rx="6" ry="4" fill="#FF8A80" opacity="0.65" />
          <!-- 코 -->
          <ellipse cx="50" cy="58" rx="8" ry="6" fill="#FF7597" />
          <circle cx="48" cy="56" r="2" fill="#FFFFFF" opacity="0.9" />
          <!-- 수염 -->
          <line x1="22" y1="58" x2="12" y2="56" stroke="#4A2E16" stroke-width="2" stroke-linecap="round" />
          <line x1="22" y1="62" x2="13" y2="64" stroke="#4A2E16" stroke-width="2" stroke-linecap="round" />
          <line x1="78" y1="58" x2="88" y2="56" stroke="#4A2E16" stroke-width="2" stroke-linecap="round" />
          <line x1="78" y1="62" x2="87" y2="64" stroke="#4A2E16" stroke-width="2" stroke-linecap="round" />
          <!-- 입 -->
          ${isHit ? `
            <circle cx="50" cy="68" r="4.5" fill="#3D1F08" />
          ` : `
            <path d="M 44 65 Q 50 71 56 65" stroke="#2B1911" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          `}
          <!-- 앞발 -->
          <ellipse cx="26" cy="86" rx="7" ry="5" fill="#6D4323" />
          <ellipse cx="74" cy="86" rx="7" ry="5" fill="#6D4323" />
        </svg>
      `;
  }
}

// ==========================================
// 3. Web Audio API 사운드 신시사이저
// ==========================================
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.loadMuteState();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  loadMuteState() {
    try {
      const saved = localStorage.getItem('forest_mole_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch (e) {
      console.warn('localStorage access failed:', e);
    }
  }

  saveMuteState() {
    try {
      localStorage.setItem('forest_mole_muted', this.isMuted.toString());
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMuteState();
    return this.isMuted;
  }

  // 1. 일반 두더지: 짧고 경쾌한 팝 소리
  playNormalPop() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 2. 베이지 두더지: 귀여운 고음 팝/퐁 소리
  playCutePop() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.16);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 3. 버섯 두더지: 가벼운 뿅 소리 (스윕)
  playMushroomBoing() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.15);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // 4. 꽃 두더지: 맑고 반짝이는 벨/차임 소리
  playFlowerChime() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 2개의 배음으로 맑은 차임 효과
    [880, 1320].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.28, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.36);
    });
  }

  // 5. 황금 두더지: 특별한 반짝임과 화려한 팡파레 아르페지오 (C5-E5-G5-C6)
  playGoldenFanfare() {
    if (this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.32, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.42);
    });
  }

  // 시작 신호음
  playStartChime() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [392, 523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.3, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.26);
    });
  }

  // 종료 신호음
  playGameOverSound() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [587.33, 523.25, 440, 392].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.3, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.36);
    });
  }

  // 두더지 종류별 라우팅
  playCatchSound(type) {
    this.init();
    switch (type) {
      case 'normal':
        this.playNormalPop();
        break;
      case 'beige':
        this.playCutePop();
        break;
      case 'mushroom':
        this.playMushroomBoing();
        break;
      case 'flower':
        this.playFlowerChime();
        break;
      case 'golden':
        this.playGoldenFanfare();
        break;
    }
  }
}

// ==========================================
// 4. 게임 상태 & 메인 엔진
// ==========================================
class WhackAMoleGame {
  constructor() {
    this.sound = new SoundSynthesizer();

    // DOM 참조
    this.gridEl = document.getElementById('gardenGrid');
    this.effectLayer = document.getElementById('effectLayer');
    this.currentScoreEl = document.getElementById('currentScore');
    this.timeLeftEl = document.getElementById('timeLeft');
    this.timeCardEl = document.getElementById('timeCard');
    this.highScoreEl = document.getElementById('highScore');
    this.startBtn = document.getElementById('startBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundIconEl = document.getElementById('soundIcon');
    this.soundLabelEl = document.getElementById('soundLabel');

    // 모달 DOM
    this.introModal = document.getElementById('introModal');
    this.modalStartBtn = document.getElementById('modalStartBtn');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.restartBtn = document.getElementById('restartBtn');
    this.finalScoreDisplay = document.getElementById('finalScoreDisplay');
    this.finalHighScoreDisplay = document.getElementById('finalHighScoreDisplay');
    this.newRecordTag = document.getElementById('newRecordTag');
    this.gameResultTitle = document.getElementById('gameResultTitle');
    this.gameResultDesc = document.getElementById('gameResultDesc');
    this.resultHero = document.getElementById('resultHero');
    this.moleCatchStats = document.getElementById('moleCatchStats');

    // 게임 상태 변수
    this.score = 0;
    this.timeLeft = GAME_CONFIG.duration;
    this.highScore = 0;
    this.isPlaying = false;
    this.holes = []; // 25개 구멍 셀 객체
    this.activeMoles = new Map(); // holeIndex -> { moleEl, type, timeoutId, isHit }
    this.gameTimer = null;
    this.spawnTimer = null;

    // 잡은 통계
    this.catchStats = {
      normal: 0,
      beige: 0,
      mushroom: 0,
      flower: 0,
      golden: 0
    };

    this.init();
  }

  init() {
    this.loadHighScore();
    this.buildHoles();
    this.renderPreviews();
    this.updateSoundUI();
    this.bindEvents();
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem('forest_mole_high_score');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch (e) {
      this.highScore = 0;
    }
    this.highScoreEl.textContent = this.highScore;
  }

  saveHighScore(score) {
    if (score > this.highScore) {
      this.highScore = score;
      try {
        localStorage.setItem('forest_mole_high_score', score.toString());
      } catch (e) {}
      this.highScoreEl.textContent = this.highScore;
      return true; // 신기록 달성
    }
    return false;
  }

  // 5x5 총 25개의 구멍 DOM 구축
  buildHoles() {
    this.gridEl.innerHTML = '';
    this.holes = [];

    for (let i = 0; i < GAME_CONFIG.totalHoles; i++) {
      const cell = document.createElement('div');
      cell.className = 'hole-cell';
      cell.setAttribute('data-index', i.toString());

      // 구멍 내부 마스크 (두더지가 이 안에서 오르내림)
      const pitMask = document.createElement('div');
      pitMask.className = 'hole-pit-mask';

      // 두더지 액터 엘리먼트
      const moleActor = document.createElement('div');
      moleActor.className = 'mole-actor';
      moleActor.setAttribute('role', 'button');
      moleActor.setAttribute('tabindex', '0');
      moleActor.setAttribute('aria-label', `두더지 구멍 ${i + 1}`);

      pitMask.appendChild(moleActor);

      // 앞쪽 흙둔덕 (두더지가 땅속에서 튀어나오는 느낌을 주는 앞가림막)
      const moundFront = document.createElement('div');
      moundFront.className = 'hole-mound-front';

      // 귀여운 잔디 장식 풀
      const grassLeft = document.createElement('div');
      grassLeft.className = 'hole-grass-deco deco-left';
      const grassRight = document.createElement('div');
      grassRight.className = 'hole-grass-deco deco-right';

      cell.appendChild(pitMask);
      cell.appendChild(moundFront);
      cell.appendChild(grassLeft);
      cell.appendChild(grassRight);

      this.gridEl.appendChild(cell);

      this.holes.push({
        index: i,
        cellEl: cell,
        moleActor: moleActor,
        isOccupied: false
      });

      // 클릭 / 터치 이벤트 바인딩
      this.bindMoleClick(moleActor, i);
    }
  }

  // 도감 & 모달용 미니 프리뷰 SVG 주입
  renderPreviews() {
    const previewMap = {
      'preview-normal': 'normal',
      'preview-beige': 'beige',
      'preview-mushroom': 'mushroom',
      'preview-flower': 'flower',
      'preview-golden': 'golden',
      'preview-hero': 'golden'
    };

    Object.entries(previewMap).forEach(([className, type]) => {
      const el = document.querySelector(`.${className}`);
      if (el) {
        el.innerHTML = getMoleSVG(type, 'normal');
      }
    });
  }

  updateSoundUI() {
    if (this.sound.isMuted) {
      this.soundToggleBtn.classList.add('muted');
      this.soundIconEl.textContent = '🔇';
      this.soundLabelEl.textContent = '음소거';
    } else {
      this.soundToggleBtn.classList.remove('muted');
      this.soundIconEl.textContent = '🔊';
      this.soundLabelEl.textContent = '소리 켬';
    }
  }

  bindEvents() {
    // 음소거 토글
    this.soundToggleBtn.addEventListener('click', () => {
      this.sound.init();
      this.sound.toggleMute();
      this.updateSoundUI();
    });

    // 시작 버튼
    this.startBtn.addEventListener('click', () => {
      this.sound.init();
      this.startGame();
    });

    // 인트로 모달 시작 버튼
    this.modalStartBtn.addEventListener('click', () => {
      this.sound.init();
      this.introModal.classList.add('hidden');
      this.startGame();
    });

    // 재시작 버튼
    this.restartBtn.addEventListener('click', () => {
      this.sound.init();
      this.gameOverModal.classList.add('hidden');
      this.startGame();
    });
  }

  // ==========================================
  // 5. 클릭 및 잡기 판정
  // ==========================================
  bindMoleClick(moleActor, holeIndex) {
    // pointerdown으로 모바일 및 데스크톱에서 가장 빠르고 정확한 반응 제공
    const handleHit = (e) => {
      e.preventDefault();
      if (!this.isPlaying) return;

      const active = this.activeMoles.get(holeIndex);
      // 구멍에서 올라와 있고 아직 안 맞은 상태여야만 클릭 인정
      if (!active || active.isHit) return;

      // 히트 처리 (중복 클릭 방지)
      active.isHit = true;
      const typeInfo = MOLE_TYPES[active.type];

      // 점수 획득
      this.score += typeInfo.score;
      this.currentScoreEl.textContent = this.score;
      this.catchStats[active.type]++;

      // 효과음 재생
      this.sound.playCatchSound(active.type);

      // SVG 표정 변화 ('hit')
      moleActor.innerHTML = getMoleSVG(active.type, 'hit');
      moleActor.classList.add('is-hit');

      // 플로팅 점수 & 파티클 생성
      this.spawnScorePop(moleActor, typeInfo.score, active.type === 'golden');
      this.spawnParticles(moleActor, typeInfo.particleColors, active.type === 'golden');

      // 맞으면 약간의 리액션 후 빠르게 땅으로 내려감
      clearTimeout(active.timeoutId);
      setTimeout(() => {
        this.hideMole(holeIndex);
      }, 200);
    };

    moleActor.addEventListener('pointerdown', handleHit);
  }

  // ==========================================
  // 6. 두더지 출현 & 스케줄링 로직
  // ==========================================
  getRandomMoleType() {
    const rand = Math.random() * 100;
    let sum = 0;
    for (const key of Object.keys(MOLE_TYPES)) {
      sum += MOLE_TYPES[key].weight;
      if (rand <= sum) {
        return key;
      }
    }
    return 'normal';
  }

  popMole() {
    if (!this.isPlaying) return;

    // 현재 올라와 있는 두더지 수가 최대 허용치 미만일 때만 새 두더지 스폰
    if (this.activeMoles.size >= GAME_CONFIG.maxConcurrentMoles) {
      this.scheduleNextPop();
      return;
    }

    // 비어있는 구멍 후보들
    const availableHoles = this.holes.filter(h => !this.activeMoles.has(h.index));
    if (availableHoles.length === 0) {
      this.scheduleNextPop();
      return;
    }

    // 무작위 구멍 선택
    const chosenHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const moleType = this.getRandomMoleType();
    const moleActor = chosenHole.moleActor;

    // SVG 주입 & 클래스 세팅
    moleActor.innerHTML = getMoleSVG(moleType, 'normal');
    moleActor.className = `mole-actor is-up type-${moleType}`;

    // 머무는 시간 계산 (게임 후반부일수록 살짝 빨라짐)
    const timeProgress = 1 - (this.timeLeft / GAME_CONFIG.duration); // 0 ~ 1
    const baseStay = GAME_CONFIG.minMoleStay + Math.random() * (GAME_CONFIG.maxMoleStay - GAME_CONFIG.minMoleStay);
    const actualStay = Math.max(650, baseStay - timeProgress * 250);

    // 일정 시간 후 자동으로 쏙 숨기
    const timeoutId = setTimeout(() => {
      const active = this.activeMoles.get(chosenHole.index);
      if (active && !active.isHit) {
        this.hideMole(chosenHole.index);
      }
    }, actualStay);

    this.activeMoles.set(chosenHole.index, {
      moleEl: moleActor,
      type: moleType,
      timeoutId: timeoutId,
      isHit: false
    });

    this.scheduleNextPop();
  }

  hideMole(holeIndex) {
    const active = this.activeMoles.get(holeIndex);
    if (!active) return;

    active.moleEl.classList.remove('is-up');
    this.activeMoles.delete(holeIndex);

    // 완전히 내려간 뒤 초기화
    setTimeout(() => {
      active.moleEl.className = 'mole-actor';
      active.moleEl.innerHTML = '';
    }, 250);
  }

  scheduleNextPop() {
    if (!this.isPlaying) return;

    const interval = GAME_CONFIG.minPopInterval + Math.random() * (GAME_CONFIG.maxPopInterval - GAME_CONFIG.minPopInterval);
    this.spawnTimer = setTimeout(() => {
      this.popMole();
    }, interval);
  }

  // ==========================================
  // 7. 시각 효과 (플로팅 점수, 파티클)
  // ==========================================
  spawnScorePop(targetEl, score, isSpecial) {
    const rect = targetEl.getBoundingClientRect();
    const containerRect = this.effectLayer.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top + rect.height * 0.3 - containerRect.top;

    const popup = document.createElement('div');
    popup.className = `floating-score ${isSpecial ? 'special' : ''}`;
    popup.textContent = `+${score}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    this.effectLayer.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 850);
  }

  spawnParticles(targetEl, colors, isGolden) {
    const rect = targetEl.getBoundingClientRect();
    const containerRect = this.effectLayer.getBoundingClientRect();

    const originX = rect.left + rect.width / 2 - containerRect.left;
    const originY = rect.top + rect.height * 0.4 - containerRect.top;

    const count = isGolden ? 16 : 8;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.backgroundColor = color;

      const size = isGolden ? (6 + Math.random() * 8) : (5 + Math.random() * 5);
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;

      // 황금 두더지는 별 모양/둥근 형태 혼합
      if (isGolden && Math.random() > 0.5) {
        p.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      }

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = (isGolden ? 45 : 30) + Math.random() * 35;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 15; // 살짝 위로 튀는 느낌

      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);

      this.effectLayer.appendChild(p);

      setTimeout(() => {
        p.remove();
      }, 700);
    }
  }

  // ==========================================
  // 8. 게임 수명 주기 (Start, Tick, End)
  // ==========================================
  startGame() {
    // 이전 타이머 완전 초기화
    this.clearAllTimers();

    // 상태 리셋
    this.score = 0;
    this.timeLeft = GAME_CONFIG.duration;
    this.isPlaying = true;
    this.activeMoles.clear();

    this.catchStats = {
      normal: 0,
      beige: 0,
      mushroom: 0,
      flower: 0,
      golden: 0
    };

    // UI 갱신
    this.currentScoreEl.textContent = '0';
    this.timeLeftEl.textContent = `${this.timeLeft}s`;
    this.timeCardEl.classList.remove('warning');
    this.startBtn.disabled = true;
    this.startBtn.innerHTML = '<span class="btn-icon">⚡</span><span class="btn-text">게임 진행 중...</span>';

    // 기존 구멍 정리
    this.holes.forEach(h => {
      h.moleActor.className = 'mole-actor';
      h.moleActor.innerHTML = '';
    });

    // 시작 효과음
    this.sound.playStartChime();

    // 첫 두더지 즉시 등장 후 스케줄링
    this.popMole();
    setTimeout(() => this.popMole(), 300);

    // 1초 단위 타이머
    this.gameTimer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    this.timeLeft--;
    this.timeLeftEl.textContent = `${this.timeLeft}s`;

    // 10초 이하 경고
    if (this.timeLeft <= 10) {
      this.timeCardEl.classList.add('warning');
    }

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.isPlaying = false;
    this.clearAllTimers();

    // 모든 두더지 숨기기
    this.holes.forEach(h => {
      h.moleActor.classList.remove('is-up');
      setTimeout(() => {
        h.moleActor.className = 'mole-actor';
        h.moleActor.innerHTML = '';
      }, 200);
    });
    this.activeMoles.clear();

    // 버튼 복원
    this.startBtn.disabled = false;
    this.startBtn.innerHTML = '<span class="btn-icon">🌱</span><span class="btn-text">다시 시작하기!</span>';
    this.timeCardEl.classList.remove('warning');

    // 최고 점수 갱신 여부
    const isNewRecord = this.saveHighScore(this.score);

    // 종료 효과음
    this.sound.playGameOverSound();

    // 결과 모달 표시
    this.showGameOverModal(isNewRecord);
  }

  clearAllTimers() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    if (this.spawnTimer) {
      clearTimeout(this.spawnTimer);
      this.spawnTimer = null;
    }
    this.activeMoles.forEach(active => {
      clearTimeout(active.timeoutId);
    });
  }

  showGameOverModal(isNewRecord) {
    this.finalScoreDisplay.textContent = `${this.score}점`;
    this.finalHighScoreDisplay.textContent = `${this.highScore}점`;

    if (isNewRecord && this.score > 0) {
      this.newRecordTag.classList.remove('hidden');
      this.gameResultTitle.textContent = '🎉 신기록 달성!';
      this.gameResultDesc.textContent = '와우! 숲속 정원의 최고의 두더지 사냥꾼이 탄생했어요!';
      this.resultHero.innerHTML = getMoleSVG('golden', 'normal');
    } else {
      this.newRecordTag.classList.add('hidden');
      this.gameResultTitle.textContent = '게임 종료!';
      this.gameResultDesc.textContent = this.score >= 200
        ? '정말 훌륭한 실력이에요! 두더지들이 깜짝 놀랐겠어요!'
        : '수고하셨어요! 다음엔 더 많은 두더지를 잡아볼까요?';
      this.resultHero.innerHTML = getMoleSVG(this.score >= 100 ? 'flower' : 'beige', 'normal');
    }

    // 두더지 종류별 잡은 개수 요약
    this.moleCatchStats.innerHTML = `
      <div class="stat-chip">
        <span class="stat-chip-icon">🌰</span>
        <span class="stat-chip-name">일반</span>
        <span class="stat-chip-num">${this.catchStats.normal}마리</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip-icon">🍞</span>
        <span class="stat-chip-name">베이지</span>
        <span class="stat-chip-num">${this.catchStats.beige}마리</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip-icon">🍄</span>
        <span class="stat-chip-name">버섯</span>
        <span class="stat-chip-num">${this.catchStats.mushroom}마리</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip-icon">🌸</span>
        <span class="stat-chip-name">꽃</span>
        <span class="stat-chip-num">${this.catchStats.flower}마리</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip-icon">✨</span>
        <span class="stat-chip-name">황금</span>
        <span class="stat-chip-num" style="color: #e65100;">${this.catchStats.golden}마리</span>
      </div>
    `;

    this.gameOverModal.classList.remove('hidden');
  }
}

// ==========================================
// 9. DOM 준비 시 게임 인스턴스 시작
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  window.forestGame = new WhackAMoleGame();
});
