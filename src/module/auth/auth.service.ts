import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from '@/common/service/base.service';
import { CacheService } from '@/common/service/cache.service';
import { encryptPassword, makeSalt } from '@/utils';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { REDIS_ACCESS_TOKEN_PREFIX } from '@/constant';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: CacheService,
  ) {
    super();
  }

  /**
   * 登录
   *
   * @param {LoginDto} loginDto
   * @return {*}
   * @memberof AuthService
   */
  async login(loginDto: LoginDto) {
    const user = await this.checkLoginForm(loginDto);
    const token = await this.certificate(user);

    // 获取缓存的值
    // const cacheToken = await this.redisService.get(
    //   `${REDIS_ACCESS_TOKEN_PREFIX}-${user.id}`,
    // );
    // if (token !== JSON.parse(cacheToken)) {
    //   this.error('你已经在另一处登录，请重新登录', 401);
    // }
    const second = 60 * 60 * 24 * 7;
    await this.redisService.set(
      `${REDIS_ACCESS_TOKEN_PREFIX}${user.id}`,
      token,
      second,
    );

    return {
      token: `Bearer ${token}`,
    };
  }

  /**
   * 校验登录数据
   *
   * @param {LoginDto} loginDto
   * @return {*}
   * @memberof AuthService
   */
  async checkLoginForm(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userService.findUserByUsername(username);

    const { password: dbPassword, salt } = user ?? {};
    const curHashPassword = encryptPassword(password, salt);
    if (!user || curHashPassword !== dbPassword) {
      this.error('用户名或密码错误');
    }

    return user;
  }

  /**
   * 生成 token
   *
   * @param {User} user
   * @return {*}
   * @memberof AuthService
   */
  async certificate(user: User) {
    const payload = {
      id: user.id,
      username: user.username,
      mobile: user.mobile,
    };
    const token = this.jwtService.sign(payload);

    return token;
  }

  /**
   * 用户注册
   *
   * @param {RegisterDto} registerDto
   * @return {*}
   * @memberof AuthService
   */
  async register(registerDto: RegisterDto) {
    await this.checkRegisterForm(registerDto);

    const { username, nickname, password, mobile } = registerDto;
    // 制作密码盐
    const salt = makeSalt();
    // 加密密码
    const hashPassword = encryptPassword(password, salt);
    console.log(salt, hashPassword);

    const newUser = new User();
    newUser.username = username;
    newUser.nickname = nickname;
    newUser.mobile = mobile;
    newUser.password = hashPassword;
    newUser.salt = salt;

    const result = await this.userService.create(newUser);
    delete result.password;
    delete result.salt;
    return result;
  }

  /**
   * 校验注册数据
   *
   * @param {RegisterDto} registerDto
   * @memberof AuthService
   */
  async checkRegisterForm(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.passwordRepeat) {
      this.error('两次输入的密码不一致，请检查');
    }

    const { username } = registerDto;
    const hasUser = await this.userService.findUserByUsername(username);
    if (hasUser) {
      this.error('用户名已存在');
    }
  }

  // 校验 token
  verifyToken(token: string): User {
    try {
      if (!token) return null;
      const tokenUser = this.jwtService.verify(token.replace('Bearer ', ''));
      // console.log(user);
      return tokenUser;
    } catch (err) {
      return null;
    }
  }
}
