# Licencia del contenido y de los modelos 3D

El **código** de este repositorio se publica bajo licencia MIT (ver [`LICENSE`](LICENSE)). El **contenido educativo** y los **modelos 3D** se publican bajo una licencia distinta, que se describe en este documento.

## Alcance

Esta licencia cubre:

- **El contenido educativo**: todo lo que está en `web/data/**` (fichas de estructuras en español e inglés, notas clínicas, recorridos guiados, preguntas de quiz y tarjetas de repaso).
- **Los modelos 3D derivados**: los archivos `web/public/models3d/*.glb`, generados a partir de BodyParts3D y, para el reproductor femenino, del Human Reference Atlas.

## Licencia

Estos materiales se publican bajo **Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)**:
<https://creativecommons.org/licenses/by-sa/4.0/deed.es>

Puedes copiar, redistribuir, adaptar y usar el material, incluso con fines comerciales, siempre que des crédito adecuado, indiques si hiciste cambios y distribuyas tus aportes bajo la misma licencia.

## Atribución obligatoria para los modelos 3D

Los modelos 3D son obras derivadas de BodyParts3D y del Human Reference Atlas. Quien los reutilice o redistribuya debe mantener estas atribuciones.

**Cuerpo masculino y resto de las estructuras** (`web/public/models3d/*.glb`):

> Derivados de BodyParts3D, © The Database Center for Life Science (DBCLS), licenciado bajo CC BY-SA 2.1 Japan (<https://creativecommons.org/licenses/by-sa/2.1/jp/>), <https://lifesciencedb.jp/bp3d/>.
> Modificaciones: agrupación por estructura, simplificación de mallas, reorientación y conversión a glTF/GLB.

**Útero, ovarios y trompas uterinas** (`reproductor_femenino.glb`):

> Derivados del Human Reference Atlas 3D Reference Object Library v1.2, © HuBMAP Consortium, licenciado bajo CC BY 4.0 (<https://creativecommons.org/licenses/by/4.0/>), <https://humanatlas.io>.
> Modificaciones: alineación y escalado dentro del cuerpo de BodyParts3D, unión izquierda-derecha, simplificación y conversión a GLB.

### Sobre la compatibilidad de licencias

BodyParts3D se distribuye bajo CC BY-SA 2.1 Japón. El artículo 5, inciso 2 del texto legal de esa licencia (<https://creativecommons.org/licenses/by-sa/2.1/jp/legalcode>) permite distribuir una obra derivada bajo la misma licencia o bajo otra licencia Creative Commons con los mismos elementos de licencia, y menciona expresamente las versiones más nuevas de la licencia. CC BY-SA 4.0 tiene esos mismos elementos (Atribución y CompartirIgual), y por eso los GLB derivados se publican bajo CC BY-SA 4.0. En cualquier caso, **quien reutilice los GLB debe mantener la atribución a DBCLS** indicada arriba.

Para las mallas del Human Reference Atlas, CC BY 4.0 permite redistribuir las obras derivadas bajo CC BY-SA 4.0 siempre que se mantenga la atribución al HRA indicada arriba.

Esta explicación es una lectura de buena fe de los términos de las licencias, no asesoramiento legal.

## Cómo citar el atlas

> Atlas de Anatomía Humana (nhsiciliano), <https://github.com/nhsiciliano/atlas-anatomia>, CC BY-SA 4.0.

## Fuentes del contenido textual

Las fichas, notas clínicas, recorridos, preguntas y tarjetas **son redacción propia**. Se apoyan en las siguientes fuentes, que se citan como referencias y **no se reproducen**:

- FIPAT, *Terminologia Anatomica*, 2.ª ed. (TA2).
- Standring S. (ed.), *Gray's Anatomy*, 42.ª ed.
- OpenStax, *Anatomy and Physiology 2e*.
- MedlinePlus (U.S. National Library of Medicine).
- StatPearls (NCBI Bookshelf).
- NCBI Bookshelf.

El detalle de cada fuente está en la página `/atribuciones` de la aplicación.

## Aviso

Este material es **educativo, no clínico**. No sustituye el criterio de un profesional de la salud y no debe usarse para diagnóstico ni tratamiento. El contenido, en particular el clínico, está **pendiente de revisión por un profesional**: ver [`docs/REVISION_PROFESIONAL.md`](docs/REVISION_PROFESIONAL.md).

## Código

Todo lo que no es contenido ni modelo 3D (el código de la aplicación en `web/` y los scripts de `bp3d/`) está bajo licencia MIT: ver [`LICENSE`](LICENSE).

---

## Summary (English)

- **Code**: MIT License (see [`LICENSE`](LICENSE)).
- **Educational content** (`web/data/**`: structure cards, clinical notes, tours, quiz questions, review cards) and **derived 3D models** (`web/public/models3d/*.glb`): **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**, <https://creativecommons.org/licenses/by-sa/4.0/>.
- **3D models are derived from BodyParts3D**, © The Database Center for Life Science (DBCLS), licensed under CC BY-SA 2.1 Japan (<https://creativecommons.org/licenses/by-sa/2.1/jp/>), <https://lifesciencedb.jp/bp3d/>. Changes: grouping by structure, mesh simplification, reorientation and conversion to glTF/GLB. Article 5, paragraph 2 of the legal code of CC BY-SA 2.1 Japan (<https://creativecommons.org/licenses/by-sa/2.1/jp/legalcode>) allows derivatives to be distributed under the same license or another Creative Commons license with the same license elements, expressly mentioning newer versions of the license, which is why the GLB files are published under CC BY-SA 4.0. Anyone reusing the GLB files must keep the attribution to DBCLS. This is a good-faith reading of the license terms, not legal advice.
- **The female uterus, ovaries and uterine tubes** (`reproductor_femenino.glb`) are derived from the Human Reference Atlas 3D Reference Object Library v1.2, © HuBMAP Consortium, CC BY 4.0 (<https://creativecommons.org/licenses/by/4.0/>), <https://humanatlas.io>. Changes: alignment and scaling within the BodyParts3D body, left-right merging, simplification and conversion to GLB. CC BY 4.0 allows redistributing derivatives under CC BY-SA 4.0 as long as the HRA attribution is kept.
- **How to cite**: Atlas de Anatomía Humana (nhsiciliano), <https://github.com/nhsiciliano/atlas-anatomia>, CC BY-SA 4.0.
- **Text content** is original writing based on cited references (FIPAT TA2, Gray's Anatomy 42e, OpenStax A&P 2e, MedlinePlus, StatPearls, NCBI Bookshelf); the sources are not reproduced.
- **Educational, not clinical.** Not a substitute for professional judgment; the content is pending professional review (see [`docs/REVISION_PROFESIONAL.md`](docs/REVISION_PROFESIONAL.md)).
