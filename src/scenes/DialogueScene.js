import Phaser from 'phaser';
import { CHARACTERS, NPCS, HOBIS } from '../constants.js';

export default class DialogueScene extends Phaser.Scene {
  constructor() { super({ key: 'DialogueScene' }); }

  init(data) {
    this.dialogueData = data.dialogue;
    this.returnScene = data.returnScene;
    this.lineIndex = 0;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Semi-transparent overlay
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);

    // Scene title — HOBIS cyan
    if (this.dialogueData.scene_title_ko) {
      this.add.text(w / 2, 24, '── COMM LINK ──', {
        fontSize: '9px', fontFamily: HOBIS.FONT_HEADER, color: HOBIS.CYAN
      }).setOrigin(0.5);
      this.add.text(w / 2, 40, `${this.dialogueData.scene_title_ko} / ${this.dialogueData.scene_title_ja}`, {
        fontSize: '13px', fontFamily: HOBIS.FONT_KR, color: HOBIS.CYAN, fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 0, color: '#00f7ff33', blur: 6, fill: true }
      }).setOrigin(0.5);
    }

    // Dialogue box — HOBIS panel style
    const boxY = h - 90;
    const boxW = w - 20;
    const boxH = 150;
    this.dialogBox = this.add.rectangle(w / 2, boxY, boxW, boxH, HOBIS.PANEL_HEX, 0.95)
      .setStrokeStyle(1, HOBIS.CYAN_HEX, 0.6);

    // Corner brackets on dialogue box
    this.drawCornerBrackets(w / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, HOBIS.CYAN_HEX, 0.4);

    // Speaker portrait area — cyan ring
    this.portrait = this.add.circle(50, h - 140, 20, HOBIS.PANEL_HEX);
    this.portrait.setStrokeStyle(2, HOBIS.CYAN_HEX, 0.6);

    // Speaker names
    this.speakerName = this.add.text(80, h - 155, '', {
      fontSize: '13px', fontFamily: HOBIS.FONT_KR, color: HOBIS.CYAN, fontStyle: 'bold'
    });
    this.speakerNameJa = this.add.text(80, h - 138, '', {
      fontSize: '10px', fontFamily: HOBIS.FONT_JP, color: HOBIS.MUTED
    });

    // Dialogue text — green Korean, muted Japanese
    this.textKo = this.add.text(25, h - 115, '', {
      fontSize: '15px', fontFamily: HOBIS.FONT_KR, color: HOBIS.GREEN,
      wordWrap: { width: w - 50 }, lineSpacing: 3
    });
    this.textJa = this.add.text(25, h - 75, '', {
      fontSize: '12px', fontFamily: HOBIS.FONT_JP, color: '#aac0c0',
      wordWrap: { width: w - 50 }, lineSpacing: 2
    });
    this.textPron = this.add.text(25, h - 48, '', {
      fontSize: '10px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.BORDER,
      wordWrap: { width: w - 50 }
    });

    // Progress indicator — cyan mono
    this.progressText = this.add.text(w - 25, h - 25, '', {
      fontSize: '10px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.CYAN
    }).setOrigin(1, 0.5);

    // Next indicator — green pulsing
    this.nextHint = this.add.text(w / 2, h - 20, '▼ NEXT', {
      fontSize: '10px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.GREEN,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff3322', blur: 4, fill: true }
    }).setOrigin(0.5);
    this.tweens.add({ targets: this.nextHint, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    // Show first line
    this.showLine();

    // Input
    this.input.on('pointerdown', () => this.nextLine());
    this.input.keyboard.on('keydown-SPACE', () => this.nextLine());
  }

  drawCornerBrackets(x, y, w, h, color, alpha) {
    const g = this.add.graphics();
    const len = 10;
    g.lineStyle(1, color, alpha);
    // Top-left
    g.lineBetween(x, y, x + len, y);
    g.lineBetween(x, y, x, y + len);
    // Top-right
    g.lineBetween(x + w, y, x + w - len, y);
    g.lineBetween(x + w, y, x + w, y + len);
    // Bottom-left
    g.lineBetween(x, y + h, x + len, y + h);
    g.lineBetween(x, y + h, x, y + h - len);
    // Bottom-right
    g.lineBetween(x + w, y + h, x + w - len, y + h);
    g.lineBetween(x + w, y + h, x + w, y + h - len);
  }

  showLine() {
    const lines = this.dialogueData.lines;
    if (this.lineIndex >= lines.length) {
      this.closeDialogue();
      return;
    }

    const line = lines[this.lineIndex];
    const chars = { ...CHARACTERS, ...NPCS };
    const charData = chars[line.speaker] || { name_ko: line.speaker, name_ja: '', color: HOBIS.CYAN };

    // Update portrait — character color ring
    const charColor = Phaser.Display.Color.HexStringToColor(charData.color || HOBIS.CYAN).color;
    this.portrait.setFillStyle(HOBIS.PANEL_HEX);
    this.portrait.setStrokeStyle(2, charColor, 0.8);

    // Update texts with typewriter effect
    this.speakerName.setText(charData.name_ko || line.speaker);
    this.speakerNameJa.setText(charData.name_ja || '');

    // Typewriter effect for Korean text
    this.textKo.setText('');
    this.textJa.setText(line.text_ja || '');
    this.textPron.setText(line.pronunciation || '');

    const fullText = line.text_ko;
    let charIndex = 0;
    if (this.typeTimer) this.typeTimer.remove();
    this.typeTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        charIndex++;
        this.textKo.setText(fullText.substring(0, charIndex));
        if (charIndex >= fullText.length && this.typeTimer) this.typeTimer.remove();
      },
      repeat: fullText.length - 1
    });

    // Emotion indicator
    const emotions = { excited: '✨', happy: '😊', calm: '😌', nervous: '😅', friendly: '🤝', surprised: '😮' };
    if (line.emotion) {
      this.speakerName.setText(`${charData.name_ko} ${emotions[line.emotion] || ''}`);
    }

    this.progressText.setText(`${this.lineIndex + 1}/${lines.length}`);
  }

  nextLine() {
    const lines = this.dialogueData.lines;
    // If typewriter is still running, complete it
    if (this.typeTimer && this.typeTimer.getProgress() < 1) {
      this.typeTimer.remove();
      this.textKo.setText(lines[this.lineIndex].text_ko);
      return;
    }
    this.lineIndex++;
    this.showLine();
  }

  closeDialogue() {
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
