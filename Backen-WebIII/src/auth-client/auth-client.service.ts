import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { Repository } from 'typeorm';
import { LoginClientDto } from './dto/loginClient.dto';
import * as bcrypt from 'bcrypt';
import { ClientProfile, JwtPayload, LoginResponse } from './interfaceClient/auth.interface';

@Injectable()
export class AuthClientService {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async loginClient(loginClientDto: LoginClientDto): Promise<LoginResponse> {
        const { email, password } = loginClientDto;

        const client = await this.findClientForAuthentication(email);
        if (!client) {
            throw new UnauthorizedException('Credenciales invalidos');
        }

        const isPasswordValid = await bcrypt.compare(password, client.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales invalidos');
        }
        return this.generateAuthResponse(client);

    }

    private generateAuthResponse(client: Client): LoginResponse {
        const payload: JwtPayload = {
            sub: client.id,
            email: client.email,
        }

        const accessToken = this.jwtService.sign(payload);
        const expiresIn = this.getTokenExpirationInSeconds();


        const clientProfile: ClientProfile = {
            id: client.id,
            email: client.email,
            firstName: client.firstName,
            role: client.role ?? 'client',
            lastName: client.lastName,
        }
        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: expiresIn,
            user: clientProfile,
        }
    }

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

    private async findClientForAuthentication(email: string) {
        return this.clientRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
            }
        })
    }
}
