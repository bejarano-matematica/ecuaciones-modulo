let escala = 30, centroX;
let resX1 = null, resX2 = null;
let esValida1 = false, esValida2 = false;
let validado1 = false, validado2 = false;
let modoProActivo = false;

// AL CARGAR LA APP: Verificamos si ya era PRO
window.onload = function() {
    try {
        if (localStorage.getItem('moduloProBejarano') === 'activado') {
            setModo('pro');
        }
    } catch (e) {
        console.log("Error de almacenamiento local.");
    }
};

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) { tabcontent[i].style.display = "none"; }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function setModo(modo) {
    let slK = document.getElementById('slK'), slN = document.getElementById('slN'), slM = document.getElementById('slM');
    if (modo === 'basico') {
        modoProActivo = false;
        document.getElementById('btnBásico').className = "btn-mode active-free";
        document.getElementById('btnPro').className = "btn-mode";
        document.getElementById('formulaRef').innerText = "Ecuación: a |bx - h| = e";
        slK.value = 0; slN.value = 0; slM.value = 0;
        slK.disabled = true; slN.disabled = true; slM.disabled = true;
        document.getElementById('grpK').classList.add('locked');
        document.getElementById('grpN').classList.add('locked');
        document.getElementById('grpM').classList.add('locked');
    } else {
        modoProActivo = true;
        document.getElementById('btnBásico').className = "btn-mode";
        document.getElementById('btnPro').className = "btn-mode active-pro";
        document.getElementById('formulaRef').innerText = "Ecuación: a |bx - h| + k + nx = e + mx";
        slK.disabled = false; slN.disabled = false; slM.disabled = false;
        document.getElementById('grpK').classList.remove('locked');
        document.getElementById('grpN').classList.remove('locked');
        document.getElementById('grpM').classList.remove('locked');
    }
    resetBotones();
}

// SISTEMA PRO CON HASH (Contraseña: 5toAB)
function intentarDesbloquearPro() {
    if(modoProActivo) return;
    document.getElementById('area-ingreso-pro').style.display = 'block';
    document.getElementById('mensaje-error-pro').style.display = 'none';
}

function cancelarPro() {
    document.getElementById('area-ingreso-pro').style.display = 'none';
}

function verificarCodigoPro() {
    let codigo = document.getElementById('input-codigo-pro').value;
    let hashGenerado = btoa(codigo.trim());
    let hashCorrecto = "NXRvQUI="; // Huella para 5toAB

    if (hashGenerado === hashCorrecto) {
        document.getElementById('mensaje-error-pro').style.display = 'none';
        document.getElementById('mensaje-exito-pro').style.display = 'block';
        try { localStorage.setItem('moduloProBejarano', 'activado'); } catch(e) {}
        setTimeout(() => {
            document.getElementById('area-ingreso-pro').style.display = 'none';
            setModo('pro');
        }, 1500);
    } else {
        document.getElementById('mensaje-error-pro').style.display = 'block';
    }
}

// CANVAS INTELIGENTE
function setup() {
    let contenedorAncho = document.getElementById('canvas-container').offsetWidth || windowWidth * 0.9;
    let c = createCanvas(contenedorAncho, 220); 
    c.parent('canvas-container');
    actualizarMedidasCanvas();
}

function windowResized() {
    let contenedorAncho = document.getElementById('canvas-container').offsetWidth || windowWidth * 0.9;
    resizeCanvas(contenedorAncho, 220);
    actualizarMedidasCanvas();
}

function actualizarMedidasCanvas() {
    centroX = width / 2;
    escala = width / 32; 
}

