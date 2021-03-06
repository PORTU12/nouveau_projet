import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { UserSubscribeDto } from 'src/Auth/UserSubscribe.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { LoginCredentialsDto } from './LoginCredentialsDto';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity)
    private authRepository: Repository<UserEntity>,
    private jwtService: JwtService){}

    async subscribe(userData: UserSubscribeDto): Promise<UserEntity> {
        const auth = this.authRepository.create({...userData})
        const salt = 10;
        auth.password = await bcrypt.hash(auth.password, salt);
        try{
            await this.authRepository.save(auth)
        } catch(error){
            throw new HttpException('not found', HttpStatus.NOT_FOUND)
        } return auth
    }
    async Login(credentials: LoginCredentialsDto){
        //RECUPERE LE LOGIN ET PASSWORD
        
        const {email} = credentials;
        //S'INSCRIRE VIA LE loginname ou LE loginpassword
        const payload =  {email: credentials.email, password: credentials.password};
        //VERIFIER S'IL Y'A UN USER AVEC LE LOGIN OU CE MDP
        const users = await this.authRepository.findOne({where: {email}})
    
        if (!users)
        throw new HttpException(`Introuvable`, HttpStatus.NOT_FOUND);
        return {
                access_token: this.jwtService.sign(payload)
        }
    }
}
