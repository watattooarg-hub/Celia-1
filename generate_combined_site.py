import re

with open('index_completo.html', 'r', encoding='utf-8') as f:
    main_html = f.read()

# Extraer el bloque del sistema de reservas interactivo de reservas.html
with open('public/reservas.html', 'r', encoding='utf-8') as f:
    res_html = f.read()

# Extraer el CSS específico de reservas (la sección entre /* --- CARDS & FORM DESIGN --- */ y /* --- RESPONSIVE --- */)
css_match = re.search(r'/\* --- TABS BAR.*?(?=/\* --- FOOTER)', res_html, re.DOTALL)
booking_css = css_match.group(0) if css_match else ""

# Extraer el HTML del sistema de reservas (Hero, tabs, panels de turnos)
booking_content_match = re.search(r'<!-- PESTAÑAS \(NUEVO TURNO / MIS TURNOS\) -->.*?(?=<!-- ========================================== -->\s*<!-- SECCIÓN: HORARIOS Y CÓMO LLEGAR AL ATELIER -->)', res_html, re.DOTALL)
booking_content = booking_content_match.group(0) if booking_content_match else ""

# Extraer el script de reservas
script_match = re.search(r'// DATOS MAESTROS DEL SALON.*?(?=</script>)', res_html, re.DOTALL)
booking_script = script_match.group(0) if script_match else ""

# 1. Inyectar el CSS de reservas en main_html antes de </style>
combined = main_html.replace('</style>', booking_css + '\n    </style>')

# 2. Agregar la sección interactiva de turnos justo encima de la sección de ubicación
booking_section_html = f"""
    <!-- ========================================== -->
    <!-- SISTEMA DE RESERVAS Y TURNOS ONLINE        -->
    <!-- ========================================== -->
    <section id="reservar" style="padding: 90px 4% 30px; background: #070707; border-top: 1px solid rgba(212,175,55,0.15);">
        <div style="text-align: center; margin-bottom: 30px;" data-aos="fade-up">
            <p style="color: var(--gold); letter-spacing: 4px; font-size: 0.7rem; text-transform: uppercase; margin-bottom: 8px;">SISTEMA OFICIAL DE CITAS</p>
            <h2 style="font-size: clamp(2rem, 5vw, 3.5rem); color: var(--gold); font-family: 'Cormorant Garamond', serif; font-weight: 300;">RESERVAR TURNO ONLINE</h2>
            <p style="color: #999; max-width: 650px; margin: 10px auto 0; font-size: 0.9rem;">Elegí tu servicio, seleccioná fecha (de martes a sábados de 11 a 18 hs) y coordiná directamente tu cita.</p>
        </div>
        <div class="main-container" style="max-width: 1050px; margin: 0 auto;">
            {booking_content}
        </div>
    </section>
"""

combined = combined.replace('<section id="ubicacion"', booking_section_html + '\n    <section id="ubicacion"')

# 3. Inyectar el script de reservas antes de </script> al final
combined = combined.replace('</script>\n</body>', f"\n{booking_script}\n    </script>\n</body>")

# 4. En el menú de navegación, asegurar que el enlace a RESERVAR apunte a #reservar
combined = combined.replace('href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..." class="btn-wa-nav"', 'href="#reservar" class="btn-wa-nav"')
combined = combined.replace("href='/preguntas'", "href='/preguntas.html'")

# Guardar como celia_pagina_completa.html tanto en public/ como en root
with open('public/celia_pagina_completa.html', 'w', encoding='utf-8') as f:
    f.write(combined)

with open('celia_pagina_completa.html', 'w', encoding='utf-8') as f:
    f.write(combined)

print("Generated celia_pagina_completa.html successfully. Length:", len(combined))
