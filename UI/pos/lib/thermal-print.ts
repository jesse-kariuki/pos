export type PrintMode = "browser" | "thermal";
export type PaperWidth = "58mm" | "80mm";

export interface ThermalPrinterSettings {
  mode: PrintMode;
  printerName: string;
  paperWidth: PaperWidth;
  fallbackToBrowser: boolean;
}

export interface ReceiptLineItem {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  unitLabel?: string;
}

export interface ReceiptPayload {
  storeName: string;
  tagline?: string;
  address?: string;
  createdAt: string;
  receiptNumber: string;
  paymentMethod: string;
  phone?: string;
  cashierName: string;
  items: ReceiptLineItem[];
  subtotal: number;
  amountPaid: number;
  changeAmount: number;
  total: number;
}

export const THERMAL_PRINT_SETTINGS_KEY = "pos.thermalPrinterSettings";

export const DEFAULT_THERMAL_PRINTER_SETTINGS: ThermalPrinterSettings = {
  mode: "thermal",
  printerName: "E-POS",
  paperWidth: "58mm",
  fallbackToBrowser: true,
};

function safeText(value: string, max: number) {
  const clean = (value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 2)}..`;
}

function padRight(value: string, width: number) {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

function padLeft(value: string, width: number) {
  return value.length >= width ? value : " ".repeat(width - value.length) + value;
}

function money(value: number) {
  return `Ksh ${Number(value || 0).toFixed(2)}`;
}

function line(width: number) {
  return "-".repeat(width);
}

export function loadThermalPrinterSettings(): ThermalPrinterSettings {
  if (typeof window === "undefined") return DEFAULT_THERMAL_PRINTER_SETTINGS;

  try {
    const raw = localStorage.getItem(THERMAL_PRINT_SETTINGS_KEY);
    if (!raw) return DEFAULT_THERMAL_PRINTER_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_THERMAL_PRINTER_SETTINGS,
      ...parsed,
      mode: parsed?.mode === "browser" ? "browser" : "thermal",
      paperWidth: parsed?.paperWidth === "80mm" ? "80mm" : "58mm",
      printerName:
        typeof parsed?.printerName === "string" && parsed.printerName.trim()
          ? parsed.printerName.trim()
          : DEFAULT_THERMAL_PRINTER_SETTINGS.printerName,
      fallbackToBrowser:
        typeof parsed?.fallbackToBrowser === "boolean"
          ? parsed.fallbackToBrowser
          : DEFAULT_THERMAL_PRINTER_SETTINGS.fallbackToBrowser,
    };
  } catch {
    return DEFAULT_THERMAL_PRINTER_SETTINGS;
  }
}

export function saveThermalPrinterSettings(settings: ThermalPrinterSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THERMAL_PRINT_SETTINGS_KEY, JSON.stringify(settings));
}

export function buildThermalReceiptText(
  payload: ReceiptPayload,
  paperWidth: PaperWidth,
): string {
  const width = paperWidth === "80mm" ? 48 : 32;

  const centerLine = (value: string) => {
    const text = safeText(value, width);
    const leftPad = Math.max(0, Math.floor((width - text.length) / 2));
    return `${" ".repeat(leftPad)}${text}`;
  };

  const output: string[] = [];

  output.push("\x1B\x40");
  output.push("\x1B\x61\x01");
  output.push(centerLine(payload.storeName));
  if (payload.tagline) output.push(centerLine(payload.tagline));
  if (payload.address) output.push(centerLine(payload.address));
  output.push(centerLine(payload.createdAt));
  output.push(centerLine(`Receipt #: ${payload.receiptNumber}`));

  output.push(centerLine(line(Math.min(width, 24))));
  output.push(centerLine("ITEMS"));
  output.push(centerLine(line(Math.min(width, 24))));

  payload.items.forEach((item) => {
    const qtyText = `${item.qty}${item.unitLabel || ""}`;
    output.push(centerLine(safeText(item.name, width)));
    output.push(centerLine(`${qtyText} x ${item.unitPrice.toFixed(2)} = ${item.lineTotal.toFixed(2)}`));
  });

  output.push(centerLine(line(Math.min(width, 24))));
  output.push(centerLine(`Subtotal: ${payload.subtotal.toFixed(2)}`));
  output.push(centerLine(`Amount Paid: ${payload.amountPaid.toFixed(2)}`));

  if (payload.changeAmount > 0) {
    output.push(centerLine(`Change: ${payload.changeAmount.toFixed(2)}`));
  }

  output.push(centerLine(line(Math.min(width, 24))));
  output.push(centerLine(`GRAND TOTAL: ${payload.total.toFixed(2)}`));
  output.push(centerLine(line(Math.min(width, 24))));
  output.push(centerLine(`Payment: ${payload.paymentMethod.toUpperCase()}`));
  if (payload.phone) output.push(centerLine(`Phone: ${payload.phone}`));
  output.push(centerLine(`Items: ${payload.items.length}`));
  output.push(centerLine(`Cashier: ${payload.cashierName}`));
  output.push(centerLine("Thank you for your patronage"));
  output.push("\n\n\n");
  output.push("\x1D\x56\x00");

  return output.join("\n");
}

