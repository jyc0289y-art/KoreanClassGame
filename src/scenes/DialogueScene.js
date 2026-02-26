import Phaser from 'phaser';
import { CHARACTERS, NPCS } from '../constants.js';

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

    // Scene title
    if (this.dialogueData.scene_title_ko) {
      this.add.text(w / 2, 30, `${this.dialogueData.scene_title_ko} / ${this.dialogueData.scene_title_ja}`, {
        fontSize: '14px', color: '#ff69b4', fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Dialogue box
    this.dialogBox = this.add.rectangle(w / 2, h - 90, w - 20, 150, 0x0d0d2b, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.5);

    // Speaker portrait area
    this.portrait = this.add.circle(50, h - 140, 20, 0xff69b4);
    this.speakerName = this.add.text(80, h - 155, '', {
      fontSize: '13px', color: '#ff69b4', fontStyle: 'bold'
    });
    this.speakerNameJa = this.add.text(80, h - 138, '', {
      fontSize: '10px', color: '#aaaacc'
    });

    // Dialogue text
    this.textKo = this.add.text(25, h - 115, '', {
      fontSize: '15px', color: '#ffffff', wordWrap: { width: w - 50 }, lineSpacing: 3
    });
    this.textJa = this.add.text(25, h - 75, '', {
      fontSize: '12px', color: '#bbbbdd', wordWrap: { width: w - 50 }, lineSpacing: 2
    });
    this.textPron = this.add.text(25, h - 48, '', {
      fontSize: '10px', color: '#88aa88', wordWrap: { width: w - 50 }
    });

    // Progress indicator
    this.progressText = this.add.text(w - 25, h - 25, '', {
      fontSize: '10px', color: '#666688'
    }).setOrigin(1, 0.5);

    // Next indicator
    this.nextHint = this.add.text(w / 2, h - 20, '▼ 탭하여 계속 / タップで続く', {
      fontSize: '10px', color: '#888888'
    }).setOrigin(0.5);
    this.tweens.add({ targets: this.nextHint, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    // Show first line
    this.showLine();

    // Input
    this.input.on('pointerdown', () => this.nextLine());
    this.input.keyboard.on('keydown-SPACE', () => this.nextLine());
  }

  showLine() {
    const lines = this.dialogueData.lines;
    if (this.lineIndex >= lines.length) {
      this.closeDialogue();
      return;
    }

    const line = lines[this.lineIndex];
    const chars = { ...CHARACTERS, ...NPCS };
    const charData = chars[line.speaker] || { name_ko: line.speaker, name_ja: '', color: '#ffffff' };

    // Update portrait color
    this.portrait.setFillStyle(Phaser.Display.Color.HexStringToColor(charData.color || '#ffffff').color);

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
