# Dirección de diseño: Inglés, paso a paso

## Fuente de la dirección

La usuaria aprobó una demo independiente. El lenguaje visual parte del sitio existente y de las referencias: interfaz oscura, tarjetas discretas, tipografía editorial para títulos y acento lavanda. No es una réplica literal. La prioridad es que cada tarea se entienda y permanezca separada: aprender, resolver una hoja, practicar por escrito, practicar la voz propia y trabajar con un audio autorizado.

## Movimiento de diseño

Aula digital editorial con claridad de producto: una interfaz acogedora y progresiva que se siente más como un cuaderno de estudio guiado que como un tablero de métricas.

## Principios

1. Una tarea principal por pantalla: estudiar, resolver la hoja o usar una práctica; no presentar las tareas mezcladas.
2. La progresión A1–C1 se entiende con etiquetas y pasos concretos, no con jerga.
3. La hoja impresa debe tener el mismo cuidado que la lección digital: consignas claras, respuestas escribibles y clave opcional.
4. Prioridad a legibilidad, contraste y espacios de respuesta; los puntos y adornos son secundarios.
5. No hacer pasar IA externa por local ni simulaciones por una llamada real. La voz y Drive deben tener estados reales, mensajes de permiso y fallos comprensibles.
6. Respetar privacidad: no guardar audio ni resultados; pedir micrófono o procesar un archivo de Drive solo tras una acción consciente y con aviso claro.
7. Resolver ASR/traducción en el navegador mediante modelos públicos descargados a demanda. No llamar a proveedores de inferencia, no usar créditos de Manus y no pedir claves. La descarga inicial/cache de modelos se explica aparte de la privacidad del audio.

## Color y superficies

Base de grafito profundo (#111216), paneles carbón (#1A1B22), superficies elevadas (#22232B), bordes suaves (#343640), texto claro (#F4F2F8) y texto secundario gris-lavanda (#A6A4B2). El lavanda (#B7A1FF) marca CTA y selección; verde menta discreto identifica acierto. Errores usan coral suave y siempre texto explicativo, nunca solo color.

## Paradigma de layout

En escritorio: navegación lateral compacta con marca y destinos claros; contenido central con ancho máximo moderado y cabecera contextual; lecciones, hojas, práctica escrita, voz y audio de Drive aparecen como vistas independientes. En móvil: navegación adaptable y tarjetas apiladas; formularios y controles mantienen un ancho tocable. No usar un hero grande que empuje el primer contenido fuera de vista.

## Elementos de firma

- Marca «Aa» con el descriptor «English, paso a paso».
- Chips A1, A2, B1, B2 y C1 consistentes en Inicio, Lecciones y Práctica.
- Indicador de progreso breve, sin dominar la pantalla.
- Hoja de trabajo con etiqueta de nivel, unidad, número de ejercicios y control separado de clave/impresión.
- Estado de práctica escrita con ronda, puntos y tipo de ejercicio.
- Mi voz: contador visible de 160 caracteres, controles discretos de grabar/detener/escuchar y nota local.
- Tu audio: URL de Drive, confirmación de permiso, reproductor, progreso de modelo y resultado por segmento (inglés, español, reproducción de pronunciación).

## Interacción y movimiento

Los cambios de vista conservan nivel y unidad seleccionados. El feedback de autocorrección es inmediato, breve y textual. Las transiciones son sutiles y cortas; se respeta `prefers-reduced-motion`. `speechSynthesis` es opcional y local; el micrófono solo se activa después de que la persona pulse grabar. Los modelos se descargan bajo demanda, con estado de progreso, cancelación/errores comprensibles y explicación de compatibilidad.

## Tipografía

Títulos de sección con serif editorial del sistema (Georgia o equivalente) para dar un aire de cuaderno; cuerpo, navegación, formularios y controles con sans-serif del sistema para máxima legibilidad. Tamaños fluidos, longitud de línea contenida y jerarquía tipográfica evidente.

## Esencia y voz de marca

Esencia: avanzar con calma, entender antes de memorizar y practicar sin miedo al error. Voz: español cálido, directo y adulto; instrucciones cortas, apoyo sin infantilizar y pronunciación rotulada como orientación aproximada. La transcripción de una canción se llama borrador, no letra oficial.

## Marca e icono

Reutilizar la identidad tipográfica «Aa» observada en el sitio público. La demo ya tiene favicon e icono coherentes. No se necesitan imágenes decorativas para estas pantallas.
