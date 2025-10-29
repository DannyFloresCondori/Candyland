import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Client } from "src/clients/entities/client.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "../interfaceClient/auth.interface";

@Injectable()
export class JwtStrategyClient extends PassportStrategy(Strategy, 'jwtClient') {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<Client> {
    const { sub: id } = payload;

    const user = await this.clientRepository.findOne({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token no válido o no existe');
    }

    return user; // 🔥 Esto se guarda en req.user
  }
}
