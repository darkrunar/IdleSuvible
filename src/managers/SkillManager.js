import OrbitingSphere from '../objects/OrbitingSphere';
import FloatingText from '../objects/FloatingText';

export default class SkillManager {
    constructor(scene) {
        this.scene = scene;
        this.level = 1;
        this.currentExp = 0;
        this.expToNextLevel = 33; // Testing: reduced from 100 to 33 (1/3)


        this.availableSkills = [
            { id: 'multishot', name: 'Multishot', description: '+1 Projectile', type: 'projectileCount', value: 1, icon: 'icon_multishot' },
            { id: 'damage', name: 'Damage Up', description: '+20% Damage', type: 'damageMultiplier', value: 0.2, icon: 'icon_damage' },
            { id: 'speed', name: 'Attack Speed', description: '+20% Atk Speed', type: 'attackSpeedMultiplier', value: 0.2, icon: 'icon_speed' },
            { id: 'move_speed', name: 'Move Speed', description: '+10% Move Speed', type: 'speed', value: 20, icon: 'icon_move' },
            { id: 'projectile_size', name: 'Projectile Size', description: '+10% Size', type: 'projectileScale', value: 0.1, icon: 'icon_damage' },

            // Orbiting Sphere skills
            { id: 'sphere_count', name: 'Orbit Sphere', description: '+1 Sphere', type: 'sphereCount', value: 1, icon: 'icon_multishot' },
            { id: 'sphere_damage', name: 'Sphere Power', description: '+5 Damage', type: 'sphereDamage', value: 5, icon: 'icon_damage' },
            { id: 'sphere_size', name: 'Sphere Size', description: '+20% Size', type: 'sphereSize', value: 4, icon: 'icon_damage' },
            { id: 'sphere_speed', name: 'Sphere Speed', description: '+20% Speed', type: 'sphereSpeed', value: 0.4, icon: 'icon_speed' },

            // New Skills
            { id: 'chain_lightning', name: 'Lightning Chain', description: 'Chain +1 Enemy', type: 'chainLightning', value: 1, icon: 'icon_speed' },
            { id: 'life_steal', name: 'Life Steal', description: '+5% Life Steal', type: 'lifeSteal', value: 0.05, icon: 'icon_damage' },
            { id: 'poison_cloud', name: 'Poison Cloud', description: 'Poison on Kill', type: 'poisonCloud', value: 'enable', icon: 'icon_damage' },
            { id: 'time_warp', name: 'Time Warp', description: 'Slow Nearby Enemies', type: 'timeWarp', value: 'enable', icon: 'icon_speed' },
            { id: 'explosive_shot', name: 'Explosive Shot', description: 'AoE on Hit', type: 'explosiveShot', value: 'enable', icon: 'icon_damage' },
            { id: 'exp_magnet', name: 'EXP Magnet', description: '+50 Range', type: 'expMagnet', value: 50, icon: 'icon_move' },
            { id: 'piercing', name: 'Piercing', description: '+1 Pierce', type: 'piercing', value: 1, icon: 'icon_multishot' },
            { id: 'frost_aura', name: 'Frost Aura', description: 'Slow Touch', type: 'frostAura', value: 'enable', icon: 'icon_speed' },
            { id: 'critical', name: 'Critical Strike', description: '+15% Crit Chance', type: 'critical', value: 0.15, icon: 'icon_damage' },
            { id: 'shield', name: 'Shield', description: '+1 Shield Charge', type: 'shield', value: 1, icon: 'icon_move' },
            { id: 'shield', name: 'Shield', description: '+1 Shield Charge', type: 'shield', value: 1, icon: 'icon_move' },
            { id: 'shadow_clone', name: 'Shadow Clone', description: 'Unlock Clone', type: 'shadowClone', value: 1, icon: 'icon_multishot' },
            { id: 'clone_count_up', name: 'Clone Army', description: '+1 Clone Count', type: 'shadowCloneCount', value: 1, icon: 'icon_multishot' },
            { id: 'spiral_shot', name: 'Spiral Shot', description: 'Unlock Spiral', type: 'spiralShot', value: 1, icon: 'icon_multishot' },
            { id: 'spiral_count', name: 'Spiral Count', description: '+2 Spirals', type: 'spiralCount', value: 2, icon: 'icon_multishot' },
            { id: 'spiral_size', name: 'Spiral Size', description: '+20% Size', type: 'spiralSize', value: 0.2, icon: 'icon_damage' },
            { id: 'spiral_damage', name: 'Spiral Damage', description: '+20% Damage', type: 'spiralDamage', value: 0.2, icon: 'icon_damage' },
            { id: 'meteor_shower', name: 'Meteor Shower', description: 'Unlock Meteors', type: 'meteorShower', value: 1, icon: 'icon_multishot' },
            { id: 'meteor_count', name: 'Meteor Count', description: '+1 Meteor', type: 'meteorCount', value: 1, icon: 'icon_multishot' },
            { id: 'meteor_damage', name: 'Meteor Damage', description: '+20% Damage', type: 'meteorDamage', value: 0.2, icon: 'icon_damage' },
            { id: 'meteor_area', name: 'Meteor Area', description: '+20% Area', type: 'meteorArea', value: 0.2, icon: 'icon_damage' },
            { id: 'lightning_totem', name: 'Lightning Totem', description: 'Unlock Totem', type: 'lightningTotem', value: 1, icon: 'icon_multishot' },
            { id: 'totem_duration', name: 'Totem Duration', description: '+1s Duration', type: 'totemDuration', value: 1000, icon: 'icon_speed' },
            { id: 'totem_damage', name: 'Totem Damage', description: '+20% Damage', type: 'totemDamage', value: 0.2, icon: 'icon_damage' },
            { id: 'totem_damage', name: 'Totem Damage', description: '+20% Damage', type: 'totemDamage', value: 0.2, icon: 'icon_damage' },
            { id: 'totem_speed', name: 'Totem Speed', description: '+20% Atk Speed', type: 'totemSpeed', value: 0.2, icon: 'icon_speed' },
            { id: 'black_hole', name: 'Black Hole', description: 'Unlock Black Hole', type: 'blackHole', value: 1, icon: 'icon_multishot' },
            { id: 'bh_duration', name: 'BH Duration', description: '+1s Duration', type: 'bhDuration', value: 1000, icon: 'icon_speed' },
            { id: 'bh_size', name: 'BH Size', description: '+20% Size', type: 'bhSize', value: 0.2, icon: 'icon_damage' },
            { id: 'bh_damage', name: 'BH Damage', description: '+20% Damage', type: 'bhDamage', value: 0.2, icon: 'icon_damage' }
        ];
    }

