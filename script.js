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
    if (localStorage.getItem('moduloProBejarano') === 'activado') setModo('pro');
    setTimeout(() => { if (typeof loop === "function") loop(); draw(); }, 500);
};

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'pantallaGraficos') { if (typeof loop === "function") loop(); draw(); }
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
    cancelarPro(); resetBotones(); draw();
}

function intentarDesbloquearPro() {
    if(modoProActivo || localStorage.getItem('moduloProBejarano') === 'activado') setModo('pro');
    else document.getElementById('area-ingreso-pro').style.display = 'block';
}

function cancelarPro() { document.getElementById('area-ingreso-pro').style.display = 'none'; }

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
    let c = createCanvas(cont.offsetWidth || 350, 240); 
    c.parent('canvas-container');
    actualizarMedidasCanvas();
}

function windowResized() {
    resizeCanvas(document.getElementById('canvas-container').offsetWidth, 240);
    actualizarMedidasCanvas();
}

function actualizarMedidasCanvas() { centroX = width / 2; escala = width / 32; }

function draw() {
    background(255);
    const gV = (id) => parseFloat(document.getElementById(id).value);
    let a = gV('slA'), b = gV('slB'), h = gV('slH'), k = gV('slK'), n = gV('slN'), e = gV('slE'), m = gV('slM');

    document.querySelectorAll('.controls span').forEach(s => {
        let id = s.id.replace('v', 'sl');
        s.innerText = f(document.getElementById(id).value);
    });

    if (b === 0) {
        document.getElementById('eqActual').innerText = "Módulo sin variable (b=0)";
        document.getElementById('step1').innerHTML = "No hay variable para despejar.";
        document.getElementById('step2').innerHTML = "No hay variable para despejar.";
        return;
    }

    let hC = h / b;
    let bT = b === 1 ? "" : (b === -1 ? "-" : f(b));
    let hS = h >= 0 ? "-" : "+";
    let nP = (modoProActivo && n !== 0) ? (n > 0 ? ` + ${f(n)}x` : ` - ${f(Math.abs(n))}x`) : "";
    let mP = (modoProActivo && m !== 0) ? (m > 0 ? ` + ${f(m)}x` : ` - ${f(Math.abs(m))}x`) : "";
    let eqK = (modoProActivo && k !== 0) ? ` ${k >= 0 ? '+' : '-'} ${f(Math.abs(k))}` : "";
    
    document.getElementById('eqActual').innerText = `${a === 1 ? '' : (a === -1 ? '-' : f(a))}|${bT}x ${hS} ${f(Math.abs(h))}|${eqK}${nP} = ${f(e)}${mP}`;

    // CONDICIONES
    document.getElementById('despejeC1').innerHTML = `${f(b)}x ${hS} ${f(Math.abs(h))} ≥ 0  =>  x ${b > 0 ? '≥' : '≤'} ${f(hC)}`;
    document.getElementById('despejeC2').innerHTML = `${f(b)}x ${hS} ${f(Math.abs(h))} < 0  =>  x ${b > 0 ? '<' : '>'} ${f(hC)}`;

    // CASO 1
    let cX1 = (a * b) + n - m;
    let tI1 = e - k + (a * h);
    resX1 = cX1 !== 0 ? tI1 / cX1 : null;
    esValida1 = (b > 0) ? (resX1 >= hC - 0.01) : (resX1 <= hC + 0.01);

    let step1HTML = `1) ${f(a*b)}x ${a*(-h)>=0?'+':'-'} ${f(Math.abs(a*h))} ${nP} = ${f(e)} ${-eqK.replace(/ /g,'')} ${mP}<br>`;
    step1HTML += `2) (${f(a*b)} ${n>=0?'+':'-'} ${f(Math.abs(n))} ${-m>=0?'+':'-'} ${f(Math.abs(-m))})x = ${f(e)} ${-k>=0?'+':'-'} ${f(Math.abs(-k))} ${a*h>=0?'+':'-'} ${f(Math.abs(a*h))}<br>`;
    step1HTML += `3) <strong>${f(cX1)}x = ${f(tI1)} => x₁ = ${f(resX1)}</strong>`;
    document.getElementById('step1').innerHTML = step1HTML;

    // CASO 2
    let cX2 = (a * -b) + n - m;
    let tI2 = e - k - (a * h);
    resX2 = cX2 !== 0 ? tI2 / cX2 : null;
    esValida2 = (b > 0) ? (resX2 < hC + 0.01) : (resX2 > hC - 0.01);

    let step2HTML = `1) ${f(a*-b)}x ${a*h>=0?'+':'-'} ${f(Math.abs(a*h))} ${nP} = ${f(e)} ${-eqK.replace(/ /g,'')} ${mP}<br>`;
    step2HTML += `2) (${f(a*-b)} ${n>=0?'+':'-'} ${f(Math.abs(n))} ${-m>=0?'+':'-'} ${f(Math.abs(-m))})x = ${f(e)} ${-k>=0?'+':'-'} ${f(Math.abs(-k))} ${-a*h>=0?'+':'-'} ${f(Math.abs(-a*h))}<br>`;
    step2HTML += `3) <strong>${f(cX2)}x = ${f(tI2)} => x₂ = ${f(resX2)}</strong>`;
    document.getElementById('step2').innerHTML = step2HTML;

    dibujarRecta(1, 70, hC, resX1, b > 0);
    dibujarRecta(2, 170, hC, resX2, b > 0);
    chequearSolucionFinal();
}

function dibujarRecta(caso, y, hC, xV, bP) {
    stroke(230); strokeWeight(1);
    for(let i=-15; i<=15; i++) {
        let px = centroX + i*escala;
        line(px, y-40, px, y+20);
        if(i % 5 === 0) { fill(150); noStroke(); text(i, px-5, y+35); stroke(230); }
    }
    stroke(150); line(30, y, width-30, y);
    let pxC = centroX + hC * escala;
    strokeWeight(6); stroke(46, 204, 113, 80); 
    if ((caso === 1 && bP) || (caso === 2 && !bP)) line(pxC, y, width - 30, y); else line(pxC, y, 30, y);
    strokeWeight(1); fill(255); stroke(46, 204, 113); ellipse(pxC, y, 10, 10);
    if(xV !== null) {
        let pxS = centroX + xV * escala;
        fill(caso === 1 ? "#3498db" : "#e74c3c"); noStroke(); ellipse(pxS, y, 12, 12);
        fill(0); text(`x${caso}=${f(xV)}`, pxS-15, y-15);
    }
}

function verificar(caso) {
    let v = (caso === 1) ? esValida1 : esValida2;
    if (caso === 1) validado1 = true; else validado2 = true;
    document.getElementById('btn' + caso).className = "btn-validar " + (v ? "btn-exito" : "btn-error");
    document.getElementById('btn' + caso).innerText = v ? "CORRECTO" : "FUERA";
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
    let url = "https://api.whatsapp.com/send?text=" + encodeURIComponent("Mi resolución: " + eq);
    if (typeof window.AppInventor !== 'undefined') window.AppInventor.setWebViewString(url);
    else window.open(url, '_blank');
}

document.querySelectorAll('input').forEach(i => i.oninput = () => { resetBotones(); draw(); });
