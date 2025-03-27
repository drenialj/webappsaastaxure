import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function DocumentList() {
  const {
    documents,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    deleteDocument
  } = useDocuments();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) return;
    
    try {
      setDeletingId(docId);
      await deleteDocument(docId, fileUrl);
    } catch (err) {
      alert('Fehler beim Löschen des Dokuments');
    } finally {
      setDeletingId(null);
    }
  };

  const getDocumentType = (filename: string): string => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('rechnung') || lowerFilename.includes('invoice')) {
      return 'Rechnung';
    } else if (lowerFilename.includes('beleg')) {
      return 'Beleg';
    } else if (lowerFilename.includes('quittung')) {
      return 'Quittung';
    } else {
      return 'Sonstiges';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToExcel = () => {
    try {
      setExporting(true);

      // Dokumente nach Typ gruppieren
      const groupedDocs = documents.reduce((acc, doc) => {
        const type = getDocumentType(doc.filename);
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(doc);
        return acc;
      }, {} as Record<string, typeof documents>);

      // Arbeitsmappe erstellen
      const workbook = XLSX.utils.book_new();

      // Übersichtsblatt erstellen
      const summaryData = Object.entries(groupedDocs).map(([type, docs]) => ({
        'Dokumententyp': type,
        'Anzahl': docs.length,
        'Ältestes Dokument': formatDate(docs.reduce((oldest, doc) => 
          doc.uploadedAt < oldest ? doc.uploadedAt : oldest, docs[0].uploadedAt)),
        'Neustes Dokument': formatDate(docs.reduce((newest, doc) => 
          doc.uploadedAt > newest ? doc.uploadedAt : newest, docs[0].uploadedAt))
      }));

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Übersicht');

      // Detailblatt erstellen
      const detailData = documents.map(doc => ({
        'Dokumententyp': getDocumentType(doc.filename),
        'Dateiname': doc.filename,
        'Hochgeladen am': formatDate(doc.uploadedAt),
        'Download-Link': doc.fileUrl,
        'Dateityp': doc.filename.split('.').pop()?.toUpperCase() || 'Unbekannt'
      }));

      // Nach Dokumententyp und Datum sortieren
      detailData.sort((a, b) => {
        if (a.Dokumententyp === b.Dokumententyp) {
          return a['Hochgeladen am'].localeCompare(b['Hochgeladen am']);
        }
        return a.Dokumententyp.localeCompare(b.Dokumententyp);
      });

      const detailSheet = XLSX.utils.json_to_sheet(detailData);

      // Spaltenbreiten anpassen
      const detailCols = [
        { wch: 15 },  // Dokumententyp
        { wch: 40 },  // Dateiname
        { wch: 20 },  // Hochgeladen am
        { wch: 100 }, // Download-Link
        { wch: 10 }   // Dateityp
      ];

      detailSheet['!cols'] = detailCols;
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Dokumente');

      // Excel-Datei generieren und herunterladen
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });

      saveAs(blob, `dokumente_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Fehler beim Excel-Export:', err);
      alert('Fehler beim Erstellen der Excel-Datei');
    } finally {
      setExporting(false);
    }
  };

  const isPreviewable = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'pdf' || ext === 'jpg' || ext === 'jpeg' || ext === 'png';
  };

  const isImage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Suchfeld */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Sortierung */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
        </select>

        {/* Datumsfilter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as 'all' | '7days' | '30days')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Alle Dokumente</option>
          <option value="7days">Letzte 7 Tage</option>
          <option value="30days">Letzte 30 Tage</option>
        </select>

        {/* Excel Export Button */}
        <button
          onClick={exportToExcel}
          disabled={exporting || loading || documents.length === 0}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Wird exportiert...' : 'Excel exportieren'}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          {searchQuery ? 'Keine Dokumente gefunden' : 'Noch keine Dokumente vorhanden'}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc.id} className="py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {doc.filename}
                </h4>
                <p className="text-sm text-gray-500">
                  Hochgeladen am {doc.uploadedAt.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Vorschau für Bilder */}
              {isImage(doc.filename) && (
                <div className="flex-shrink-0 h-16 w-16 mr-4">
                  <img
                    src={doc.fileUrl}
                    alt={doc.filename}
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                {/* Vorschau/Download Button */}
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isPreviewable(doc.filename) ? 'Vorschau' : 'Herunterladen'}
                </a>

                {/* Löschen Button */}
                <button
                  onClick={() => handleDelete(doc.id, doc.fileUrl)}
                  disabled={deletingId === doc.id}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deletingId === doc.id ? 'Wird gelöscht...' : 'Löschen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 