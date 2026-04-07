// --- VARIABLES DE ESTADO ---
let esModoPro = false;

// Al cargar la página/app
window.onload = function() {
    // 1. Verificamos si ya era PRO (Persistencia)
    if (localStorage.getItem('modoPro') === 'true') {
        activarInterfazPro();
    }

    // 2. Inicializamos los escuchadores de los deslizadores
    configurarEventos();
    
    // 3. Primera resolución con valores iniciales
    resolverEcuacion();
};

// --- GESTIÓN DE DESLIZADORES ---
function configurarEventos() {
    // IDs de todos los inputs range
    const ids = ['val-a', 'val-b', 'val-h', 'val-e', 'val-k'];

    ids.forEach(id => {
        const input = document.getElementById(id);
        const display = document.getElementById(id + '-display');

        if (input) {
            // Cada vez que se mueva el slider...
            input.addEventListener('input', () => {
                if (display) display.innerText = input.value;
                resolverEcuacion(); // Recalcular al instante
            });
        }
    });
}

// --- LÓGICA DE ACCESO (CÓDIGO: 5toAB) ---
function verificarCodigo() {
    const input = document.getElementById('codigo-acceso');
    if (!input) return;

    const valorIngresado = input.value.trim();
    
    // btoa("5toAB") === "NXRvQUI="
    if (btoa(valorIngresado) === "NXRvQUI=") {
        localStorage.setItem('modoPro', 'true');
        activarInterfazPro();
        alert("✅ ¡Modo PRO activado con éxito!");
        resolverEcuacion();
    } else {
        alert("❌ Código incorrecto. Intentá de nuevo.");
    }
}

function activarInterfazPro() {
    esModoPro = true;
    // Mostrar campos ocultos
    const elementosPro = document.querySelectorAll('.controles-pro');
    elementosPro.forEach(el => el.style.display = 'block');
    // Ocultar el input de código una vez activado
    const seccionAcceso = document.getElementById('seccion-acceso');
    if (seccionAcceso) seccionAcceso.style.display = 'none';
}

// --- CÁLCULO MATEMÁTICO ---
function resolverEcuacion() {
    // Captura de valores de los inputs
    const a = parseFloat(document.getElementById('val-a')?.value) || 1;
    const b = parseFloat(document.getElementById('val-b')?.value) || 1;
    const h = parseFloat(document.getElementById('val-h')?.value) || 0;
    const e = parseFloat(document.getElementById('val-e')?.value) || 0;
    
    // Si es PRO usa k, si no es 0
    const k = esModoPro ? (parseFloat(document.getElementById('val-k')?.value) || 0) : 0;

    // Ecuación: a|bx + h| + k = e  =>  |bx + h| = (e - k) / a
    const argumentoModulo = (e - k) / a;
    let textoResultado = "";

    if (a === 0) {
        textoResultado = "El coeficiente 'a' no puede ser 0";
    } else if (argumentoModulo < 0) {
        textoResultado = "Sin solución real (Módulo negativo)";
    } else {
        // Resolvemos las dos ramas del módulo
        const x1 = (argumentoModulo - h) / b;
        const x2 = (-argumentoModulo - h) / b;

        // Formateo de números (tu pedido: enteros sin .0, decimales a 2)
        const f1 = Number.isInteger(x1) ? x1 : x1.toFixed(2);
        const f2 = Number.isInteger(x2) ? x2 : x2.toFixed(2);

        textoResultado = `x₁ = ${f1} <br> x₂ = ${f2}`;
    }

    const display = document.getElementById('display-resultado');
    if (display) display.innerHTML = textoResultado;
}

// --- COMUNICACIÓN CON APP INVENTOR ---
function compartirWhatsApp() {
    const resultado = document.getElementById('display-resultado')?.innerText;
    if (!resultado || resultado.includes("Mueva")) {
        alert("Resolvé una ecuación primero.");
        return;
    }

    const mensaje = `*Ecuaciones con Módulo*\nResultado: ${resultado}`;
    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(mensaje);

    if (window.AppInventor) {
        // Envía la URL al ActivityStarter de tu App
        window.AppInventor.setWebViewString(url);
    } else {
        // Abre WhatsApp Web si estás en PC
        window.open(url, '_blank');
    }
}
