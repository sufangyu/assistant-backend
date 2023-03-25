create table if not exists category
(
    id         int auto_increment comment '分类ID'
        primary key,
    name       varchar(50)                               not null comment '分类名称',
    created_at timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at timestamp(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at timestamp(6)                              null comment '删除时间'
);

create table if not exists push_record
(
    id         int auto_increment comment '记录ID'
        primary key,
    module     varchar(50)                               not null comment '功能模块',
    title      varchar(500)                              null comment '推送的标题',
    variable   varchar(500)                              null comment '推送变量、参数集合（JSON 字符串格式）',
    created_at timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at timestamp(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at timestamp(6)                              null comment '删除时间'
);

create table if not exists robot
(
    id         int auto_increment comment '机器人ID'
        primary key,
    name       varchar(50)                                  not null comment '机器人名称',
    type       enum ('1', '2', '3')                         not null comment '机器人类型（1: 飞书; 2: 钉钉; 3: 企微）',
    webhook    varchar(250)                                 not null comment '机器人 Webhook',
    status     enum ('0', '1') default '1'                  not null comment '状态（0: 禁用; 1: 启用;）',
    created_at timestamp(6)    default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at timestamp(6)    default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at timestamp(6)                                 null comment '删除时间'
);

create table if not exists push_record_result
(
    id             int auto_increment comment '推送结果ID'
        primary key,
    result         int                                       not null comment '推送结果 (0:失败; 1:成功)',
    push_record_id int                                       null comment '记录ID',
    robot_id       int                                       null comment '机器人ID',
    created_at     timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at     timestamp(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at     timestamp(6)                              null comment '删除时间',
    constraint FK_8c288f89091e3e7689c1503a8a8
        foreign key (push_record_id) references push_record (id),
    constraint FK_bba82064bcf5be9978ef8c1c1cb
        foreign key (robot_id) references robot (id)
);

create table if not exists share
(
    id          int auto_increment comment '主键id'
        primary key,
    url         varchar(255)                              not null comment '链接地址',
    title       varchar(255)                              null comment '链接标题',
    description varchar(255)                              null comment '链接描述',
    category_id int                                       null comment '分类ID',
    created_at  timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at  timestamp(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at  timestamp(6)                              null comment '删除时间',
    constraint FK_46837a824fe551ef6f4c562ca15
        foreign key (category_id) references category (id)
);

create table if not exists share_robot_id
(
    share_id int not null,
    robot_id int not null,
    primary key (share_id, robot_id),
    constraint FK_dd11c3e575494e46e5902950324
        foreign key (robot_id) references robot (id),
    constraint FK_f30bbb7e10a9c500bd49ac0483c
        foreign key (share_id) references share (id)
            on update cascade on delete cascade
);

create index IDX_dd11c3e575494e46e590295032
    on share_robot_id (robot_id);

create index IDX_f30bbb7e10a9c500bd49ac0483
    on share_robot_id (share_id);

create table if not exists tag
(
    id         int auto_increment comment '标签ID'
        primary key,
    name       varchar(50)                               not null comment '标签名称',
    created_at timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at timestamp(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at timestamp(6)                              null comment '删除时间'
);

create table if not exists share_tag_id
(
    share_id int not null,
    tag_id   int not null,
    primary key (share_id, tag_id),
    constraint FK_1b83de469fc56360b27590df6bc
        foreign key (share_id) references share (id)
            on update cascade on delete cascade,
    constraint FK_1e7fb3d9db06bf76a1da85ef22b
        foreign key (tag_id) references tag (id)
);

create index IDX_1b83de469fc56360b27590df6b
    on share_tag_id (share_id);

create index IDX_1e7fb3d9db06bf76a1da85ef22
    on share_tag_id (tag_id);

create table if not exists user
(
    id         int auto_increment comment 'ID'
        primary key,
    username   varchar(100)                                      not null comment '用户名',
    nickname   varchar(100)                                      null comment '昵称',
    mobile     varchar(11)                                       not null comment '手机号',
    password   varchar(250)                                      not null comment '加密后的密码',
    salt       varchar(100)                                      not null comment '加密盐',
    role       enum ('1', '2', '3') default '3'                  not null comment '用户角色（1: 超管; 2: 作者; 3: 访客;）',
    status     enum ('0', '1')      default '1'                  not null comment '状态（0: 禁用; 1: 启用;）',
    created_at timestamp(6)         default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    updated_at timestamp(6)         default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6) comment '更新时间',
    deleted_at timestamp(6)                                      null comment '删除时间'
);