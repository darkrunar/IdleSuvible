import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create(data) {
        const width = this.scale.width;
        const height = this.scale.height;

        // --- HUD ---

        // EXP Bar (Top)
        this.expBarBg = this.add.graphics();
        this.expBarBg.fillStyle(0x222222, 1);
        this.expBarBg.fillRect(0, 0, width, 20);

        this.expBar = this.add.graphics();
        this.expBar.fillStyle(0x00ffff, 1);
        this.expBar.fillRect(0, 0, 0, 20); // Starts empty

        this.levelText = this.add.text(10, 25, 'LV 1', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Skill List Container (Left Side, below Level)
        this.skillListContainer = this.add.container(10, 60);

        // Timer (Top Center)
        this.timerText = this.add.text(width / 2, 35, '00:00', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Kill Counter (Top Right)
        this.killText = this.add.text(width - 20, 35, 'Kills: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0.5);

        // Health Bar (Bottom Center)
        // Container for health bar to center it easily
        const healthBarWidth = 300;
        const healthBarHeight = 20;
        const healthBarX = (width - healthBarWidth) / 2;
        const healthBarY = height - 40;

        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x000000, 0.8);
        this.healthBarBg.fillRoundedRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4, 4);

        this.healthBar = this.add.graphics();
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRoundedRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight, 2);

        this.healthText = this.add.text(width / 2, healthBarY + 10, '100 / 100', {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Listen to GameScene events
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateExp', this.updateExpUI, this);
        gameScene.events.on('updateHealth', this.updateHealthUI, this);
        gameScene.events.on('updateTime', this.updateTimerUI, this);
        gameScene.events.on('updateKills', this.updateKillsUI, this);
        gameScene.events.on('playerDeath', this.showGameOver, this);
        gameScene.events.on('updateSkillList', this.updateSkillList, this);

        // Listen for direct events from SkillManager (via UIScene events)
        this.events.on('levelUp', this.handleLevelUpEvent, this);

        // Level Up Modal (Hidden by default)
        this.createLevelUpModal();
        this.createGameOverModal();

        if (data && data.showLevelUp) {
            this.showLevelUp(data.skills);
            if (data.playerX !== undefined && data.playerY !== undefined) {
                this.showLevelUpEffect(data.playerX, data.playerY);
            }
        }
    }

    handleLevelUpEvent(skills, playerX, playerY) {
        if (playerX !== undefined && playerY !== undefined) {
            this.showLevelUpEffect(playerX, playerY);
        }
        this.showLevelUp(skills);

        // TEST FEATURE: Auto-select first card after 100ms
        this.time.delayedCall(100, () => {
            if (this.skillButtons && this.skillButtons.length > 0) {
                const firstButton = this.skillButtons[0];
                if (firstButton && firstButton.active) {
                    firstButton.emit('pointerdown');
                }
            }
        });
    }

    createLevelUpModal() {
        this.modalContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        this.modalContainer.setVisible(false);
        this.skillButtons = [];
    }

    showLevelUpEffect(x, y) {
        const effect = this.add.image(x, y, 'levelup_effect');
        effect.setScale(0);
        this.tweens.add({
            targets: effect,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            onComplete: () => effect.destroy()
        });
    }

    // ... (showLevelUpEffect)

    showLevelUp(skills) {
        this.modalContainer.setVisible(true);

        // Clear old buttons
        this.skillButtons.forEach(btn => btn.destroy());
        this.skillButtons = [];

        if (!skills || skills.length === 0) {
            const errText = this.add.text(0, 0, 'NO SKILLS', { fontSize: '32px', fill: '#ff0000' });
            this.modalContainer.add(errText);
            return;
        }

        const cardWidth = 220;
        const cardHeight = 300;
        const spacing = 40;
        const startX = -((cardWidth * 3) + (spacing * 2)) / 2 + cardWidth / 2;

        skills.forEach((skill, index) => {
            const xPos = startX + (index * (cardWidth + spacing));
            const yPos = 50;

            const cardContainer = this.add.container(xPos, yPos);

            // Card Background
            const cardBg = this.add.image(0, 0, 'card_bg');
            cardBg.setDisplaySize(cardWidth, cardHeight);
            cardContainer.add(cardBg); // Add background FIRST

            // Interactive Zone on Container (Covers everything)
            const hitArea = new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            cardContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

            // Hover Effects
            cardContainer.on('pointerover', () => {
                cardContainer.setScale(1.1);
                cardBg.setTint(0xcccccc);
            });

            cardContainer.on('pointerout', () => {
                cardContainer.setScale(1.0);
                cardBg.clearTint();
            });

            cardContainer.on('pointerdown', () => {
                console.log('Card clicked:', skill.id);
                this.selectSkill(skill.id);
            });

            // Skill Name
            const nameText = this.add.text(0, 10, skill.name, {
                fontSize: '24px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: cardWidth - 20 }
            }).setOrigin(0.5);

            // Skill Description
            const descText = this.add.text(0, 60, skill.description, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#cccccc',
                align: 'center',
                wordWrap: { width: cardWidth - 30 }
            }).setOrigin(0.5);

            // Skill Icon
            if (skill.icon) {
                const icon = this.add.image(0, -50, skill.icon);
                icon.setDisplaySize(64, 64);
                cardContainer.add(icon);
            }

            // Add elements to container
            cardContainer.add([nameText, descText]);

            this.modalContainer.add(cardContainer);
            this.skillButtons.push(cardContainer);
        });
    }

    updateExpUI(currentExp, expToNextLevel, level) {
        this.levelText.setText(`LVL ${level}`);

        const percent = Phaser.Math.Clamp(currentExp / expToNextLevel, 0, 1);
        this.expBar.clear();
        this.expBar.fillStyle(0x00ffff, 1);
        this.expBar.fillRect(0, 0, this.scale.width * percent, 20);
    }

    updateHealthUI(currentHealth, maxHealth) {
        const percent = Phaser.Math.Clamp(currentHealth / maxHealth, 0, 1);
        const width = this.scale.width;
        const healthBarWidth = 300;
        const healthBarHeight = 20;
        const healthBarX = (width - healthBarWidth) / 2;
        const healthBarY = this.scale.height - 40;

        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRoundedRect(healthBarX, healthBarY, healthBarWidth * percent, healthBarHeight, 2);

        this.healthText.setText(`${Math.ceil(currentHealth)} / ${maxHealth}`);
    }

    updateTimerUI(time) {
        const totalSeconds = Math.floor(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText(formattedTime);
    }

    updateKillsUI(count) {
        this.killText.setText(`Kills: ${count}`);
    }

    updateSkillList(skills) {
        this.skillListContainer.removeAll(true);

        const iconSize = 32;
        const spacing = 15;
        let yPos = 0;

        Object.values(skills).forEach((skill) => {
            const container = this.add.container(0, yPos);

            // Icon
            if (skill.icon) {
                const icon = this.add.image(iconSize / 2, iconSize / 2, skill.icon);
                icon.setDisplaySize(iconSize, iconSize);
                container.add(icon);
            }

            // Skill Name
            const nameText = this.add.text(iconSize + 10, -2, skill.name, {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            container.add(nameText);

            // Level (Count)
            const levelText = this.add.text(iconSize + 10, 14, `Lv ${skill.count}`, {
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            container.add(levelText);

            this.skillListContainer.add(container);
            yPos += iconSize + spacing;
        });
    }

    selectSkill(skillId) {
        const gameScene = this.scene.get('GameScene');
        gameScene.skillManager.applySkill(skillId);
        this.hideLevelUp();
    }

    hideLevelUp() {
        this.modalContainer.setVisible(false);
        this.scene.resume('GameScene');
    }

    createGameOverModal() {
        this.gameOverContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        this.gameOverContainer.setVisible(false);

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(-300, -200, 600, 400);
        this.gameOverContainer.add(bg);

        const title = this.add.text(0, -50, 'GAME OVER', { fontSize: '48px', fill: '#ff0000' }).setOrigin(0.5);
        this.gameOverContainer.add(title);

        const restartBtn = this.add.text(0, 50, 'Click to Restart', { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
                this.scene.start('UIScene');
            });
        this.gameOverContainer.add(restartBtn);
    }

    showGameOver() {
        this.gameOverContainer.setVisible(true);
        this.scene.pause('GameScene');
    }
}
