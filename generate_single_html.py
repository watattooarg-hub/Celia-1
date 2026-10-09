import re

with open('celia_index_original.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Quitar el script de Netlify HUD al final si está presente
content = re.sub(r'<script async src="/\.netlify/scripts/hud[^>]*></script>', '', content)

# 2. Agregar el CSS para el botón flotante de WhatsApp y ocultar la barra de Netlify
extra_css = """
        /* Ocultar barra/drawer de Netlify feedback */
        netlify-drawer,
        #netlify-drawer,
        [data-netlify-drawer],
        div[data-netlify-drawer],
        iframe#netlify-drawer {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
        }

        /* Botón Flotante WhatsApp Oficial */
        .btn-wa-flotante {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background-color: #25D366;
            color: white;
            border-radius: 50px;
            text-align: center;
            font-size: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .btn-wa-flotante:hover {
            transform: scale(1.1);
            background-color: #20ba59;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
            color: white;
        }
        .btn-wa-flotante svg {
            width: 32px;
            height: 32px;
            fill: #ffffff;
        }

        /* Mapa sin filtro grisáceo */
        .map-canvas {
            filter: none !important;
        }

        /* Horarios de atención en ubicación */
        .salon-hours-box {
            margin: 20px 0;
            padding: 16px 20px;
            background: #111;
            border: 1px solid rgba(212, 175, 55, 0.25);
            border-radius: 4px;
            text-align: left;
        }
        .salon-hours-title {
            color: var(--gold);
            font-size: 0.8rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .salon-hours-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.85rem;
            color: #ccc;
            line-height: 1.7;
        }
        .salon-hours-list .closed-day {
            color: #ff6b6b;
            font-weight: 500;
        }
        .salon-hours-list .open-day {
            color: #7ce89f;
        }
"""

content = content.replace('</style>', extra_css + '\n    </style>')

# 3. Asegurar que el mapa no tenga filtro y use el link/coordenadas oficiales
old_map = '<div class="map-canvas" data-aos="fade-left">\n                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.4533157529124!2d-58.4031649!3d-34.5952136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca90e3802361%3A0xe2128711e2f4700d!2sStudio%20Celia%20Figueredo!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>\n            </div>'

# 4. En la sección de ubicación, agregar el cartel de horarios con Lunes y Domingo Cerrado (según Google Maps) y accesos a la galería
hours_html = """
                <div class="salon-hours-box">
                    <div class="salon-hours-title"><i class="far fa-clock"></i> Horario de Atención Oficial (Google Maps)</div>
                    <ul class="salon-hours-list">
                        <li><strong>Lunes:</strong> <span class="closed-day">Cerrado</span></li>
                        <li><strong>Martes a Sábado:</strong> <span class="open-day">de 11:00 a 18:00 hs</span></li>
                        <li><strong>Domingo:</strong> <span class="closed-day">Cerrado</span></li>
                    </ul>
                </div>
"""

content = content.replace('Galería Americana • Esquina Av. Pueyrredón.<br>Ciudad Autónoma de Buenos Aires.</p>', 'Galería Americana • Esquina Av. Pueyrredón.<br>Ciudad Autónoma de Buenos Aires.</p>' + hours_html)

# 5. Actualizar el footer con el crédito en amarillo sin subrayar:
old_footer_pattern = """        <div class="footer-socials">
            <a href="https://www.instagram.com/studio_celia_figueredo/"><i class="fab fa-instagram"></i></a>
            <a href="https://wa.me/5491165804616"><i class="fab fa-whatsapp"></i></a>
        </div>
        <p class="copy">© 2026 CELIA FIGUEREDO ATELIER • EXCLUSIVIDAD EN DISEÑO CAPILAR</p>
    </footer>"""

new_footer_content = """        <div class="footer-socials">
            <a href="https://www.instagram.com/studioceliabelleza/" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..." target="_blank" title="Pedir un Turno por WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </div>
        <p class="copy">© 2026 CELIA FIGUEREDO ATELIER • EXCLUSIVIDAD EN DISEÑO CAPILAR</p>
        <p style="margin-top: 14px; font-size: 0.75rem; color: #facc15; text-decoration: none;">
            <a href="https://wa.me/5491176423742?text=hola%20megustaria%20tener%20mi%20propio%20proyecto%20de.." target="_blank" rel="noopener noreferrer" style="color: #facc15; text-decoration: none;">creada por Soul Grafic Desing click para hablar de tu proyecto.</a>
        </p>
    </footer>

    <!-- BOTÓN FLOTANTE WHATSAPP CON LOGO OFICIAL Y MENSAJE SOLICITADO -->
    <a href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..." target="_blank" rel="noopener noreferrer" title="Pedir un Turno por WhatsApp" aria-label="Pedir un Turno por WhatsApp" class="btn-wa-flotante">
        <svg viewBox="0 0 24 24" fill="#ffffff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
        </svg>
    </a>"""

content = content.replace(old_footer_pattern, new_footer_content)

# 6. Actualizar los mensajes predeterminados de WhatsApp en los botones de reserva
content = content.replace('https://wa.me/5491165804616?text=Hola!%20Vengo%20de%20la%20web%20de%20Celia%20Figueredo%20y%20quiero%20reservar%20un%20turno.', 'https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20...')
content = content.replace('https://wa.me/5491165804616?text=Hola!%20Vengo%20de%20la%20web%20y%20quiero%20un%20turno.', 'https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20...')

# 7. En el script de las tarjetas de servicios, cuando hace click para reservar:
content = content.replace('`Hola! Vengo de la web de Celia Figueredo y quiero reservar un turno para ${service}.`', '`Hola me gustaria pedir un Turno para ${service}`')

# Guardar en public/index.html (renombrado como index_completo.html y index.html)
with open('public/index_completo.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('index_completo.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Generated index_completo.html successfully. Length:", len(content))
