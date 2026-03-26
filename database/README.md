# **MODELO BASE DE DATOS - FACEATTEND EDU**
---
# **INSTRUCCIONES PARA USAR LAS SENTENCIAS.**

## PASO 1: 

El primer paso es la ejecución de los procedimientos almacenados.
Los archivos de los procedimientos almacenados se encuentran en las siguientes ubicaciones:
- `TABLAS/creacionTablas.sql`
- `TABLAS/eliminarTablas.sql`
- `DATOS/insercionDatos.sql`

## PASO 2:

El segundo paso a seguir es el llamado a la creación de las tablas.
~~~
CALL creacionTablas();
~~~
Con esta sentencia, se habrán creado las tablas de forma correcta.

## PASO 3:

El tercer paso es la creación de los triggers/disparadores.
Que todas las sentencias se encuentran en los siguientes archivos:
- `FUNCION - TRIGGERS/triggerALL.sql`
- `TRIGGERS/validarResponsable-Jornada.sql`

En este paso también incluiríamos la creación de las vistas.
La creación de estas las encontramos en la siguiente ubicación:
- `VISTAS/creacionVistas.sql`

## PASO 4:

Cómo cuarto paso, tenemos la inserción de los datos de ejemplo, que es muy sencilla. Solo requerimos del siguiente llamado:
~~~
CALL insercionDatos();
~~~

## PASO 5:

Cómo quinto paso, tenemos el uso de las vistas para verificar la correcta inserción de los datos.
Todos los llamados de las vistas las podemos encontrar en el archivo del siguiente nombre:
- `consultas.sql`

## PASO 6:

Cómo sexto y último paso, podemos simplemente disfrutar de nuestra base de datos ya puesta en marcha o ¡eliminarla!
En el caso de querer eliminar las tablas de nuestra base de datos, solo requerimos hacer el siguiente llamado:
~~~
CALL eliminarTablas();
~~~

# ¡Y listo! Esto es todo lo que necesitamos saber sobre los archivos que se encuentran en este repositorio.