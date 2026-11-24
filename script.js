// --- CONFIGURACIÓN INICIAL ---
const lienzo = document.getElementById('lienzo');
const toast = document.getElementById('toast');
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
const TAMANO_CELDA = window.innerWidth < 600 ? 40 : 50;
lienzo.style.backgroundSize = `${TAMANO_CELDA}px ${TAMANO_CELDA}px`;

const estiloAtomo = document.createElement('style');
estiloAtomo.innerHTML = `
    .atomo {
        width: ${TAMANO_CELDA}px !important;
        height: ${TAMANO_CELDA}px !important;
        font-size: ${TAMANO_CELDA * 0.32}px !important; 
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
let timeoutNotificacion = null; 

const niveles = [
    { nombre: "2-metilpropano (Isobutano)", carbonos: 4, gradosCorrectos: [3, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 4, f: 3} ] },
    { nombre: "2-metilbutano", carbonos: 5, gradosCorrectos: [3, 2, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3} ] },
    { nombre: "2,2-dimetilpropano (Neopentano)", carbonos: 5, gradosCorrectos: [4, 1, 1, 1, 1], silueta: [ {c: 4, f: 4}, {c: 3, f: 4}, {c: 5, f: 4}, {c: 4, f: 3}, {c: 4, f: 5} ] },
    { nombre: "3-metilpentano", carbonos: 6, gradosCorrectos: [3, 2, 2, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3} ] },
    { nombre: "2,3-dimetilbutano", carbonos: 6, gradosCorrectos: [3, 3, 1, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 5, f: 3} ] },
    { nombre: "3-etilpentano", carbonos: 7, gradosCorrectos: [3, 2, 2, 2, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 4, f: 2} ] },
    { nombre: "2,2,3-trimetilbutano", carbonos: 7, gradosCorrectos: [4, 3, 1, 1, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 4, f: 3}, {c: 4, f: 5}, {c: 5, f: 3} ] },
    { nombre: "3-etil-2-metilpentano", carbonos: 8, gradosCorrectos: [3, 3, 2, 2, 1, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 3, f: 3}, {c: 4, f: 3}, {c: 4, f: 2} ] },
    { nombre: "2,2,4-trimetilpentano", carbonos: 8, gradosCorrectos: [4, 2, 2, 2, 1, 1, 1, 1], silueta: [ {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 3, f: 3}, {c: 3, f: 5}, {c: 5, f: 3} ] },
    { nombre: "2,2,3,3-Tetrametilpentano", carbonos: 9, gradosCorrectos: [4, 4, 2, 2, 1, 1, 1, 1, 1], silueta: [ {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 7, f: 4}, {c: 4, f: 3}, {c: 4, f: 5}, {c: 5, f: 3}, {c: 5, f: 5} ] },
    { nombre: "3-isopropil-2-metilhexano", carbonos: 10, gradosCorrectos: [3, 3, 3, 2, 2, 1, 1, 1, 1, 1], silueta: [ {c: 1, f: 4}, {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 2, f: 3}, {c: 3, f: 3}, {c: 3, f: 2}, {c: 3, f: 5} ] },
    { nombre: "4-etil-2,2-dimetilhexano", carbonos: 10, gradosCorrectos: [4, 3, 2, 2, 2, 1, 1, 1, 1, 1], silueta: [ {c: 1, f: 4}, {c: 2, f: 4}, {c: 3, f: 4}, {c: 4, f: 4}, {c: 5, f: 4}, {c: 6, f: 4}, {c: 2, f: 3}, {c: 2, f: 5}, {c: 4, f: 3}, {c: 4, f: 2} ] }
];

function mostrarNotificacion(texto, tipo = 'exito', duracion = 4000) {
    if (timeoutNotificacion) clearTimeout(timeoutNotificacion);
    mensaje.innerHTML = texto;
    toast.className = ''; 
    toast.classList.add(tipo);
    toast.classList.remove('toast-oculto');
    timeoutNotificacion = setTimeout(() => {
        toast.classList.add('toast-oculto');
    }, duracion);
}

function iniciarNivel() {
    if (nivelActual >= niveles.length) {
        mostrarNotificacion("🎉 ¡Felicidades! Has completado todos los niveles. 🎉", "exito", 8000);
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

    if (carbonoFlotante) {
        const divFantasma = document.createElement('div');
        divFantasma.classList.add('atomo', 'fantasma');
        divFantasma.textContent = 'C';
        divFantasma.style.left = `${carbonoFlotante.x}px`;
        divFantasma.style.top = `${carbonoFlotante.y}px`;
        lienzo.appendChild(divFantasma);
    }
}

lienzo.addEventListener('click', (e) => {
    if (carbonoFlotante) {
        const rect = lienzo.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        let gridX = Math.round(clickX / TAMANO_CELDA) * TAMANO_CELDA;
        let gridY = Math.round(clickY / TAMANO_CELDA) * TAMANO_CELDA;

        const existe = atomos.some(a => a.x === gridX && a.y === gridY);
        
        if (!existe) {
            atomos.push({ id: siguienteId++, x: gridX, y: gridY, elemento: 'C' });
            carbonoFlotante.x = gridX;
            carbonoFlotante.y = gridY;
            dibujarTodo();
        }
    }
});

window.addEventListener('keydown', (e) => {
    if (carbonoFlotante) {
        if (e.key === 'ArrowRight') carbonoFlotante.x += TAMANO_CELDA;
        if (e.key === 'ArrowLeft') carbonoFlotante.x -= TAMANO_CELDA;
        if (e.key === 'ArrowUp') carbonoFlotante.y -= TAMANO_CELDA;
        if (e.key === 'ArrowDown') carbonoFlotante.y += TAMANO_CELDA;
        
        carbonoFlotante.x = Math.max(TAMANO_CELDA, Math.min(lienzo.clientWidth - TAMANO_CELDA, carbonoFlotante.x));
        carbonoFlotante.y = Math.max(TAMANO_CELDA, Math.min(lienzo.clientHeight - TAMANO_CELDA, carbonoFlotante.y));
        
        e.preventDefault();
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
    herramientaActual = 'añadir'; 
    carbonoFlotante = { 
        x: Math.round((lienzo.parentElement.scrollLeft + lienzo.parentElement.clientWidth / 2) / TAMANO_CELDA) * TAMANO_CELDA,
        y: Math.round((lienzo.parentElement.scrollTop + lienzo.parentElement.clientHeight / 2) / TAMANO_CELDA) * TAMANO_CELDA
    };
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

btnPista.addEventListener('click', () => {
    if (nivelActual >= niveles.length) return;
    mostrarPista = !mostrarPista; 
    const carbonosNecesarios = niveles[nivelActual].carbonos;
    const hidrogenosTotales = (carbonosNecesarios * 2) + 2;
    
    if (mostrarPista) {
        mostrarNotificacion(`💡 Coloca <b>${carbonosNecesarios} carbonos</b> sobre los círculos.<br>Fórmula esperada: <b>C${carbonosNecesarios}H${hidrogenosTotales}</b>`, 'pista');
    } else {
        mostrarNotificacion(`Pista ocultada. ¡Tú puedes!`, 'pista');
    }
    dibujarTodo();
});

function generarNombreIUPAC(atomos, enlaces) {
    const n = atomos.length;
    if (n === 0) return "";
    let adj = {};
    atomos.forEach(a => adj[a.id] = []);
    enlaces.forEach(e => {
        adj[e.origenId].push(e.destinoId);
        adj[e.destinoId].push(e.origenId);
    });
    let todosLosCaminos = [];
    function dfs(actual, camino) {
        let esExtremo = true;
        for (let vecino of adj[actual]) {
            if (!camino.includes(vecino)) {
                esExtremo = false;
                dfs(vecino, [...camino, vecino]);
            }
        }
        if (esExtremo || camino.length === n) {
            todosLosCaminos.push([...camino]);
        }
    }
    atomos.forEach(a => dfs(a.id, [a.id]));
    let cadenaPrincipal = [];
    let maxLen = 0;
    todosLosCaminos.forEach(c => {
        if (c.length > maxLen) {
            maxLen = c.length;
            cadenaPrincipal = c;
        }
    });
    let enCadena = new Set(cadenaPrincipal);
    let ramificaciones = atomos.filter(a => !enCadena.has(a.id));
    let sustituyentes = [];
    let visitadosRamas = new Set();
    function explorarRama(nodoInicio, carbonoCadena) {
        let cola = [{ id: nodoInicio }];
        visitadosRamas.add(nodoInicio);
        let grupo = [nodoInicio];
        while (cola.length > 0) {
            let { id } = cola.shift();
            for (let vecino of adj[id]) {
                if (!enCadena.has(vecino) && !visitadosRamas.has(vecino)) {
                    visitadosRamas.add(vecino);
                    grupo.push(vecino);
                    cola.push({ id: vecino });
                }
            }
        }
        return { carbonoCadena, grupo };
    }
    for (let rama of ramificaciones) {
        if (!visitadosRamas.has(rama.id)) {
            let carbonoCadena = null;
            for (let vecino of adj[rama.id]) {
                if (enCadena.has(vecino)) {
                    carbonoCadena = vecino;
                    break;
                }
            }
            if (carbonoCadena !== null) {
                let info = explorarRama(rama.id, carbonoCadena);
                sustituyentes.push(info);
            }
        }
    }
    let numIzq = {};
    cadenaPrincipal.forEach((id, index) => numIzq[id] = index + 1);
    let numDer = {};
    cadenaPrincipal.forEach((id, index) => numDer[id] = cadenaPrincipal.length - index);
    let scoreIzq = sustituyentes.map(s => numIzq[s.carbonoCadena]).sort((a,b)=>a-b);
    let scoreDer = sustituyentes.map(s => numDer[s.carbonoCadena]).sort((a,b)=>a-b);
    let usarDer = false;
    for (let i = 0; i < scoreIzq.length; i++) {
        if (scoreDer[i] < scoreIzq[i]) { usarDer = true; break; }
        if (scoreDer[i] > scoreIzq[i]) { usarDer = false; break; }
    }
    let numeracion = usarDer ? numDer : numIzq;
    const prefijos = ["met", "et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];
    let listaNombres = [];
    sustituyentes.forEach(s => {
        let largo = s.grupo.length;
        let nombreBase = prefijos[largo - 1] || "alquil";
        let pos = numeracion[s.carbonoCadena];
        listaNombres.push({ pos: pos, nombre: nombreBase + "il" });
    });
    let conteo = {};
    listaNombres.forEach(n => {
        if (!conteo[n.nombre]) conteo[n.nombre] = [];
        conteo[n.nombre].push(n.pos);
    });
    let prefijosMultiplicadores = { 2: "di", 3: "tri", 4: "tetra", 5: "penta" };
    let partesNombre = [];
    let clavesOrdenadas = Object.keys(conteo).sort();
    clavesOrdenadas.forEach(nombreSust => {
        let posiciones = conteo[nombreSust].sort((a,b) => a-b);
        let multiplicador = posiciones.length > 1 ? prefijosMultiplicadores[posiciones.length] : "";
        let stringPos = posiciones.join(",");
        partesNombre.push(`${stringPos}-${multiplicador}${nombreSust}`);
    });
    let prefijoCadena = prefijos[cadenaPrincipal.length - 1] || "alcan";
    let nombreCadena = prefijoCadena + "ano";
    if (partesNombre.length === 0) {
        return nombreCadena.charAt(0).toUpperCase() + nombreCadena.slice(1);
    } else {
        let nombreCompleto = partesNombre.join("-") + "-" + nombreCadena;
        return nombreCompleto.charAt(0).toUpperCase() + nombreCompleto.slice(1);
    }
}

btnVerificar.addEventListener('click', () => {
    if (nivelActual >= niveles.length) return;
    const nivel = niveles[nivelActual];

    if (atomos.length !== nivel.carbonos) {
        mostrarNotificacion(`❌ Error: El ${nivel.nombre} tiene exactamente ${nivel.carbonos} carbonos. Tú tienes ${atomos.length}.`, 'error');
        return;
    }

    const hayAislados = atomos.some(a => {
        return !enlaces.some(en => en.origenId === a.id || en.destinoId === a.id);
    });
    if (hayAislados) {
        mostrarNotificacion("❌ Error: Hay carbonos flotando sin estar unidos a la cadena.", 'error');
        return;
    }

    let gradosJugador = atomos.map(a => {
        return enlaces.filter(en => en.origenId === a.id || en.destinoId === a.id).length;
    }).sort((a,b) => b - a); 

    let gradosCorrectos = [...nivel.gradosCorrectos].sort((a,b) => b - a);
    const esCorrecto = JSON.stringify(gradosJugador) === JSON.stringify(gradosCorrectos);

    if (esCorrecto) {
        const numH = (atomos.length * 2) + 2;
        const nombreIUPACGenerado = generarNombreIUPAC(atomos, enlaces);
        
        mostrarNotificacion(`✅ ¡Correcto! Has armado el ${nivel.nombre}.<br>
        Fórmula: <b>C${atomos.length}H${numH}</b><br>
        <span style="color: #ffeb3b; font-size: 1.1em; display: inline-block; margin-top: 5px;">Nombre generado: <b>${nombreIUPACGenerado}</b></span>`, 'exito', 4000);
        
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
        }, 4000); 
    } else {
        mostrarNotificacion("❌ La estructura no es correcta. Revisa la longitud de la cadena principal y las ramificaciones.", 'error');
    }
});

iniciarNivel();