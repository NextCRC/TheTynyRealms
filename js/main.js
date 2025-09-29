// CONFIGURACIÓN Y CONSTANTES
const CONFIG = {
    // Rutas de las carpetas de recursos
    ICON_PATH: "media/iconos/", 
    AVATAR_PATH: "media/avatar/", 
    SOUND_PATH: "media/sonidos/",
    NARRATION_PATH: "media/sonidos/narraciones/", // Nueva ruta para narraciones
    
    MAX_LIFE: 9999, 
    COUNTER_TIMEOUT: 1500, // 1.5 segundos para la animación flotante
    CRITICAL_THRESHOLD: 10, // Umbral para la alerta roja intermitente
};

// Mapeo de Texto de Leyenda a Archivo de Audio (Basado en narracio-audio-textos.pdf)
// NOTA: Los textos aquí deben coincidir *exactamente* con los textos generados por el Log
const NARRATION_MAP = {
    // Frases Iniciales / Fin de Juego
    "La batalla comienza. ¡Que las cartas decidan vuestro destino!": "narracionintro01.mp3",
    "Esperando el próximo movimiento.": "narracion02.mp3",
    "¡Todos los héroes han caído!": "narracion03.mp3",
    "¡Felicitaciones, has ganado la Batalla!": "narracion04.mp3",
    "¡El Jefe ha sido derrotado! ¡Felicidades!": "narracion05.mp3", // Se usa en modal de victoria

    // DAÑO ALTO (>= 5)
    "¡Ataque voraz! ¡Daño significativo recibido!": "narracion06.mp3",
    "Un impacto crítico atraviesa la armadura. ¡Cuidado!": "narracion07.mp3",
    "¡Siente el aguijón de la batalla! Puntos vitales perdidos.": "narracion08.mp3",
    "El enemigo acierta de lleno. ¡Golpe demoledor!": "narracion09.mp3",
    "El golpe resuena en el campo de batalla.": "narracion10.mp3",
    "La ofensiva enemiga es implacable.": "narracion11.mp3",
    "¡Un fuerte castigo! Necesita recuperarse.": "narracion12.mp3",
    "El impacto ha sido brutal. ¡Se tambalea!": "narracion13.mp3",
    "El enemigo da en el blanco. ¡Gravemente herido!": "narracion14.mp3",
    "Daño crítico: la voluntad es la única armadura restante.": "narracion15.mp3",

    // DAÑO BAJO (< 5)
    "Fue solo un rasguño. Seguimos con vida.": "narracion16.mp3",
    "Un roce sin importancia. Ignora la herida.": "narracion17.mp3",
    "La defensa funcionó: solo daños menores.": "narracion18.mp3",
    "El golpe resbaló. Apenas se siente.": "narrcion19.mp3",
    "Solo daño cosmético. Sigue fuerte.": "narracion20.mp3",
    "Un simple moretón. El enemigo falló el golpe fatal.": "narracion21.mp3",
    "El impacto no fue suficiente. Se sacude el polvo.": "narracion22.mp3",
    "¡Qué suerte! Solo recibe una pequeña penalización.": "narracion23.mp3",
    "Un ataque débil. Ni se inmuta.": "narracion24.mp3",
    "Una pequeña herida, nada que lo detenga.": "narracion25.mp3", 

    // CURACIÓN BAJA (<= 4)
    "Usa un vendaje y recupera puntos de vida.": "narracion26.mp3",
    "Un soplo de aire fresco. Sana un poco de vida.": "narracion27.mp3",
    "Curación menor. ¡Puntos de vuelta!": "narracion28.mp3",
    "La luz toca y restaura puntos.": "narracion29.mp3",
    "Sorbo de poción ligera.": "narracion30.mp3",
    "Pequeño milagro. Puntos recuperados.": "narracion31.mp3",
    "La voluntad cura: vida restaurada.": "narracion32.mp3",
    "Un alivio momentáneo. Ha sanado un poco.": "narracion33.mp3",
    "El clérigo bendice: puntos restaurados.": "narracion34.mp3",
    "Una ayuda extra. Gana puntos.": "narracion35.mp3",

    // CURACIÓN ALTA (> 4)
    "¡Poción maestra! Bebe el elixir.": "narracion36.mp3",
    "La magia curativa envuelve. ¡Vida devuelta!": "narracion37.mp3",
    "¡Un milagro total! Asombrosa cantidad de vida recuperada.": "narracion38.mp3",
    "El poder de la naturaleza sana y restaura.": "narracion39.mp3",
    "¡Se siente renovado! Recibe una curación épica.": "narracion40.mp3",
};

// Data de Personajes y Avatares
const CHARACTERS = {
    warrior: { name: "Guerrero", vida: 60, color: "warrior", icon: "guerrerom.png" },
    cleric: { name: "Clérigo", vida: 55, color: "cleric", icon: "clerigom.png" },
    thief: { name: "Ladrón", vida: 52, color: "thief", icon: "ladronm.png" },
    wizard: { name: "Hechicero", vida: 50, color: "wizard", icon: "hechicerom.png" },
    ranger: { name: "Explorador", vida: 58, color: "ranger", icon: "exploradorm.png" }
};

