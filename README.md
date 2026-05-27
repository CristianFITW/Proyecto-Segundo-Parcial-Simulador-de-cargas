# Proyecto Segundo Parcial: Simulador de Cargas Eléctricas, Fuerza Eléctrica y Campo Eléctrico

**Asignatura:** Mecánica y Electromagnetismo
**Carrera:** Ingeniería en Sistemas Computacionales
**Grupo:** 2CM2

**Integrantes del Equipo:**

* Gutiérrez Flores Cristian
* Martínez Pastrana Alfredo Yahir
* Nuñez Carrasco Luis Ángel

**Fecha de entrega:** 02/06/2026

---

## 1. Descripción del Proyecto

El presente proyecto consiste en el desarrollo de una aplicación computacional diseñada para simular un sistema de cargas eléctricas puntuales. El propósito principal es relacionar los conceptos teóricos revisados en clase con una implementación computacional interactiva.

El simulador permite representar cargas en una o dos dimensiones (1D y 2D), calcular la fuerza eléctrica entre pares de cargas mediante la Ley de Coulomb, aplicar el principio de superposición para obtener la fuerza neta sobre una carga seleccionada, y calcular y visualizar el campo eléctrico producido por el sistema en puntos del espacio definidos por el usuario.

---

## 2. Tecnologías y Herramientas Utilizadas

El simulador fue desarrollado empleando tecnologías web estándar, omitiendo el uso de librerías externas para la lógica matemática o el renderizado, con el objetivo de mantener una arquitectura de software nativa y optimizada.

* **HTML5:** Estructuración de la interfaz gráfica y los paneles de control.
* **CSS3:** Diseño, variables de entorno y estilos visuales.
* **JavaScript (Vanilla):** Implementación de la lógica matemática, manipulación del Document Object Model (DOM) y renderizado gráfico a través de la API de `<canvas>`.

*Nota sobre el uso de Inteligencia Artificial:* En cumplimiento con los lineamientos académicos del proyecto, se declara el uso de herramientas de inteligencia artificial generativa como apoyo durante la estructuración de la arquitectura modular del código y la redacción de la documentación. El equipo analizó, validó y adaptó los algoritmos resultantes para garantizar la correcta implementación del modelo físico requerido.

---

## 3. Instrucciones de Instalación y Ejecución

### Ejecución Web (Recomendada)

La aplicación se encuentra alojada mediante la plataforma GitHub Pages, por lo que no requiere ningún proceso de instalación. Para acceder al simulador, ingrese al siguiente enlace desde cualquier navegador web moderno:

**Enlace del simulador:** [Simulador de Cargas Puntuales](https://www.google.com/search?q=https://CristianFITW.github.io/Proyecto-Segundo-Parcial-Simulador-de-cargas/)

### Ejecución Local

En caso de requerir la ejecución del código fuente en un entorno local, siga el siguiente procedimiento:

1. Clone este repositorio utilizando su terminal de comandos:
```bash
git clone https://github.com/CristianFITW/Proyecto-Segundo-Parcial-Simulador-de-cargas.git

```


2. Extraiga los archivos en caso de haber descargado el formato comprimido (`.zip`).
3. Abra el archivo `index.html` en el navegador web de su preferencia, o ejecute un servidor local estático para su visualización íntegra.

---

## 4. Flujo Lógico y Ejemplos de Uso

El programa opera bajo el siguiente flujo de trabajo, diseñado para analizar los sistemas físicos paso a paso:

1. **Selección de entorno:** El usuario define si el análisis se realizará en el eje colineal (1D) o en el plano cartesiano (2D) a través del panel de control.
2. **Ingreso de cargas:** Se define el valor (magnitud en nC), el signo y la posición espacial de cada carga, añadiéndolas al sistema mediante el formulario de entrada.
3. **Cálculo de fuerzas:** Al seleccionar una carga específica del listado, el programa calcula y muestra de forma automatizada las fuerzas individuales ejercidas sobre ella, las componentes vectoriales y el vector de la fuerza neta.
4. **Análisis de campo eléctrico:** El usuario puede fijar puntos de prueba (sondas) en el espacio para que el sistema calcule y represente gráficamente el campo eléctrico total en dichas coordenadas.

---

## 5. Fundamento Teórico y Cálculos Implementados

El motor físico de la aplicación procesa las interacciones electromagnéticas basándose en el siguiente modelo matemático:

### Ley de Coulomb

Se determina la magnitud de la fuerza eléctrica entre dos cargas puntuales utilizando la siguiente formulación:


$$F = k \frac{|q_{1}q_{2}|}{r^{2}}$$


Donde la constante de proporcionalidad en el vacío equivale a $k = 8.99 \times 10^{9} \, \text{N}\cdot\text{m}^{2}/\text{C}^{2}$.

### Principio de Superposición (Fuerza Neta)

La fuerza resultante sobre una carga de interés se obtiene descomponiendo cada vector de interacción en sus componentes ortogonales ($F_{x}$, $F_{y}$) y ejecutando la sumatoria vectorial:


$$\vec{F}_{neta} = \sum_{i} \vec{F}_{i}$$

### Campo Eléctrico

La magnitud del campo eléctrico generado por una carga puntual individual se calcula mediante:


$$E = k \frac{|q|}{r^{2}}$$


Posteriormente, el campo eléctrico total que experimenta un punto de prueba espacial se define mediante la suma de las contribuciones individuales:


$$\vec{E}_{total} = \sum_{i} \vec{E}_{i}$$

---

## 6. Evidencia de Ejecución y Visualizaciones

*La siguiente sección presenta las evidencias gráficas correspondientes a los casos de prueba solicitados para la validación del simulador.*

### Caso de Prueba en 1D

Representación del sistema interactivo sobre el eje X, demostrando las interacciones de atracción o repulsión entre las partículas.

{Inserta aquí una captura de pantalla del caso de prueba en 1D mostrando al menos 2 cargas y sus resultados numéricos}

### Caso de Prueba en 2D y Fuerza Neta

Representación en el plano cartesiano de un sistema múltiple, detallando los vectores de fuerza individual y el vector resultante sobre la carga de análisis.

{Inserta aquí una captura de pantalla del caso de prueba en 2D mostrando al menos 3 cargas en el plano}

### Medición del Campo Eléctrico

Ilustración de los vectores e intensidad del campo eléctrico evaluado a través de las sondas de prueba ubicadas en el entorno.

{Inserta aquí una captura de pantalla que demuestre la medición del campo eléctrico en al menos 3 puntos distintos definidos por el usuario}

### Demostración Audiovisual

Para corroborar el flujo lógico, la estabilidad del entorno y la correcta validación de las entradas de datos, consulte la siguiente evidencia en video:

{Inserta aquí el enlace al video de demostración o indica que el archivo de video se encuentra adjunto en este repositorio}