async function getQzInstance() {
  if (typeof window === "undefined") return null;

  const existingQz = (window as any).qz;
  if (existingQz) return existingQz;

  try {
    const imported = await import("qz-tray");
    const qz = (imported as any).default || imported;
    (window as any).qz = qz;
    return qz;
  } catch {
    return null;
  }
}

export async function sendRawPrintJob(
  rawText: string,
  settings: ThermalPrinterSettings,
): Promise<void> {
  const qz = await getQzInstance();

  if (!qz) {
    throw new Error(
      "QZ Tray is not available in this browser context. Make sure QZ Tray is running and injected.",
    );
  }

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  const config = qz.configs.create(settings.printerName || undefined);
  await qz.print(config, [rawText]);
}

export function buildBrowserReceiptHtml(payload: ReceiptPayload): string {
  const itemRows = payload.items
    .map(
      (item) => `
        <tr>
          <td style="font-size: 10px; text-align: center;">${safeText(item.name, 24)}</td>
          <td style="font-size: 10px; text-align: center;">${item.qty}${item.unitLabel || ""}</td>
          <td style="font-size: 10px; text-align: center;">${item.lineTotal.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 72mm;
            padding: 4mm;
            font-size: 10px;
            color: #000;
            line-height: 1.2;
            text-align: center;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 3px 0; border-bottom: 1px solid #000; text-align: center; }
          td { padding: 2px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 14px;">${payload.storeName}</div>
        ${payload.tagline ? `<div class="center" style="font-size: 9px; font-style: italic;">${payload.tagline}</div>` : ""}
        ${payload.address ? `<div class="center" style="font-size: 8px;">${payload.address}</div>` : ""}
        <div class="center" style="font-size: 8px;">${payload.createdAt}</div>
        <div class="center" style="font-size: 8px; margin-bottom: 5px;">Receipt #: ${payload.receiptNumber}</div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr class="bold">
              <th style="width: 50%;">ITEM</th>
              <th style="width: 25%;">QTY</th>
              <th style="width: 25%;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="divider"></div>

        <div style="font-size: 10px;"><span class="bold">Subtotal:</span> ${money(payload.subtotal)}</div>

        <div style="font-size: 10px; margin-top: 3px;"><span class="bold">Amount Paid:</span> ${money(payload.amountPaid)}</div>

        ${
          payload.changeAmount > 0
            ? `<div style="font-size: 10px; margin-top: 3px; color: #d00;"><span class="bold">Change:</span> ${money(payload.changeAmount)}</div>`
            : ""
        }

        <div class="divider"></div>

        <div style="font-size: 12px;" class="bold">
          GRAND TOTAL ${money(payload.total)}
        </div>

        <div class="divider"></div>

        <div class="center" style="font-size: 9px; margin-top: 10px;">
          <div>Payment: ${payload.paymentMethod.toUpperCase()}</div>
          ${payload.phone ? `<div>Phone: ${payload.phone}</div>` : ""}
          <div style="margin-top: 5px;">THANK YOU FOR YOUR PATRONAGE</div>
          <div style="font-size: 8px; margin-top: 5px;">Items: ${payload.items.length} | Cashier: ${payload.cashierName}</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;
}