// Nombres por género
const GENDER_NAMES = {
    warrior: { m: "Guerrero", f: "Guerrera" },
    cleric: { m: "Clérigo", f: "Clériga" },
    thief: { m: "Ladrón", f: "Ladrona" },
    wizard: { m: "Hechicero", f: "Hechicera" },
    ranger: { m: "Explorador", f: "Exploradora" }
};

// Avatares genéricos
const GENERIC_AVATARS = [
    "generico1.png", "generico2.png", "generico3.png", "generico4.png", 
    "generico5.png", "generico6.png", "generico7.png", "generico8.png"
];

// Almacenar el último mensaje de log y la última pista de música
let lastLogMessage = null;
let lastMusicTrack = null;

// UTILIDAD PARA SELECCIONAR MENSAJES ALEATORIOS SIN REPETICIÓN INMEDIATA
const getRandomMessage = (array) => {
    let message;
    let attempts = 0;
    
    // Intenta seleccionar un mensaje diferente al último
    do {
        message = array[Math.floor(Math.random() * array.length)];
        attempts++;
        // Permite la repetición si solo hay un mensaje o si se agotan los intentos
        if (array.length === 1 || attempts > 5) break; 
    } while (message === lastLogMessage);
    
    lastLogMessage = message;
    return message;
};

// MENSAJES DINÁMICOS PARA LA CARTA CENTRAL (Info Card)
const BATTLE_LOG_MESSAGES = {
    // Leyendas (sin nombres de jugador, listas para ElevenLabs)
    // NOTA: Los textos aquí deben coincidir exactamente con las claves de NARRATION_MAP
    DAMAGE_HIGH: [
        "¡Ataque voraz! ¡Daño significativo recibido!", "Un impacto crítico atraviesa la armadura. ¡Cuidado!", "¡Siente el aguijón de la batalla! Puntos vitales perdidos.", 
        "El enemigo acierta de lleno. ¡Golpe demoledor!", "El golpe resuena en el campo de batalla.", "La ofensiva enemiga es implacable.", "¡Un fuerte castigo! Necesita recuperarse.", 
        "El impacto ha sido brutal. ¡Se tambalea!", "El enemigo da en el blanco. ¡Gravemente herido!", "Daño crítico: la voluntad es la única armadura restante."
    ],
    DAMAGE_LOW: [
        "Fue solo un rasguño. Seguimos con vida.", "Un roce sin importancia. Ignora la herida.", "La defensa funcionó: solo daños menores.", "El golpe resbaló. Apenas se siente.", 
        "Solo daño cosmético. Sigue fuerte.", "Un simple moretón. El enemigo falló el golpe fatal.", "El impacto no fue suficiente. Se sacude el polvo.", "¡Qué suerte! Solo recibe una pequeña penalización.", 
        "Un ataque débil. Ni se inmuta.", "Una pequeña herida, nada que lo detenga." 
    ],
    HEAL_LOW: [
        "Usa un vendaje y recupera puntos de vida.", "Un soplo de aire fresco. Sana un poco de vida.", "Curación menor. ¡Puntos de vuelta!", "La luz toca y restaura puntos.", 
        "Sorbo de poción ligera.", "Pequeño milagro. Puntos recuperados.", "La voluntad cura: vida restaurada.", "Un alivio momentáneo. Ha sanado un poco.", 
        "El clérigo bendice: puntos restaurados.", "Una ayuda extra. Gana puntos."
    ],
    HEAL_HIGH: [
        "¡Poción maestra! Bebe el elixir.", "La magia curativa envuelve. ¡Vida devuelta!", "¡Un milagro total! Asombrosa cantidad de vida recuperada.", 
        "El poder de la naturaleza sana y restaura.", "¡Se siente renovado! Recibe una curación épica."
    ],
    
    // Frases cortas con nombre (solo visibles en el log de abajo)
    CRITICAL_LOW: (name) => `${name} está mal de vida. ¿Lo van a perdonar?`,
    ALLIANCE_TARGET: (name) => `Creo que es hora de una alianza contra ${name}.`,
    DEFEAT: (name) => `¡${name} ha caído en batalla! Su alma pasa a mejor vida.`,
    INIT: "La batalla comienza. ¡Que las cartas decidan vuestro destino!", 
    IDLE: "Esperando el próximo movimiento."
};

// ESTADO GLOBAL
class GameState {
    constructor() {
        this.players = [];
        this.boss = null;
        this.isBossMode = false;
        this.counters = {};
        this.timers = {};
        this.directions = {};
        
        this.effectSounds = this.initializeEffectSounds(); 

        this.battleLog = BATTLE_LOG_MESSAGES.INIT;
        this.criticalPlayers = new Set();
        this.allianceTarget = null;
        
        this.bgMusic = this.initializeMusic();
        
        // 3. Narraciones
        this.narrations = this.initializeNarrations();
    }
    
    // LÓGICA DE NARRACIONES (MP3) - ÚNICO PARA INTRO
    initializeNarrations() {
        const narrationFile = `${CONFIG.NARRATION_PATH}narracionintro01.mp3`;
        const audio = new Audio(narrationFile);
        audio.volume = 0.8;
        
        return {
            playIntro: () => {
                console.log(`Intentando reproducir narración: ${narrationFile}`);
                try {
                    audio.currentTime = 0; 
                    audio.play().catch(e => {
                        console.warn('Error al iniciar la narración. URL/Bloqueo:', e);
                    });
                } catch (error) {
                    console.warn('Cannot play narration intro (general error):', error);
                }
            }
        };
    }
    
