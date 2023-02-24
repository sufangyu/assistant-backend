export const config = {
  db: {
    type: 'mysql',
    host: 'localhost',
    port: 3344,
    username: 'root',
    password: '123456',
    database: 'assistant',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: true, // 不能被用于生产环境, 可能会丢失生产环境数据
    logging: true,
  },
};
