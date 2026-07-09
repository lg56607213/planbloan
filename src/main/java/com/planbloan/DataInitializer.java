package com.planbloan;

import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.Role;
import com.planbloan.domain.User;
import com.planbloan.repository.LoanCompanyRepository;
import com.planbloan.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LoanCompanyRepository loanCompanyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(LoanCompanyRepository loanCompanyRepository,
                            UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.loanCompanyRepository = loanCompanyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (loanCompanyRepository.count() > 0) {
            return;
        }

        LoanCompany demoCompany = loanCompanyRepository.save(LoanCompany.builder()
                .name("데모 대부주식회사")
                .contactEmail("partner-demo@planbloan.com")
                .phone("02-1234-5678")
                .businessRegistrationNumber("123-45-67890")
                .registrationNumber("2025-경기-0001")
                .address("경기도 성남시 분당구 판교로 123")
                .bankName("국민은행")
                .bankAccountNumber("123456-04-123456")
                .interestRateDetail("연 15.0% (고정금리)")
                .installmentRepaymentSchedule("매월 25일")
                .earlyRepaymentTerms("중도상환수수료 없음")
                .incidentalCosts("해당 없음")
                .debtCertificateFee("무료")
                .debtCertificateIssueDeadline("신청 후 7일 이내")
                .statutoryMaxAnnualRate(new java.math.BigDecimal("20.0"))
                .active(true)
                .build());

        userRepository.save(User.builder()
                .email("admin@planbloan.com")
                .passwordHash(passwordEncoder.encode("Admin1234!"))
                .name("본사 관리자")
                .phone("010-0000-0000")
                .role(Role.HQ_ADMIN)
                .termsAgreed(true)
                .build());

        userRepository.save(User.builder()
                .email("partner@planbloan.com")
                .passwordHash(passwordEncoder.encode("Partner1234!"))
                .name("제휴사 담당자")
                .phone("010-1111-1111")
                .role(Role.PARTNER_ADMIN)
                .loanCompany(demoCompany)
                .termsAgreed(true)
                .build());
    }
}