    // LÓGICA DE REPRODUCCIÓN DE LEYENDAS DINÁMICAS
    playNarrationForLog(logMessage) {
        // Buscar el archivo MP3 correspondiente
        const fileName = NARRATION_MAP[logMessage];
        
        if (fileName) {
            const audioPath = `${CONFIG.NARRATION_PATH}${fileName}`;
            try {
                // Crear nueva instancia de Audio para no interrumpir el fondo
                const audio = new Audio(audioPath);
                audio.volume = 0.9;
                audio.play().catch(e => {
                    console.warn(`Error reproduciendo leyenda (${fileName}): ${e.message}`);
                });
            } catch (error) {
                console.warn(`Cannot play legend sound ${fileName}:`, error);
            }
        } else {
            // console.warn(`No se encontró mapeo de audio para la leyenda: "${logMessage}"`);
        }
    }

    // LÓGICA DE SONIDOS PARA EFECTOS (MP3)
    initializeEffectSounds() {
        const damageVolume = 0.5;
        const healVolume = 0.5;

        return {
            damage: () => {
                try {
                    const audio = new Audio(`${CONFIG.SOUND_PATH}damage.mp3`);
                    audio.volume = damageVolume;
                    audio.play().catch(e => console.warn(`Error playing damage sound: ${e.message}`));
                } catch (error) {
                    console.warn('Cannot play damage sound:', error);
                }
            },
            heal: () => {
                try {
                    const audio = new Audio(`${CONFIG.SOUND_PATH}heal.mp3`);
                    audio.volume = healVolume;
                    audio.play().catch(e => console.warn(`Error playing heal sound: ${e.message}`));
                } catch (error) {
                    console.warn('Cannot play heal sound:', error);
                }
            }
        };
    }

    // LÓGICA DE MÚSICA DE FONDO (OGG) - AHORA NO REPITE INMEDIATAMENTE
    initializeMusic() {
        const musicFiles = Array.from({ length: 17 }, (_, i) => `${CONFIG.SOUND_PATH}soundtrack${String(i + 1).padStart(2, '0')}.ogg`);
        
        const audio = new Audio();
        audio.volume = 0.3; 
        audio.loop = false; 
        
        const playNextTrack = () => {
            if (musicFiles.length === 0) return;
            
            let randomIndex;
            let nextTrack;
            let attempts = 0;
            
            // Intenta seleccionar un track diferente al último
            do {
                randomIndex = Math.floor(Math.random() * musicFiles.length);
                nextTrack = musicFiles[randomIndex];
                attempts++;
                if (musicFiles.length === 1 || attempts > 5) break; 
            } while (nextTrack === lastMusicTrack);
            
            lastMusicTrack = nextTrack;
            
            audio.src = nextTrack;
            
            audio.addEventListener('canplaythrough', () => {
                audio.play().then(() => {
                    console.log(`Música de fondo iniciada: ${nextTrack}`);
                }).catch(e => {
                    console.log('Música de fondo esperando interacción de usuario (promesa fallida):', e);
                });
            }, { once: true });
        };
        
        audio.addEventListener('ended', playNextTrack);
        
        return {
            start: () => {
                if (audio.paused) {
                    playNextTrack();
                }
            },
            stop: () => audio.pause()
        };
    }

    playSound(type) {
        if (this.effectSounds[type]) {
            this.effectSounds[type]();
        }
    }

    resetCounters() {
        Object.keys(this.counters).forEach(id => {
            const counterEl = document.getElementById(`counter-player${id}`) || document.getElementById(`counter-boss`);
            if (counterEl) {
                counterEl.classList.remove("animate");
                counterEl.textContent = "";
            }
            this.counters[id] = 0;
            this.directions[id] = null;
            clearTimeout(this.timers[id]);
        });
    }
}

const gameState = new GameState();

// Elementos del DOM
const elements = {
    playerCountSelect: document.getElementById("player-count"),
    useCharactersCheckbox: document.getElementById("use-characters"),
    useBossModeCheckbox: document.getElementById("use-boss-mode"), 
    
    // Setup Steps
    setupInitial: document.getElementById('setup-initial'),
    playerStep: document.getElementById('player-step'),
    playerSummary: document.getElementById('player-summary'),
    
    // Player Step Fields
    playerStepTitle: document.getElementById('player-step-title'),
    playerNameInput: document.getElementById('player-name'),
    characterSelectGroup: document.getElementById('character-select-group'),
    playerCharacterSelect: document.getElementById('player-character'),
    
    // Summary Fields
    summaryList: document.getElementById('summary-list'),
    bossSetupFields: document.getElementById('boss-setup-fields'), 
    bossNameInput: document.getElementById('boss-name'), 
    bossLifeInput: document.getElementById('boss-life'), 
    
    // Buttons
    nextSetupBtn: document.getElementById('next-setup'),
    nextPlayerBtn: document.getElementById('next-player'),
    startButton: document.getElementById('start-button'),
    resetButton: document.getElementById('reset-button'),
    historyBtn: document.getElementById('history-btn'), 
    settingsBtn: document.getElementById('settings-btn'), 
    
    // Screens and Containers
    setupScreen: document.getElementById("setup-screen"),
    gameScreen: document.getElementById("game-screen"),
    playersContainerLeft: document.getElementById("players-container-left"), 
    playersContainerRight: document.getElementById("players-container-right"), 
    centralCardWrapper: document.getElementById('central-card-wrapper'), 
    gameModeTitle: document.getElementById('game-mode-title'), 
    gameFooter: document.getElementById('game-footer'), 
    modalOverlay: document.getElementById('custom-modal-overlay') 
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

    animate: (element, className, duration = 300) => {
        element.classList.add(className);
        setTimeout(() => element.classList.remove(className), duration);
    },
    
    showAlert: (message) => {
        showModal("Alerta", message, "⚠️", [{ text: "Entendido", value: false, class: "btn-secondary" }], () => {});
    }
};

