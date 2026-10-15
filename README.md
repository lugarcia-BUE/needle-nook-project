# Tres.arg

# Proyecto: Teje conmigo — aplicación integral de tejido

Quiero que construyas una aplicación web funcional llamada provisionalmente **Teje conmigo**, destinada a personas que realizan tejido a crochet, dos agujas y otras técnicas textiles.

No quiero solamente un prototipo visual. Necesito una aplicación interactiva con persistencia de datos, autenticación, cálculos correctos y funcionalidades reales.

## 1. Idioma y diseño

- Toda la interfaz debe estar en español.
- Usar centímetros, milímetros, gramos, metros y minutos como unidades predeterminadas.
- Diseñar una interfaz cálida, artesanal, moderna y elegante, con tonos crema, terracota, verde salvia y colores suaves.
- Utilizar tarjetas con fotografías de proyectos, iconos intuitivos, tipografía legible y botones amplios.
- La aplicación debe adaptarse a celulares, tablets y computadoras.
- Priorizar la facilidad de uso mientras la persona está tejiendo.
- Crear una navegación principal sencilla: Inicio, Mis proyectos, Contadores, Calculadoras, Materiales, Biblioteca, Compras y Comunidad.

## 2. Usuarios y seguridad

Implementar registro, inicio y cierre de sesión y recuperación de contraseña.

Cada usuario debe tener acceso exclusivamente a sus proyectos privados, archivos, fotografías, contadores, sesiones de tiempo, materiales y listas de compras.

Configurar los permisos de acceso en la base de datos y el almacenamiento, no solamente en la interfaz.

Incluir un perfil con nombre o seudónimo, país, provincia o estado y ciudad opcionales, técnicas favoritas y nivel de experiencia.

No solicitar ubicación precisa. La ubicación geográfica debe ser voluntaria.

## 3. Panel de inicio

Mostrar:

- Proyectos activos.
- Últimos proyectos modificados.
- Vueltas registradas recientemente.
- Tiempo dedicado durante la semana.
- Proyectos terminados.
- Accesos rápidos para crear un proyecto, abrir un contador e iniciar una sesión de tejido.

Cada proyecto debe mostrar su fotografía, nombre, estado y porcentaje de avance cuando se haya definido un objetivo de progreso.

## 4. Gestión de proyectos

Permitir crear, consultar, editar, pausar, reanudar, finalizar y archivar proyectos.

Cada proyecto tendrá:

- Nombre y descripción.
- Técnica: crochet, dos agujas u otra.
- Tipo de prenda u objeto.
- Nivel de dificultad.
- Fecha de inicio y fecha estimada de finalización.
- Estado del proyecto.
- Fotografía principal.
- Patrón asociado.
- Medidas objetivo.
- Notas.
- Piezas o secciones.
- Materiales.
- Contadores.
- Registro de tiempo.

Permitir crear secciones como espalda, delantero, mangas, cuello, puños y terminaciones.

## 5. Contadores de tejido

Crear contadores independientes por proyecto y por sección.

Cada contador debe registrar:

- Vueltas o filas actuales.
- Objetivo de vueltas o filas, opcional.
- Número de puntos por fila, opcional.
- Repeticiones de motivos, opcional.
- Notas.
- Fecha y hora de la última modificación.

Incluir botones grandes para sumar una vuelta, restar una vuelta y volver al valor anterior cuando sea posible.

Permitir editar el número de vueltas manualmente, sin perder el historial de cambios.

Guardar automáticamente los datos y recuperarlos al volver a abrir la aplicación.

No permitir valores negativos.

Si existe un objetivo de vueltas, mostrar el progreso en porcentaje. Si no existe, no inventar un porcentaje de finalización.

## 6. Calculadora de medidas

Crear una calculadora con dos herramientas.

**A. Regla de tres simple**

Permitir ingresar:

- Valor de referencia.
- Medida correspondiente.
- Nueva medida deseada.

Calcular el valor proporcional y mostrar la operación paso a paso.

Ejemplo: 20 puntos corresponden a 10 cm. Para 35 cm se necesitan 70 puntos.

Fórmula: nuevo valor = valor original × nueva medida / medida de referencia.

Validar que la medida de referencia no sea cero y que los datos sean numéricos y válidos.

**B. Calculadora de muestra de tensión**

Permitir registrar puntos y filas obtenidos en una muestra de 10 × 10 cm.

Calcular:

- Puntos por centímetro.
- Filas por centímetro.
- Puntos estimados para un ancho deseado.
- Filas estimadas para un alto deseado.

Mostrar los resultados sin decimales cuando se trate de cantidades de puntos o filas, pero conservar el valor calculado original para explicar el redondeo.

Advertir que los motivos, las repeticiones, los aumentos, las disminuciones y la construcción de la prenda pueden requerir ajustes adicionales.

Permitir guardar los cálculos dentro de un proyecto.

## 7. Registro del tiempo

Implementar un cronómetro por proyecto con iniciar, pausar y finalizar.

Registrar cada sesión con fecha, hora de inicio, duración y notas opcionales.

Calcular el tiempo total de cada proyecto sumando las sesiones válidas sin duplicarlas.

Permitir agregar sesiones manuales y consultar estadísticas semanales y mensuales.

Si se calcula una estimación de tiempo restante, basarla en las sesiones y el progreso registrados, indicando que es aproximada.

## 8. Materiales

Crear un inventario de hilados, agujas y accesorios.

Para los hilados, registrar marca, nombre, composición, grosor, color, código de color, peso del ovillo, metros por ovillo, cantidad disponible y notas.

Para las agujas, registrar tipo, diámetro en milímetros y largo, cuando corresponda.

Permitir asociar materiales a proyectos y registrar:

- Cantidad estimada necesaria.
- Cantidad disponible.
- Cantidad comprada.
- Cantidad realmente utilizada.

Cuando existan datos suficientes, calcular cuántos ovillos se necesitan y cuántos faltan comprar. No inventar consumos si faltan datos.

## 9. Biblioteca de patrones

Crear una biblioteca vinculada a los proyectos.

Permitir adjuntar patrones en PDF, fotografías, imágenes, esquemas y documentos, además de guardar enlaces externos.

Organizar los elementos por nombre, técnica, dificultad, tipo de prenda y etiquetas.

Los archivos privados no deben quedar accesibles públicamente mediante enlaces sin protección.

## 10. Calidad y funcionamiento

Construir primero estos módulos y probarlos antes de agregar funciones avanzadas.

Crear una base de datos persistente con relaciones correctas entre usuarios, proyectos, secciones, contadores, sesiones, materiales y archivos.

Implementar validaciones, estados de carga, mensajes de error y confirmaciones para acciones destructivas.

No usar datos ficticios como si fueran datos reales.

No crear botones que parezcan funcionales pero no realicen ninguna acción.

Antes de finalizar, verificar el registro de usuarios, los permisos, el guardado y recuperación de datos, los cálculos matemáticos y la adaptación a pantallas pequeñas.

Si alguna función necesita configuración adicional, explicar qué debo hacer de manera sencilla, sin asumir que sé programar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://needle-nook-project.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee977943-1e4f-4829-b695-af99184e2a5d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
