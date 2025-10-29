import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "../interfaces/auth.interfaces";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService,
    ){
        super({
            //Extrae el token del header Athorization como Bearer token 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // No ignorar la expiracion del token validar siempre
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        })
    }
    async validate(payload: JwtPayload): Promise<User>{
        const {sub: id} = payload;

        const user = await this.userRepository.findOne({
            where: {id, isActive: true},
            select:{
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        });
        if(!user){
            throw new UnauthorizedException('token not valid = user does not exist');
        }
        return user;
    }
}