// --- Modal System ---
function showModal(title, message, icon, buttons, callback) {
    const overlay = elements.modalOverlay;
    if (!overlay) {
        console.error("Modal overlay not found.");
        return;
    }
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalButtons = document.getElementById('modal-buttons');

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalIcon.textContent = icon;
    modalButtons.innerHTML = '';
    
    buttons.forEach(btn => {
        const buttonEl = document.createElement('button');
        buttonEl.classList.add(btn.class || 'btn-primary');
        buttonEl.textContent = btn.text;
        buttonEl.addEventListener('click', () => {
            overlay.classList.remove('visible');
            callback(btn.value);
        });
        modalButtons.appendChild(buttonEl);
    });

    overlay.classList.add('visible');
}

// GESTIÓN DE CONTADORES VISUALES
class CounterManager {
    static updateClickCounter(id, delta, isBoss = false) {
        const counterId = isBoss ? "boss" : `player${id}`;
        const counterEl = document.getElementById(`counter-${counterId}`);
        if (!counterEl) return;

        const newDirection = delta > 0 ? "up" : "down";

        if (gameState.directions[counterId] && gameState.directions[counterId] !== newDirection) {
            gameState.counters[counterId] = 0;
            clearTimeout(gameState.timers[counterId]);
        }

        gameState.directions[counterId] = newDirection;
        gameState.counters[counterId] = (gameState.counters[counterId] || 0) + Math.abs(delta);
        
        const isDamage = delta < 0;
        const prefix = isDamage ? "-" : "+";
        counterEl.textContent = prefix + gameState.counters[counterId];
        counterEl.style.color = isDamage ? "#ff4444" : "#32cd32";

        counterEl.classList.remove("animate");
        void counterEl.offsetWidth; // Trigger reflow
        counterEl.classList.add("animate");

        clearTimeout(gameState.timers[counterId]);
        gameState.timers[counterId] = setTimeout(() => {
            if (!isBoss && gameState.counters[counterId] > 0) {
                const totalChange = gameState.counters[counterId];
                const isDamage = gameState.directions[counterId] === "down";
                CardManager.updateBattleLog(id, totalChange, isDamage);
            }

            counterEl.classList.remove("animate");
            gameState.counters[counterId] = 0;
            gameState.directions[counterId] = null;
        }, CONFIG.COUNTER_TIMEOUT);
    }
}

// GESTIÓN DE TARJETAS DE JUGADOR (Ajustado a Layout Horizontal)
class CardManager {
    static renderPlayerCards() {
        elements.playersContainerLeft.innerHTML = "";
        elements.playersContainerRight.innerHTML = "";
        
        const maxPlayers = gameState.players.length;
        const splitIndex = Math.ceil(maxPlayers / 2);

        gameState.players.forEach((player, index) => {
            const card = this.createPlayerCard(player);
            card.style.animationDelay = `${index * 0.15}s`;
            
            if (index < splitIndex) {
                elements.playersContainerLeft.appendChild(card);
            } else {
                elements.playersContainerRight.appendChild(card);
            }
        });
    }

