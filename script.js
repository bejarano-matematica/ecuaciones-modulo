let escala = 30, centroX;
let resX1 = null, resX2 = null;
let esValida1 = false, esValida2 = false;
let validado1 = false, validado2 = false;
let modoProActivo = false;

// Función auxiliar para limpiar números
function f(n) {
    return Number(Number(n).toFixed(2));
}

window.onload = function() {
    try {
        if (localStorage.getItem('moduloProBejarano') === 'activado') {
            setModo('pro');
        }
    } catch (e) {}
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
    let codigo = document.getElementById('input-codigo-pro').value;
    if (btoa(codigo.trim()) === "NXRvQUI=") {
        try { localStorage.setItem('moduloProBejarano', 'activado'); } catch(e) {}
        document.getElementById('mensaje-exito-pro').style.display = 'block';
        setTimeout(() => {
            document.getElementById('area-ingreso-pro').style.display = 'none';
            setModo('pro');
        }, 1200);
    } else {
        document.getElementById('mensaje-error-pro').style.display = 'block';
    }
}

function setup() {
    let cont = document.getElementById('canvas-container');
    let c = createCanvas(cont.offsetWidth || windowWidth * 0.9, 220); 
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
    
    document.getElementById('eqActual').innerText = `${a === 1 ? '' : (a === -1 ? '-' : f(a))}|${bT}x ${hS} ${f(Math.abs(h))}|${eqK}${nP} = ${f(e)}${mP}`;

    if (b === 0) return;

    let hC = h / b;
    document.getElementById('despejeC1').innerHTML = `Condición: x ${b > 0 ? '≥' : '≤'} ${f(hC)}`;
    document.getElementById('despejeC2').innerHTML = `Condición: x ${b > 0 ? '<' : '>'} ${f(hC)}`;

    // Caso 1
    let d1 = (a * b) + n - m;
    let v1 = e - k + (a * h);
    if (d1 !== 0) {
        resX1 = v1 / d1;
        esValida1 = (b > 0) ? (resX1 >= hC - 0.001) : (resX1 <= hC + 0.001);
        document.getElementById('step1').innerHTML = `${f(d1)}x = ${f(v1)}<br><strong>x₁ = ${f(resX1)}</strong>`;
    }

    // Caso 2
    let d2 = (-a * b) + n - m;
    let v2 = e - k - (a * h);
    if (d2 !== 0) {
        resX2 = v2 / d2;
        esValida2 = (b > 0) ? (resX2 < hC + 0.001) : (resX2 > hC - 0.001);
        document.getElementById('step2').innerHTML = `${f(d2)}x = ${f(v2)}<br><strong>x₂ = ${f(resX2)}</strong>`;
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
    if(caso === 1) {
        validado1 = true;
        document.getElementById('btn1').className = "btn-validar " + (esValida1 ? "btn-exito" : "btn-error");
        document.getElementById('btn1').innerText = esValida1 ? "CORRECTO" : "FUERA DE RANGO";
    } else {
        validado2 = true;
        document.getElementById('btn2').className = "btn-validar " + (esValida2 ? "btn-exito" : "btn-error");
        document.getElementById('btn2').innerText = esValida2 ? "CORRECTO" : "FUERA DE RANGO";
    }
}

function chequearSolucionFinal() {
    if (validado1 && validado2) {
        let sol = [];
        if(esValida1) sol.push(f(resX1));
        if(esValida2) sol.push(f(resX2));
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

document.querySelectorAll('input').forEach(i => i.oninput = () => { resetBotones(); draw(); });
setTimeout(draw, 300);
