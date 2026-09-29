import { Fragment } from 'react';
import { fiberColorHex, fiberColorLabel, serviceText, textOnColor } from '../lib/fiberColors';
import './FiberTable.css';

export interface FiberTableRow {
  id: string;
  number: number;
  // Solo en la tabla de un ODF: puerto del ODF al que llega este hilo.
  port?: number;
  color: string;
  status: string;
  service?: string | null;
  // Solo en la hoja de conexiones: puertos del dispositivo a los que entra este hilo.
  links?: string[];
}

export interface FiberTableBuffer {
  number: number;
  color: string;
  rows: FiberTableRow[];
}

interface FiberTableProps {
  caption: string;
  buffers: FiberTableBuffer[];
  // Con nombre de ODF se agregan las columnas Puerto y ODF (nombre en vertical) de la hoja de empalme.
  deviceName?: string;
  // Suma la columna "Puerto": en qué puerto del dispositivo está cada hilo (tabla de la derecha).
  showLinks?: boolean;
  // Hilo seleccionado (la tabla es interactiva si recibe onSelectRow; el detalle lo muestra quien la usa).
  selectedId?: string | null;
  onSelectRow?: (row: FiberTableRow) => void;
}

// Tabla de hilos como la hoja de empalme: Hilo (con su color), Buffer (una celda por buffer, con su
// color) y Servicio (con el color del hilo). Con `deviceName` suma las columnas Puerto y ODF.
export default function FiberTable({ caption, buffers, deviceName, showLinks = false, selectedId = null, onSelectRow }: FiberTableProps) {
  const withPorts = deviceName !== undefined;
  const totalRows = buffers.reduce((sum, buffer) => sum + buffer.rows.length, 0);
  let firstRowDone = false;

  return (
    <div className="fiber-table-wrap">
      <table className="fiber-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {withPorts && <th scope="col">Puerto</th>}
            {withPorts && <th scope="col">ODF</th>}
            <th scope="col">Hilo</th>
            <th scope="col">Buffer</th>
            <th scope="col">Servicio</th>
            {showLinks && <th scope="col">Puerto</th>}
          </tr>
        </thead>
        <tbody>
          {buffers.map((buffer) => (
            <Fragment key={buffer.number}>
              {buffer.rows.map((row, index) => {
                const isFirstOfTable = !firstRowDone;
                firstRowDone = true;
                const selected = selectedId === row.id;
                const hiloStyle = { backgroundColor: fiberColorHex(row.color), color: textOnColor(row.color) };
                const service = serviceText(row.service, row.status);
                return (
                  <Fragment key={row.id}>
                    <tr
                      className={[selected ? 'is-selected' : '', onSelectRow ? 'is-clickable' : ''].join(' ').trim() || undefined}
                      onClick={onSelectRow ? () => onSelectRow(row) : undefined}
                    >
                      {withPorts && <td className="fiber-table-port">{row.port}</td>}
                      {withPorts && isFirstOfTable && (
                        <td className="fiber-table-device" rowSpan={totalRows}>
                          <span>{deviceName}</span>
                        </td>
                      )}
                      <td className="fiber-table-hilo" style={hiloStyle}>
                        {onSelectRow ? (
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); onSelectRow(row); }}
                            aria-pressed={selected}
                            aria-label={`Hilo ${row.number}, ${fiberColorLabel(row.color)}, ${service}. Ver detalle`}
                            style={{ color: 'inherit' }}
                          >
                            {row.number}
                          </button>
                        ) : (
                          <>
                            {row.number}
                            <span className="visually-hidden"> {fiberColorLabel(row.color)}</span>
                          </>
                        )}
                      </td>
                      {index === 0 && (
                        <td
                          className="fiber-table-buffer"
                          rowSpan={buffer.rows.length}
                          style={{ backgroundColor: fiberColorHex(buffer.color), color: textOnColor(buffer.color) }}
                        >
                          <strong>Buffer {buffer.number}</strong>
                          <span>{fiberColorLabel(buffer.color).toUpperCase()}</span>
                        </td>
                      )}
                      <td className="fiber-table-service" style={hiloStyle} title={row.status}>
                        {service}
                      </td>
                      {showLinks && (
                        <td className={`fiber-table-link${row.links?.length ? '' : ' is-empty'}`}>
                          {row.links?.length ? row.links.join(' · ') : '—'}
                        </td>
                      )}
                    </tr>
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