    static createPlayerCard(player) {
        const card = document.createElement("div");
        card.classList.add("player-card", "fade-in");
        card.id = `card-${player.id}`;

        if (player.character) {
            card.classList.add(CHARACTERS[player.character].color);
        }

        // El .life-display-wrapper es el nuevo contenedor para el efecto de parpadeo
        card.innerHTML = `
            <div class="player-info-side">
                <div class="player-name">${player.name}</div>
                <div class="avatar-icon" id="avatar-container-${player.id}">
                    <img id="avatar-${player.id}" class="avatar-img" src="${CONFIG.AVATAR_PATH}${player.avatar}" alt="Avatar de ${player.name}" onerror="this.onerror=null;this.src='${CONFIG.AVATAR_PATH}generico1.png';">
                </div>
                <div class="character-name" id="char-name-${player.id}">${player.characterName}</div>
            </div>
            <div class="player-life-center">
                <div id="life-display-wrapper-${player.id}" class="life-display-wrapper">
                    <p class="life-display" id="life-${player.id}">${player.vida}</p>
                </div>
            </div>
            <div class="player-action-side">
                <button id="btn-heal-${player.id}" class="action-btn btn-heal" aria-label="Curar (+1)">
                    <img src="${CONFIG.ICON_PATH}pocima.png" alt="Curar">
                </button>
                <span class="heart-icon-small" id="heart-small-${player.id}">❤️</span>
                <button id="btn-damage-${player.id}" class="action-btn btn-damage" aria-label="Dañar (-1)">
                    <img src="${CONFIG.ICON_PATH}espada.png" alt="Dañar">
                </button>
            </div>
            <div id="counter-player${player.id}" class="click-counter"></div>
        `;
        
        // Adjuntar listeners de eventos
        const avatarContainer = card.querySelector(`#avatar-container-${player.id}`);
        const avatarImg = card.querySelector(`#avatar-${player.id}`);
        const btnHeal = card.querySelector(`#btn-heal-${player.id}`);
        const btnDamage = card.querySelector(`#btn-damage-${player.id}`);
        
        // 1. Evento Flip de Avatar
        avatarContainer.addEventListener("click", () => this.handleAvatarFlip(avatarImg, player));
        
        // 2. Eventos de Vida
        btnHeal.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleLifeChange(player.id, 1, btnHeal);
        });
        
        btnDamage.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleLifeChange(player.id, -1, btnDamage);
        });

        this.updateCardVisuals(player);
        return card;
    }
    
    // Función de Flip de Avatar para cambiar género y nombre
    static handleAvatarFlip(avatarImg, player) {
        if (!player.character) {
            utils.animate(avatarImg, "flip-glow", 600);
            return;
        }

        if (avatarImg.classList.contains("flipping")) return;
        avatarImg.classList.add("flip-glow", "flipping");

        const filename = player.avatar;
        const base = filename.slice(0, -5);
        const currentGender = filename.endsWith("m.png") ? "m" : "f";
        const newGender = currentGender === "m" ? "f" : "m";
        const newSrc = `${CONFIG.AVATAR_PATH}${base}${newGender}.png`;
        const charNameEl = document.getElementById(`char-name-${player.id}`);
        
        player.avatar = `${base}${newGender}.png`; 
        
        // Animación y cambio de fuente
        setTimeout(() => {
            avatarImg.src = newSrc;

            avatarImg.onload = () => {
                avatarImg.classList.remove("flip-glow", "flipping");
                
                // Actualizar nombre del personaje
                if (charNameEl) {
                    charNameEl.textContent = GENDER_NAMES[player.character][newGender];
                }
            };
        }, 300);
    }

    static handleLifeChange(playerId, delta, button) {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;

        const newVida = Math.max(0, player.vida + delta); 
        player.vida = newVida;

        gameState.playSound(delta > 0 ? 'heal' : 'damage');
        this.updateCardVisuals(player);
        CounterManager.updateClickCounter(playerId, delta);
        utils.animate(button, "btn-animate", 400);

        if (player.vida <= 0) {
            this.handlePlayerDefeat(playerId);
        }
    }
    
    static updateBattleLog(playerId, totalChange, isDamage) {
        if (gameState.isBossMode) return; 

        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;

        let message;
        
        // Generar mensaje genérico de log (sin nombre)
        if (isDamage) {
            message = totalChange >= 5 
                ? getRandomMessage(BATTLE_LOG_MESSAGES.DAMAGE_HIGH)
                : getRandomMessage(BATTLE_LOG_MESSAGES.DAMAGE_LOW);
        } else {
            message = totalChange >= 4 
                ? getRandomMessage(BATTLE_LOG_MESSAGES.HEAL_HIGH)
                : getRandomMessage(BATTLE_LOG_MESSAGES.HEAL_LOW);
        }
        
        BossManager.updateBattleLog(message);
    }

    static updateCardVisuals(player) {
        const vidaEl = document.getElementById(`life-${player.id}`);
        const lifeWrapperEl = document.getElementById(`life-display-wrapper-${player.id}`);
        const heartSmallEl = document.getElementById(`heart-small-${player.id}`);
        const cardEl = document.getElementById(`card-${player.id}`);
        const CRITICAL_THRESHOLD = CONFIG.CRITICAL_THRESHOLD;
        const ALLIANCE_THRESHOLD_PERCENT = 0.8;

        if (vidaEl) {
            vidaEl.textContent = player.vida;
            
            // Lógica para el contenedor de parpadeo (alrededor del número de vida)
            if (lifeWrapperEl) {
                if (player.vida <= CRITICAL_THRESHOLD && player.vida > 0) {
                    lifeWrapperEl.classList.add("critical-glow-active");
                } else {
                    lifeWrapperEl.classList.remove("critical-glow-active");
                }
            }
            
            // Estilo crítico para el texto de la vida
            if (player.vida <= 10 && player.vida > 0) {
                vidaEl.classList.add("critical-health");
            } else {
                vidaEl.classList.remove("critical-health");
            }
        }
        
        // Lógica de Alianza (Jugador más fuerte) y Crítica (Jugador débil)
        if (cardEl) {
            if (player.vida <= 0) {
                cardEl.style.opacity = "0.6";
                cardEl.style.filter = "grayscale(70%)";
                gameState.criticalPlayers.delete(player.id);
                // Usar nombre en el Log del footer para la derrota
                BossManager.updateBattleLogFooter(BATTLE_LOG_MESSAGES.DEFEAT(player.name), 'defeat');
                // Reproducir audio de derrota total
                gameState.playNarrationForLog(BATTLE_LOG_MESSAGES.DEFEAT_GAME); // Nueva llamada
            } else {
                cardEl.style.opacity = "1";
                cardEl.style.filter = "none";
                
                if (player.vida <= CRITICAL_THRESHOLD) {
                    gameState.criticalPlayers.add(player.id);
                } else {
                    gameState.criticalPlayers.delete(player.id);
                }
                
                const alivePlayers = gameState.players.filter(p => p.vida > 0);
                if (alivePlayers.length > 0) {
                    const sortedPlayers = alivePlayers.sort((a, b) => b.vida - a.vida);
                    const allianceCandidate = sortedPlayers[0];
                    
                    if (allianceCandidate && allianceCandidate.vida >= (allianceCandidate.maxVida * ALLIANCE_THRESHOLD_PERCENT)) {
                         gameState.allianceTarget = allianceCandidate.id;
                    } else {
                         gameState.allianceTarget = null;
                    }
                } else {
                    gameState.allianceTarget = null;
                }
            }
        }
        
        // Lógica de opacidad dinámica para el corazón pequeño
        if (heartSmallEl) {
            const opacityRatio = player.vida * 2 / 100;
            const finalOpacity = Math.min(1, Math.max(0.2, opacityRatio)); 
            
            heartSmallEl.style.opacity = finalOpacity;
            
            if (player.vida <= 0) {
                heartSmallEl.style.opacity = 0;
            }
        }
        
        // Forzar la actualización del log de batalla
        if (!gameState.isBossMode) {
             BossManager.renderBossCard(); 
        }
        
        // Actualizar el log del footer con las alertas críticas/alianza
        BossManager.updateFooterAlerts();
    }

    static handlePlayerDefeat(playerId) {
        const card = document.getElementById(`card-${playerId}`);
        if (card) {
            utils.animate(card, "defeat-flash", 800);
        }
        
        const activePlayers = gameState.players.filter(p => p.vida > 0);
        if (activePlayers.length === 0) {
            // Reproducir audio de derrota total (Game Over)
            gameState.playNarrationForLog(BATTLE_LOG_MESSAGES.DEFEAT_GAME);
            showModal("DERROTA", "¡Todos los héroes han caído!", "💀", [{ text: "Reiniciar Partida", value: true, class: "btn-primary" }], (res) => {
                if (res) EventManager.handleGameReset();
            });
        }
    }
}