    addExp(amount) {
        this.currentExp += amount;
        if (this.currentExp >= this.expToNextLevel) {
            this.levelUp();
        }
        this.scene.events.emit('updateExp', this.currentExp, this.expToNextLevel, this.level);
    }

    levelUp() {
        this.level++;
        this.currentExp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);

        const skills = this.getRandomSkills(3);

        // Calculate player screen position
        const player = this.scene.player;
        const camera = this.scene.cameras.main;
        const screenX = player.x - camera.scrollX;
        const screenY = player.y - camera.scrollY;

        // Call UIScene method directly (more reliable than events)
        const uiScene = this.scene.scene.get('UIScene');

        if (uiScene) {
            uiScene.handleLevelUpEvent(skills, screenX, screenY);
            this.scene.scene.bringToTop('UIScene');
        }

        // Pause game and show skill selection
        this.scene.scene.pause('GameScene');
    }

    getRandomSkills(count) {
        const player = this.scene.player;
        const hasSpheres = player.orbitingSpheres.count > 0;
        const hasClones = player.shadowClone.count > 0;

        // Filter skills based on sphere ownership
        let availableSkills = this.availableSkills;
        if (!hasSpheres) {
            // Exclude sphere upgrade skills if player doesn't have any spheres yet
            availableSkills = availableSkills.filter(skill =>
                skill.type !== 'sphereDamage' &&
                skill.type !== 'sphereSize' &&
                skill.type !== 'sphereSpeed'
            );
        }

        // Filter clone skills
        if (hasClones) {
            // If player has clones, remove the unlock skill, keep the upgrade skill
            availableSkills = availableSkills.filter(skill => skill.id !== 'shadow_clone');
        } else {
            // If player has NO clones, remove the upgrade skill, keep the unlock skill
            availableSkills = availableSkills.filter(skill => skill.id !== 'clone_count_up');
        }

        // Filter spiral skills
        if (player.spiralShot.enabled) {
            availableSkills = availableSkills.filter(skill => skill.id !== 'spiral_shot');
        } else {
            availableSkills = availableSkills.filter(skill =>
                skill.id !== 'spiral_count' &&
                skill.id !== 'spiral_size' &&
                skill.id !== 'spiral_damage'
            );
        }

        // Filter meteor skills
        if (player.meteorShower.enabled) {
            availableSkills = availableSkills.filter(skill => skill.id !== 'meteor_shower');
        } else {
            availableSkills = availableSkills.filter(skill =>
                skill.id !== 'meteor_count' &&
                skill.id !== 'meteor_damage' &&
                skill.id !== 'meteor_area'
            );
        }

        // Filter totem skills
        if (player.lightningTotem.enabled) {
            availableSkills = availableSkills.filter(skill => skill.id !== 'lightning_totem');
        } else {
            availableSkills = availableSkills.filter(skill =>
                skill.id !== 'totem_duration' &&
                skill.id !== 'totem_damage' &&
                skill.id !== 'totem_speed'
            );
        }

        // Filter black hole skills
        if (player.blackHole.enabled) {
            availableSkills = availableSkills.filter(skill => skill.id !== 'black_hole');
        } else {
            availableSkills = availableSkills.filter(skill =>
                skill.id !== 'bh_duration' &&
                skill.id !== 'bh_size' &&
                skill.id !== 'bh_damage'
            );
        }

        const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    applySkill(skillId) {
        const skill = this.availableSkills.find(s => s.id === skillId);
        if (!skill) return;

        const player = this.scene.player;
        if (skill.type === 'projectileCount') {
            player.projectileCount += skill.value;
        } else if (skill.type === 'damageMultiplier') {
            player.damageMultiplier += skill.value;
        } else if (skill.type === 'attackSpeedMultiplier') {
            player.attackSpeedMultiplier += skill.value;
        } else if (skill.type === 'speed') {
            player.speed += skill.value;
        } else if (skill.type === 'projectileScale') {
            player.projectileScale += skill.value;
        } else if (skill.type === 'sphereCount') {
            player.orbitingSpheres.count += skill.value;
            this.updateOrbitingSpheres();
        } else if (skill.type === 'sphereDamage') {
            player.orbitingSpheres.damage += skill.value;
            this.updateOrbitingSpheres();
        } else if (skill.type === 'sphereSize') {
            player.orbitingSpheres.size += skill.value;
            this.updateOrbitingSpheres();
        } else if (skill.type === 'sphereSpeed') {
            player.orbitingSpheres.speed += skill.value;
            this.updateOrbitingSpheres();
        } else if (skill.type === 'chainLightning') {
            if (!player.chainLightning.enabled) player.chainLightning.enabled = true;
            player.chainLightning.count += skill.value;
        } else if (skill.type === 'shadowClone') {
            // Unlock skill (first clone)
            if (player.shadowClone.count === 0) {
                player.shadowClone.count = 1;
                this.updateShadowClones();
            }
        } else if (skill.type === 'shadowCloneCount') {
            // Upgrade skill (add more clones)
            player.shadowClone.count += skill.value;
            this.updateShadowClones();
        } else if (skill.type === 'lifeSteal') {
            player.lifeSteal += skill.value;
        } else if (skill.type === 'poisonCloud') {
            player.poisonCloud.enabled = true;
        } else if (skill.type === 'timeWarp') {
            player.timeWarp.enabled = true;
        } else if (skill.type === 'explosiveShot') {
            player.explosiveShot.enabled = true;
        } else if (skill.type === 'expMagnet') {
            player.expMagnetRadius += skill.value;
        } else if (skill.type === 'piercing') {
            player.piercing += skill.value;
        } else if (skill.type === 'frostAura') {
            player.frostAura.enabled = true;
        } else if (skill.type === 'critical') {
            player.criticalChance += skill.value;
        } else if (skill.type === 'shield') {
            player.shield.enabled = true;
            player.shield.maxCharges += skill.value;
            player.shield.maxCharges += skill.value;
            player.shield.charges = player.shield.maxCharges;
        } else if (skill.type === 'spiralShot') {
            player.spiralShot.enabled = true;
        } else if (skill.type === 'spiralCount') {
            player.spiralShot.count += skill.value;
        } else if (skill.type === 'spiralSize') {
            player.spiralShot.sizeMultiplier += skill.value;
        } else if (skill.type === 'spiralDamage') {
            player.spiralShot.damageMultiplier += skill.value;
        } else if (skill.type === 'meteorShower') {
            player.meteorShower.enabled = true;
        } else if (skill.type === 'meteorCount') {
            player.meteorShower.count += skill.value;
        } else if (skill.type === 'meteorDamage') {
            player.meteorShower.damageMultiplier += skill.value;
        } else if (skill.type === 'meteorArea') {
            player.meteorShower.area *= (1 + skill.value);
        } else if (skill.type === 'lightningTotem') {
            player.lightningTotem.enabled = true;
        } else if (skill.type === 'totemDuration') {
            player.lightningTotem.duration += skill.value;
        } else if (skill.type === 'totemDamage') {
            player.lightningTotem.damageMultiplier += skill.value;
        } else if (skill.type === 'totemSpeed') {
            player.lightningTotem.attackSpeed *= (1 - skill.value); // Reduce interval
        } else if (skill.type === 'blackHole') {
            player.blackHole.enabled = true;
        } else if (skill.type === 'bhDuration') {
            player.blackHole.duration += skill.value;
        } else if (skill.type === 'bhSize') {
            player.blackHole.pullRadius *= (1 + skill.value);
        } else if (skill.type === 'bhDamage') {
            player.blackHole.damageMultiplier += skill.value;
        }
        // Track acquired skills
        if (!this.acquiredSkills) this.acquiredSkills = {};

        if (!this.acquiredSkills[skill.id]) {
            this.acquiredSkills[skill.id] = {
                id: skill.id,
                name: skill.name,
                icon: skill.icon,
                count: 0,
                description: skill.description
            };
        }
        this.acquiredSkills[skill.id].count++;

        // Emit event for UI
        this.scene.events.emit('updateSkillList', this.acquiredSkills);
    }

    updateOrbitingSpheres() {
        const player = this.scene.player;
        const config = player.orbitingSpheres;

        // Clear existing spheres
        this.scene.orbitingSpheres.clear(true, true);

        // Create new spheres with updated count
        for (let i = 0; i < config.count; i++) {
            const sphere = new OrbitingSphere(this.scene, player, i, config.count, {
                radius: config.radius,
                speed: config.speed,
                damage: config.damage,
                size: config.size
            });
            this.scene.orbitingSpheres.add(sphere);

            // Add spawn animation effect
            sphere.setScale(0);
            this.scene.tweens.add({
                targets: sphere,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut',
                delay: i * 50 // Stagger animation for multiple spheres
            });
        }

        // Show floating text notification
        new FloatingText(this.scene, player.x, player.y - 40,
            `Orbiting Spheres: ${config.count}`, '#00ffff');
    }
    updateShadowClones() {
        if (this.scene.createShadowClones) {
            this.scene.createShadowClones();
        }
    }
}
