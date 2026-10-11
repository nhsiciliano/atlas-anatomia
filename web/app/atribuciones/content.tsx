'use client';
import { REFERENCES } from '@/data/references';
import { STRUCTURES } from '@/data/anatomy-data';
import { SYSTEMS } from '@/data/systems';
import { ArrowLeft, BookOpen, Box, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AtribucionesContent() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Volver al atlas
        </Link>

        <h1 className="font-display text-3xl font-light tracking-tight mb-2">Atribuciones y fuentes</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Esta aplicación es una representación educativa simplificada. El modelo 3D y las fichas son material
          educativo simplificado; no sustituyen a un atlas clínico. A continuación se listan el origen del modelo 3D y las fuentes de
          referencia utilizadas para elaborar el contenido textual.
        </p>

        <h2 className="font-display text-lg font-light mb-3">Modelo 3D</h2>
        <div className="bg-card rounded-lg border border-border p-4 mb-8 space-y-2">
          <div className="flex items-start gap-2">
            <Box size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">BodyParts3D</h3>
              <p className="text-xs text-muted-foreground">
                BodyParts3D, © The Database Center for Life Science (DBCLS), licenciado bajo{' '}
                <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Creative Commons Reconocimiento-CompartirIgual 2.1 Japón (CC BY-SA 2.1 JP)
                </a>.
              </p>
              <p className="text-xs text-muted-foreground">
                Modificaciones: las mallas originales se agruparon por estructura, se simplificaron (reducción de polígonos),
                se reorientaron y se convirtieron a formato glTF para su visualización en el navegador. Los modelos 3D
                derivados se distribuyen bajo la misma licencia CC BY-SA 2.1 JP.
              </p>
              <p className="text-xs text-muted-foreground">
                BodyParts3D es un modelo de cuerpo masculino; las estructuras femeninas se describen en sus fichas
                sin representación 3D.
              </p>
              <a
                href="https://lifesciencedb.jp/bp3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink size={10} />
                https://lifesciencedb.jp/bp3d/
              </a>
            </div>
          </div>
        </div>

        <h2 className="font-display text-lg font-light mb-3">Fuentes del contenido</h2>
        <div className="space-y-4">
          {(REFERENCES ?? []).map((ref: any) => (
            <div key={ref?.id} className="bg-card rounded-lg border border-border p-4 space-y-1">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold">{ref?.nombre}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{ref?.shortName}</p>
                  {ref?.isbn && (
                    <p className="text-xs text-muted-foreground font-mono">ISBN {ref.isbn}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{ref?.descripcion_es}</p>
                  {ref?.url && !/^https?:\/\//.test(ref.url) && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">{ref.url}</p>
                  )}
                  {ref?.url && /^https?:\/\//.test(ref.url) && (
                    <a
                      href={ref?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink size={10} />
                      {ref?.url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-accent/30 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Nota:</strong> Este atlas contiene {STRUCTURES.length} estructuras simplificadas distribuidas en{' '}
            {SYSTEMS.length} sistemas corporales. No pretende reemplazar un atlas anatómico completo ni sustituir el criterio profesional
            de salud. El modelo 3D es una representación didáctica simplificada, no una imagen clínica.
          </p>
        </div>
      </div>
    </div>
  );
}
