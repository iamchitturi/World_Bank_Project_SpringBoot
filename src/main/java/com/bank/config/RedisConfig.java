package com.bank.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration for distributed caching.
 * Falls back to in-memory ConcurrentMapCacheManager if Redis is unavailable,
 * so the application runs correctly even without a Redis server.
 */
@Configuration
@EnableCaching
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${app.cache.default-ttl-minutes:10}")
    private long defaultTtlMinutes;

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer(cacheObjectMapper()));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer(cacheObjectMapper()));
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Verify Redis is reachable
            connectionFactory.getConnection().ping();
            log.info("✅ Redis is available — using RedisCacheManager (distributed cache)");

            GenericJackson2JsonRedisSerializer serializer =
                    new GenericJackson2JsonRedisSerializer(cacheObjectMapper());

            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(defaultTtlMinutes))
                    .serializeKeysWith(RedisSerializationContext.SerializationPair
                            .fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair
                            .fromSerializer(serializer))
                    .disableCachingNullValues();

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withCacheConfiguration("accounts",
                            defaultConfig.entryTtl(Duration.ofMinutes(5)))
                    .withCacheConfiguration("userAccounts",
                            defaultConfig.entryTtl(Duration.ofMinutes(5)))
                    .withCacheConfiguration("reports",
                            defaultConfig.entryTtl(Duration.ofMinutes(2)))
                    .build();

        } catch (Exception e) {
            log.warn("⚠️  Redis is NOT available — falling back to in-memory cache. "
                    + "Start Redis for distributed caching. Error: {}", e.getMessage());
            return new ConcurrentMapCacheManager("accounts", "userAccounts", "reports");
        }
    }

    /**
     * Dedicated ObjectMapper for Redis serialization.
     */
    private ObjectMapper cacheObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }
}
