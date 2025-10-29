# App del Clima - TECNM Cancún

Este proyecto es una aplicación web desarrollada en **React con TypeScript y Vite**, 
diseñada para mostrar información meteorológica de distintas ciudades.  
La interfaz permite buscar una ubicación, visualizar su clima actual (simulado por el momento) y 
observar un pronóstico horario con íconos descriptivos.

El propósito del proyecto es servir como base para futuras integraciones con APIs de clima reales 
(como OpenWeatherMap o WeatherAPI), combinando funcionalidad, diseño y accesibilidad.


## Funcionalidades

La aplicación muestra:

- Temperatura actual.  
- Estado del clima (soleado, nublado, lluvia, etc.).  
- Hora y fecha local.  
- Búsqueda inteligente de ciudades y países.  
- Pronóstico de 24 horas con íconos visuales.  

Además, está preparada para futuras ampliaciones, como pronósticos extendidos, modo oscuro y almacenamiento de ubicaciones favoritas.



## Requisitos

Para ejecutar correctamente este proyecto en tu computadora, necesitarás tener instalado:

- **Node.js** versión 18 o superior.  
- **npm** (incluido al instalar Node).  
- Un editor de código como **Visual Studio Code**.  
- **Git** para clonar el repositorio.  

---

## Instalación

A continuación, se detallan los pasos necesarios para instalar y ejecutar la aplicación en Windows.  
(Si usas Linux o macOS, los comandos son equivalentes).

1. Abre el Explorador de Archivos y haz clic derecho sobre el lugar donde quieres clonar el proyecto y selecciona:
- **Abrir en Terminal**, o  
- **Abrir en PowerShell**, o  
- **Abrir en Símbolo del sistema (CMD)**.  
Si no aparece, mantén presionada la tecla **Shift** mientras haces clic derecho.

3. Escribe el siguiente comando para clonar el repositorio:

```bash
# Clonar el repositorio
git clone https://github.com/ANDY-TONDERSON/-app-clima--MENDEZ-CORDERO-ANWAR-BAHRAIN-.git

# Entrar a la carpeta
cd app

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
