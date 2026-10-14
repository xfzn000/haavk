package com.haavk.handler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 逗号分隔字符串 ⇄ List&lt;String&gt; 的 MyBatis 类型处理器
 *
 * <p>用途：把「图片地址列表」这类多值字段存成一行 varchar，但让实体 / 接口层始终是 {@code List<String>}，
 * 前端拿到的就是数组，避免出现「后端返回字符串、前端 v-for 按单个字拆开」这种坑。
 *
 * <p>用法：实体上写 {@code @TableName(value = "xxx", autoResultMap = true)}（必须开 autoResultMap）
 * + {@code @TableField(typeHandler = CommaListTypeHandler.class)}。
 */
@MappedTypes(List.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class CommaListTypeHandler extends BaseTypeHandler<List<String>> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, String.join(",", parameter));
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return split(rs.getString(columnName));
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return split(rs.getString(columnIndex));
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return split(cs.getString(columnIndex));
    }

    /** 空值 → 空列表（接口永远返回数组，不是 null） */
    private static List<String> split(String raw) {
        List<String> list = new ArrayList<>();
        if (raw == null || raw.isBlank()) return list;
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(list::add);
        return list;
    }
}
