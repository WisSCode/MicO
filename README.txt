MANTENER LAS DEPENDENCIAS CONSISTENTES

    1. Antes de enviar cualquier commit, correr este linea en un cmd dentro de la carpeta Backend 
    pip freeze > requirements.txt

    2. Al bajar la ultima versión del archivo es recomendable correr el siguiente comando para anexar cualquier dependencia que se haya añadido
    pip install -r requirements.txt