// GESTIÓN DE LA CARTA CENTRAL (JEFE/INFO)
class BossManager {
    static renderBossCard() {
        const boss = gameState.boss;
        if (!gameState.isBossMode) {
            elements.centralCardWrapper.innerHTML = BossManager.createInfoCard().outerHTML;
            elements.gameModeTitle.textContent = "Batalla en el Reino";
            return;
        }

        elements.centralCardWrapper.innerHTML = BossManager.createBossCard(boss).outerHTML;
        elements.gameModeTitle.textContent = "⚔️ Batalla de Jefe ⚔️";

        document.getElementById('boss-damage-btn').addEventListener('click', () => {
            BossManager.handleLifeChange(-1, document.getElementById('boss-damage-btn'));
        });
        document.getElementById('boss-heal-btn').addEventListener('click', () => {
            BossManager.handleLifeChange(1, document.getElementById('boss-heal-btn'));
        });
    }

    static updateBattleLog(message) {
        gameState.battleLog = message;
        // Reproducir audio de la leyenda
        gameState.playNarrationForLog(message);
        BossManager.renderBossCard();
    }

    static updateBattleLogFooter(message, type) {
        const footerAlert = document.getElementById('footer-alert');
        if (footerAlert) {
            footerAlert.textContent = message;
            footerAlert.className = `footer-alert ${type}`;
        }
    }

    static updateFooterAlerts() {
        const footerAlert = document.getElementById('footer-alert');
        if (!footerAlert) return;

        let alertMessage = "";
        let alertType = "";

        // 1. Alertas Críticas (con nombres)
        const criticalNames = Array.from(gameState.criticalPlayers).map(id => gameState.players.find(p => p.id === id)?.name).filter(Boolean);
        if (criticalNames.length > 0) {
            alertMessage = BATTLE_LOG_MESSAGES.CRITICAL_LOW(criticalNames.join(', '));
            alertType = 'critical';
        }

        // 2. Alerta de Alianza (con nombre)
        if (gameState.allianceTarget && !alertMessage) {
            const targetPlayer = gameState.players.find(p => p.id === gameState.allianceTarget);
            if (targetPlayer && targetPlayer.vida > 0) {
                 alertMessage = BATTLE_LOG_MESSAGES.ALLIANCE_TARGET(targetPlayer.name);
                 alertType = 'alliance';
            }
        }
        
        if (alertMessage) {
            footerAlert.textContent = alertMessage;
            footerAlert.className = `footer-alert ${alertType}`;
        } else {
            // Si no hay alertas, mostrar el mensaje por defecto del footer
            footerAlert.textContent = "Lista para cualquier desafío.";
            footerAlert.className = `footer-alert`;
        }
    }
    
    static createInfoCard() {
        const card = document.createElement("div");
        card.classList.add("info-card", "fade-in");
        
        // 1. Log Principal (genérico, para ElevenLabs)
        let logContent = `<h3 class="log-entry">${gameState.battleLog}</h3>`;
        
        card.innerHTML = `
            <h3>Diario de Batalla</h3>
            ${logContent}
        `;
        return card;
    }

