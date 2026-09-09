# ⚔️ Idle Survivor

**Phaser 3** 기반의 로그라이크 방치형 서바이버 게임입니다.  
레벨업할 때마다 스킬을 선택하고, 밀려오는 적 웨이브를 버텨내세요!

---

## 🎮 플레이 방법

| 키 | 동작 |
|---|---|
| `W A S D` / 방향키 | 캐릭터 이동 |
| `Space` | 대시 (무적 포함) |
| 키 미입력 | 가장 가까운 경험치 젬 자동 수집 |

- 적을 자동으로 공격합니다
- 레벨업 시 카드 3장 중 1개 선택
- 보물 상자를 획득하면 즉시 레벨업

---

## ✨ 스킬 목록

### 🔫 기본 강화
| 스킬 | 효과 |
|---|---|
| Multishot | 발사체 +1 |
| Damage Up | 데미지 +20% |
| Attack Speed | 공격 속도 +20% |
| Move Speed | 이동 속도 +10% |
| Projectile Size | 발사체 크기 +10% |
| Piercing | 관통 +1 |
| EXP Magnet | 경험치 수집 범위 +50 |
| Critical Strike | 크리티컬 확률 +15% |
| Life Steal | 공격 시 체력 흡수 +5% |
| Shield | 피해 흡수 실드 +1 충전 |

### 🌀 특수 스킬
| 스킬 | 효과 |
|---|---|
| **Shadow Clone** | 플레이어를 따라다니며 함께 공격하는 클론 소환 |
| **Orbit Sphere** | 플레이어 주위를 선회하며 적을 공격하는 구체 |
| **Spiral Shot** | 나선형으로 회전하는 특수 발사체 발사 |
| **Meteor Shower** | 주기적으로 주변에 운석 낙하 (범위 폭발) |
| **Lightning Totem** | 설치형 토템 소환, 범위 내 적을 자동 감전 |
| **Black Hole** | 적을 끌어당기는 블랙홀 생성 및 지속 피해 |
| **Chain Lightning** | 체인 형태로 여러 적에게 번개 연결 |
| **Poison Cloud** | 적 처치 시 독 구름 생성 |
| **Explosive Shot** | 적 명중 시 범위 폭발 |
| **Frost Aura** | 접촉한 적 이동 속도 감소 |
| **Time Warp** | 근처 적의 속도를 지속적으로 감소 |

---

## 👾 적 종류

| 적 | 특성 |
|---|---|
| 스켈레톤 (기본) | 표준 속도와 체력 |
| 배트 (빠름) | 빠른 이동, 낮은 체력 |
| 골렘 (탱커) | 느리지만 높은 체력 |
| **스네이크 보스** | 일정 시간 후 등장, 분절 몸체, 전용 체력바 |

---

## 🎁 아이템

| 아이템 | 효과 |
|---|---|
| 경험치 젬 | 경험치 획득 → 레벨업 |
| 포션 | 체력 회복 |
| 자석 | 일정 시간 동안 경험치 젬 자동 흡수 |
| 보물 상자 | 즉시 레벨업 (희귀 드랍) |

---

## 🛠️ 기술 스택

| | |
|---|---|
| **게임 프레임워크** | [Phaser 3](https://phaser.io/) |
| **번들러** | [Vite](https://vitejs.dev/) |
| **언어** | JavaScript (ES6+) |

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

개발 서버 실행 후 브라우저에서 `http://localhost:5173` 접속

---

## 📁 프로젝트 구조

```
IdleSuvible/
├── src/
│   ├── assets/          # 이미지 에셋
│   ├── managers/
│   │   ├── SkillManager.js   # 스킬 관리 (레벨업, 적용)
│   │   └── WaveManager.js    # 웨이브 및 보스 관리
│   ├── objects/
│   │   ├── Player.js         # 플레이어 (이동, 공격, 대시)
│   │   ├── Enemy.js          # 기본 적
│   │   ├── BossSnake.js      # 스네이크 보스
│   │   ├── Bullet.js         # 기본 발사체
│   │   ├── SpiralProjectile.js # 나선 발사체
│   │   ├── Meteor.js         # 운석
│   │   ├── LightningTotem.js # 번개 토템
│   │   ├── BlackHole.js      # 블랙홀
│   │   ├── Clone.js          # 그림자 클론
│   │   ├── OrbitingSphere.js # 궤도 구체
│   │   ├── PoisonCloud.js    # 독 구름
│   │   ├── ExpGem.js         # 경험치 젬
│   │   ├── Item.js           # 아이템 (포션, 자석, 상자)
│   │   └── FloatingText.js   # 피해량 표시 텍스트
│   └── scenes/
│       ├── GameScene.js      # 메인 게임 씬
│       └── UIScene.js        # HUD, 레벨업 모달, 게임오버
├── index.html
└── package.json
```

---

## 📸 스크린샷

> *(스크린샷 추가 예정)*

---

## 📜 라이선스

MIT
