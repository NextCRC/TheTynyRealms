// Configuración y constantes
const CONFIG = {
  ICON_PATH: "media/iconos/",
  AVATAR_PATH: "media/avatar/",
  SOUND_PATH: "media/sonidos/",
  MAX_LIFE: 260,
  COUNTER_TIMEOUT: 2500
};

const CHARACTERS = {
  warrior: { name: "Guerrero", vida: 60, color: "warrior", icon: "guerrerom.png" },
  cleric: { name: "Clérigo", vida: 55, color: "cleric", icon: "clerigom.png" },
  thief: { name: "Ladrón", vida: 52, color: "thief", icon: "ladronm.png" },
  wizard: { name: "Hechicero", vida: 50, color: "wizard", icon: "hechicerom.png" },
  ranger: { name: "Explorador", vida: 58, color: "ranger", icon: "exploradorm.png" }
};

const GENDER_NAMES = {
  warrior: { m: "Guerrero", f: "Guerrera" },
  cleric: { m: "Clérigo", f: "Clériga" },
  thief: { m: "Ladrón", f: "Ladrona" },
  wizard: { m: "Hechicero", f: "Hechicera" },
  ranger: { m: "Explorador", f: "Exploradora" }
};

// Estado global de la aplicación
class GameState {
  constructor() {
    this.players = [];
    this.counters = {};
    this.timers = {};
    this.directions = {};
    this.sounds = this.initializeSounds();
  }

  initializeSounds() {
    try {
      const damageSound = new Audio(`${CONFIG.SOUND_PATH}damage.mp3`);
      const healSound = new Audio(`${CONFIG.SOUND_PATH}heal.mp3`);
      
      damageSound.playbackRate = 1.5;
      healSound.playbackRate = 1.5;
      damageSound.volume = 0.7;
      healSound.volume = 0.7;

      return { damage: damageSound, heal: healSound };
    } catch (error) {
      console.warn('No se pudieron cargar los sonidos:', error);
      return { damage: null, heal: null };
    }
  }

  playSound(type) {
    if (this.sounds[type]) {
      this.sounds[type].pause();
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(e => console.warn(`Error reproduciendo sonido ${type}:`, e));
    }
  }

  resetCounters() {
    Object.keys(this.counters).forEach(playerId => {
      const counterEl = document.getElementById(`counter-player${playerId}`);
      if (counterEl) {
        counterEl.classList.remove("animate");
        counterEl.textContent = "";
      }
      this.counters[playerId] = 0;
      this.directions[playerId] = null;
      clearTimeout(this.timers[playerId]);
    });
  }
}

// Inicializar estado global
const gameState = new GameState();

// Elementos del DOM
const elements = {
  playerCountSelect: document.getElementById("player-count"),
  useCharactersCheckbox: document.getElementById("use-characters"),
  playerInputsContainer: document.getElementById("player-inputs"),
  startButton: document.getElementById("start-button"),
  resetButton: document.getElementById("reset-button"),
  setupScreen: document.getElementById("setup-screen"),
  gameScreen: document.getElementById("game-screen"),
  playersContainer: document.getElementById("players-container")
};

// Utilidades
const utils = {
  shuffleArray: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  animate: (element, className, duration = 300) => {
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
  }
};

// Gestión de contadores visuales
class CounterManager {
  static updateClickCounter(playerId, delta) {
    const counterEl = document.getElementById(`counter-player${playerId}`);
    if (!counterEl) return;

    const newDirection = delta > 0 ? "up" : "down";

    // Reset counter si cambia de dirección
    if (gameState.directions[playerId] && gameState.directions[playerId] !== newDirection) {
      gameState.counters[playerId] = 0;
      clearTimeout(gameState.timers[playerId]);
    }

    gameState.directions[playerId] = newDirection;
    gameState.counters[playerId] = (gameState.counters[playerId] || 0) + 1;

    const prefix = newDirection === "up" ? "+" : "-";
    counterEl.textContent = prefix + gameState.counters[playerId];
    counterEl.style.color = newDirection === "up" ? "#32cd32" : "#ff4444";

    // Animar contador
    counterEl.classList.remove("animate");
    void counterEl.offsetWidth; // Trigger reflow
    counterEl.classList.add("animate");

    // Auto-hide counter
    clearTimeout(gameState.timers[playerId]);
    gameState.timers[playerId] = setTimeout(() => {
      counterEl.classList.remove("animate");
      counterEl.textContent = "";
      gameState.counters[playerId] = 0;
      gameState.directions[playerId] = null;
    }, CONFIG.COUNTER_TIMEOUT);
  }
}

