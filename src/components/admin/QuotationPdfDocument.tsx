import { Document, Page, View, Text, Image as PdfImage, StyleSheet, Font } from "@react-pdf/renderer";
import type { QuotationWithItems } from "@/types/quotation";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf", fontWeight: "bold" },
  ],
});

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" preserveAspectRatio="xMidYMid meet">
  <path fill="#7c3aed" d="M374.714844 107.667969C374.71875 107.351562 374.6875 107.039062 374.628906 106.730469C374.566406 106.417969 374.476562 106.117188 374.359375 105.828125C374.238281 105.535156 374.089844 105.257812 373.917969 104.996094C373.742188 104.734375 373.542969 104.488281 373.320312 104.265625C373.097656 104.042969 372.855469 103.84375 372.59375 103.667969C372.332031 103.492188 372.054688 103.347656 371.761719 103.226562C371.472656 103.105469 371.171875 103.015625 370.859375 102.953125C370.550781 102.894531 370.238281 102.863281 369.921875 102.863281L272.894531 102.863281L272.894531 7.605469L272.882812 7.605469C272.886719 7.289062 272.855469 6.976562 272.796875 6.667969C272.738281 6.355469 272.648438 6.054688 272.527344 5.765625C272.410156 5.472656 272.261719 5.195312 272.089844 4.933594C271.914062 4.667969 271.714844 4.425781 271.492188 4.203125C271.269531 3.980469 271.027344 3.78125 270.765625 3.605469C270.503906 3.429688 270.226562 3.28125 269.933594 3.160156C269.640625 3.042969 269.339844 2.949219 269.03125 2.890625C268.722656 2.832031 268.410156 2.800781 268.09375 2.800781L163.183594 2.800781C162.546875 2.800781 161.9375 2.925781 161.347656 3.167969C160.761719 3.410156 160.242188 3.757812 159.792969 4.207031L106.53125 57.386719C106.070312 57.710938 105.679688 58.101562 105.355469 58.5625L3.535156 160.222656C2.847656 160.660156 2.304688 161.238281 1.914062 161.953125C1.519531 162.671875 1.324219 163.4375 1.324219 164.253906L1.324219 267.007812C1.324219 267.324219 1.355469 267.636719 1.414062 267.945312C1.476562 268.253906 1.566406 268.554688 1.6875 268.847656C1.808594 269.136719 1.957031 269.414062 2.132812 269.675781C2.308594 269.9375 2.507812 270.179688 2.730469 270.402344C2.953125 270.628906 3.195312 270.824219 3.457031 271C3.71875 271.175781 3.996094 271.324219 4.289062 271.445312C4.578125 271.566406 4.878906 271.65625 5.1875 271.71875C5.496094 271.777344 5.808594 271.8 6.121094 271.800781L107.234375 271.800781L107.234375 368.433594C107.234375 368.746094 107.265625 369.058594 107.324219 369.367188C107.386719 369.675781 107.476562 369.976562 107.597656 370.269531C107.714844 370.5625 107.863281 370.839844 108.035156 371.101562C108.210938 371.367188 108.410156 371.609375 108.632812 371.832031C108.855469 372.054688 109.097656 372.253906 109.359375 372.429688C109.621094 372.605469 109.898438 372.753906 110.191406 372.875C110.484375 372.996094 110.785156 373.089844 111.09375 373.148438C111.402344 373.207031 111.714844 373.238281 112.03125 373.238281L217.121094 373.238281C217.757812 373.238281 218.367188 373.113281 218.957031 372.871094C219.542969 372.628906 220.0625 372.28125 220.511719 371.832031L273.773438 318.652344C274.234375 318.328125 274.625 317.9375 274.949219 317.476562L376.769531 215.816406C377.457031 215.378906 378 214.800781 378.390625 214.085938C378.785156 213.367188 378.980469 212.601562 378.980469 211.785156L378.980469 108.03125C378.980469 107.714844 378.949219 107.402344 378.890625 107.09375C378.828125 106.785156 378.738281 106.484375 378.617188 106.191406C378.496094 105.902344 378.347656 105.625 378.175781 105.363281C378.003906 105.097656 377.804688 104.855469 377.582031 104.632812C377.359375 104.410156 377.117188 104.210938 376.855469 104.035156C376.59375 103.859375 376.316406 103.710938 376.023438 103.589844C375.730469 103.472656 375.429688 103.378906 375.121094 103.320312C374.8125 103.261719 374.5 103.230469 374.183594 103.230469L374.183594 103.230469L374.714844 107.667969Z"/>
  <path fill="#35ff45" d="M114.078125 66.121094L207.640625 66.121094L207.640625 159.457031L114.078125 159.457031Z"/>
  <path fill="#35ff45" d="M114.078125 271.804688L207.640625 271.804688L207.640625 365.195312L114.078125 365.195312Z"/>
  <path fill="#06b6d4" d="M104.472656 159.453125L17.898438 159.453125L104.472656 73.011719Z"/>
  <path fill="#06b6d4" d="M263.292969 105.703125L217.246094 152.527344L217.246094 64.542969L263.292969 19.09375Z"/>
  <path fill="#06b6d4" d="M305.410156 271.804688L217.246094 358.542969L217.246094 271.804688Z"/>
  <path fill="#06b6d4" d="M313.710938 159.453125L223.898438 159.453125L270.105469 112.46875L358.675781 112.46875Z"/>
  <path fill="#06b6d4" d="M165.171875 12.40625L256.394531 12.40625L211.703125 56.519531L120.992188 56.519531Z"/>
  <path fill="#06b6d4" d="M320.5625 256.902344L320.5625 166.183594L365.113281 119.628906L365.113281 213.074219Z"/>
  <path fill="#ffffff" d="M114.078125 169.058594L207.640625 169.058594L207.640625 262.203125L114.078125 262.203125Z"/>
  <path fill="#35ff45" d="M217.246094 169.058594L310.792969 169.058594L310.792969 262.203125L217.246094 262.203125Z"/>
  <path fill="#35ff45" d="M10.925781 169.058594L104.472656 169.058594L104.472656 262.203125L10.925781 262.203125Z"/>
