import { Controller, Get, Param, Res, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { ReportPdfService } from './report-pdf.service';
import { OrdersService } from '../orders/orders.service';
import { Response } from 'express';

@Controller('report-pdf')
export class ReportPdfController {
  constructor(
    private readonly reportPdfService: ReportPdfService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('factura/:id')
  async getFactura(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    
    const order = await this.ordersService.findOne(id);

    if (!order) throw new NotFoundException('Orden no encontrada');
    
    const pdfBuffer = await this.reportPdfService.generatePdf(order);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura_${id}.pdf`,
    });
    res.end(pdfBuffer);
  }
}
