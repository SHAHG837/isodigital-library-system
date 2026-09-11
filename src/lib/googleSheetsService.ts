import { Member, OfficeBearer } from '../types';

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface GoogleSpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
  spreadsheetUrl: string;
}

/**
 * List spreadsheet files from the user's Google Drive
 */
export async function listGoogleSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Google Drive files (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch spreadsheet metadata including tab names
 */
export async function getSpreadsheetDetails(
  spreadsheetId: string,
  accessToken: string
): Promise<GoogleSpreadsheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to load spreadsheet ${spreadsheetId} (${res.status})`);
  }

  return res.json();
}

/**
 * Create a new Google Spreadsheet in the user's Google Drive
 */
export async function createGoogleSpreadsheet(
  title: string,
  sheetTabs: string[],
  accessToken: string
): Promise<GoogleSpreadsheetMetadata> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const body = {
    properties: {
      title
    },
    sheets: sheetTabs.map((tabTitle) => ({
      properties: {
        title: tabTitle
      }
    }))
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Google Spreadsheet (${res.status})`);
  }

  return res.json();
}

/**
 * Write/Update values in a specific range in a Google Sheet
 */
export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: any[][],
  accessToken: string
): Promise<{ updatedRows: number; updatedColumns: number; updatedCells: number }> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const body = {
    range,
    majorDimension: 'ROWS',
    values
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to write values to sheet (${res.status})`);
  }

  return res.json();
}

/**
 * Append values to a Google Sheet
 */
export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: any[][],
  accessToken: string
): Promise<{ updates: { updatedRows: number; updatedCells: number } }> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const body = {
    range,
    majorDimension: 'ROWS',
    values
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to append values to sheet (${res.status})`);
  }

  return res.json();
}

/**
 * Read values from a range in a Google Sheet
 */
export async function readSheetValues(
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<any[][]> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to read values from range ${range} (${res.status})`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Helper to format ISO Members into table rows for Google Sheets
 */
export function formatMembersForGoogleSheets(members: Member[]): any[][] {
  const header = [
    'Member ID',
    'Full Name',
    'Mobile Number',
    'WhatsApp Number',
    'City',
    'District',
    'Division',
    'Province',
    'Country',
    'Joining Date',
    'Status',
    'Notes'
  ];

  const rows = members.map((m) => [
    m.id,
    m.fullName,
    m.mobileNumber,
    m.whatsappNumber || '',
    m.city,
    m.district,
    m.division || '',
    m.province,
    m.country,
    m.joiningDate,
    m.status,
    m.notes || ''
  ]);

  return [header, ...rows];
}

/**
 * Helper to format Office Bearers into table rows for Google Sheets
 */
export function formatOfficeBearersForGoogleSheets(bearers: OfficeBearer[]): any[][] {
  const header = [
    'Bearer ID',
    'Full Name',
    'Designation',
    'Mobile Number',
    'WhatsApp',
    'City',
    'District',
    'Division',
    'Province',
    'Country',
    'Appointment Date',
    'Status',
    'Notes'
  ];

  const rows = bearers.map((b) => [
    b.id,
    b.name,
    b.designation,
    b.mobileNumber,
    b.whatsapp || '',
    b.city,
    b.district,
    b.division || '',
    b.province,
    b.country,
    b.appointmentDate,
    b.status,
    b.notes || ''
  ]);

  return [header, ...rows];
}

/**
 * Parse rows read from a Google Sheet back into Member objects
 */
export function parseSheetRowsToMembers(rows: any[][]): Omit<Member, 'id'>[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('full'));
  const mobileIdx = headers.findIndex((h) => h.includes('mobile') || h.includes('phone'));
  const whatsappIdx = headers.findIndex((h) => h.includes('whatsapp'));
  const cityIdx = headers.findIndex((h) => h.includes('city'));
  const districtIdx = headers.findIndex((h) => h.includes('district'));
  const provIdx = headers.findIndex((h) => h.includes('province'));

  const parsed: Omit<Member, 'id'>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const fullName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : String(row[1] || row[0] || '').trim();
    const mobile = mobileIdx !== -1 ? String(row[mobileIdx] || '').trim() : String(row[2] || '').trim();
    const city = cityIdx !== -1 ? String(row[cityIdx] || '').trim() : String(row[4] || 'Karachi').trim();

    if (!fullName || !mobile) continue;

    parsed.push({
      fullName,
      mobileNumber: mobile,
      whatsappNumber: whatsappIdx !== -1 && row[whatsappIdx] ? String(row[whatsappIdx]).trim() : mobile,
      city: city || 'Karachi',
      district: districtIdx !== -1 && row[districtIdx] ? String(row[districtIdx]).trim() : city,
      division: city,
      province: provIdx !== -1 && row[provIdx] ? String(row[provIdx]).trim() : 'Sindh',
      country: 'Pakistan',
      joiningDate: new Date().toISOString().split('T')[0],
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      notes: 'Imported from Google Sheets',
      status: 'Approved'
    });
  }

  return parsed;
}