</svg>`;

const logoDataUrl = `data:image/svg+xml;base64,${
  typeof window !== "undefined"
    ? window.btoa(logoSvg)
    : Buffer.from(logoSvg).toString("base64")
}`;

const INR = (v?: number | null) =>
  `₹${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v ?? 0)}`;

const ACCENT   = "#7c3aed";
const DARK     = "#0f0f23";
const BODY     = "#374151";
const MUTED    = "#6b7280";
const BORDER   = "#e5e7eb";
const BG_LIGHT = "#f9fafb";
const BG_PAGE  = "#ffffff";

const S = StyleSheet.create({
  page: { backgroundColor: BG_PAGE, fontFamily: "Roboto", fontSize: 9, color: BODY },

  // ── header bar ──
  headerBar: {
    backgroundColor: DARK,
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 40, height: 40, marginRight: 10 },
  brandName: { fontSize: 16, fontWeight: "bold", color: "#ffffff", letterSpacing: 1 },
  brandSub: { fontSize: 8, color: "#a78bfa", marginTop: 3 },
  quoteNo: { fontSize: 22, fontWeight: "bold", color: "#ffffff", textAlign: "right" },
  quoteTitle: { fontSize: 9, color: "#a78bfa", textAlign: "right", marginTop: 3, letterSpacing: 1, textTransform: "uppercase" },
  statusPill: {
    marginTop: 6,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-end",
  },
  statusText: { fontSize: 7, fontWeight: "bold", color: "#ffffff", letterSpacing: 1 },

  // ── accent strip ──
  accentStrip: { height: 3, backgroundColor: ACCENT },

  // ── meta row ──
  metaRow: {
    flexDirection: "row",
    backgroundColor: BG_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 36,
    paddingVertical: 10,
    gap: 32,
  },
  metaCell: {},
  metaLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 9, fontWeight: "bold", color: DARK },

  // ── body ──
  body: { paddingHorizontal: 36, paddingTop: 20, paddingBottom: 60 },

  // ── parties ──
  parties: { flexDirection: "row", gap: 16, marginBottom: 20 },
  partyBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  partyLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ede9fe",
  },
  partyName: { fontSize: 11, fontWeight: "bold", color: DARK, marginBottom: 3 },
  partyLine: { fontSize: 8.5, color: BODY, marginBottom: 2 },
  partyMuted: { fontSize: 8, color: MUTED, marginBottom: 1 },

  // ── table ──
  tableSection: { marginBottom: 16 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: DARK,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 1,
  },
  thText: { fontSize: 7.5, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: BG_LIGHT },

  // column widths
  colNo:    { width: 22 },
  colSvc:   { flex: 1 },       // takes remaining space
  colQty:   { width: 30, textAlign: "right" },
  colUnit:  { width: 34, textAlign: "right" },
  colPrice: { width: 58, textAlign: "right" },
  colDisc:  { width: 32, textAlign: "right" },
  colGst:   { width: 30, textAlign: "right" },
  colAmt:   { width: 64, textAlign: "right" },

  cellNo:    { width: 22, fontSize: 8, color: MUTED },
  cellSvc:   { flex: 1 },
  cellSvcName: { fontSize: 10, fontWeight: "bold", color: DARK, marginBottom: 2 },
  cellBullet: { fontSize: 8, color: BODY, lineHeight: 1.4, marginLeft: 2 },
  cellNum:   { fontSize: 9, color: BODY },
  cellAmt:   { fontSize: 10, fontWeight: "bold", color: DARK },

  // ── totals ──
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 20 },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: BORDER },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontWeight: "bold", color: BODY },
  totalDiscount: { color: "#059669" },
  grandBox: {
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: DARK,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandLabel: { fontSize: 10, fontWeight: "bold", color: "#a78bfa" },
  grandValue: { fontSize: 16, fontWeight: "bold", color: "#ffffff" },

  // ── terms / notes ──
  bottomGrid: { flexDirection: "row", gap: 16, marginBottom: 20 },
  infoBox: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: BORDER, padding: 12 },
  infoLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ede9fe",
  },
  infoText: { fontSize: 8, color: BODY, lineHeight: 1.6 },

  // ── footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BG_LIGHT,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 36,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLogo: { width: 18, height: 18 },
  footerText: { fontSize: 7.5, color: MUTED },
  footerRight: { fontSize: 7.5, color: MUTED, textAlign: "right" },
});

function statusColor(status: string) {
  if (status === "accepted") return "#059669";
  if (status === "rejected") return "#dc2626";
  if (status === "sent")     return "#2563eb";
  if (status === "expired")  return "#d97706";
  return ACCENT;
}

export function QuotationPdfDocument({ quote }: { quote: QuotationWithItems }) {
  const items = quote.items ?? [];

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── HEADER BAR ── */}
        <View style={S.headerBar}>
          <View style={S.logoRow}>
            <PdfImage style={S.logoImg} src={logoDataUrl} />
            <View>
              <Text style={S.brandName}>THE WEB START</Text>
              <Text style={S.brandSub}>thewebstart.in  ·  info@thewebstart.in</Text>
            </View>
          </View>
          <View>
            <Text style={S.quoteNo}>{quote.quote_no}</Text>
            <Text style={S.quoteTitle}>{quote.title}</Text>
            <View style={[S.statusPill, { backgroundColor: statusColor(quote.status) }]}>
              <Text style={S.statusText}>{(quote.status ?? "").toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── ACCENT STRIP ── */}
        <View style={S.accentStrip} />

        {/* ── META ROW ── */}
        <View style={S.metaRow}>
          <View style={S.metaCell}>
            <Text style={S.metaLabel}>Issue Date</Text>
            <Text style={S.metaValue}>{(quote.created_at ?? "").split("T")[0]}</Text>
          </View>
          <View style={S.metaCell}>
            <Text style={S.metaLabel}>Valid Until</Text>
            <Text style={S.metaValue}>{quote.valid_until ?? "—"}</Text>
          </View>
          <View style={S.metaCell}>
            <Text style={S.metaLabel}>Currency</Text>
            <Text style={S.metaValue}>{quote.currency}</Text>
          </View>
          <View style={S.metaCell}>
            <Text style={S.metaLabel}>GST Rate</Text>
            <Text style={S.metaValue}>{quote.tax_percent}%</Text>
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={S.body}>

          {/* Parties */}
          <View style={S.parties}>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>From</Text>
              <Text style={S.partyName}>The Web Start</Text>
              <Text style={S.partyLine}>info@thewebstart.in</Text>
              <Text style={S.partyMuted}>www.thewebstart.in</Text>
            </View>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>Prepared For</Text>
              <Text style={S.partyName}>{quote.client_name}</Text>
              {!!quote.client_company && <Text style={S.partyLine}>{quote.client_company}</Text>}
              {!!quote.client_email   && <Text style={S.partyMuted}>{quote.client_email}</Text>}
              {!!quote.client_phone   && <Text style={S.partyMuted}>{quote.client_phone}</Text>}
              {!!quote.client_address && <Text style={S.partyMuted}>{quote.client_address}</Text>}
            </View>
          </View>

          {/* Table */}
          <View style={S.tableSection}>
            {/* Head — repeats on every page */}
            <View style={S.tableHead} fixed>
              <Text style={[S.thText, S.colNo]}>#</Text>
              <Text style={[S.thText, S.colSvc]}>Service / Description</Text>
              <Text style={[S.thText, S.colQty]}>Qty</Text>
              <Text style={[S.thText, S.colUnit]}>Unit</Text>
              <Text style={[S.thText, S.colPrice]}>Unit Price</Text>
              <Text style={[S.thText, S.colDisc]}>Disc%</Text>
              <Text style={[S.thText, S.colGst]}>GST%</Text>
              <Text style={[S.thText, S.colAmt]}>Amount</Text>
            </View>

            {/* Rows — wrap={false} keeps each row on one page */}
            {items.map((item, i) => (
              <View style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]} key={i} wrap={false}>
                <Text style={S.cellNo}>{i + 1}</Text>
                <View style={S.cellSvc}>
                  <Text style={S.cellSvcName}>{item.service}</Text>
                  {item.description
                    ? item.description.split("\n").filter(Boolean).map((line, li) => (
                        <Text key={li} style={S.cellBullet}>{"• "}{line.replace(/^\s*[-•‣]\s*/, "")}</Text>
                      ))
                    : null}
                </View>
                <Text style={[S.cellNum, S.colQty]}>{item.quantity}</Text>
                <Text style={[S.cellNum, S.colUnit]}>{item.unit}</Text>
                <Text style={[S.cellNum, S.colPrice]}>{INR(item.unit_price)}</Text>
                <Text style={[S.cellNum, S.colDisc]}>{item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}</Text>
                <Text style={[S.cellNum, S.colGst]}>{item.tax_percent > 0 ? `${item.tax_percent}%` : "—"}</Text>
                <Text style={[S.cellAmt, S.colAmt]}>{INR(item.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={S.totalsWrap} wrap={false}>
            <View style={S.totalsBox}>
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Subtotal</Text>
                <Text style={S.totalValue}>{INR(quote.subtotal)}</Text>
              </View>
              {(quote.discount_amount ?? 0) > 0 && (
                <View style={S.totalRow}>
                  <Text style={[S.totalLabel, S.totalDiscount]}>
                    Discount{quote.discount_type === "percent" ? ` (${quote.discount_value}%)` : " (fixed)"}
                  </Text>
                  <Text style={[S.totalValue, S.totalDiscount]}>- {INR(quote.discount_amount)}</Text>
                </View>
              )}
              {(quote.tax_amount ?? 0) > 0 && (
                <View style={S.totalRow}>
                  <Text style={S.totalLabel}>GST ({quote.tax_percent}%)</Text>
                  <Text style={S.totalValue}>{INR(quote.tax_amount)}</Text>
                </View>
              )}
              <View style={S.grandBox}>
                <Text style={S.grandLabel}>TOTAL</Text>
                <Text style={S.grandValue}>{INR(quote.total)}</Text>
              </View>
            </View>
          </View>

          {/* Terms / Notes */}
          {(quote.terms || quote.notes) && (
            <View style={S.bottomGrid} wrap={false}>
              {!!quote.terms && (
                <View style={S.infoBox}>
                  <Text style={S.infoLabel}>Terms &amp; Conditions</Text>
                  <Text style={S.infoText}>{quote.terms}</Text>
                </View>
              )}
              {!!quote.notes && (
                <View style={S.infoBox}>
                  <Text style={S.infoLabel}>Additional Notes</Text>
                  <Text style={S.infoText}>{quote.notes}</Text>
                </View>
              )}
            </View>
          )}

        </View>

        {/* ── FOOTER ── */}
        <View style={S.footer} fixed>
          <View style={S.footerLeft}>
            <PdfImage style={S.footerLogo} src={logoDataUrl} />
            <Text style={S.footerText}>The Web Start  ·  thewebstart.in</Text>
          </View>
          <Text style={S.footerRight}>Thank you for your business!</Text>
        </View>

      </Page>
    </Document>
  );
}
