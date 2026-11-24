// --- CONFIGURACIÓN INICIAL ---
const lienzo = document.getElementById('lienzo');
const mensaje = document.getElementById('mensaje');
const nombreAlcanoUI = document.getElementById('nombre-alcano');
const puntosUI = document.getElementById('puntos');

const btnCarbono = document.getElementById('btn-carbono');
const btnUnir = document.getElementById('btn-unir');
const btnBorrar = document.getElementById('btn-borrar');
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnPista = document.getElementById('btn-pista');
const btnVerificar = document.getElementById('btn-verificar');

// --- DETECCIÓN DE PANTALLA ---
const TAMANO_CELDA = window.innerWidth < 600 ? 45 : 60;
lienzo.style.backgroundSize = `${TAMANO_CELDA}px ${TAMANO_CELDA}px`;

const estiloAtomo = document.createElement('style');
estiloAtomo.innerHTML = `
    .atomo {
        width: ${TAMANO_CELDA}px !important;
        height: ${TAMANO_CELDA}px !important;
        font-size: ${TAMANO_CELDA * 0.35}px !important; 
    }
    .pista-fantasma {
        width: ${TAMANO_CELDA}px !important;
        height: ${TAMANO_CELDA}px !important;
        border: 2px dashed #4CAF50;
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 1;
        opacity: 0.6;
    }
`;
document.head.appendChild(estiloAtomo);

// --- ESTADO DEL JUEGO ---
let atomos = []; 
let enlaces = []; 
let siguienteId = 1;
let herramientaActual = 'unir'; 
let carbonoFlotante = null; 
let carbonoSeleccionado = null; 
let puntaje = 0;
let nivelActual = 0;
let mostrarPista = false; 

// --- BASE DE DATOS DE NIVELES ---
const niveles = [
    { nombre: "Propano", carbonos: 3, gradosCorrectos: [2, 1, 1], silueta: [ {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4} ] },
    { nombre: "Butano", carbonos: 4, gradosCorrectos: [2, 2, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4} ] },
    { nombre: "2-metilpropano (Isobutano)", carbonos: 4, gradosCorrectos: [3, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 4, f: 3} ] },
    { nombre: "Pentano", carbonos: 5, gradosCorrectos: [2, 2, 2, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4} ] },
    { nombre: "2-metilbutano", carbonos: 5, gradosCorrectos: [3, 2, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3} ] },
    { nombre: "2,2-dimetilpropano (Neopentano)", carbonos: 5, gradosCorrectos: [4, 1, 1, 1, 1], silueta: [ {c: 4, f: 4}, {c: 3, f: 4}, {c: 5, f: 4}, {c: 4, f: 3}, {c: 4, f: 5} ] },
    { nombre: "Hexano", carbonos: 6, gradosCorrectos: [2, 2, 2, 2, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 7, f: 4} ] },
    { nombre: "3-metilpentano", carbonos: 6, gradosCorrectos: [3, 2, 2, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3} ] },
    { nombre: "2,3-dimetilbutano", carbonos: 6, gradosCorrectos: [3, 3, 1, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 5, f: 3} ] },
    { nombre: "Heptano", carbonos: 7, gradosCorrectos: [2, 2, 2, 2, 2, 1, 1], silueta: [ {c: 1, f: 4}, {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 7, f: 4} ] },
    { nombre: "3-etilpentano", carbonos: 7, gradosCorrectos: [3, 2, 2, 2, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 4, f: 2} ] },
    { nombre: "2,2,3-trimetilbutano", carbonos: 7, gradosCorrectos: [4, 3, 1, 1, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 4, f: 5}, {c: 5, f: 3} ] }
];

function iniciarNivel() {
    if (nivelActual >= niveles.length) {
        mensaje.innerHTML = "🎉 ¡Felicidades! Has completado todos los niveles. Eres un maestro de los alcanos. 🎉";
        mensaje.style.color = "#4CAF50";
        btnVerificar.disabled = true;
        btnPista.disabled = true;
        btnCarbono.disabled = true;
        btnUnir.disabled = true;
        btnBorrar.disabled = true;
        return;
    }
    
    atomos = [];
    enlaces = [];
    siguienteId = 1;
    carbonoSeleccionado = null;
    carbonoFlotante = null;
    mostrarPista = false; 
    
    btnVerificar.disabled = false;
    btnPista.disabled = false;
    btnCarbono.disabled = false;
    btnUnir.disabled = false;
    btnBorrar.disabled = false;
    
    nombreAlcanoUI.textContent = niveles[nivelActual].nombre;
    mensaje.textContent = "Arma la estructura y presiona 'Verificar'.";
    mensaje.style.color = "#aaa";
    
    herramientaActual = 'unir';
    btnUnir.classList.add('activo'); 
    btnCarbono.classList.remove('activo');

    dibujarTodo();
}