    static createBossCard(boss) {
        const card = document.createElement("div");
        card.classList.add("central-card", "fade-in");
        card.id = `card-boss`;
        
        card.innerHTML = `
            <div class="boss-header">BOSS</div>
            <div class="boss-avatar" style="background-image: url('${CONFIG.AVATAR_PATH}generico1.png')"></div>
            <div class="boss-name">${boss.name}</div>
            
            <div class="boss-life-control">
                <button id="boss-damage-btn" class="boss-life-btn" aria-label="Dañar Jefe">-</button>
                <div class="boss-life-display" id="life-boss">${boss.vida}</div>
                <button id="boss-heal-btn" class="boss-life-btn" aria-label="Curar Jefe">+</button>
            </div>

            <div id="counter-boss" class="click-counter"></div>
        `;
        return card;
    }

    static handleLifeChange(delta, button) {
        const boss = gameState.boss;
        if (!boss) return;

        const newVida = Math.max(0, boss.vida + delta); 
        boss.vida = newVida;
        
        gameState.playSound(delta < 0 ? 'damage' : 'heal');

        BossManager.updateCardVisuals(boss);
        CounterManager.updateClickCounter('boss', delta, true);
        utils.animate(button, "btn-animate", 400);

        if (boss.vida <= 0) {
            BossManager.handleBossDefeat();
        }
    }

    static updateCardVisuals(boss) {
        const vidaEl = document.getElementById('life-boss');
        const cardEl = elements.centralCardWrapper.querySelector('.central-card');

        if (vidaEl) {
            vidaEl.textContent = boss.vida;
            
            const ratio = boss.vida / boss.maxVida;
            if (cardEl) {
                if (ratio <= 0.25 && boss.vida > 0) {
                    cardEl.style.boxShadow = `0 0 40px var(--boss-glow), inset 0 0 30px rgba(255, 0, 0, 0.7)`;
                    cardEl.style.borderColor = "#ff0000";
                } else if (ratio <= 0) {
                     cardEl.style.boxShadow = `0 0 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0, 0, 0, 0.7)`;
                     cardEl.style.filter = "grayscale(100%)";
                } else {
                    cardEl.style.boxShadow = `0 0 30px rgba(255, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.5)`;
                    cardEl.style.borderColor = "var(--boss-border)";
                    cardEl.style.filter = "none";
                }
            }
        }
    }
    
    static handleBossDefeat() {
        const bossCard = document.getElementById(`card-boss`);
        if (bossCard) {
            utils.animate(bossCard, "defeat-flash", 1000);
            BossManager.updateBattleLog("¡Felicitaciones, has ganado la Batalla!"); // Usar mensaje de victoria
            gameState.playNarrationForLog("¡Felicitaciones, has ganado la Batalla!"); // Reproducir audio de victoria
            showModal("VICTORIA", "¡Has derrotado al Jefe! ¡Felicidades!", "🎉", [{ text: "Reiniciar Partida", value: true, class: "btn-primary" }], (res) => {
                if (res) EventManager.handleGameReset();
            });
        }
    }
}


// GESTIÓN DE EVENTOS Y FLUJO
class EventManager {
    static init() {
        // Setup flow listeners
        elements.nextSetupBtn.addEventListener('click', EventManager.handleNextSetup);
        elements.nextPlayerBtn.addEventListener('click', EventManager.handleNextPlayer);
        elements.startButton.addEventListener('click', EventManager.handleGameStart);
        
        // Game reset listener
        elements.resetButton.addEventListener("click", () => {
            showModal(
                "Confirmación", 
                "¿Estás seguro de que quieres reiniciar la partida actual y volver a la configuración?", 
                "🔄", 
                [{ text: "Cancelar", value: false, class: "btn-secondary" }, { text: "Reiniciar", value: true, class: "btn-primary" }], 
                (confirm) => {
                    if (confirm) EventManager.handleGameReset();
                }
            );
        });
        
        // Placeholder buttons listeners
        elements.historyBtn.addEventListener('click', () => utils.showAlert("La funcionalidad de Historial será implementada pronto."));
        elements.settingsBtn.addEventListener('click', () => utils.showAlert("La funcionalidad de Settings será implementada pronto."));


        // Toggle visibility of character/boss fields
        elements.useCharactersCheckbox.addEventListener('change', EventManager.toggleCharacterFields);
        // Aseguramos que toggleBossFields solo se use para actualizar la visibilidad
        elements.useBossModeCheckbox.addEventListener('change', EventManager.toggleBossFields);

        // Initial setup display
        EventManager.toggleCharacterFields();
        // Inicialmente ocultamos los campos de jefe al cargar la pantalla de setup
        elements.bossSetupFields.classList.add('hidden'); 
    }
    
    static toggleCharacterFields() {
         // Lógica manejada dentro de updatePlayerStep
    }
    
    static toggleBossFields() {
        // Esta función solo debe alternar la visibilidad de los campos de jefe en la pantalla de resumen
        // Se llama explícitamente desde showSummary
    }
    
    // Variables de estado de flujo
    static totalPlayers = 4;
    static useCharacters = false;
    static useBossMode = false;
    static currentPlayer = 1;
    static playersData = [];
    
    static handleNextSetup() {
        EventManager.totalPlayers = parseInt(elements.playerCountSelect.value, 10);
        EventManager.useCharacters = elements.useCharactersCheckbox.checked;
        EventManager.useBossMode = elements.useBossModeCheckbox.checked;
        
        elements.setupInitial.classList.add('hidden');
        elements.playerStep.classList.remove('hidden');
        EventManager.currentPlayer = 1;
        EventManager.playersData = [];
        EventManager.updatePlayerStep();
    }

