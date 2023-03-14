import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/service/base';
import { encryptPassword, makeSalt, randomPassword } from '@/utils';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUser } from './dto/query-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
  }

  async create(createUserDto: CreateUserDto) {
    const { username, nickname, mobile, role } = createUserDto;
    const hasUser = await this.findUserByUsername(username);
    if (hasUser) {
      this.error('用户名已存在');
    }

    // 随机密码
    const password = randomPassword();
    // console.log('password =>', password);
    // 制作密码盐
    const salt = makeSalt();
    // 加密密码
    const hashPassword = encryptPassword(password, salt);

    const newUser = new User();
    newUser.username = username;
    newUser.nickname = nickname;
    newUser.mobile = mobile;
    newUser.password = hashPassword;
    newUser.salt = salt;
    newUser.role = role;

    const result = await this.userRepository.save(newUser);
    console.log(result);
    result.password = password;

    return result;
  }

  /** 根据用户名查找用户 */
  findUserByUsername(username: string) {
    const user = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.salt')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    return user;
  }

  findAll() {
    return this.userRepository.find();
  }

  /**
   * 列表分页查询
   *
   * @param {QueryUser} query
   * @return {*}
   * @memberof UserService
   */
  async findListWithQuery(query: QueryUser) {
    const qb = this.userRepository.createQueryBuilder('user');

    // 名称模糊查询
    if (query.username) {
      qb.andWhere('user.username like :username', {
        username: `%${query.username}%`,
      });
    }

    // 状态
    if (query.status) {
      qb.andWhere('user.status like :status', { status: `${query.status}` });
    }

    // 角色
    if (query.role) {
      qb.andWhere('user.role like :role', { role: `${query.role}` });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('user.created_at BETWEEN :start AND :end', {
        start: query.start ?? '',
        end: query.end ?? '',
      });
    }

    // 分页. 一页最多查 100 条数据; 默认查10条
    const size = query.size ? Math.min(query.size, 100) : 10;
    const page = query.page ?? 1;
    qb.skip(size * (page - 1)).take(size);

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page,
      size,
    };
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * 获取用户详情（基于token）
   *
   * @memberof UserService
   */
  async findDetail(token: string) {
    const { username } = await this.authService.verifyToken(token);
    const user = await this.findUserByUsername(username);
    delete user.password;
    delete user.salt;

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.getUserWithError(id);

    if (updateUserDto.username && updateUserDto.username !== result.username) {
      this.error('用户名不能修改');
    }

    return this.userRepository.update(+id, updateUserDto);
  }

  /** 更新状态 */
  async updateStatus(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.getUserWithError(id);

    result.status = updateUserDto.status;
    return this.userRepository.update(+id, result);
  }

  /**
   * 重置密码
   *
   * @param {number} id
   * @return {*}
   * @memberof UserService
   */
  async resetPassword(id: number) {
    const result = await this.getUserWithError(id);
    // 随机密码
    const password = randomPassword();
    // 制作密码盐
    const salt = makeSalt();
    // 加密密码
    const hashPassword = encryptPassword(password, salt);

    result.salt = salt;
    result.password = hashPassword;
    await this.userRepository.update(+id, result);
    return {
      password,
    };
  }

  async remove(id: number) {
    const result = await this.getUserWithError(id);
    return this.userRepository.softRemove(result);
  }

  async getUserWithError(id: number) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('用户不存在');
    }

    return result;
  }
}