function draw() {
    background(255);
    let a = parseFloat(document.getElementById('slA').value);
    let b_real = parseFloat(document.getElementById('slB').value);
    let b_calc = b_real === 0 ? 0.00001 : b_real;
    let h = parseFloat(document.getElementById('slH').value);
    let k = parseFloat(document.getElementById('slK').value);
    let n = parseFloat(document.getElementById('slN').value);
    let e = parseFloat(document.getElementById('slE').value);
    let m = parseFloat(document.getElementById('slM').value);

    // Actualizar números al lado de los deslizadores
    document.querySelectorAll('.controls span').forEach(s => {
        let id = s.id.replace('v', 'sl');
        s.innerText = document.getElementById(id).value;
    });

    let bText = b_real === 0 ? "0" : (b_real === 1 ? "" : (b_real === -1 ? "-" : b_real));
    let hSign = h >= 0 ? "-" : "+";
    let hAbs = Math.abs(h);
    let kSign = k >= 0 ? "+" : "-";
    let kAbs = Math.abs(k);
    let nPart = n === 0 ? "" : (n > 0 ? ` + ${n}x` : ` - ${Math.abs(n)}x`);
    let mPart = m === 0 ? "" : (m > 0 ? ` + ${m}x` : ` - ${Math.abs(m)}x`);
    let aText = a === 1 ? "" : (a === -1 ? "-" : a);
    let eqK = (!modoProActivo || k === 0) ? "" : ` ${kSign} ${kAbs}`;
    
    document.getElementById('eqActual').innerText = `${aText}|${bText}x ${hSign} ${hAbs}|${eqK}${nPart} = ${e}${mPart}`;

    if (b_real === 0) {
        document.getElementById('despejeC1').innerHTML = "No es lineal";
        document.getElementById('despejeC2').innerHTML = "-";
        return;
    }

    let hCritico = h / b_calc;
    let bPos = b_calc > 0;
    let ineq1 = bPos ? "≥" : "≤";
    let ineq2 = bPos ? "<" : ">";

    document.getElementById('despejeC1').innerHTML = `${b_real}x ${hSign} ${hAbs} ≥ 0<br>x ${ineq1} ${hCritico.toFixed(2)}`;
    document.getElementById('despejeC2').innerHTML = `${b_real}x ${hSign} ${hAbs} < 0<br>x ${ineq2} ${hCritico.toFixed(2)}`;

    let den1 = (a * b_calc) + n - m;
    let num1 = e - k + (a * h);
    if (den1 !== 0) {
        resX1 = num1 / den1;
        esValida1 = bPos ? (resX1 >= hCritico - 0.001) : (resX1 <= hCritico + 0.001);
        document.getElementById('step1').innerHTML = `${den1.toFixed(1)}x = ${num1.toFixed(1)}<br><strong>x₁ = ${resX1.toFixed(2)}</strong>`;
    }

    let den2 = (-a * b_calc) + n - m;
    let num2 = e - k - (a * h);
    if (den2 !== 0) {
        resX2 = num2 / den2;
        esValida2 = bPos ? (resX2 < hCritico + 0.001) : (resX2 > hCritico - 0.001);
        document.getElementById('step2').innerHTML = `${den2.toFixed(1)}x = ${num2.toFixed(1)}<br><strong>x₂ = ${resX2.toFixed(2)}</strong>`;
    }

    dibujarRecta(1, 70, hCritico, resX1, `Validez Caso 1`, "#3498db", "x₁", bPos);
    dibujarRecta(2, 160, hCritico, resX2, `Validez Caso 2`, "#e74c3c", "x₂", bPos);
    chequearSolucionFinal();
}

function dibujarRecta(caso, y, hCritico, xVal, titulo, colorPunto, labelPunto, bPos) {
    fill(100); noStroke(); textAlign(LEFT); textSize(12); text(titulo, 20, y - 35);
    stroke(200); line(40, y, width-40, y);
    for(let i=-15; i<=15; i++) {
        let px = centroX + i*escala;
        line(px, y-5, px, y+5);
        if(i % 5 === 0) { noStroke(); fill(150); text(i, px-5, y+18); stroke(200); }
    }
    let pxCritico = centroX + hCritico * escala;
    strokeWeight(4); stroke(46, 204, 113, 180); 
    let vaDerecha = (caso === 1 && bPos) || (caso === 2 && !bPos);
    if (vaDerecha) line(pxCritico, y, width - 40, y); else line(pxCritico, y, 40, y);
    strokeWeight(1); fill(caso === 1 ? 46 : 255); stroke(46, 204, 113);
    ellipse(pxCritico, y, 10, 10);
    if(xVal !== null) {
        let pxSol = centroX + xVal * escala;
        fill(colorPunto); noStroke(); ellipse(pxSol, y, 12, 12);
        fill(50); text(labelPunto, pxSol-5, y-15);
    }
}

function verificar(caso) {
    if(caso === 1) {
        validado1 = true;
        document.getElementById('btn1').className = esValida1 ? "btn-validar btn-exito" : "btn-validar btn-error";
        document.getElementById('btn1').innerText = esValida1 ? "CORRECTO" : "FUERA DE RANGO";
    } else {
        validado2 = true;
        document.getElementById('btn2').className = esValida2 ? "btn-validar btn-exito" : "btn-validar btn-error";
        document.getElementById('btn2').innerText = esValida2 ? "CORRECTO" : "FUERA DE RANGO";
    }
}

function chequearSolucionFinal() {
    if (validado1 && validado2) {
        let sol = [];
        if(esValida1) sol.push(resX1.toFixed(2));
        if(esValida2) sol.push(resX2.toFixed(2));
        sol.sort((a,b)=>a-b);
        document.getElementById('solucion-final-text').innerText = sol.length ? `{ ${sol.join(" ; ")} }` : "∅";
        document.getElementById('conclusion-panel').style.display = 'block';
    }
}

function resetBotones() {
    validado1 = false; validado2 = false;
    document.getElementById('conclusion-panel').style.display = "none";
    document.getElementById('btn1').className = "btn-validar btn-espera"; document.getElementById('btn1').innerText = "Validar Caso 1";
    document.getElementById('btn2').className = "btn-validar btn-espera"; document.getElementById('btn2').innerText = "Validar Caso 2";
}

document.querySelectorAll('input').forEach(i => i.oninput = resetBotones);

// DISPARADOR INICIAL (Para que no aparezca vacía)
setTimeout(() => { draw(); }, 500);