function obtenerTextoAtomo(idAtomo) {
    const numEnlaces = enlaces.filter(en => en.origenId === idAtomo || en.destinoId === idAtomo).length;
    const numHidrogenos = 4 - numEnlaces;

    if (numHidrogenos === 0) return 'C';
    if (numHidrogenos === 1) return 'CH';
    if (numHidrogenos === 2) return 'CH₂';
    if (numHidrogenos === 3) return 'CH₃';
    return 'C'; 
}

function dibujarTodo() {
    lienzo.innerHTML = '';

    // 0. Dibujar pista visual
    if (mostrarPista) {
        const nivel = niveles[nivelActual];
        nivel.silueta.forEach(pos => {
            const circuloPista = document.createElement('div');
            circuloPista.classList.add('pista-fantasma');
            circuloPista.style.left = `${pos.c * TAMANO_CELDA}px`;
            circuloPista.style.top = `${pos.f * TAMANO_CELDA}px`;
            lienzo.appendChild(circuloPista);
        });
    }

    // 1. Dibujar enlaces
    enlaces.forEach(enlace => {
        const origen = atomos.find(a => a.id === enlace.origenId);
        const destino = atomos.find(a => a.id === enlace.destinoId);
        
        if (origen && destino) {
            const linea = document.createElement('div');
            linea.classList.add('enlace');
            const dx = destino.x - origen.x;
            const dy = destino.y - origen.y;
            const longitud = Math.sqrt(dx * dx + dy * dy);
            const angulo = Math.atan2(dy, dx) * (180 / Math.PI);

            linea.style.width = `${longitud}px`;
            linea.style.left = `${origen.x}px`;
            linea.style.top = `${origen.y}px`;
            linea.style.transform = `rotate(${angulo}deg)`;
            
            lienzo.appendChild(linea);
        }
    });

    // 2. Dibujar átomos
    atomos.forEach(átomo => {
        const div = document.createElement('div');
        div.classList.add('atomo');
        div.innerHTML = obtenerTextoAtomo(átomo.id); 
        div.style.left = `${átomo.x}px`;
        div.style.top = `${átomo.y}px`;
        
        if (carbonoSeleccionado === átomo.id) div.classList.add('seleccionado');

        div.addEventListener('click', (e) => {
            e.stopPropagation(); 
            manejarClicAtomo(átomo.id);
        });

        lienzo.appendChild(div);
    });

    // 3. Dibujar carbono flotante
    if (carbonoFlotante) {
        const divFantasma = document.createElement('div');
        divFantasma.classList.add('atomo', 'fantasma');
        divFantasma.textContent = 'C';
        divFantasma.style.left = `${carbonoFlotante.x}px`;
        divFantasma.style.top = `${carbonoFlotante.y}px`;
        lienzo.appendChild(divFantasma);
    }
}

function actualizarFlotante(clientX, clientY) {
    if (carbonoFlotante) {
        const rect = lienzo.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        let gridX = Math.round(mouseX / TAMANO_CELDA) * TAMANO_CELDA;
        let gridY = Math.round(mouseY / TAMANO_CELDA) * TAMANO_CELDA;

        gridX = Math.max(TAMANO_CELDA, Math.min(lienzo.clientWidth - TAMANO_CELDA, gridX));
        gridY = Math.max(TAMANO_CELDA, Math.min(lienzo.clientHeight - TAMANO_CELDA, gridY));

        carbonoFlotante.x = gridX;
        carbonoFlotante.y = gridY;
        dibujarTodo();
    }
}

