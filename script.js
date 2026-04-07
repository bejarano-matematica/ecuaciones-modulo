/**
 * LÓGICA DE ECUACIONES CON MÓDULO - VERSIÓN INTEGRADA
 * Desarrollado para 5to Año - Escuela Técnica
 */

// 1. --- ESTADO GLOBAL Y PERSISTENCIA ---
let esModoPro = false;

window.onload = function() {
    // Al cargar, verificamos si el alumno ya había activado el modo PRO antes
    if (localStorage.getItem('modoPro') === 'true') {
        activarInterfazPro();
    }
};

// 2. --- FUNCIÓN DE ACCESO (CÓDIGO 5toAB) ---
function verificarCodigo() {
    const inputElement = document.getElementById('codigo-acceso');
    if (!inputElement) return;

    const codigoInput = inputElement.value.trim();
    
    // NXRvQUI= es el Base64 exacto de "5toAB"
    if (btoa(codigoInput) === "NXRvQUI=") {
        localStorage.setItem('modoPro', 'true');
        activarInterfazPro();
        alert("✅ ¡Modo PRO activado! Parámetros k, n y m habilitados.");
        
        // Ocultar el modal o sección de login si existe
        const modal = document.getElementById('modal-acceso');
        if (modal) modal.style.display = 'none';
    } else {
        alert("❌ Código incorrecto. Recordá que distingue mayúsculas (ej: 5toAB).");
    }
}

function activarInterfazPro() {
    esModoPro = true;
    document.body.classList.add('pro-active');
    
    // Mostramos todos los elementos que tengan la clase 'controles-pro'
    const elementosPro = document.querySelectorAll('.controles-pro');
    elementosPro.forEach(el => {
        el.style.display = 'block'; // O 'flex' según tu CSS
    });

    console.log("Sistema: Modo PRO inicializado.");
}

// 3. --- LÓGICA MATEMÁTICA (Resumen de Resolución) ---
function resolverEcuacion() {
    // Captura de valores (ejemplo: a|bx + h| + k = e)
    const a = parseFloat(document.getElementById('val-a').value) || 1;
    const b = parseFloat(document.getElementById('val-b').value) || 1;
    const h = parseFloat(document.getElementById('val-h').value) || 0;
    const e = parseFloat(document.getElementById('val-e').value) || 0;
    
    // Parámetros PRO (si no es PRO, valen 0)
    const k = esModoPro ? (parseFloat(document.getElementById('val-k').value) || 0) : 0;
    const n = esModoPro ? (parseFloat(document.getElementById('val-n').value) || 0) : 0;
    
    // Aquí iría tu fórmula de resolución: a|bx + h| = e - k - nx ...
    // [Tu lógica actual de cálculo aquí]
    
    const resultado = `Resultado de la ecuación...`; // Ejemplo
    document.getElementById('display-resultado').innerText = resultado;
}

// 4. --- FUNCIÓN DE COMPARTIR (PUENTE CON APP INVENTOR) ---
function compartirPorWhatsApp() {
    const resultado = document.getElementById('display-resultado').innerText;
    const nombreAlumno = document.getElementById('nombre-alumno')?.value || "Alumno";
    
    if (!resultado || resultado === "") {
        alert("Primero debés resolver una ecuación.");
        return;
    }

    const mensaje = `*Ecuaciones con Módulo*\n` +
                    `Estudiante: ${nombreAlumno}\n` +
                    `Resultado: ${resultado}\n` +
                    `_Enviado desde la App de Matemática_`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = "https://api.whatsapp.com/send?text=" + mensajeCodificado;

    // IMPORTANTE: Comunicación con el bloque 'WebViewStringChange' de App Inventor
    if (window.AppInventor) {
        // Esto dispara el bloque de la foto que me pasaste
        window.AppInventor.setWebViewString(urlWhatsApp);
    } else {
        // Fallback para navegador de PC
        window.open(urlWhatsApp, '_blank');
    }
}
