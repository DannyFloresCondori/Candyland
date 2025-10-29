import { Controller, Get, Param, Res, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { EcommerceService } from 'src/ecommerce/ecommerce.service';
import { ReportPdfService } from './reportEcommerce-pdf.service';

@Controller('ecommerce-report-pdf')
export class ReportPdfController {
  constructor(
    private readonly ecommerceService: EcommerceService,
    private readonly reportPdfService: ReportPdfService,
  ) {}

  @Get('factura/:id')
  async getFactura(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    
    const ecommerce = await this.ecommerceService.findOne(id);

    if (!ecommerce) throw new NotFoundException('Orden no encontrada');
    
    const pdfBuffer = await this.reportPdfService.generatePdf(ecommerce);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura_${id}.pdf`,
    });
    res.end(pdfBuffer);
  }
}