lienzo.addEventListener('mousemove', (e) => actualizarFlotante(e.clientX, e.clientY));
lienzo.addEventListener('touchmove', (e) => {
    if (carbonoFlotante) e.preventDefault(); 
    actualizarFlotante(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

lienzo.addEventListener('click', (e) => {
    if (carbonoFlotante) {
        const existe = atomos.some(a => a.x === carbonoFlotante.x && a.y === carbonoFlotante.y);
        if (!existe) {
            atomos.push({ id: siguienteId++, x: carbonoFlotante.x, y: carbonoFlotante.y, elemento: 'C' });
        }
        dibujarTodo();
    }
});

function manejarClicAtomo(id) {
    if (herramientaActual === 'unir') {
        if (carbonoSeleccionado === null) {
            carbonoSeleccionado = id;
        } else if (carbonoSeleccionado === id) {
            carbonoSeleccionado = null;
        } else {
            const yaUnidos = enlaces.some(en => 
                (en.origenId === carbonoSeleccionado && en.destinoId === id) ||
                (en.origenId === id && en.destinoId === carbonoSeleccionado)
            );
            if (!yaUnidos) enlaces.push({ origenId: carbonoSeleccionado, destinoId: id });
            carbonoSeleccionado = null;
        }
        dibujarTodo();
    }
}

btnCarbono.addEventListener('click', () => {
    btnCarbono.classList.add('activo'); btnUnir.classList.remove('activo');
    herramientaActual = 'añadir'; carbonoFlotante = { x: TAMANO_CELDA, y: TAMANO_CELDA };
    dibujarTodo();
});

btnUnir.addEventListener('click', () => {
    btnUnir.classList.add('activo'); btnCarbono.classList.remove('activo');
    herramientaActual = 'unir'; carbonoFlotante = null; carbonoSeleccionado = null;
    dibujarTodo();
});

btnBorrar.addEventListener('click', () => {
    if (atomos.length > 0) {
        const ultimoId = atomos[atomos.length - 1].id;
        atomos.pop();
        enlaces = enlaces.filter(en => en.origenId !== ultimoId && en.destinoId !== ultimoId);
        dibujarTodo();
    }
});

btnReiniciar.addEventListener('click', iniciarNivel);

// --- PISTA ACTUALIZADA CON FÓRMULA ---
btnPista.addEventListener('click', () => {
    if (nivelActual >= niveles.length) return;
    mostrarPista = !mostrarPista; 
    const carbonosNecesarios = niveles[nivelActual].carbonos;
    // Calculamos los hidrógenos totales usando la fórmula de alcanos (2n + 2)
    const hidrogenosTotales = (carbonosNecesarios * 2) + 2;
    
    if (mostrarPista) {
        mensaje.innerHTML = `💡 Pista activada: Coloca <b>${carbonosNecesarios} carbonos</b> sobre los círculos.<br>Fórmula esperada: <b>C${carbonosNecesarios}H${hidrogenosTotales}</b>`;
    } else {
        mensaje.innerHTML = `Pista ocultada. ¡Tú puedes!`;
    }
    mensaje.style.color = "#ffeb3b";
    dibujarTodo();
});

btnVerificar.addEventListener('click', () => {
    if (nivelActual >= niveles.length) return;
    const nivel = niveles[nivelActual];

    if (atomos.length !== nivel.carbonos) {
        mensaje.textContent = `❌ Error: El ${nivel.nombre} tiene exactamente ${nivel.carbonos} carbonos. Tú tienes ${atomos.length}.`;
        mensaje.style.color = "#f44336";
        return;
    }

    const hayAislados = atomos.some(a => {
        return !enlaces.some(en => en.origenId === a.id || en.destinoId === a.id);
    });
    if (hayAislados) {
        mensaje.textContent = "❌ Error: Hay carbonos flotando sin estar unidos a la cadena.";
        mensaje.style.color = "#f44336";
        return;
    }

    let gradosJugador = atomos.map(a => {
        return enlaces.filter(en => en.origenId === a.id || en.destinoId === a.id).length;
    }).sort((a,b) => b - a); 

    let gradosCorrectos = [...nivel.gradosCorrectos].sort((a,b) => b - a);
    const esCorrecto = JSON.stringify(gradosJugador) === JSON.stringify(gradosCorrectos);

    if (esCorrecto) {
        const numH = (atomos.length * 2) + 2;
        mensaje.innerHTML = `✅ ¡Correcto! Has armado el ${nivel.nombre}.<br>Fórmula molecular: <b>C${atomos.length}H${numH}</b>`;
        mensaje.style.color = "#4CAF50";
        puntaje += 100;
        puntosUI.textContent = puntaje;
        
        btnVerificar.style.backgroundColor = "#fff";
        btnVerificar.style.color = "#4CAF50";
        
        setTimeout(() => {
            nivelActual++;
            mostrarPista = false; 
            btnVerificar.style.backgroundColor = "#4CAF50";
            btnVerificar.style.color = "white";
            iniciarNivel();
        }, 3000); 
    } else {
        mensaje.textContent = "❌ La estructura no es correcta. Revisa la longitud de la cadena principal y las ramificaciones.";
        mensaje.style.color = "#f44336";
    }
});

iniciarNivel();