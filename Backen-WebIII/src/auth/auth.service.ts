import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, LoginResponse, UserProfile } from './interfaces/auth.interfaces';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(LoginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = LoginDto;

        const user = await this.findUserForAuthentication(email);
        if (!user) {
            throw new UnauthorizedException('invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('invalid credentials')
        }
        return this.generateAuthResponse(user);
    }

    private generateAuthResponse(user: User): LoginResponse {

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        }

        const accessToken = this.jwtService.sign(payload)
        const expiresIn = this.getTokenExpirationInSeconds();

        const userProfile: UserProfile = {
            id: user.id,
            email: user.email,
            role: user.role?.name ?? 'client', // <-- incluye el nombre del rol
            firstName: user.firstName,
            lastName: user.lastName,
        };

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: expiresIn,
            user: userProfile,
        }
    }

    /** 
     * Obtiene el tiempo de expiracion del token en segundos
     * soporta formatos como '3600', '60s', '10m, '2h', '1d'.
     * por defecto, retorna 3600 segundos (1 hora) si no se especifica o si el formato es invalido.
    */
    private getTokenExpirationInSeconds(): number {
        const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h')

        if (expiresIn.endsWith('h')) {
            return parseInt(expiresIn) * 3600;
        }

        if (expiresIn.endsWith('m')) {
            return parseInt(expiresIn) * 60;
        }

        if (expiresIn.endsWith('d')) {
            return parseInt(expiresIn) * 86400;
        }
        return parseInt(expiresIn) || 3600;
    }

    /**
     * Encuentra un usuario activo con su correo Electronico.
     */
    private async findUserForAuthentication(email: string) {
        return this.userRepository.findOne({
            where: { email, isActive: true },
            select: {
                id: true,
                email: true,
                password: true,
            },
            relations: ['role'], //Asegura que el rol se cargue junto con el usuario
        })
    }
}
