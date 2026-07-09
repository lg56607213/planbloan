package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.Gender;
import com.planbloan.domain.Guarantor;
import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.User;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Locale;

/**
 * 대부거래 표준계약서(9p 양식)에 신청 데이터와 서명 이미지를 덮어써서 최종 계약서 PDF를 생성한다.
 * 좌표는 원본 템플릿(src/main/resources/contract-templates/standard-loan-contract.pdf) 9페이지를
 * PDFBox로 텍스트 위치 추출하여 산출한 값이다 (상단 기준 y좌표, A4).
 */
@Service
public class ContractPdfService {

    private static final String TEMPLATE_PATH = "contract-templates/standard-loan-contract.pdf";
    private static final String FONT_PATH = "fonts/malgun.ttf";
    private static final int FORM_PAGE_INDEX = 8; // 0-based, page 9
    private static final float FONT_SIZE = 8f;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    public byte[] generate(LoanApplication app, ContractFieldValues values, byte[] signaturePng) {
        try (PDDocument document = Loader.loadPDF(readTemplateBytes())) {
            PDPage page = document.getPage(FORM_PAGE_INDEX);
            float pageHeight = page.getMediaBox().getHeight();
            PDFont font = PDType0Font.load(document, new ClassPathResource(FONT_PATH).getInputStream());

            try (PDPageContentStream cs = new PDPageContentStream(document, page,
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                cs.setFont(font, FONT_SIZE);

                LoanCompany company = app.getLoanCompany();
                User applicant = app.getApplicant();
                Guarantor guarantor = app.getGuarantor();

                // 대부업자
                text(cs, font, 225, 174.1f, pageHeight, company.getName());
                text(cs, font, 424, 174.1f, pageHeight, company.getPhone());
                text(cs, font, 225, 187.9f, pageHeight, company.getBusinessRegistrationNumber());
                text(cs, font, 225, 201.7f, pageHeight, company.getRegistrationNumber());
                text(cs, font, 225, 215.5f, pageHeight, company.getAddress());

                // 채무자
                text(cs, font, 225, 229.3f, pageHeight, applicant.getName());
                text(cs, font, 424, 229.3f, pageHeight, applicant.getPhone());
                text(cs, font, 225, 243.1f, pageHeight, birthGender(applicant.getBirthDate(), applicant.getGender()));
                text(cs, font, 225, 256.9f, pageHeight, applicant.getAddress());

                // 보증인 (선택)
                if (guarantor != null) {
                    text(cs, font, 225, 270.7f, pageHeight, guarantor.getName());
                    text(cs, font, 424, 270.7f, pageHeight, guarantor.getPhone());
                    text(cs, font, 225, 284.5f, pageHeight, birthGender(guarantor.getBirthDate(), guarantor.getGender()));
                    text(cs, font, 225, 298.3f, pageHeight, guarantor.getAddress());
                    text(cs, font, 350, 312.1f, pageHeight, formatDate(guarantor.getGuaranteeContractDate()));
                    text(cs, font, 350, 325.9f, pageHeight, guarantor.getGuaranteePeriod());
                    text(cs, font, 350, 339.7f, pageHeight, formatAmount(guarantor.getGuaranteeMaxAmount()));
                    text(cs, font, 350, 353.5f, pageHeight, guarantor.isJointGuarantee() ? "있음" : "없음");
                }

                // 대부금액
                String amountText = formatAmount(values.financedAmount());
                text(cs, font, 225, 368.8f, pageHeight, amountText);
                text(cs, font, 405, 368.8f, pageHeight, amountText);

                // 이자율 / 연체이율
                text(cs, font, 270, 422.8f, pageHeight, formatRate(values.interestRateMonthly()));
                text(cs, font, 270, 436.6f, pageHeight, formatRate(values.interestRateAnnual()));
                text(cs, font, 468, 422.8f, pageHeight, formatRate(values.defaultInterestRateMonthly()));
                text(cs, font, 468, 436.6f, pageHeight, formatRate(values.defaultInterestRateAnnual()));
                if (company.getStatutoryMaxAnnualRate() != null) {
                    text(cs, font, 418, 450.4f, pageHeight, formatRate(company.getStatutoryMaxAnnualRate()));
                }

                text(cs, font, 225, 503.5f, pageHeight, formatDate(values.contractDate()));
                text(cs, font, 225, 517.3f, pageHeight, formatDate(values.loanExpiryDate()));

                text(cs, font, 225, 531.1f, pageHeight, company.getInstallmentRepaymentSchedule());
                text(cs, font, 225, 544.9f, pageHeight, company.getInterestRateDetail());
                text(cs, font, 225, 558.7f, pageHeight, bankAccount(company));

                text(cs, font, 225, 611.3f, pageHeight, company.getEarlyRepaymentTerms());
                text(cs, font, 225, 639.4f, pageHeight, company.getIncidentalCosts());
                text(cs, font, 225, 681.8f, pageHeight, company.getDebtCertificateFee());
                text(cs, font, 450, 681.8f, pageHeight, company.getDebtCertificateIssueDeadline());

                text(cs, font, 480, 731.5f, pageHeight, values.receiptAnswer());
                text(cs, font, 480, 747.6f, pageHeight, values.explanationAnswer());
                text(cs, font, 480, 763.6f, pageHeight, values.brokerageFeeAnswer());

                if (signaturePng != null) {
                    BufferedImage sigImage = ImageIO.read(new ByteArrayInputStream(signaturePng));
                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, sigImage);
                    float boxW = 50f;
                    float boxH = 16f;
                    float drawY = pageHeight - 229.3f - 12f;
                    cs.drawImage(pdImage, 322f, drawY, boxW, boxH);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "계약서 생성에 실패했습니다: " + e.getMessage());
        }
    }

    public byte[] decodeSignature(String dataUrlOrBase64) {
        String base64 = dataUrlOrBase64.contains(",")
                ? dataUrlOrBase64.substring(dataUrlOrBase64.indexOf(',') + 1)
                : dataUrlOrBase64;
        return Base64.getDecoder().decode(base64);
    }

    private void text(PDPageContentStream cs, PDFont font, float x, float topY, float pageHeight, String value) throws IOException {
        if (value == null || value.isBlank()) return;
        // topY is the label's baseline in top-down coordinates (as extracted via PDFTextStripper),
        // so converting to PDF's bottom-up space needs no extra font-size offset.
        float y = pageHeight - topY;
        cs.beginText();
        cs.newLineAtOffset(x, y);
        cs.showText(value);
        cs.endText();
    }

    private String birthGender(LocalDate birthDate, Gender gender) {
        String g = gender == null ? "" : (gender == Gender.MALE ? " (남)" : " (여)");
        return (birthDate == null ? "" : formatDate(birthDate)) + g;
    }

    private String bankAccount(LoanCompany company) {
        if (company.getBankName() == null && company.getBankAccountNumber() == null) return "";
        return String.format("%s %s", nullToEmpty(company.getBankName()), nullToEmpty(company.getBankAccountNumber())).trim();
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(DATE_FMT);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "";
        return String.format(Locale.KOREA, "%,d", amount.longValueExact());
    }

    private String formatRate(BigDecimal rate) {
        return rate == null ? "" : rate.stripTrailingZeros().toPlainString();
    }

    private byte[] readTemplateBytes() throws IOException {
        try (InputStream in = new ClassPathResource(TEMPLATE_PATH).getInputStream()) {
            return in.readAllBytes();
        }
    }

    public record ContractFieldValues(
            BigDecimal financedAmount,
            BigDecimal interestRateMonthly,
            BigDecimal interestRateAnnual,
            BigDecimal defaultInterestRateMonthly,
            BigDecimal defaultInterestRateAnnual,
            LocalDate contractDate,
            LocalDate loanExpiryDate,
            String receiptAnswer,
            String explanationAnswer,
            String brokerageFeeAnswer
    ) {
    }
}
