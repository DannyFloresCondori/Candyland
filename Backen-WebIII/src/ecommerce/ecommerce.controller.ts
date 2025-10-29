import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { JwtAuthGuard } from 'src/auth-client/guards/jwt-auth.guard';

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) { }

  @Post()
  create(@Body() createEcommerceDto: CreateEcommerceDto) {
    return this.ecommerceService.create(createEcommerceDto);
  }

  @Get()
  findAll() {
    return this.ecommerceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecommerceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEcommerceDto: UpdateEcommerceDto) {
    return this.ecommerceService.update(id, updateEcommerceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecommerceService.remove(id);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@Req() req) {
    console.log('Usuario en JWT:', req.user);
    const clientId = req.user.id;
    return this.ecommerceService.findByClient(clientId);
  }

}
