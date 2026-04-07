let escala = 30, centroX, centroY;
let resX1 = null, resX2 = null;
let esValida1 = false, esValida2 = false;
let validado1 = false, validado2 = false;
let modoProActivo = false;

function f(n) {
    let num = Number(n);
    if (isNaN(num)) return "0";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

window.onload = function() {
    if (localStorage.getItem('moduloProBejarano') === 'activado') {
        modoProActivo = true;
        setModo('pro');
    } else {
        setModo('basico');
    }
    setTimeout(() => { if (typeof loop === "function") loop(); draw(); }, 500);
};

function setModo(modo) {
    modoProActivo = (modo === 'pro');
    document.getElementById('btnBásico').className = modoProActivo ? "btn-mode" : "btn-mode active-free";
    document.getElementById('btnPro').className = modoProActivo ? "btn-mode active-pro" : "btn-mode";
    document.getElementById('formulaRef').innerText = modoProActivo ? 
        "Ecuación: a |bx - h| + k + nx = e + mx" : "Ecuación: a |bx - h| = e";
    
    const idsPro = ['grpK', 'grpN', 'grpM'];
    if (!modoProActivo) {
        document.getElementById('slK').value = 0; document.getElementById('slN').value = 0; document.getElementById('slM').value = 0;
        idsPro.forEach(id => document.getElementById(id).classList.add('locked'));
    } else {
        idsPro.forEach(id => document.getElementById(id).classList.remove('locked'));
    }
    document.getElementById('area-ingreso-pro').style.display = 'none';
    resetBotones();
    if (typeof loop === "function") loop();
    draw();
}

function intentarDesbloquearPro() {
    if (modoProActivo || localStorage.getItem('moduloProBejarano') === 'activado') {
        setModo('pro');
    } else {
        document.getElementById('area-ingreso-pro').style.display = 'block';
    }
}

function verificarCodigoPro() {
    if (btoa(document.getElementById('input-codigo-pro').value.trim()) === "NXRvQUI=") {
        localStorage.setItem('moduloProBejarano', 'activado');
        setModo('pro');
    } else {
        document.getElementById('mensaje-error-pro').style.display = 'block';
    }
}

function setup() {
    let cont = document.getElementById('canvas-container');
    let w = cont.offsetWidth || 350;
    let h = cont.offsetHeight || 250;
    let c = createCanvas(w, h);
    c.parent('canvas-container');
    centroX = width / 2;
    centroY = height / 2;
    escala = width / 30;
}

function draw() {
    background(255);
    const g = (id) => parseFloat(document.getElementById(id).value);
    let a = g('slA'), b = g('slB'), h = g('slH'), k = g('slK'), n = g('slN'), e = g('slE'), m = g('slM');

    document.querySelectorAll('.controls span').forEach(s => {
        let id = s.id.replace('v', 'sl');
        s.innerText = f(document.getElementById(id).value);
    });

    let bT = b === 0 ? "0" : (b === 1 ? "" : (b === -1 ? "-" : f(b)));
    let hS = h >= 0 ? "-" : "+";
    let nP = (modoProActivo && n !== 0) ? (n > 0 ? ` + ${f(n)}x` : ` - ${f(Math.abs(n))}x`) : "";
    let mP = (modoProActivo && m !== 0) ? (m > 0 ? ` + ${f(m)}x` : ` - ${f(Math.abs(m))}x`) : "";
    let eqK = (modoProActivo && k !== 0) ? ` ${k >= 0 ? '+' : '-'} ${f(Math.abs(k))}` : "";
    document.getElementById('eqActual').innerText = `${f(a)}|${bT}x ${hS} ${f(Math.abs(h))}|${eqK}${nP} = ${f(e)}${mP}`;

    if (b === 0) return;
    let hC = h / b;
    document.getElementById('despejeC1').innerHTML = `Condición: x ${b > 0 ? '≥' : '≤'} ${f(hC)}`;
    document.getElementById('despejeC2').innerHTML = `Condición: x ${b > 0 ? '<' : '>'} ${f(hC)}`;

    // --- CASO 1 (+) ---
    let den1 = (a * b) + n - m;
    let num1 = e - k + (a * h);
    if (den1 !== 0) {
        resX1 = num1 / den1;
        esValida1 = (b > 0) ? (resX1 >= hC - 0.01) : (resX1 <= hC + 0.01);
        let html1 = `<div class="step-line">${f(a*b)}x ${a*(-h)>=0?'+':'-'} ${f(Math.abs(a*h))}... = ${f(e)}...</div>`;
        html1 += `<div class="step-line">${f(den1)}x = ${f(num1)}</div>`;
        html1 += `<span class="res-destacado">x₁ = ${f(resX1)}</span>`;
        document.getElementById('step1').innerHTML = html1;
    }

    // --- CASO 2 (-) ---
    let den2 = (-a * b) + n - m;
    let num2 = e - k - (a * h);
    if (den2 !== 0) {
        resX2 = num2 / den2;
        esValida2 = (b > 0) ? (resX2 < hC + 0.01) : (resX2 > hC - 0.01);
        let html2 = `<div class="step-line">${f(-a*b)}x ${(-a)*(-h)>=0?'+':'-'} ${f(Math.abs(-a*h))}... = ${f(e)}...</div>`;
        html2 += `<div class="step-line">${f(den2)}x = ${f(num2)}</div>`;
        html2 += `<span class="res-destacado">x₂ = ${f(resX2)}</span>`;
        document.getElementById('step2').innerHTML = html2;
    }
    dibujarGráfico(hC);
}

function dibujarGráfico(hC) {
    stroke(240);
    for (let i = -20; i <= 20; i++) {
        line(centroX + i * escala, 0, centroX + i * escala, height);
        line(0, centroY + i * escala, width, centroY + i * escala);
    }
    stroke(200); strokeWeight(2);
    line(0, centroY, width, centroY); line(centroX, 0, centroX, height);
    let pxC = centroX + hC * escala;
    noStroke(); fill(46, 204, 113, 40);
    rect(modoProActivo ? 0 : pxC, 0, width, height); 
    drawPunto(resX1, "#3498db", "x1");
    drawPunto(resX2, "#e74c3c", "x2");
}

function drawPunto(xv, col, lab) {
    if (xv === null) return;
    let px = centroX + xv * escala;
    fill(col); noStroke(); ellipse(px, centroY, 12, 12);
    fill(50); textSize(10); text(lab + "=" + f(xv), px - 10, centroY - 15);
}

function verificar(caso) {
    let valida = (caso === 1) ? esValida1 : esValida2;
    if (caso === 1) validado1 = true; else validado2 = true;
    let btn = document.getElementById('btn' + caso);
    btn.className = "btn-validar " + (valida ? "btn-exito" : "btn-error");
    btn.innerText = valida ? "CORRECTO" : "FUERA";
    chequearSolucionFinal();
}

function chequearSolucionFinal() {
    if (validado1 && validado2) {
        let sol = [];
        if(esValida1) sol.push(f(resX1));
        if(esValida2) sol.push(f(resX2));
        document.getElementById('solucion-final-text').innerText = sol.length ? `{ ${sol.join(" ; ")} }` : "∅";
        document.getElementById('conclusion-panel').style.display = 'block';
    }
}

function resetBotones() {
    validado1 = false; validado2 = false;
    document.getElementById('conclusion-panel').style.display = "none";
    document.getElementById('btn1').className = "btn-validar btn-espera"; document.getElementById('btn1').innerText = "Validar 1";
    document.getElementById('btn2').className = "btn-validar btn-espera"; document.getElementById('btn2').innerText = "Validar 2";
}

document.querySelectorAll('input').forEach(i => i.oninput = () => { resetBotones(); draw(); });

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'pantallaGraficos') draw();
}

function compartirWhatsApp() {
    let eq = document.getElementById('eqActual').innerText;
    let sol = document.getElementById('solucion-final-text').innerText || "No validada";
    let mensaje = `*Ecuación con Módulo*%0A*Ecuación:* ${eq}%0A*Solución:* ${sol}`;
    let url = "https://api.whatsapp.com/send?text=" + mensaje;
    if (typeof window.AppInventor !== 'undefined') window.AppInventor.setWebViewString(url);
    else window.location.href = url;
}
