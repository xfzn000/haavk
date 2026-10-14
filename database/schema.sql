-- ============================================================
-- HAAVK 哈夫克集团企业内部系统 —— 数据库结构
-- MySQL 8.x
-- 执行：mysql -uroot -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `haavk`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `haavk`;

-- 清理（按依赖顺序）
DROP TABLE IF EXISTS `operation_log`;
DROP TABLE IF EXISTS `forum_reply`;
DROP TABLE IF EXISTS `forum_post`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `missing_person`;
DROP TABLE IF EXISTS `employee`;
DROP TABLE IF EXISTS `admin_user`;

-- ------------------------------------------------------------
-- 后台管理员账号
-- ------------------------------------------------------------
CREATE TABLE `admin_user` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username`   VARCHAR(64)  NOT NULL COMMENT '登录名',
    `password`   VARCHAR(100) NOT NULL COMMENT 'BCrypt 密码散列',
    `nickname`   VARCHAR(64)  DEFAULT NULL COMMENT '昵称',
    `avatar`     VARCHAR(512) DEFAULT NULL COMMENT '头像地址（/uploads/xxx.png）',
    `role`       VARCHAR(32)  NOT NULL DEFAULT 'USER' COMMENT '角色：ADMIN=管理员(可进后台) / USER=普通用户(默认)，MySQL 保留字',
    `status`     TINYINT      NOT NULL DEFAULT 1 COMMENT '1 启用 / 0 禁用',
    `last_login` DATETIME     DEFAULT NULL COMMENT '最后登录时间',
    `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '后台管理员账号';

-- ------------------------------------------------------------
-- 员工
-- ------------------------------------------------------------
CREATE TABLE `employee` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`             VARCHAR(64)  NOT NULL COMMENT '姓名',
    `avatar`           VARCHAR(512) DEFAULT NULL COMMENT '头像',
    `department`       VARCHAR(64)  DEFAULT NULL COMMENT '部门',
    `role`             VARCHAR(64)  DEFAULT NULL COMMENT '角色/职称（MySQL 保留字）',
    `attention_points` INT          NOT NULL DEFAULT 0 COMMENT '注意力点数（每日重置：普通用户 10000 / 管理员 1000000）',
    `points_reset_date` DATE       DEFAULT NULL COMMENT '上次重置注意力点数的日期（不是今天则读/扣时重置为满额）',
    `status`           TINYINT      NOT NULL DEFAULT 1 COMMENT '1 在职 / 0 未注册',
    `created_at`       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '员工';

-- ------------------------------------------------------------
-- 论坛帖子
-- ------------------------------------------------------------
CREATE TABLE `forum_post` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL COMMENT '标题',
    `content`     TEXT         COMMENT '正文',
    `images`      VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '配图地址，逗号分隔（如 /uploads/20261014/a.png,/uploads/.../b.png）',
    `author_id`   BIGINT       DEFAULT NULL COMMENT '发帖人',
    `pinned`      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否置顶',
    `status`      VARCHAR(16)  NOT NULL DEFAULT 'ON_SALE' COMMENT 'DRAFT/ON_SALE/OFF_SALE',
    `likes`       INT          NOT NULL DEFAULT 0 COMMENT '点赞数',
    `reply_count` INT          NOT NULL DEFAULT 0 COMMENT '回复数',
    `deleted`     TINYINT      NOT NULL DEFAULT 0 COMMENT '软删除标记',
    `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_post_author` (`author_id`),
    KEY `idx_post_status` (`status`, `deleted`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '论坛帖子';

-- ------------------------------------------------------------
-- 论坛回复
-- ------------------------------------------------------------
CREATE TABLE `forum_reply` (
    `id`         BIGINT      NOT NULL AUTO_INCREMENT,
    `post_id`    BIGINT      NOT NULL COMMENT '帖子 ID',
    `author_id`  BIGINT      DEFAULT NULL COMMENT '回复人',
    `content`    TEXT        COMMENT '内容',
    `images`     VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '配图地址，逗号分隔',
    `status`     VARCHAR(16) NOT NULL DEFAULT 'ON_SALE',
    `deleted`    TINYINT     NOT NULL DEFAULT 0 COMMENT '软删除标记',
    `created_at` DATETIME    DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_reply_post` (`post_id`, `deleted`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '论坛回复';

-- ------------------------------------------------------------
-- 商品（解决方案）
-- ------------------------------------------------------------
CREATE TABLE `product` (
    `id`             BIGINT        NOT NULL AUTO_INCREMENT,
    `name`           VARCHAR(128)  NOT NULL COMMENT '名称',
    `image`          VARCHAR(512)  DEFAULT NULL COMMENT '图片',
    `description`    VARCHAR(512)  DEFAULT NULL COMMENT '描述',
    `details`        TEXT          COMMENT '物品详情，每行一条',
    `price`          DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '价格',
    `purchase_limit` INT           NOT NULL DEFAULT 1 COMMENT '限购上限',
    `sold_count`     INT           NOT NULL DEFAULT 0 COMMENT '已售数量',
    `status`         VARCHAR(16)   NOT NULL DEFAULT 'OFF_SALE' COMMENT 'DRAFT/ON_SALE/OFF_SALE',
    `sort`           INT           NOT NULL DEFAULT 1 COMMENT '排序',
    `deleted`        TINYINT       NOT NULL DEFAULT 0 COMMENT '软删除标记',
    `created_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_status` (`status`, `deleted`, `sort`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '商品';

-- ------------------------------------------------------------
-- 寻人启事
-- ------------------------------------------------------------
CREATE TABLE `missing_person` (
    `id`            BIGINT        NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(128)  NOT NULL COMMENT '姓名',
    `code`          VARCHAR(32)   DEFAULT NULL COMMENT '编号',
    `image`         VARCHAR(512)  DEFAULT NULL COMMENT '图片',
    `subtitle`      VARCHAR(255)  DEFAULT NULL COMMENT '副标题标签',
    `description`   VARCHAR(512)  DEFAULT NULL COMMENT '描述',
    `reward_type`   VARCHAR(64)   DEFAULT NULL COMMENT '奖励类型',
    `reward_text`   VARCHAR(255)  DEFAULT NULL COMMENT '奖励文本',
    `reward_amount` DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '奖励金额',
    `status`        VARCHAR(16)   NOT NULL DEFAULT 'OFF_SALE',
    `sort`          INT           NOT NULL DEFAULT 1,
    `submitted`     TINYINT       NOT NULL DEFAULT 0 COMMENT '线索是否已提交（前台按钮态，后台可重置）',
    `deleted`       TINYINT       NOT NULL DEFAULT 0 COMMENT '软删除标记',
    `created_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_missing_status` (`status`, `deleted`, `sort`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '寻人启事';

-- ------------------------------------------------------------
-- 操作日志
-- ------------------------------------------------------------
CREATE TABLE `operation_log` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT,
    `admin`      VARCHAR(64)  DEFAULT NULL COMMENT '管理员',
    `action`     VARCHAR(32)  DEFAULT NULL COMMENT '操作类型',
    `target`     VARCHAR(255) DEFAULT NULL COMMENT '操作目标',
    `ip`         VARCHAR(64)  DEFAULT NULL COMMENT '来源 IP',
    `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_log_time` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '操作日志';