// Gestión de jugadores
class PlayerManager {
  static renderPlayerInputs() {
    const count = parseInt(elements.playerCountSelect.value);
    const useCharacters = elements.useCharactersCheckbox.checked;
    elements.playerInputsContainer.innerHTML = "";

    for (let i = 1; i <= count; i++) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("form-group", "fade-in");
      wrapper.style.animationDelay = `${i * 0.1}s`;

      // Input de nombre
      const nameLabel = document.createElement("label");
      nameLabel.textContent = `👤 Jugador ${i}:`;
      nameLabel.classList.add("form-label");

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.id = `player-name-${i}`;
      nameInput.classList.add("input-medieval");
      nameInput.placeholder = `Nombre del jugador ${i}`;
      nameInput.setAttribute("aria-label", `Nombre del Jugador ${i}`);

      wrapper.appendChild(nameLabel);
      wrapper.appendChild(nameInput);

      // Selector de personaje
      if (useCharacters) {
        const selectLabel = document.createElement("label");
        selectLabel.textContent = "⚔️ Personaje:";
        selectLabel.classList.add("form-label");

        const select = document.createElement("select");
        select.id = `character-select-${i}`;
        select.classList.add("input-medieval");
        select.setAttribute("aria-label", `Personaje del Jugador ${i}`);

        // Opción por defecto
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccionar personaje...";
        select.appendChild(defaultOption);

        // Opciones de personajes
        Object.entries(CHARACTERS).forEach(([key, character]) => {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = `${character.name} (❤️ ${character.vida})`;
          select.appendChild(option);
        });

        wrapper.appendChild(selectLabel);
        wrapper.appendChild(select);
      }

      elements.playerInputsContainer.appendChild(wrapper);
    }
  }

  static validatePlayerSetup() {
    const count = parseInt(elements.playerCountSelect.value);
    const useCharacters = elements.useCharactersCheckbox.checked;
    const usedCharacters = new Set();
    const errors = [];

    for (let i = 1; i <= count; i++) {
      const nameInput = document.getElementById(`player-name-${i}`);
      const name = nameInput.value.trim();
      
      if (!name) {
        errors.push(`Falta el nombre del Jugador ${i}`);
        nameInput.focus();
        continue;
      }

      if (useCharacters) {
        const select = document.getElementById(`character-select-${i}`);
        const character = select.value;
        
        if (!character) {
          errors.push(`Selecciona un personaje para ${name}`);
          continue;
        }
        
        if (usedCharacters.has(character)) {
          errors.push(`El personaje "${CHARACTERS[character].name}" ya fue elegido`);
          continue;
        }
        
        usedCharacters.add(character);
      }
    }

    return errors;
  }

  static createPlayerData() {
    const count = parseInt(elements.playerCountSelect.value);
    const useCharacters = elements.useCharactersCheckbox.checked;
    const players = [];
    
    // Avatares genéricos disponibles
    const genericAvatars = utils.shuffleArray(
      Array.from({ length: 8 }, (_, i) => `generico${i + 1}.png`)
    );

    for (let i = 1; i <= count; i++) {
      const name = document.getElementById(`player-name-${i}`).value.trim();
      let character = null;
      let avatar = null;
      let vida = 50; // Vida por defecto

      if (useCharacters) {
        character = document.getElementById(`character-select-${i}`).value;
        avatar = CHARACTERS[character].icon;
        vida = CHARACTERS[character].vida;
      } else {
        avatar = genericAvatars[i - 1];
      }

      players.push({ id: i, name, character, vida, avatar, maxVida: vida });
    }

    return players;
  }
}

// Gestión de tarjetas de jugador
class CardManager {
  static renderPlayerCards() {
    elements.playersContainer.innerHTML = "";
    gameState.players.forEach((player, index) => {
      const card = this.createPlayerCard(player);
      card.style.animationDelay = `${index * 0.15}s`;
      elements.playersContainer.appendChild(card);
    });
  }

