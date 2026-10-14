package com.haavk;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * HAAVK 哈夫克集团企业内部系统 —— 后端启动类
 */
@SpringBootApplication
@MapperScan("com.haavk.mapper")
public class HaavkApplication {

    public static void main(String[] args) {
        SpringApplication.run(HaavkApplication.class, args);
    }
}
