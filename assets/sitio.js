(function () {
  var html = document.documentElement;

  /* Encabezado: filete al bajar */
  var cab = document.querySelector('.cabecera');
  function alBajar() { if (cab) cab.classList.toggle('con-scroll', window.scrollY > 8); }
  window.addEventListener('scroll', alBajar, { passive: true });
  alBajar();

  /* Menú en celular */
  var boton = document.querySelector('.boton-menu');
  if (boton) {
    boton.addEventListener('click', function () {
      var abierto = cab.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.querySelector('b').textContent = abierto ? 'Cerrar' : 'Menú';
      document.body.style.overflow = abierto ? 'hidden' : '';
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        cab.classList.remove('abierto');
        boton.setAttribute('aria-expanded', 'false');
        boton.querySelector('b').textContent = 'Menú';
        document.body.style.overflow = '';
      });
    });
  }

  /* Copiar el correo */
  document.querySelectorAll('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var texto = b.getAttribute('data-copiar');
      var listo = function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar correo'; }, 2000); };
      try { navigator.clipboard.writeText(texto).then(listo, function () { b.textContent = texto; }); }
      catch (e) { b.textContent = texto; }
    });
  });

  /* Formulario: arma el correo en el programa de correo de la persona (la web no tiene servidor) */
  var form = document.getElementById('form-contacto');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('mensaje-form');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      var asunto = 'Consulta web: ' + d.get('motivo');
      var cuerpo = 'Nombre: ' + d.get('nombre') + '\nCorreo: ' + d.get('correo') +
        (d.get('telefono') ? '\nTeléfono: ' + d.get('telefono') : '') + '\n\n' + d.get('mensaje');
      window.location.href = 'mailto:' + form.dataset.destino + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
      msg.textContent = 'Se abrió su programa de correo con el mensaje listo. Si no se abrió, escríbanos a ' + form.dataset.destino + '.';
    });
  }

  /* Videos sensibles: se cargan y se ven solo si la persona lo elige */
  document.querySelectorAll('.sensible').forEach(function (fig) {
    var boton = fig.querySelector('.aviso-sensible');
    var v = fig.querySelector('video');
    boton.addEventListener('click', function () {
      v.src = v.getAttribute('data-src');
      v.setAttribute('controls', '');
      fig.classList.add('visto');
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  });

  /* Solo un video a la vez */
  document.addEventListener('play', function (e) {
    document.querySelectorAll('video').forEach(function (o) { if (o !== e.target) o.pause(); });
  }, true);

  /* Año del pie */
  document.querySelectorAll('[data-anio]').forEach(function (s) { s.textContent = new Date().getFullYear(); });
})();

/* Dónde nos formamos y docentes: entrada al aparecer, pestañas y placa con video sin sonido */
(function () {
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var piezas = document.querySelectorAll('[data-entra]');
  if ('IntersectionObserver' in window && !reducir) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('entro'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    piezas.forEach(function (el) { io.observe(el); });
  } else {
    piezas.forEach(function (el) { el.classList.add('entro'); });
  }

  var placa = document.querySelector('.placa');
  if (!placa) return;
  var pestanas = document.querySelectorAll('.pestanas [data-tab]');
  var fichas = document.querySelectorAll('[data-ficha]');
  var medios = placa.querySelectorAll('[data-docente]');
  var verSonido = document.getElementById('ver-sonido');
  var visible = false;
  var activo = function () { return placa.querySelector('.activo'); };
  var reproducir = function () {
    var m = activo();
    if (m && m.tagName === 'VIDEO' && visible && !reducir) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
  };
  var elegir = function (clave) {
    pestanas.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === clave)); });
    fichas.forEach(function (f) { f.hidden = f.dataset.ficha !== clave; });
    medios.forEach(function (m) {
      var es = m.dataset.docente === clave;
      m.classList.toggle('activo', es);
      if (m.tagName === 'VIDEO' && !es) { m.pause(); m.muted = true; m.removeAttribute('controls'); }
    });
    var m = activo();
    verSonido.textContent = m && m.tagName === 'VIDEO' ? 'Ver con sonido' : 'Ver las fotos';
    reproducir();
  };
  pestanas.forEach(function (b) { b.addEventListener('click', function () { elegir(b.dataset.tab); }); });
  verSonido.addEventListener('click', function () {
    var m = activo();
    if (!m || m.tagName !== 'VIDEO') { window.location.href = 'actividades.html#videos'; return; }
    m.muted = false; m.currentTime = 0; m.setAttribute('controls', '');
    var p = m.play(); if (p && p.catch) p.catch(function () {});
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      var m = activo();
      if (visible) reproducir(); else if (m && m.tagName === 'VIDEO') m.pause();
    }, { threshold: 0.35 }).observe(placa);
  }
  document.addEventListener('visibilitychange', function () { var m = activo(); if (document.hidden && m && m.pause) m.pause(); else reproducir(); });
  elegir('fakih');
})();
