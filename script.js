let escala = 30, centroX;
let resX1 = null, resX2 = null;
let esValida1 = false, esValida2 = false;
let validado1 = false, validado2 = false;
let modoProActivo = false;

function f(n) {
    let num = Number(n);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

window.onload = function() {
    try {
        if (localStorage.getItem('moduloProBejarano') === 'activado') {
            setModo('pro');
        }
    } catch (e) {}
    setTimeout(draw, 500);
};

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function setModo(modo) {
    if (modo === 'basico') {
        modoProActivo = false;
        document.getElementById('btnBásico').className = "btn-mode active-free";
        document.getElementById('btnPro').className = "btn-mode";
        document.getElementById('formulaRef').innerText = "Ecuación: a |bx - h| = e";
        document.getElementById('slK').value = 0; document.getElementById('slN').value = 0; document.getElementById('slM').value = 0;
        document.getElementById('grpK').classList.add('locked');
        document.getElementById('grpN').classList.add('locked');
        document.getElementById('grpM').classList.add('locked');
    } else {
        modoProActivo = true;
        document.getElementById('btnBásico').className = "btn-mode";
        document.getElementById('btnPro').className = "btn-mode active-pro";
        document.getElementById('formulaRef').innerText = "Ecuación: a |bx - h| + k + nx = e + mx";
        document.getElementById('grpK').classList.remove('locked');
        document.getElementById('grpN').classList.remove('locked');
        document.getElementById('grpM').classList.remove('locked');
    }
    resetBotones();
    draw();
}

function intentarDesbloquearPro() {
    if(modoProActivo) return;
    document.getElementById('area-ingreso-pro').style.display = 'block';
}

function cancelarPro() { document.getElementById('area-ingreso-pro').style.display = 'none'; }

function verificarCodigoPro() {
    if (btoa(document.getElementById('input-codigo-pro').value.trim()) === "NXRvQUI=") {
        try { localStorage.setItem('moduloProBejarano', 'activado'); } catch(e) {}
        document.getElementById('area-ingreso-pro').style.display = 'none';
        setModo('pro');
    } else {
        document.getElementById('mensaje-error-pro').style.display = 'block';
    }
}

function setup() {
    let cont = document.getElementById('canvas-container');
    let c = createCanvas(cont.offsetWidth || 350, 220); 
    c.parent('canvas-container');
    actualizarMedidasCanvas();
}

function windowResized() {
    resizeCanvas(document.getElementById('canvas-container').offsetWidth, 220);
    actualizarMedidasCanvas();
}

function actualizarMedidasCanvas() {
    centroX = width / 2;
    escala = width / 32; 
}

function draw() {
    background(255);
    let a = parseFloat(document.getElementById('slA').value);
    let b = parseFloat(document.getElementById('slB').value);
    let h = parseFloat(document.getElementById('slH').value);
    let k = parseFloat(document.getElementById('slK').value);
    let n = parseFloat(document.getElementById('slN').value);
    let e = parseFloat(document.getElementById('slE').value);
    let m = parseFloat(document.getElementById('slM').value);

    document.querySelectorAll('.controls span').forEach(s => {
        let id = s.id.replace('v', 'sl');
        s.innerText = f(document.getElementById(id).value);
    });

    let bT = b === 0 ? "0" : (b === 1 ? "" : (b === -1 ? "-" : f(b)));
    let hS = h >= 0 ? "-" : "+";
    let nP = n === 0 ? "" : (n > 0 ? ` + ${f(n)}x` : ` - ${f(Math.abs(n))}x`);
    let mP = m === 0 ? "" : (m > 0 ? ` + ${f(m)}x` : ` - ${f(Math.abs(m))}x`);
    let eqK = (!modoProActivo || k === 0) ? "" : ` ${k >= 0 ? '+' : '-'} ${f(Math.abs(k))}`;
    
    let eqTxt = `${a === 1 ? '' : (a === -1 ? '-' : f(a))}|${bT}x ${hS} ${f(Math.abs(h))}|${eqK}${nP} = ${f(e)}${mP}`;
    document.getElementById('eqActual').innerText = eqTxt;

    if (b === 0) return;
    let hC = h / b;

    // CONDICIONES
    document.getElementById('despejeC1').innerHTML = `${f(b)}x ${hS} ${f(Math.abs(h))} ≥ 0 <br> x ${b > 0 ? '≥' : '≤'} ${f(hC)}`;
    document.getElementById('despejeC2').innerHTML = `${f(b)}x ${hS} ${f(Math.abs(h))} < 0 <br> x ${b > 0 ? '<' : '>'} ${f(hC)}`;

    // CASO 1: DISTRIBUTIVA Y DESPEJE
    let d1 = (a * b) + n - m;
    let v1 = e - k + (a * h);
    if (d1 !== 0) {
        resX1 = v1 / d1;
        esValida1 = (b > 0) ? (resX1 >= hC - 0.001) : (resX1 <= hC + 0.001);
        let t1 = `${f(a)}(${f(b)}x ${hS} ${f(Math.abs(h))})${eqK}${nP} = ${f(e)}${mP}<br>`;
        t1 += `${f(a*b)}x ${a*(-h)>=0?'+':'-'} ${f(Math.abs(a*h))}${eqK}${nP} = ${f(e)}${mP}<br>`;
        t1 += `<strong>${f(d1)}x = ${f(v1)} | x₁ = ${f(resX1)}</strong>`;
        document.getElementById('step1').innerHTML = t1;
    }

    // CASO 2: DISTRIBUTIVA Y DESPEJE
    let d2 = (a * -b) + n - m;
    let v2 = e - k - (a * h);
    if (d2 !== 0) {
        resX2 = v2 / d2;
        esValida2 = (b > 0) ? (resX2 < hC + 0.001) : (resX2 > hC - 0.001);
        let t2 = `${f(a)}[ -(${f(b)}x ${hS} ${f(Math.abs(h))}) ]${eqK}${nP} = ${f(e)}${mP}<br>`;
        t2 += `${f(a*-b)}x ${a*h>=0?'+':'-'} ${f(Math.abs(a*h))}${eqK}${nP} = ${f(e)}${mP}<br>`;
        t2 += `<strong>${f(d2)}x = ${f(v2)} | x₂ = ${f(resX2)}</strong>`;
        document.getElementById('step2').innerHTML = t2;
    }

    dibujarRecta(1, 70, hC, resX1, `Validez Caso 1`, "#3498db", "x₁", b > 0);
    dibujarRecta(2, 160, hC, resX2, `Validez Caso 2`, "#e74c3c", "x₂", b > 0);
    chequearSolucionFinal();
}

function dibujarRecta(caso, y, hC, xV, tit, col, lab, bP) {
    fill(100); noStroke(); textSize(12); text(tit, 20, y - 35);
    stroke(200); line(40, y, width-40, y);
    for(let i=-15; i<=15; i++) {
        let px = centroX + i*escala;
        line(px, y-5, px, y+5);
        if(i % 5 === 0) { noStroke(); fill(150); text(i, px-5, y+18); stroke(200); }
    }
    let pxC = centroX + hC * escala;
    strokeWeight(4); stroke(46, 204, 113, 150); 
    if ((caso === 1 && bP) || (caso === 2 && !bP)) line(pxC, y, width - 40, y); else line(pxC, y, 40, y);
    strokeWeight(1); fill(caso === 1 ? 46 : 255); stroke(46, 204, 113);
    ellipse(pxC, y, 10, 10);
    if(xV !== null) {
        let pxS = centroX + xV * escala;
        fill(col); noStroke(); ellipse(pxS, y, 12, 12);
        fill(50); text(lab, pxS-5, y-15);
    }
}

function verificar(caso) {
    let valida = (caso === 1) ? esValida1 : esValida2;
    if (caso === 1) validado1 = true; else validado2 = true;
    document.getElementById('btn' + caso).className = "btn-validar " + (valida ? "btn-exito" : "btn-error");
    document.getElementById('btn' + caso).innerText = valida ? "CORRECTO" : "FUERA";
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

function compartirWhatsApp() {
    let eq = document.getElementById('eqActual').innerText;
    let sol = document.getElementById('solucion-final-text').innerText || "---";

    // Creamos el mensaje formateado
    let texto = `*Ecuación:* ${eq}%0A*Solución:* ${sol}`;
    
    // Armamos la URL de WhatsApp
    let urlWhatsApp = "https://api.whatsapp.com/send?text=" + texto;
    
    // ESTO ES LO IMPORTANTE: Enviamos la URL a MIT App Inventor
    // para que se active el bloque "WebViewStringChange"
    if (window.AppInventor) {
        window.AppInventor.setWebViewString(urlWhatsApp);
    } else {
        // Por si lo probás desde un navegador normal
        window.open(urlWhatsApp, '_blank');
    }
}

document.querySelectorAll('input').forEach(i => i.oninput = () => { resetBotones(); draw(); });
