package com.bank.aspect;

import com.bank.entity.AuditLog;
import com.bank.repository.AuditLogRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditLogRepository auditLogRepository;

    public AuditAspect(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Around("execution(* com.bank.service.AccountService.createAccount(..)) || "
            + "execution(* com.bank.service.AccountService.deposit(..)) || "
            + "execution(* com.bank.service.AccountService.withdraw(..)) || "
            + "execution(* com.bank.service.AccountService.deleteAccount(..)) || "
            + "execution(* com.bank.service.TransactionService.transfer(..))")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String user = getCurrentUser();
        Object[] args = joinPoint.getArgs();

        Object result = joinPoint.proceed();

        String entity = methodName.contains("transfer") ? "Transaction" : "Account";
        String entityId = extractEntityId(args);
        String details = buildDetails(methodName, args);

        try {
            auditLogRepository.save(new AuditLog(
                    methodName.toUpperCase(),
                    entity,
                    entityId,
                    user,
                    details
            ));
        } catch (Exception e) {
            log.warn("Failed to save audit log: {}", e.getMessage());
        }

        return result;
    }

    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }

    private String extractEntityId(Object[] args) {
        if (args.length > 0 && args[0] instanceof String) {
            return (String) args[0];
        }
        return "N/A";
    }

    private String buildDetails(String method, Object[] args) {
        StringBuilder sb = new StringBuilder(method).append("(");
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(args[i] != null ? args[i].toString() : "null");
        }
        sb.append(")");
        return sb.toString();
    }
}