  static createPlayerCard(player) {
    const card = document.createElement("div");
    card.classList.add("player-card", "fade-in");
    card.id = `card-${player.id}`;

    if (player.character) {
      card.classList.add(CHARACTERS[player.character].color);
    }

    // Display de vida
    const vidaDisplay = document.createElement("p");
    vidaDisplay.id = `life-${player.id}`;
    vidaDisplay.classList.add("life-display");
    vidaDisplay.textContent = player.vida;

    // Corazón indicador
    const heart = document.createElement("img");
    heart.src = `${CONFIG.ICON_PATH}corazon.svg`;
    heart.classList.add("heart-icon");
    heart.id = `heart-${player.id}`;
    heart.alt = "Indicador de vida";
    heart.onerror = () => heart.style.display = 'none';

    // Nombre del jugador
    const playerName = document.createElement("div");
    playerName.classList.add("player-name");
    playerName.textContent = player.name;

    // Avatar con funcionalidad de flip
    const avatar = document.createElement("img");
    avatar.src = `${CONFIG.AVATAR_PATH}${player.avatar}`;
    avatar.classList.add("avatar-icon");
    avatar.alt = `Avatar de ${player.name}`;
    avatar.onerror = () => {
      avatar.src = `${CONFIG.AVATAR_PATH}generico1.png`;
    };

    // Evento de flip del avatar
    avatar.addEventListener("click", () => this.handleAvatarFlip(avatar, player));

    // Nombre del personaje
    const characterName = document.createElement("div");
    characterName.classList.add("character-name");
    characterName.id = `char-name-${player.id}`;
    characterName.textContent = player.character ? CHARACTERS[player.character].name : "Aventurero";

    // Botón de daño
    const btnDamage = document.createElement("button");
    btnDamage.classList.add("action-btn", "btn-damage");
    btnDamage.setAttribute("aria-label", `Dañar a ${player.name}`);
    btnDamage.title = "Restar vida (-1)";

    const iconDamage = document.createElement("img");
    iconDamage.src = `${CONFIG.ICON_PATH}espada.png`;
    iconDamage.alt = "Daño";
    iconDamage.onerror = () => btnDamage.innerHTML = '⚔️';
    btnDamage.appendChild(iconDamage);

    btnDamage.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleLifeChange(player.id, -1, btnDamage);
    });

    // Botón de curación
    const btnHeal = document.createElement("button");
    btnHeal.classList.add("action-btn", "btn-heal");
    btnHeal.setAttribute("aria-label", `Curar a ${player.name}`);
    btnHeal.title = "Restaurar vida (+1)";

    const iconHeal = document.createElement("img");
    iconHeal.src = `${CONFIG.ICON_PATH}pocima.png`;
    iconHeal.alt = "Curación";
    iconHeal.onerror = () => btnHeal.innerHTML = '🧪';
    btnHeal.appendChild(iconHeal);

    btnHeal.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleLifeChange(player.id, 1, btnHeal);
    });

    // Contador visual
    const counter = document.createElement("div");
    counter.classList.add("click-counter");
    counter.id = `counter-player${player.id}`;

    // Ensamblar tarjeta
    card.appendChild(vidaDisplay);
    card.appendChild(heart);
    card.appendChild(playerName);
    card.appendChild(avatar);
    card.appendChild(characterName);
    card.appendChild(btnDamage);
    card.appendChild(btnHeal);
    card.appendChild(counter);

    // Actualizar estado inicial
    this.updateCardVisuals(player);

    return card;
  }

  static handleAvatarFlip(avatar, player) {
    if (avatar.classList.contains("flipping")) return;

    const filename = avatar.src.split("/").pop();
    if (!filename.endsWith("m.png") && !filename.endsWith("f.png")) {
      // Avatar genérico, no hacer flip
      utils.animate(avatar, "flip-glow", 600);
      return;
    }

    avatar.classList.add("flip-glow", "flipping");

    setTimeout(() => {
      const base = filename.slice(0, -5);
      const currentGender = filename.endsWith("m.png") ? "m" : "f";
      const newGender = currentGender === "m" ? "f" : "m";
      const newSrc = `${CONFIG.AVATAR_PATH}${base}${newGender}.png`;
      
      avatar.src = newSrc;

      avatar.onload = () => {
        avatar.classList.remove("flip-glow", "flipping");
        
        // Actualizar nombre del personaje
        if (player.character && GENDER_NAMES[player.character]) {
          const charNameEl = document.getElementById(`char-name-${player.id}`);
          if (charNameEl) {
            charNameEl.textContent = GENDER_NAMES[player.character][newGender];
          }
        }
      };
    }, 300);
  }

  static handleLifeChange(playerId, delta, button) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // Actualizar vida
    const newVida = Math.max(0, Math.min(player.vida + delta, CONFIG.MAX_LIFE));
    player.vida = newVida;

    // Efectos de sonido
    gameState.playSound(delta > 0 ? 'heal' : 'damage');

    // Actualizar visuales
    this.updateCardVisuals(player);

    // Actualizar contador visual
    CounterManager.updateClickCounter(playerId, delta);

    // Animar botón
    utils.animate(button, "btn-animate", 400);

    // Efecto especial si el jugador es derrotado
    if (player.vida <= 0) {
      this.handlePlayerDefeat(playerId);
    }
  }

  static updateCardVisuals(player) {
    const vidaEl = document.getElementById(`life-${player.id}`);
    const heartEl = document.getElementById(`heart-${player.id}`);
    const cardEl = document.getElementById(`card-${player.id}`);

    if (vidaEl) {
      vidaEl.textContent = player.vida;
      
      // Efecto de vida crítica
      if (player.vida <= 10 && player.vida > 0) {
        vidaEl.classList.add("critical-health");
      } else {
        vidaEl.classList.remove("critical-health");
      }
    }

    if (heartEl) {
      const maxVida = player.maxVida || 60;
      const opacity = player.vida >= maxVida ? 1 : Math.max(0.2, player.vida / maxVida);
      heartEl.style.opacity = opacity;
      
      // Efecto pulsante en vida baja
      if (player.vida <= 10 && player.vida > 0) {
        heartEl.style.animation = "pulseRed 1s infinite";
      } else {
        heartEl.style.animation = "none";
      }
    }

    // Efecto de transparencia en jugador derrotado
    if (cardEl) {
      if (player.vida <= 0) {
        cardEl.style.opacity = "0.6";
        cardEl.style.filter = "grayscale(70%)";
      } else {
        cardEl.style.opacity = "1";
        cardEl.style.filter = "none";
      }
    }
  }

  static handlePlayerDefeat(playerId) {
    const card = document.getElementById(`card-${playerId}`);
    if (card) {
      utils.animate(card, "defeat-flash", 800);
      
      // Efectos adicionales de derrota
      setTimeout(() => {
        card.style.transform = "scale(0.95)";
        card.style.borderColor = "#666";
      }, 400);
    }
  }
}

