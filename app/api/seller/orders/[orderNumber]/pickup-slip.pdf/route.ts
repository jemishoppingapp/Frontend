import { eq } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import { db, schema } from '@/db';
import { requireSeller } from '@/lib/seller-session';
import { DELIVERY_ZONES } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatNaira(n: number): string {
  return `NGN ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  let seller;
  try {
    const result = await requireSeller();
    seller = result.seller;
  } catch {
    return new Response('Forbidden', { status: 403 });
  }

  const { orderNumber } = await params;

  // Fetch order + buyer
  const orderRows = await db()
    .select({ order: schema.orders, user: schema.users })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
    .where(eq(schema.orders.orderNumber, orderNumber))
    .limit(1);

  const orderRow = orderRows[0];
  if (!orderRow || !orderRow.user) {
    return new Response('Order not found', { status: 404 });
  }
  const { order, user } = orderRow;

  // Filter to seller's items only
  const sellerProducts = await db()
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.sellerId, seller.id));
  const productIds = new Set(sellerProducts.map((p) => p.id));

  const items: Array<{ name: string; price: number; quantity: number }> = [];
  for (const so of order.subOrders) {
    for (const item of so.items) {
      if (productIds.has(item.productId)) {
        items.push({ name: item.name, price: item.price, quantity: item.quantity });
      }
    }
  }

  if (items.length === 0) {
    return new Response('You have no items in this order', { status: 404 });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const zoneName = DELIVERY_ZONES.find((z) => z.slug === order.deliveryZone)?.name ?? order.deliveryZone;
  const pickupCode = order.subOrders[0]?.pickupCode ?? '----';

  // Build PDF
  const doc = new PDFDocument({ size: 'A5', margin: 36 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#16a34a').text('JEMI', { align: 'left' });
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('Pickup Slip', { align: 'left' });
  doc.moveDown(0.5);

  // Divider
  doc.strokeColor('#e5e5e5').lineWidth(0.5)
    .moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).stroke();
  doc.moveDown(0.5);

  // Order ref
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('ORDER', { continued: false });
  doc.fontSize(13).font('Courier-Bold').fillColor('#111').text(order.orderNumber);
  doc.moveDown(0.5);

  // Pickup code (BIG)
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('PICKUP CODE');
  doc.fontSize(32).font('Courier-Bold').fillColor('#16a34a').text(pickupCode, { characterSpacing: 4 });
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666')
    .text('Verify buyer shows this exact code before handing over.', { width: 350 });
  doc.moveDown(0.8);

  // Buyer
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('BUYER');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text(user.name);
  doc.moveDown(0.5);

  // Pickup location
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('PICKUP LOCATION');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text(zoneName);
  if (order.deliveryDescription) {
    doc.fontSize(9).font('Helvetica').fillColor('#555').text(order.deliveryDescription);
  }
  doc.moveDown(0.8);

  // Items
  doc.fontSize(8).font('Helvetica').fillColor('#888').text('YOUR ITEMS TO HAND OVER');
  doc.moveDown(0.3);

  for (const item of items) {
    const lineY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111')
      .text(`${item.quantity} × ${item.name}`, doc.x, lineY, { width: 280 });
    doc.fontSize(10).font('Helvetica').fillColor('#555')
      .text(formatNaira(item.price * item.quantity), 280, lineY, { width: 100, align: 'right' });
    doc.moveDown(0.4);
  }

  doc.moveDown(0.3);
  doc.strokeColor('#e5e5e5').lineWidth(0.5)
    .moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).stroke();
  doc.moveDown(0.5);

  // Subtotal
  const subY = doc.y;
  doc.fontSize(10).font('Helvetica').fillColor('#555').text('Your subtotal', doc.x, subY, { width: 280 });
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#111')
    .text(formatNaira(subtotal), 280, subY, { width: 100, align: 'right' });

  doc.moveDown(2);

  // Footer instructions
  doc.fontSize(8).font('Helvetica').fillColor('#888').text(
    'INSTRUCTIONS', { underline: false }
  );
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').fillColor('#444');
  doc.text('1. Wait at the pickup location at the agreed time.');
  doc.text('2. Ask the buyer to show their pickup code on their phone.');
  doc.text('3. Verify the code matches the one shown above.');
  doc.text('4. Hand over the items.');
  doc.text('5. Open JEMI on your phone, find this order, and tap "Mark delivered".');
  doc.text('6. The buyer also taps "Confirm receipt" — funds release to your balance.');

  doc.moveDown(1);
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#999')
    .text(`Printed for ${seller.businessName}`, { align: 'center' });

  doc.end();
  const pdfBuffer = await finished;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="jemi-pickup-${order.orderNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}