    static updatePlayerStep() {
        elements.playerStepTitle.textContent = `Jugador ${EventManager.currentPlayer} de ${EventManager.totalPlayers}`;
        elements.playerNameInput.value = '';
        if (EventManager.useCharacters) {
            elements.characterSelectGroup.style.display = '';
            elements.playerCharacterSelect.value = '';
        } else {
            elements.characterSelectGroup.style.display = 'none';
        }
    }

    static handleNextPlayer() {
        const name = elements.playerNameInput.value.trim();
        if (!name) {
            utils.showAlert('Por favor ingresa un nombre para el jugador.');
            return;
        }
        let character = '';
        if (EventManager.useCharacters) {
            character = elements.playerCharacterSelect.value;
            if (!character) {
                utils.showAlert('Selecciona un personaje.');
                return;
            }
        }
        
        EventManager.playersData.push({ name, character });
        
        if (EventManager.currentPlayer < EventManager.totalPlayers) {
            EventManager.currentPlayer++;
            EventManager.updatePlayerStep();
        } else {
            elements.playerStep.classList.add('hidden');
            EventManager.showSummary();
        }
    }

    static showSummary() {
        elements.summaryList.innerHTML = '';
        EventManager.playersData.forEach((p, idx) => {
            const charInfo = EventManager.useCharacters ? CHARACTERS[p.character].name : "Aventurero";
            const li = document.createElement('li');
            li.textContent = `Jugador ${idx + 1}: ${p.name} (${charInfo})`;
            elements.summaryList.appendChild(li);
        });

        // CORRECCIÓN CLAVE: Mostrar campos de jefe en el resumen si el modo jefe está activo
        if (EventManager.useBossMode) {
            elements.bossSetupFields.classList.remove('hidden');
        } else {
            elements.bossSetupFields.classList.add('hidden');
        }

        elements.playerSummary.classList.remove('hidden');
    }

    static handleGameStart() {
        if (EventManager.useBossMode) { // Ahora usa EventManager.useBossMode
            const bossName = elements.bossNameInput.value.trim();
            const bossLife = parseInt(elements.bossLifeInput.value, 10);
            
            // La validación ahora debe ocurrir, ya que el input es visible en el resumen
            if (!bossName) { utils.showAlert('Ingresa un nombre para el Jefe.'); return; }
            if (bossLife <= 0 || isNaN(bossLife)) { utils.showAlert('La vida inicial del Jefe debe ser un número positivo.'); return; }
            
            gameState.boss = { name: bossName, vida: bossLife, maxVida: bossLife };
            gameState.isBossMode = true;
        } else {
            gameState.boss = null;
            gameState.isBossMode = false;
        }

        const genericAvatars = utils.shuffleArray(GENERIC_AVATARS);
        gameState.players = EventManager.playersData.map((p, idx) => {
            let vida = 50, avatar = genericAvatars[idx % genericAvatars.length], maxVida = 50, characterName = "Aventurero";
            if (EventManager.useCharacters && CHARACTERS[p.character]) {
                vida = CHARACTERS[p.character].vida;
                avatar = CHARACTERS[p.character].icon; 
                maxVida = CHARACTERS[p.character].vida;
                characterName = GENDER_NAMES[p.character]['m']; 
            }
            return {
                id: idx + 1,
                name: p.name,
                character: p.character,
                vida,
                avatar,
                maxVida,
                characterName
            };
        });
        
        elements.setupScreen.classList.add("hidden");
        elements.gameScreen.classList.remove("hidden");
        
        BossManager.renderBossCard();
        CardManager.renderPlayerCards();
        gameState.resetCounters();
        
        // AUDIO START: Reproducir narración y música de fondo simultáneamente
        gameState.narrations.playIntro(); 
        gameState.bgMusic.start();
        
        elements.gameFooter.classList.remove('hidden'); // Restaurar footer
    }

    static handleGameReset() {
        gameState.bgMusic.stop();
        
        elements.gameScreen.classList.add("hidden");
        elements.setupScreen.classList.remove("hidden");

        elements.gameFooter.classList.add('hidden');

        elements.playersContainerLeft.innerHTML = "";
        elements.playersContainerRight.innerHTML = "";
        elements.centralCardWrapper.innerHTML = "";
        
        gameState.players = [];
        gameState.boss = null;
        gameState.isBossMode = false;
        gameState.resetCounters();
        gameState.battleLog = BATTLE_LOG_MESSAGES.INIT; 
        gameState.criticalPlayers.clear(); 
        gameState.allianceTarget = null;

        elements.setupInitial.classList.remove('hidden');
        elements.playerStep.classList.add('hidden');
        elements.playerSummary.classList.add('hidden');

        EventManager.totalPlayers = 4;
        EventManager.useCharacters = false;
        EventManager.useBossMode = false;
        EventManager.currentPlayer = 1;
        EventManager.playersData = [];
        
        elements.playerCountSelect.value = "4";
        elements.useCharactersCheckbox.checked = false;
        elements.useBossModeCheckbox.checked = false;
        
        // Ocultar los campos de jefe al reiniciar
        elements.bossSetupFields.classList.add('hidden');
    }
}

// INICIALIZACIÓN DE LA APLICACIÓN
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎮 The Tiny Realms - Inicializando...");
    EventManager.init();
    console.log("✅ Aplicación lista.");
});