// Gestión de eventos y inicialización
class EventManager {
  static init() {
    // Verificar que los elementos existen
    if (!elements.playerCountSelect) {
      console.error("No se pudo encontrar el elemento player-count");
      return;
    }

    // Event listeners para configuración
    elements.playerCountSelect.addEventListener("change", PlayerManager.renderPlayerInputs);
    elements.useCharactersCheckbox.addEventListener("change", PlayerManager.renderPlayerInputs);

    // Botón de inicio
    elements.startButton.addEventListener("click", this.handleGameStart);

    // Botón de reinicio
    elements.resetButton.addEventListener("click", this.handleGameReset);

    // Atajos de teclado
    document.addEventListener("keydown", this.handleKeyboardShortcuts);

    // Inicializar inputs
    PlayerManager.renderPlayerInputs();
  }

  static handleGameStart() {
    // Validar configuración
    const errors = PlayerManager.validatePlayerSetup();
    if (errors.length > 0) {
      alert("❌ " + errors[0]);
      return;
    }

    // Crear jugadores
    gameState.players = PlayerManager.createPlayerData();

    // Transición de pantallas
    elements.setupScreen.classList.add("hidden");
    elements.gameScreen.classList.remove("hidden");

    // Renderizar tarjetas con delay
    setTimeout(() => {
      CardManager.renderPlayerCards();
    }, 200);

    // Reset contadores
    gameState.resetCounters();
  }

  static handleGameReset() {
    if (gameState.players.length > 0) {
      const confirm = window.confirm("🔄 ¿Estás seguro de que quieres reiniciar la partida?");
      if (!confirm) return;
    }

    // Transición de pantallas
    elements.gameScreen.classList.add("hidden");
    elements.setupScreen.classList.remove("hidden");

    // Limpiar estado
    elements.playersContainer.innerHTML = "";
    elements.playerInputsContainer.innerHTML = "";
    gameState.players = [];
    gameState.resetCounters();

    // Regenerar inputs
    setTimeout(() => {
      PlayerManager.renderPlayerInputs();
    }, 200);
  }

  static handleKeyboardShortcuts(e) {
    // Atajo R para reiniciar
    if (e.key === 'r' || e.key === 'R') {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        EventManager.handleGameReset();
      }
    }

    // Escape para volver a configuración
    if (e.key === 'Escape') {
      if (!elements.gameScreen.classList.contains('hidden')) {
        EventManager.handleGameReset();
      }
    }
  }
}

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎮 The Tiny Realms - Iniciando aplicación...");
  
  try {
    EventManager.init();
    console.log("✅ Aplicación inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando la aplicación:", error);
    alert("Error inicializando la aplicación. Por favor, recarga la página.");
  }
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registrado'))
      .catch(error => console.log('SW no se pudo registrar'));
  });
}