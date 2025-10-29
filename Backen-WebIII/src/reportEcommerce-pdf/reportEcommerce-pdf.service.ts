import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Buffer } from 'buffer';
import { Ecommerce } from 'src/ecommerce/entities/ecommerce.entity';
const PdfPrinter = require('pdfmake/src/printer'); // 👈 cambio aquí

@Injectable()
export class ReportPdfService {
    async generatePdf(reportData: Ecommerce): Promise<Buffer> {
        const fonts = {
            Roboto: {
                normal: 'src/fonts/Roboto/static/Roboto-Regular.ttf',
                bold: 'src/fonts/Roboto/static/Roboto-Medium.ttf',
                italics: 'src/fonts/Roboto/static/Roboto-Italic.ttf',
                bolditalics: 'src/fonts/Roboto/static/Roboto-MediumItalic.ttf',
            },
        };

        const printer = new PdfPrinter(fonts); // 👈 ahora sí funciona

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'Reporte', style: 'header' },
                {
                    columns: [
                        [
                            { text: `Cliente: ${reportData.client.firstName}`, style: 'subheader' },
                            { text: `Fecha: ${reportData.createdAt}` },
                        ],
                        [{ text: `Total: Bs${reportData.total}`, alignment: 'right' }],
                    ],
                },
                { text: 'Detalles', style: 'subheader' },
                {
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'],
                            ...reportData.ecommerceDetail.map((d: any) => [
                                d.product.name || '',
                                d.quantity,
                                { text: d.unitPrice?.toFixed(2) ?? '0.00', alignment: 'right' },
                                { text: d.subTotal?.toFixed(2) ?? '0.00', alignment: 'right' },
                            ]),
                            [
                                { text: 'TOTAL', colSpan: 3, alignment: 'right', bold: true },
                                {}, {},
                                {
                                    text: reportData.total!.toFixed(2),
                                    bold: true,
                                    alignment: 'right',
                                },
                            ],
                        ],
                    },
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5],
                },
            },
            defaultStyle: {
                font: 'Roboto',
            },
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }
}
