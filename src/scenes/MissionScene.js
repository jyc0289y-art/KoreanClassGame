import Phaser from 'phaser';
import { CHARACTERS, NPCS } from '../constants.js';
import { gameState } from '../systems/GameState.js';

export default class MissionScene extends Phaser.Scene {
  constructor() { super({ key: 'MissionScene' }); }

  init(data) {
    this.missions = data.missions || [];
    this.returnScene = data.returnScene;
    this.currentMissionIndex = 0;
    this.score = { correct: 0, total: 0, xp: 0, coins: 0 };
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a2e);

    // Header
    this.add.text(w / 2, 15, '미션 / ミッション', {
      fontSize: '16px', color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.progressText = this.add.text(w / 2, 35, '', { fontSize: '11px', color: '#888888' }).setOrigin(0.5);

    // Close button
    this.add.text(w - 15, 10, '✕', { fontSize: '20px', color: '#888888' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeMission());

    // Mission container
    this.missionContainer = this.add.container(0, 0);

    this.showMission();
  }

  showMission() {
    this.missionContainer.removeAll(true);

    if (this.currentMissionIndex >= this.missions.length) {
      this.showResults();
      return;
    }

    const mission = this.missions[this.currentMissionIndex];
    this.progressText.setText(`${this.currentMissionIndex + 1} / ${this.missions.length}`);
    this.score.total++;

    switch (mission.type) {
      case 'multiple_choice': this.showMultipleChoice(mission); break;
      case 'fill_blank': this.showFillBlank(mission); break;
      case 'word_match': this.showWordMatch(mission); break;
      case 'pronunciation_check': this.showPronunciationCheck(mission); break;
      case 'grammar_point': this.showGrammarPoint(mission); break;
      case 'dialogue_order': this.showDialogueOrder(mission); break;
      default: this.showMultipleChoice(mission);
    }
  }

  showMultipleChoice(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 60, '📝 객관식 / 選択問題', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    const qKo = this.add.text(w / 2, 95, m.question_ko, {
      fontSize: '15px', color: '#ffffff', fontStyle: 'bold', wordWrap: { width: w - 40 }, align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qKo);

    const qJa = this.add.text(w / 2, 120, m.question_ja, {
      fontSize: '11px', color: '#aaaacc', wordWrap: { width: w - 40 }, align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qJa);

    m.choices.forEach((choice, i) => {
      const cy = 160 + i * 50;
      const bg = this.add.rectangle(w / 2, cy, w - 50, 40, 0x1a1a3e, 0.8)
        .setStrokeStyle(1, 0x333366, 0.5)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(w / 2, cy, `${['A', 'B', 'C', 'D'][i]}. ${choice}`, {
        fontSize: '13px', color: '#ffffff'
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setStrokeStyle(1, 0xff69b4, 0.8));
      bg.on('pointerout', () => bg.setStrokeStyle(1, 0x333366, 0.5));
      bg.on('pointerdown', () => this.handleAnswer(i === m.correct, m, bg, i));

      this.missionContainer.add([bg, label]);
    });
  }

  showFillBlank(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 60, '✏️ 빈칸 채우기 / 穴埋め', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    const qKo = this.add.text(w / 2, 95, m.question_ko, {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold', wordWrap: { width: w - 40 }, align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qKo);

    const qJa = this.add.text(w / 2, 120, m.question_ja || '', {
      fontSize: '11px', color: '#aaaacc', wordWrap: { width: w - 40 }, align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qJa);

    if (m.hint_ko) {
      const hint = this.add.text(w / 2, 145, `💡 ${m.hint_ko}`, { fontSize: '10px', color: '#88cc88' }).setOrigin(0.5);
      this.missionContainer.add(hint);
    }

    m.choices.forEach((choice, i) => {
      const cy = 175 + i * 48;
      const bg = this.add.rectangle(w / 2, cy, w - 50, 38, 0x1a1a3e, 0.8)
        .setStrokeStyle(1, 0x333366, 0.5).setInteractive({ useHandCursor: true });
      const label = this.add.text(w / 2, cy, choice, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setStrokeStyle(1, 0xff69b4, 0.8));
      bg.on('pointerout', () => bg.setStrokeStyle(1, 0x333366, 0.5));
      bg.on('pointerdown', () => this.handleAnswer(choice === m.answer, m, bg, i));
      this.missionContainer.add([bg, label]);
    });
  }

  showWordMatch(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 60, '🔗 단어 매칭 / 単語マッチング', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    const qText = this.add.text(w / 2, 90, `${m.question_ko}\n${m.question_ja}`, {
      fontSize: '13px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qText);

    // Simplified: show as matching pairs quiz
    this.matchState = { selected: null, matched: 0, total: m.pairs.length };
    const shuffledJa = Phaser.Utils.Array.Shuffle([...m.pairs.map(p => p.japanese)]);

    m.pairs.forEach((pair, i) => {
      const y = 130 + i * 42;
      // Korean side (left)
      const koBg = this.add.rectangle(w * 0.25, y, 130, 32, 0x1a2a4e, 0.8)
        .setStrokeStyle(1, 0x4488ff, 0.5).setInteractive({ useHandCursor: true });
      const koText = this.add.text(w * 0.25, y, pair.korean, { fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);
      koBg.pairData = { type: 'ko', word: pair.korean, match: pair.japanese, index: i };

      // Japanese side (right)
      const jaBg = this.add.rectangle(w * 0.75, y, 130, 32, 0x2a1a4e, 0.8)
        .setStrokeStyle(1, 0xff69b4, 0.5).setInteractive({ useHandCursor: true });
      const jaText = this.add.text(w * 0.75, y, shuffledJa[i], { fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);
      jaBg.pairData = { type: 'ja', word: shuffledJa[i], index: i };

      const handleSelect = (bg) => {
        if (!this.matchState.selected) {
          this.matchState.selected = bg;
          bg.setStrokeStyle(2, 0xffff00);
        } else {
          const first = this.matchState.selected;
          const second = bg;

          if (first.pairData.type !== second.pairData.type) {
            const koWord = first.pairData.type === 'ko' ? first.pairData : second.pairData;
            const jaWord = first.pairData.type === 'ja' ? first.pairData : second.pairData;

            const correctPair = m.pairs.find(p => p.korean === koWord.word);
            if (correctPair && correctPair.japanese === jaWord.word) {
              first.setFillStyle(0x006600, 0.8);
              second.setFillStyle(0x006600, 0.8);
              first.disableInteractive();
              second.disableInteractive();
              this.matchState.matched++;

              if (this.matchState.matched >= this.matchState.total) {
                setTimeout(() => this.handleAnswer(true, m), 500);
              }
            } else {
              first.setStrokeStyle(2, 0xff0000);
              second.setStrokeStyle(2, 0xff0000);
              setTimeout(() => {
                first.setStrokeStyle(1, first.pairData.type === 'ko' ? 0x4488ff : 0xff69b4, 0.5);
                second.setStrokeStyle(1, second.pairData.type === 'ko' ? 0x4488ff : 0xff69b4, 0.5);
              });
            }
          }
          this.matchState.selected = null;
        }
      };

      koBg.on('pointerdown', () => handleSelect(koBg));
      jaBg.on('pointerdown', () => handleSelect(jaBg));
      this.missionContainer.add([koBg, koText, jaBg, jaText]);
    });
  }

  showPronunciationCheck(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 60, '🗣️ 발음 체크 / 発音チェック', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    // Rule badge
    const ruleBadge = this.add.text(w / 2, 82, `${m.rule} / ${m.rule_ja}`, {
      fontSize: '10px', color: '#88cc88', backgroundColor: '#88cc8822', padding: { x: 6, y: 2 }
    }).setOrigin(0.5);
    this.missionContainer.add(ruleBadge);

    // Word display
    const wordDisplay = this.add.text(w / 2, 115, m.word, {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.missionContainer.add(wordDisplay);

    const qKo = this.add.text(w / 2, 148, m.question_ko, { fontSize: '12px', color: '#ccccee' }).setOrigin(0.5);
    const qJa = this.add.text(w / 2, 166, m.question_ja, { fontSize: '10px', color: '#8888aa' }).setOrigin(0.5);
    this.missionContainer.add([qKo, qJa]);

    m.choices.forEach((choice, i) => {
      const cy = 200 + i * 46;
      const bg = this.add.rectangle(w / 2, cy, w - 50, 36, 0x1a1a3e, 0.8)
        .setStrokeStyle(1, 0x333366, 0.5).setInteractive({ useHandCursor: true });
      const label = this.add.text(w / 2, cy, choice, { fontSize: '15px', color: '#ffffff' }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setStrokeStyle(1, 0xff69b4, 0.8));
      bg.on('pointerout', () => bg.setStrokeStyle(1, 0x333366, 0.5));
      bg.on('pointerdown', () => this.handleAnswer(i === m.correct, m, bg, i));
      this.missionContainer.add([bg, label]);
    });
  }

  showGrammarPoint(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 55, '📖 문법 포인트 / 文法ポイント', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    // Grammar title
    const title = this.add.text(w / 2, 80, m.grammar_ko, {
      fontSize: '18px', color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5);
    const titleJa = this.add.text(w / 2, 100, m.grammar_ja, {
      fontSize: '12px', color: '#da70d6'
    }).setOrigin(0.5);
    this.missionContainer.add([title, titleJa]);

    // Explanation
    const explKo = this.add.text(20, 120, m.explanation_ko, {
      fontSize: '12px', color: '#ffffff', wordWrap: { width: w - 40 }
    });
    const explJa = this.add.text(20, 140, m.explanation_ja, {
      fontSize: '10px', color: '#aaaacc', wordWrap: { width: w - 40 }
    });
    this.missionContainer.add([explKo, explJa]);

    // Example
    if (m.examples && m.examples[0]) {
      const ex = m.examples[0];
      const exBox = this.add.rectangle(w / 2, 182, w - 30, 50, 0x1a2a3e, 0.6)
        .setStrokeStyle(1, 0x4488ff, 0.3);
      const exKo = this.add.text(25, 167, `예) ${ex.ko}`, { fontSize: '12px', color: '#88ccff' });
      const exPron = this.add.text(25, 183, ex.pronunciation, { fontSize: '10px', color: '#88aa88' });
      const exJa = this.add.text(25, 197, ex.ja, { fontSize: '10px', color: '#aaaacc' });
      this.missionContainer.add([exBox, exKo, exPron, exJa]);
    }

    // Exercise
    if (m.exercise) {
      const ex = m.exercise;
      const qText = this.add.text(w / 2, 230, ex.sentence_ko, {
        fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      const qJa = this.add.text(w / 2, 250, ex.sentence_ja, { fontSize: '10px', color: '#aaaacc' }).setOrigin(0.5);
      this.missionContainer.add([qText, qJa]);

      ex.choices.forEach((choice, i) => {
        const cx = (w / (ex.choices.length + 1)) * (i + 1);
        const bg = this.add.rectangle(cx, 285, 60, 32, 0x1a1a3e, 0.8)
          .setStrokeStyle(1, 0x333366, 0.5).setInteractive({ useHandCursor: true });
        const label = this.add.text(cx, 285, choice, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

        bg.on('pointerdown', () => this.handleAnswer(choice === ex.answer, m, bg, i));
        this.missionContainer.add([bg, label]);
      });
    }
  }

  showDialogueOrder(m) {
    const w = this.cameras.main.width;

    const typeBadge = this.add.text(w / 2, 60, '🔢 대화 순서 / 会話の順番', {
      fontSize: '11px', color: '#ffd700', backgroundColor: '#ffd70022', padding: { x: 8, y: 3 }
    }).setOrigin(0.5);
    this.missionContainer.add(typeBadge);

    const qText = this.add.text(w / 2, 85, `${m.question_ko}\n${m.question_ja}`, {
      fontSize: '12px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5);
    this.missionContainer.add(qText);

    // Shuffled lines
    this.orderState = { selected: [], lines: Phaser.Utils.Array.Shuffle([...m.lines.map((l, i) => ({ ...l, correctIndex: i }))]) };

    this.orderState.lines.forEach((line, i) => {
      const y = 125 + i * 52;
      const bg = this.add.rectangle(w / 2, y, w - 30, 44, 0x1a1a3e, 0.8)
        .setStrokeStyle(1, 0x333366, 0.5).setInteractive({ useHandCursor: true });
      const numBadge = this.add.text(20, y - 10, `${i + 1}`, { fontSize: '10px', color: '#666688' });
      const speakerName = CHARACTERS[line.speaker]?.name_ko || NPCS[line.speaker]?.name_ko || line.speaker;
      const speaker = this.add.text(40, y - 12, speakerName, { fontSize: '10px', color: '#ff69b4' });
      const text = this.add.text(40, y + 2, line.text_ko, { fontSize: '12px', color: '#ffffff', wordWrap: { width: w - 80 } });
      const jaText = this.add.text(40, y + 18, line.text_ja, { fontSize: '9px', color: '#888888', wordWrap: { width: w - 80 } });

      bg.lineData = line;
      bg.orderIndex = i;
      bg.numBadge = numBadge;

      bg.on('pointerdown', () => {
        const order = this.orderState.selected.length + 1;
        if (!this.orderState.selected.includes(bg)) {
          this.orderState.selected.push(bg);
          numBadge.setText(`${order}`).setColor('#ff69b4');
          bg.setStrokeStyle(2, 0xff69b4, 0.8);

          if (this.orderState.selected.length === m.lines.length) {
            const isCorrect = this.orderState.selected.every((b, idx) => b.lineData.correctIndex === idx);
            this.handleAnswer(isCorrect, m);
          }
        }
      });

      this.missionContainer.add([bg, numBadge, speaker, text, jaText]);
    });

    // Reset button
    const resetBtn = this.add.text(w / 2, 125 + m.lines.length * 52 + 10, '🔄 리셋 / リセット', {
      fontSize: '11px', color: '#888888', backgroundColor: '#ffffff11', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      this.orderState.selected = [];
      this.missionContainer.removeAll(true);
      this.showDialogueOrder(m);
    });
    this.missionContainer.add(resetBtn);
  }

  handleAnswer(isCorrect, mission, selectedBg, selectedIndex) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    if (isCorrect) {
      this.score.correct++;
      this.score.xp += mission.xp || 10;
      this.score.coins += mission.coin || 2;
      gameState.addExp(mission.xp || 10);
      gameState.addCoins(mission.coin || 2);
      gameState.completeMission(mission.id);
    }

    if (selectedBg) {
      selectedBg.setFillStyle(isCorrect ? 0x006600 : 0x660000, 0.8);
    }

    // Feedback overlay
    const feedback = this.add.container(0, 0).setDepth(50);
    const fbBg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.5);
    const fbBox = this.add.rectangle(w / 2, h / 2, w - 40, 160, 0x0d0d2b, 0.95)
      .setStrokeStyle(2, isCorrect ? 0x00ff88 : 0xff4444);
    const fbIcon = this.add.text(w / 2, h / 2 - 50, isCorrect ? '⭕ 정답!' : '❌ 오답!', {
      fontSize: '24px', color: isCorrect ? '#00ff88' : '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5);
    const fbIconJa = this.add.text(w / 2, h / 2 - 25, isCorrect ? '正解！' : '不正解！', {
      fontSize: '12px', color: isCorrect ? '#00cc66' : '#cc3333'
    }).setOrigin(0.5);

    let expLine = '';
    if (isCorrect) expLine = `+${mission.xp || 10} XP  💰 +${mission.coin || 2}`;
    const fbReward = this.add.text(w / 2, h / 2, expLine, { fontSize: '14px', color: '#ffd700' }).setOrigin(0.5);

    // Explanation
    const explText = mission.explanation_ko || '';
    const explJaText = mission.explanation_ja || '';
    const fbExpl = this.add.text(w / 2, h / 2 + 25, explText, { fontSize: '11px', color: '#ccccee', wordWrap: { width: w - 60 }, align: 'center' }).setOrigin(0.5);
    const fbExplJa = this.add.text(w / 2, h / 2 + 48, explJaText, { fontSize: '9px', color: '#888888', wordWrap: { width: w - 60 }, align: 'center' }).setOrigin(0.5);

    const fbNext = this.add.text(w / 2, h / 2 + 70, '▶ 다음 / 次へ', {
      fontSize: '13px', color: '#ffffff', backgroundColor: '#ff69b444', padding: { x: 20, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    feedback.add([fbBg, fbBox, fbIcon, fbIconJa, fbReward, fbExpl, fbExplJa, fbNext]);

    fbNext.on('pointerdown', () => {
      feedback.destroy();
      this.missionContainer.removeAll(true);
      this.currentMissionIndex++;
      this.showMission();
    });
  }

  showResults() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.missionContainer.removeAll(true);

    const pct = Math.round((this.score.correct / this.missions.length) * 100);
    const grade = pct >= 90 ? 'S' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : 'C';
    const gradeColors = { S: '#ffd700', A: '#00ff88', B: '#4488ff', C: '#ff6644' };

    this.add.text(w / 2, h * 0.15, '🎉 미션 완료!', { fontSize: '24px', color: '#ff69b4', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.22, 'ミッション完了！', { fontSize: '14px', color: '#da70d6' }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.33, grade, {
      fontSize: '64px', color: gradeColors[grade], fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.48, `정답률 / 正答率: ${this.score.correct}/${this.missions.length} (${pct}%)`, {
      fontSize: '14px', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.56, `획득 XP: +${this.score.xp}  |  💰 +${this.score.coins}`, {
      fontSize: '14px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.64, `현재 레벨 / 現在レベル: Lv.${gameState.current.level}  EXP: ${gameState.current.exp}/${gameState.expToNextLevel}`, {
      fontSize: '12px', color: '#88cc88'
    }).setOrigin(0.5);

    // Buttons
    const retryBtn = this.add.text(w / 2, h * 0.76, '🔄 다시 도전 / もう一度', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#4488ff44', padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => {
      this.currentMissionIndex = 0;
      this.score = { correct: 0, total: 0, xp: 0, coins: 0 };
      this.scene.restart({ missions: this.missions, returnScene: this.returnScene });
    });

    const backBtn = this.add.text(w / 2, h * 0.86, '🏠 돌아가기 / 戻る', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#ff69b444', padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.closeMission());

    gameState.save();
  }

  closeMission() {
    if (this.returnScene) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
