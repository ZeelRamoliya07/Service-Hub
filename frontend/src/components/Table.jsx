import React from 'react';

const Table = ({ columns, data, keyField = 'id', onRowClick, emptyMessage = 'No records found' }) => {
  return (
    <div className="w-full overflow-x-auto border-3 border-black brutal-shadow">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-black text-white border-b-3 border-black">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r-2 border-neutral-800 last:border-r-0"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black">
          {data && data.length > 0 ? (
            data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors border-b-2 border-black last:border-b-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-[#FFFDF5]' : 'hover:bg-neutral-50'
                }`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-4 py-3 text-sm font-medium text-black border-r-2 border-neutral-200 last:border-r-0">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm font-bold text-neutral-600 uppercase tracking-wide">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
